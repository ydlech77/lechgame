import { useState } from "react";
import Game from "./Game";
import Multiplayer from "./Multiplayer";
import About from "./About";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [showAbout, setShowAbout] = useState(false);

  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [word, setWord] = useState("");
  const [gmScore, setGmScore] = useState(50);

  const addPlayer = () => {
    if (playerName.trim() === "") return;

    setPlayers([
      ...players,
      { name: playerName, score: 0 },
    ]);

    setPlayerName("");
  };

  const resetGame = () => {
    setPlayers([]);
    setWord("");
    setPlayerName("");
    setGmScore(50);
    setScreen("home");
  };

  // 🎮 SINGLE GAME
  if (screen === "single") {
    return (
      <>
        <Game
          players={players}
          setPlayers={setPlayers}
          word={word}
          setWord={setWord}
          gmScore={gmScore}
          setGmScore={setGmScore}
          setScreen={setScreen}
          resetGame={resetGame}
        />

        {showAbout && <About setShowAbout={setShowAbout} />}
      </>
    );
  }

  // 🌐 MULTIPLAYER
  if (screen === "multi") {
    return (
      <>
        <Multiplayer setScreen={setScreen} />

        {showAbout && <About setShowAbout={setShowAbout} />}
      </>
    );
  }

  // 🏠 HOME SCREEN
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>🎮 THE IMPOSTOR</h1>
        <p>Bluff • Betray • Survive 😈</p>

        <button
          style={styles.modeBtn}
          onClick={() => setScreen("setup")}
        >
          📱 Single Phone
        </button>

        <button
          style={styles.modeBtn}
          onClick={() => setScreen("multi")}
        >
          🌐 Multiple Phones
        </button>

        {/* SMALL ABOUT BUTTON (RIGHT AFTER MULTIPLE PHONES) */}
        <div style={styles.aboutRow}>
  <button
    onClick={() => setShowAbout(true)}
    style={styles.aboutMiniBtn}
  >
    ℹ️ About
  </button>
</div>

        {/* SETUP */}
        {screen === "setup" && (
          <>
            <input
              style={styles.input}
              placeholder="Enter player name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />

            <button style={styles.button} onClick={addPlayer}>
              Add Player
            </button>

            <div style={{ marginTop: 15 }}>
              {players.map((p, index) => (
                <p key={index}>👤 {p.name}</p>
              ))}
            </div>

            <input
              style={styles.input}
              placeholder="Game master secret word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />

            {players.length >= 3 && word !== "" && (
              <button
                style={styles.startBtn}
                onClick={() => setScreen("single")}
              >
                🚀 Start Game
              </button>
            )}
          </>
        )}
      </div>

      {/* ABOUT MODAL */}
      {showAbout && <About setShowAbout={setShowAbout} />}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontFamily: "Arial",
    padding: 20,
  },

  card: {
    width: 420,
    background: "#111827",
    padding: 30,
    borderRadius: 20,
    boxShadow: "0 0 25px cyan",
    textAlign: "center",
  },

  input: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    border: "none",
  },

  button: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    border: "none",
    background: "cyan",
    cursor: "pointer",
    fontWeight: "bold",
  },

  modeBtn: {
    width: "100%",
    padding: 14,
    marginTop: 10,
    borderRadius: 10,
    border: "none",
    background: "#1e293b",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  startBtn: {
    width: "100%",
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    border: "none",
    background: "limegreen",
    fontWeight: "bold",
    cursor: "pointer",
  },

  // ✅ SMALL FLOATING STYLE ABOUT BUTTON
  aboutMiniBtn: {
    width: 45,
    height: 45,
    borderRadius: "50%",
    border: "none",
    marginTop: 10,
    background: "#334155",
    color: "white",
    fontSize: 18,
    cursor: "pointer",
    boxShadow: "0 0 10px cyan",
  },

  aboutRow: {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: 10,
},

aboutMiniBtn: {
  padding: "8px 14px",
  borderRadius: 20,
  border: "none",
  background: "#334155",
  color: "white",
  fontSize: 14,
  cursor: "pointer",
  fontWeight: "bold",
  boxShadow: "0 0 10px cyan",
},

};