import { useEffect, useState } from "react";
import socket from "./socket";
import {
  roasts,
  praises,
} from "./data";

export default function MultiplayerGame({
  players: initialPlayers,
  roomCode,
  isHost,
}) {

  const [players, setPlayers] =
    useState(initialPlayers);

  const [phase, setPhase] =
    useState("reveal");

  const [role, setRole] =
    useState("");

  const [word, setWord] =
    useState("");

  const [halfWord, setHalfWord] =
    useState("");

  const [revealed, setRevealed] =
    useState(false);

  const [currentPlayer, setCurrentPlayer] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [voteStage, setVoteStage] =
    useState("main");

  const [voted, setVoted] =
    useState(false);

  const [result, setResult] =
    useState("");

  const [realImpostor, setRealImpostor] =
    useState("");

  const [halfImpostor, setHalfImpostor] =
    useState("");

  const [caughtImpostorId, setCaughtImpostorId] =
  useState(null);

const [waitingForHalfVote, setWaitingForHalfVote] =
  useState(false);  

  const [showWordInput, setShowWordInput] =
    useState(false);

  const [newWord, setNewWord] =
    useState("");

  const [showGuessInput, setShowGuessInput] =
    useState(false);

  const [guessWord, setGuessWord] =
    useState("");

  const isCaughtImpostor =
  role === "mainImpostor" &&
  caughtImpostorId ===
    socket.id;

  // =========================
  // SOCKET EVENTS
  // =========================
  useEffect(() => {

    // ROLES
    socket.on(
      "your-role",
      (data) => {

        setRole(data.role);

        setWord(
          data.word || ""
        );

        setHalfWord(
          data.word || ""
        );

        setPhase("reveal");

        setRevealed(false);

        setResult("");

        setRealImpostor("");

        setHalfImpostor("");

        setShowGuessInput(false);

        setVoteStage("main");

        setVoted(false);
      }
    );

    // PLAYERS
    socket.on(
      "players-updated",
      ({ players }) => {

        setPlayers([
          ...players,
        ]);
      }
    );

    // DISCUSSION
    socket.on(
      "discussion-turn",
      ({ player }) => {

        setPhase(
          "discussion"
        );

        setCurrentPlayer(
          player
        );

        const funnyMessage =
          Math.random() > 0.5
            ? roasts[
                Math.floor(
                  Math.random() *
                    roasts.length
                )
              ]
            : praises[
                Math.floor(
                  Math.random() *
                    praises.length
                )
              ];

        setMessage(
          funnyMessage.replace(
            "{name}",
            player.name
          )
        );
      }
    );

    // VOTE PHASE
    socket.on(
  "vote-phase",
  ({ stage }) => {

    setPhase("vote");

    setVoteStage(stage);

    setVoted(false);

    setShowGuessInput(false);

    if (
      stage === "half"
    ) {

      setWaitingForHalfVote(
        false
      );
    }
  }
);


    // RESULTS
   socket.on(
  "vote-results",
  ({
    result,
    stage,
    realImpostor,
    halfImpostor,
    votedOut,
  }) => {

    setResult(result);

    if (
      stage === "waiting"
    ) {

      setCaughtImpostorId(
        votedOut
      );

      setWaitingForHalfVote(
        true
      );

      return;
    }

    setPhase("results");

    if (
      stage === "end"
    ) {

      setRealImpostor(
        realImpostor || ""
      );

      setHalfImpostor(
        halfImpostor || ""
      );

      setWaitingForHalfVote(
        false
      );
    }
  }
);


    // IMPOSTOR GUESS
    socket.on(
      "guess-word",
      () => {

        setPhase("results");

        setShowGuessInput(
          true
        );

        setResult(
          "😈 Guess the word"
        );
      }
    );

    return () => {

      socket.off(
        "your-role"
      );

      socket.off(
        "players-updated"
      );

      socket.off(
        "discussion-turn"
      );

      socket.off(
        "vote-phase"
      );

      socket.off(
        "vote-results"
      );

      socket.off(
        "guess-word"
      );
    };

  }, []);

  // =========================
  // START DISCUSSION
  // =========================
  const startDiscussion =
    () => {

      socket.emit(
        "next-turn",
        {
          roomCode,
        }
      );
    };

  // =========================
  // VOTE
  // =========================
  const votePlayer =
  (id) => {

    if (voted) return;

    // CAUGHT MAIN IMPOSTOR
    // CANNOT VOTE IN HALF ROUND
    if (
      voteStage === "half" &&
      role === "mainImpostor" &&
      caughtImpostorId === socket.id
    ) {
      return;
    }

    socket.emit(
      "vote-player",
      {
        roomCode,
        votedId: id,
        stage: voteStage,
        voterId: socket.id,
      }
    );

    setVoted(true);
  };


  // =========================
  // GUESS WORD
  // =========================
  const submitGuess =
    () => {

      if (
        !guessWord.trim()
      ) {
        return;
      }

      socket.emit(
        "impostor-guess",
        {
          roomCode,
          guess: guessWord,
        }
      );

      setShowGuessInput(
        false
      );
    };

  // =========================
  // CONTINUE GAME
  // =========================
  const continueGame =
    () => {

      if (
        !newWord.trim()
      ) {

        alert(
          "Enter word"
        );

        return;
      }

      socket.emit(
        "start-game",
        {
          roomCode,
          word: newWord,
        }
      );

      setShowWordInput(
        false
      );

      setNewWord("");
    };

  // =========================
  // EXIT
  // =========================
  const exitGame =
    () => {

      window.location.reload();
    };

  return (

    <div style={styles.container}>

      {/* PLAYERS */}
      <div style={styles.topBar}>

        {players?.map(
          (player) => (

            <div
              key={player.id}
              style={
                styles.playerBox
              }
            >
              👤 {player.name}
              <br />
              ⭐ {player.score}
            </div>
          )
        )}
      </div>

      {/* ========================= */}
      {/* REVEAL */}
      {/* ========================= */}
      {phase === "reveal" && (

        <div style={styles.card}>

          {!revealed ? (

            <>
              <h1>
                🔒 Reveal Role
              </h1>

              <button
                style={
                  styles.mainBtn
                }
                onClick={() =>
                  setRevealed(
                    true
                  )
                }
              >
                TAP TO REVEAL
              </button>
            </>

          ) : (

            <>
              {/* HOST */}
              {role === "host" && (

                <>
                  <h1>
                    🎮 HOST
                  </h1>

                  <h2>
                    {word}
                  </h2>

                  <button
                    style={
                      styles.mainBtn
                    }
                    onClick={
                      startDiscussion
                    }
                  >
                    🚀 START
                    DISCUSSION
                  </button>
                </>
              )}

              {/* NORMAL */}
              {role ===
                "normal" && (

                <>
                  <h1>
                    ✅ YOUR WORD
                  </h1>

                  <h2>
                    {word}
                  </h2>
                </>
              )}

              {/* MAIN */}
              {role ===
                "mainImpostor" && (

                <>
                  <h1>
                    😈 YOU ARE
                    IMPOSTOR
                  </h1>

                  <p>
                    Survive the round
                  </p>
                </>
              )}

              {/* HALF */}
              {role ===
                "closeImpostor" && (

                <>
                  <h1>
                    🕵️ HALF
                    IMPOSTOR
                  </h1>

                  <h2>
                    {halfWord}
                  </h2>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================= */}
      {/* DISCUSSION */}
      {/* ========================= */}
      {phase ===
        "discussion" && (

        <div style={styles.card}>

          {currentPlayer?.id ===
          socket.id ? (

            <>
              <h1>
                🎤 YOUR TURN
              </h1>

              <h2>
                Speak now
              </h2>
            </>

          ) : (

            <>
              <h1>
                ⏳ WAITING
              </h1>

              <h2>
                {
                  currentPlayer?.name
                }
                's turn
              </h2>
            </>
          )}

          <div
            style={
              styles.messageBox
            }
          >
            {message}
          </div>

          {isHost && (

            <button
              style={
                styles.mainBtn
              }
              onClick={
                startDiscussion
              }
            >
              ▶ NEXT PLAYER
            </button>
          )}
        </div>
      )}

      {/* ========================= */}
      {/* VOTE */}
      {/* ========================= */}
      {phase === "vote" && (

  <div style={styles.card}>

    {/* BLOCK IMPOSTOR WHEN CAUGHT */}
    {voteStage === "half" &&
    role === "mainImpostor" &&
    caughtImpostorId === socket.id ? (

      <>
        <h1>😈 You Were Caught</h1>
        <h2>Wait for next game...</h2>
      </>
    ) : (
      <>
        <h1>🗳️ Vote</h1>

        <h2>
          {voteStage === "main"
            ? "Find Main Impostor"
            : "Find Half Impostor"}
        </h2>

        {/* SHOW WAIT IF IMPOSITOR IS GUESSING WORD */}
        {waitingForHalfVote && voteStage === "main" ? (
          <>
            <h2>⏳ Impostor is guessing the word...</h2>
          </>
        ) : (
          <>
            {!voted ? (

              players
                .filter((player) => {

                  // REMOVE HOST
                  if (player.isHost) return false;

                  // REMOVE CAUGHT IMPOSTOR IN HALF ROUND
                  if (
                    voteStage === "half" &&
                    player.id === caughtImpostorId
                  ) {
                    return false;
                  }

                  return true;
                })
                .map((player) => (
                  <button
                    key={player.id}
                    style={styles.voteBtn}
                    onClick={() =>
                      votePlayer(player.id)
                    }
                  >
                    {player.name}
                  </button>
                ))

            ) : (
              <h2>✅ Vote Sent</h2>
            )}
          </>
        )}
      </>
    )}

  </div>
)}


      {/* ========================= */}
      {/* RESULTS */}
      {/* ========================= */}
      {phase ===
        "results" && (

        <div style={styles.card}>

          <h1>
            🏆 RESULTS
          </h1>

          <h2>
            {result}
          </h2>

          {/* GUESS WORD */}
          {showGuessInput && (

            <>
              <input
                style={
                  styles.input
                }
                placeholder="Guess word"
                value={
                  guessWord
                }
                onChange={(
                  e
                ) =>
                  setGuessWord(
                    e.target
                      .value
                  )
                }
              />

              <button
                style={
                  styles.mainBtn
                }
                onClick={
                  submitGuess
                }
              >
                SUBMIT WORD
              </button>
            </>
          )}

          {/* REVEAL */}
          {realImpostor && (

            <h3
              style={{
                color:
                  "red",
              }}
            >
              😈 Main:
              {" "}
              {realImpostor}
            </h3>
          )}

          {halfImpostor && (

            <h3
              style={{
                color:
                  "orange",
              }}
            >
              🕵️ Half:
              {" "}
              {halfImpostor}
            </h3>
          )}

          {/* HOST */}
          {isHost && (

            <>
              {!showWordInput ? (

                <button
                  style={
                    styles.mainBtn
                  }
                  onClick={() =>
                    setShowWordInput(
                      true
                    )
                  }
                >
                  🔁 Continue
                </button>

              ) : (

                <>
                  <input
                    style={
                      styles.input
                    }
                    placeholder="New Word"
                    value={
                      newWord
                    }
                    onChange={(
                      e
                    ) =>
                      setNewWord(
                        e.target
                          .value
                      )
                    }
                  />

                  <button
                    style={
                      styles.mainBtn
                    }
                    onClick={
                      continueGame
                    }
                  >
                    🚀 Start
                    New Round
                  </button>
                </>
              )}

              <button
                style={
                  styles.exitBtn
                }
                onClick={
                  exitGame
                }
              >
                ❌ Exit
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {

  container: {
    minHeight: "100vh",
    background: "#020617",
    color: "white",
    padding: 20,
    fontFamily: "Arial",
  },

  topBar: {
    display: "flex",
    gap: 10,
    justifyContent:
      "center",
    flexWrap: "wrap",
    marginBottom: 20,
  },

  playerBox: {
    background: "#1e293b",
    padding: 10,
    borderRadius: 10,
    minWidth: 100,
    textAlign: "center",
  },

  card: {
    maxWidth: 500,
    margin: "auto",
    background: "#111827",
    padding: 30,
    borderRadius: 20,
    textAlign: "center",
    boxShadow:
      "0 0 30px cyan",
  },

  mainBtn: {
    width: "100%",
    padding: 14,
    marginTop: 20,
    borderRadius: 10,
    border: "none",
    background: "cyan",
    fontWeight: "bold",
    cursor: "pointer",
  },

  voteBtn: {
    width: "100%",
    padding: 14,
    marginTop: 10,
    borderRadius: 10,
    border: "none",
    background: "orange",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },

  exitBtn: {
    width: "100%",
    padding: 14,
    marginTop: 15,
    borderRadius: 10,
    border: "none",
    background: "red",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },

  input: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    border: "none",
    marginTop: 20,
    fontSize: 16,
  },

  messageBox: {
    marginTop: 20,
    background: "#1e293b",
    padding: 15,
    borderRadius: 10,
    color: "cyan",
    fontWeight: "bold",
  },
};