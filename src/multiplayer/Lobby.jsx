import { useEffect, useState } from "react";

import socket from "./socket";

import MultiplayerGame from "./MultiplayerGame";

export default function Lobby({
  players,
  roomCode,
  isHost,
}) {
  const [started, setStarted] =
    useState(false);

  const [word, setWord] =
    useState("");

  useEffect(() => {
    socket.on(
      "game-started",
      () => {
        setStarted(true);
      }
    );

    return () => {
      socket.off(
        "game-started"
      );
    };
  }, []);

  const startGame = () => {
  if (!word.trim()) {
    alert(
      "Enter secret word"
    );
    return;
  }

  console.log(
    "STARTING GAME..."
  );

  socket.emit(
    "start-game",
    {
      roomCode,
      word,
    }
  );
};

 if (
  started &&
  players.length > 0
) {
  return (
    <MultiplayerGame
      players={players}
      roomCode={roomCode}
      isHost={isHost}
    />
  );
}

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>🎮 Lobby</h1>

        <h2>
          Room:
          {" "}
          {roomCode}
        </h2>

        <div
          style={
            styles.playersBox
          }
        >
          {players.map(
            (
              player,
              index
            ) => (
              <div
                key={index}
                style={
                  styles.player
                }
              >
                👤{" "}
                {
                  player.name
                }
              </div>
            )
          )}
        </div>

        {/* HOST CONTROLS */}
        {isHost && (
          <>
          <div
  style={{
    background: "#0f172a",
    color: "cyan",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    border: "1px solid cyan",
  }}
>
  ⚠️ Make sure all players
  have joined before
  starting game

</div>
            <input
              style={
                styles.input
              }
              placeholder="Enter Secret Word"
              value={word}
              onChange={(
                e
              ) =>
                setWord(
                  e.target
                    .value
                )
              }
            />

            <button
              style={
                styles.button
              }
              onClick={
                startGame
              }
            >
              🚀 START GAME
            </button>
          </>
        )}

        {!isHost && (
          <h3
            style={{
              marginTop: 20,
            }}
          >
            ⏳ Waiting for
            Host...
          </h3>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#020617",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    fontFamily: "Arial",
  },

  card: {
    width: 450,
    background: "#111827",
    padding: 30,
    borderRadius: 20,
    color: "white",
    textAlign: "center",
    boxShadow:
      "0 0 30px rgba(0,255,255,0.4)",
  },

  playersBox: {
    marginTop: 20,
  },

  player: {
    background: "#1e293b",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  input: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    border: "none",
    marginTop: 20,
    fontSize: 16,
  },

  button: {
    width: "100%",
    padding: 14,
    marginTop: 15,
    borderRadius: 10,
    border: "none",
    background: "cyan",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: 16,
  },
};