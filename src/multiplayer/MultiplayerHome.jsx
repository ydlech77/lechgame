import { useEffect, useState } from "react";

import socket from "./socket";

import Lobby from "./Lobby";

export default function MultiplayerHome() {
  const [step, setStep] =
    useState("home");

  const [name, setName] =
    useState("");

  const [roomCode, setRoomCode] =
    useState("");

  const [players, setPlayers] =
    useState([]);

  const [joined, setJoined] =
    useState(false);

  const [isHost, setIsHost] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    socket.on(
      "room-created",
      (data) => {
        setRoomCode(
          data.roomCode
        );

        setPlayers(
          data.players
        );

        setJoined(true);

        setIsHost(true);
      }
    );

    socket.on(
      "room-joined",
      (data) => {
        setRoomCode(
          data.roomCode
        );

        setPlayers(
          data.players
        );

        setJoined(true);

        setIsHost(false);
      }
    );

    socket.on(
      "players-updated",
      (data) => {
        setPlayers(
          data.players
        );
      }
    );

    socket.on(
      "error-message",
      (message) => {
        setError(message);
      }
    );

    return () => {
      socket.off(
        "room-created"
      );

      socket.off(
        "room-joined"
      );

      socket.off(
        "players-updated"
      );

      socket.off(
        "error-message"
      );
    };
  }, []);

  const createRoom = () => {
    if (!name.trim()) {
      alert(
        "Enter your name"
      );
      return;
    }

    socket.emit(
      "create-room",
      {
        name,
      }
    );
  };

  const joinRoom = () => {
    if (
      !roomCode.trim()
    ) {
      alert(
        "Enter room code"
      );
      return;
    }

    setStep("joinName");
  };

  const finishJoin = () => {
    if (!name.trim()) {
      alert(
        "Enter your name"
      );
      return;
    }

    socket.emit(
      "join-room",
      {
        roomCode:
          roomCode.toUpperCase(),
        name,
      }
    );
  };

  if (joined) {
    return (
      <Lobby
        players={players}
        roomCode={roomCode}
        isHost={isHost}
      />
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>
          🌐 Multiplayer
        </h1>

        {/* HOME */}
        {step === "home" && (
          <>
            <input
              style={styles.input}
              placeholder="Your Name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />

            <button
              style={
                styles.createBtn
              }
              onClick={
                createRoom
              }
            >
              CREATE ROOM
            </button>

            <div
              style={
                styles.or
              }
            >
              OR
            </div>

            <input
              style={styles.input}
              placeholder="Room Code"
              value={roomCode}
              onChange={(e) =>
                setRoomCode(
                  e.target.value
                )
              }
            />

            <button
              style={
                styles.joinBtn
              }
              onClick={
                joinRoom
              }
            >
              JOIN ROOM
            </button>
          </>
        )}

        {/* JOIN NAME */}
        {step ===
          "joinName" && (
          <>
            <h2>
              Room:
              {" "}
              {roomCode.toUpperCase()}
            </h2>

            <input
              style={styles.input}
              placeholder="Enter Your Name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />

            <button
              style={
                styles.joinBtn
              }
              onClick={
                finishJoin
              }
            >
              ENTER ROOM
            </button>
          </>
        )}

        {error && (
          <p style={styles.error}>
            {error}
          </p>
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
    width: 420,
    background: "#111827",
    padding: 30,
    borderRadius: 20,
    color: "white",
    textAlign: "center",
    boxShadow:
      "0 0 30px rgba(0,255,255,0.4)",
  },

  input: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    border: "none",
    marginTop: 15,
    fontSize: 16,
  },

  createBtn: {
    width: "100%",
    padding: 14,
    marginTop: 15,
    borderRadius: 10,
    border: "none",
    background: "cyan",
    fontWeight: "bold",
    cursor: "pointer",
  },

  joinBtn: {
    width: "100%",
    padding: 14,
    marginTop: 15,
    borderRadius: 10,
    border: "none",
    background:
      "limegreen",
    fontWeight: "bold",
    cursor: "pointer",
  },

  or: {
    marginTop: 20,
    opacity: 0.7,
  },

  error: {
    color: "red",
    marginTop: 15,
  },
};