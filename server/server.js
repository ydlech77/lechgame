import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = {};

function generateRoomCode() {

  return Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase();
}

io.on("connection", (socket) => {

  console.log(
    "CONNECTED:",
    socket.id
  );

  // ======================
  // CREATE ROOM
  // ======================
  socket.on(
    "create-room",
    ({ name }) => {

      const roomCode =
        generateRoomCode();

      const host = {
        id: socket.id,
        name,
        score: 50,
        isHost: true,
      };

      rooms[roomCode] = {
        roomCode,
        hostId: socket.id,
        players: [host],
        word: "",
        impostorId: null,
        halfImpostorId: null,
        discussionOrder: [],
        currentTurn: 0,
        votes: {},
        caughtImpostor: false,
      };

      socket.join(roomCode);

      socket.emit(
        "room-created",
        {
          roomCode,
          players:
            rooms[roomCode]
              .players,
          isHost: true,
        }
      );
    }
  );

  // ======================
  // JOIN ROOM
  // ======================
  socket.on(
    "join-room",
    ({
      roomCode,
      name,
    }) => {

      const room =
        rooms[roomCode];

      if (!room) {

        socket.emit(
          "error-message",
          "Room not found"
        );

        return;
      }

      const player = {
        id: socket.id,
        name,
        score: 0,
        isHost: false,
      };

      room.players.push(
        player
      );

      socket.join(roomCode);

      socket.emit(
        "room-joined",
        {
          roomCode,
          players:
            room.players,
          isHost: false,
        }
      );

      io.to(roomCode).emit(
        "players-updated",
        {
          players:
            room.players,
        }
      );
    }
  );

  // ======================
  // START GAME
  // ======================
  socket.on(
    "start-game",
    ({
      roomCode,
      word,
    }) => {

      const room =
        rooms[roomCode];

      if (!room) return;

      room.word = word;

      room.votes = {};

      room.caughtImpostor =
        false;

      const playablePlayers =
        room.players.filter(
          (p) => !p.isHost
        );

      const shuffled = [
        ...playablePlayers,
      ].sort(
        () =>
          Math.random() - 0.5
      );

      // MAIN IMPOSTOR
      const impostor =
        shuffled[0];

      room.impostorId =
        impostor.id;

      // HALF IMPOSTOR
      room.halfImpostorId =
        null;

      let halfImpostor =
        null;

      if (
        playablePlayers.length >=
        4
      ) {

        halfImpostor =
          shuffled[1];

        room.halfImpostorId =
          halfImpostor.id;
      }

      // DISCUSSION ORDER
      const hostPlayer =
        room.players.find(
          (p) => p.isHost
        );

      room.discussionOrder = [

        hostPlayer,

        ...playablePlayers.sort(
          () =>
            Math.random() - 0.5
        ),
      ];

      room.currentTurn = 0;

      io.to(roomCode).emit(
        "game-started"
      );

      // SEND ROLES
      setTimeout(() => {

        room.players.forEach(
          (player) => {

            // HOST
            if (
              player.isHost
            ) {

              io.to(player.id).emit(
                "your-role",
                {
                  role: "host",
                  word,
                }
              );

              return;
            }

            // MAIN IMPOSTOR
            if (
              player.id ===
              room.impostorId
            ) {

              io.to(player.id).emit(
                "your-role",
                {
                  role:
                    "mainImpostor",
                }
              );

              return;
            }

            // HALF IMPOSTOR
            if (
              player.id ===
              room.halfImpostorId
            ) {

              io.to(player.id).emit(
                "your-role",
                {
                  role:
                    "closeImpostor",

                  word:
                    word.slice(
                      0,
                      Math.ceil(
                        word.length / 2
                      )
                    ),
                }
              );

              return;
            }

            // NORMAL PLAYER
            io.to(player.id).emit(
              "your-role",
              {
                role:
                  "normal",
                word,
              }
            );
          }
        );

      }, 1000);
    }
  );

  // ======================
  // NEXT TURN
  // ======================
  socket.on(
    "next-turn",
    ({ roomCode }) => {

      const room =
        rooms[roomCode];

      if (!room) return;

      if (
        room.currentTurn >=
        room
          .discussionOrder
          .length
      ) {

        io.to(roomCode).emit(
          "vote-phase",
          {
            stage: "main",
          }
        );

        return;
      }

      const player =
        room.discussionOrder[
          room.currentTurn
        ];

      io.to(roomCode).emit(
        "discussion-turn",
        {
          player,
        }
      );

      room.currentTurn++;
    }
  );

  // ======================
  // VOTE PLAYER
  // ======================
  socket.on(
    "vote-player",
    ({
      roomCode,
      votedId,
      stage,
      voterId,
    }) => {

      const room =
        rooms[roomCode];

      if (!room) return;

      // MAIN IMPOSTOR
      // CANNOT VOTE
      if (
        stage === "half" &&
        voterId ===
          room.impostorId
      ) {
        return;
      }

      // SAVE VOTES
      if (
        !room.votes[votedId]
      ) {

        room.votes[votedId] = 0;
      }

      room.votes[votedId]++;

      // TOTAL VOTES
      let neededVotes =
        room.players.length;

      // REMOVE IMPOSTOR
      // FROM HALF ROUND
      if (
        stage === "half"
      ) {

        neededVotes =
          room.players.length - 1;
      }

      const totalVotes =
        Object.values(
          room.votes
        ).reduce(
          (a, b) => a + b,
          0
        );

      if (
        totalVotes <
        neededVotes
      ) {
        return;
      }

      // FIND WINNER
      let votedOut =
        null;

      let highest = 0;

      for (const id in room.votes) {

        if (
          room.votes[id] >
          highest
        ) {

          highest =
            room.votes[id];

          votedOut = id;
        }
      }

      const host =
        room.players.find(
          (p) => p.isHost
        );

      const impostor =
        room.players.find(
          (p) =>
            p.id ===
            room.impostorId
        );

      const halfImpostor =
        room.players.find(
          (p) =>
            p.id ===
            room.halfImpostorId
        );

      // ======================
      // MAIN ROUND
      // ======================
      if (
        stage === "main"
      ) {

        // IMPOSTOR CAUGHT
        if (
          votedOut ===
          room.impostorId
        ) {

          room.caughtImpostor =
            true;

          // EVERYONE +3
          room.players.forEach(
            (player) => {

              if (
                player.id !==
                room.impostorId
              ) {

                player.score += 3;
              }
            }
          );

          // ONLY IMPOSTOR
          // CAN GUESS
          io.to(
            room.impostorId
          ).emit(
            "guess-word"
          );

          // EVERYONE WAIT
          io.to(roomCode).emit(
  "vote-results",
  {
    result:
      "😈 Main Impostor Caught!",
    stage:
      "waiting",
    votedOut:
      room.impostorId,
  }
);


        } else {

          // IMPOSTOR ESCAPED
          impostor.score += 10;

          host.score -= 10;

          io.to(roomCode).emit(
            "vote-results",
            {
              result:
                "😈 Impostor Escaped!",

              stage: "end",

              realImpostor:
                impostor?.name,

              halfImpostor:
                halfImpostor
                  ?.name || "",

              word:
                room.word,
            }
          );
        }
      }

      // ======================
      // HALF ROUND
      // ======================
      if (
        stage === "half"
      ) {

        // HALF CAUGHT
        if (
          votedOut ===
          room.halfImpostorId
        ) {

          room.players.forEach(
            (player) => {

              if (
                player.id !==
                room.impostorId &&
                player.id !==
                room.halfImpostorId
              ) {

                player.score += 2;
              }
            }
          );

          io.to(roomCode).emit(
            "vote-results",
            {
              result:
                "🕵️ Half Impostor Caught!",

              stage: "end",

              realImpostor:
                impostor?.name,

              halfImpostor:
                halfImpostor
                  ?.name,

              word:
                room.word,
            }
          );

        } else {

          // HALF ESCAPED
          if (
            halfImpostor
          ) {

            halfImpostor.score += 7;

            host.score -= 7;
          }

          io.to(roomCode).emit(
            "vote-results",
            {
              result:
                "🕵️ Half Impostor Escaped!",

              stage: "end",

              realImpostor:
                impostor?.name,

              halfImpostor:
                halfImpostor
                  ?.name,

              word:
                room.word,
            }
          );
        }
      }

      io.to(roomCode).emit(
        "players-updated",
        {
          players:
            room.players,
        }
      );

      room.votes = {};
    }
  );

  // ======================
  // IMPOSTOR GUESS
  // ======================
  socket.on(
    "impostor-guess",
    ({
      roomCode,
      guess,
    }) => {

      const room =
        rooms[roomCode];

      if (!room) return;

      const impostor =
        room.players.find(
          (p) =>
            p.id ===
            room.impostorId
        );

      const host =
        room.players.find(
          (p) => p.isHost
        );

      const correct =
        guess
          .toLowerCase()
          .trim() ===
        room.word
          .toLowerCase()
          .trim();

      // CORRECT WORD
      if (correct) {

        impostor.score += 15;

        host.score -= 15;
      }

      io.to(roomCode).emit(
        "players-updated",
        {
          players:
            room.players,
        }
      );

      // START HALF ROUND
      if (
        room.halfImpostorId
      ) {

        io.to(roomCode).emit(
          "vote-phase",
          {
            stage: "half",
          }
        );

      } else {

        // END GAME
        const halfImpostor =
          room.players.find(
            (p) =>
              p.id ===
              room.halfImpostorId
          );

        io.to(roomCode).emit(
          "vote-results",
          {
            result: correct
              ? "😈 Impostor guessed correctly!"
              : "❌ Impostor failed!",

            stage: "end",

            realImpostor:
              impostor?.name,

            halfImpostor:
              halfImpostor
                ?.name || "",

            word:
              room.word,
          }
        );
      }
    }
  );

});

const PORT =
  process.env.PORT || 3001;

server.listen(PORT, () => {

  console.log(
    `🔥 SERVER RUNNING ON ${PORT}`
  );
});