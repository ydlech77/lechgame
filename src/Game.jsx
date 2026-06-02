import { useEffect, useState } from "react";
import { praises, roasts } from "./data";

export default function Game({
  players,
  setPlayers,
  word,
  setWord,
  gmScore,
  setGmScore,
  resetGame,
}) {
  const [phase, setPhase] = useState("turn");

  const [currentPlayer, setCurrentPlayer] = useState(0);

  const [revealed, setRevealed] = useState(false);

  const [guess, setGuess] = useState("");

  const [message, setMessage] = useState("");

  const [newWord, setNewWord] = useState("");

  const [mainImpostor, setMainImpostor] =
    useState("");

  const [closeImpostor, setCloseImpostor] =
    useState(null);

  const [discussionOrder, setDiscussionOrder] =
    useState([]);

  const [discussionIndex, setDiscussionIndex] =
    useState(0);

  // RANDOMIZE ROLES
  useEffect(() => {
    generateRoles();
  }, []);

  const generateRoles = () => {
    const shuffled = [...players].sort(
      () => Math.random() - 0.5
    );

    setMainImpostor(shuffled[0].name);

    if (players.length >= 4) {
      setCloseImpostor(shuffled[1].name);
    } else {
      setCloseImpostor(null);
    }
  };

  const currentName =
    players[currentPlayer]?.name;

  const getRole = (name) => {
    if (name === mainImpostor) {
      return {
        title: "😈 MAIN IMPOSTOR",
        text: "You DO NOT know the word.",
      };
    }

    if (name === closeImpostor) {
      return {
        title: "🕵️ CLOSE IMPOSTOR",
        text: `Half Word: ${word.slice(
          0,
          Math.ceil(word.length / 2)
        )}`,
      };
    }

    return {
      title: "✅ NORMAL PLAYER",
      text: `Word: ${word}`,
    };
  };

  const nextPlayer = () => {
    setRevealed(false);

    if (currentPlayer + 1 < players.length) {
      setCurrentPlayer(currentPlayer + 1);
    } else {
      startDiscussion();
    }
  };

  // START DISCUSSION (HOST FIRST)
  const startDiscussion = () => {
    const host = players[0];
    const others = players
      .slice(1)
      .sort(() => Math.random() - 0.5);

    setDiscussionOrder([host, ...others]);

    setDiscussionIndex(0);

    setPhase("discussion");
  };

  // NEXT DISCUSSION PLAYER
  const nextDiscussionPlayer = () => {
    if (
      discussionIndex + 1 <
      discussionOrder.length
    ) {
      setDiscussionIndex((prev) => prev + 1);
    } else {
      setPhase("voteMain");
    }
  };

  // MAIN IMPOSTOR VOTE
  const voteMain = (name) => {
    if (name === mainImpostor) {
      setGmScore((prev) => prev - 10);

      setPhase("guess");
    } else {
      const updated = players.map((p) => {
        if (p.name === mainImpostor) {
          return {
            ...p,
            score: p.score + 10,
          };
        }

        return p;
      });

      setPlayers(updated);

      setGmScore((prev) => prev + 5);

      setMessage(
        praises[Math.floor(Math.random() * praises.length)](
          mainImpostor
        )
      );

      if (closeImpostor) {
        setPhase("voteClose");
      } else {
        setPhase("results");
      }
    }
  };

  // IMPOSTOR GUESS
  const submitGuess = () => {
    if (
      guess.toLowerCase() ===
      word.toLowerCase()
    ) {
      const updated = players.map((p) => {
        if (p.name === mainImpostor) {
          return {
            ...p,
            score: p.score + 15,
          };
        }

        return {
          ...p,
          score: p.score + 4,
        };
      });

      setPlayers(updated);

      setMessage(
        `🔥 ${mainImpostor} guessed correctly!`
      );
    } else {
      const updated = players.map((p) => {
        if (p.name !== mainImpostor) {
          return {
            ...p,
            score: p.score + 4,
          };
        }

        return p;
      });

      setPlayers(updated);

      setMessage(
        roasts[Math.floor(Math.random() * roasts.length)](
          mainImpostor
        )
      );
    }

    if (closeImpostor) {
      setPhase("voteClose");
    } else {
      setPhase("results");
    }
  };

  // CLOSE IMPOSTOR VOTE
  const voteClose = (name) => {
    if (name !== closeImpostor) {
      const updated = players.map((p) => {
        if (p.name === closeImpostor) {
          return {
            ...p,
            score: p.score + 7,
          };
        }

        return p;
      });

      setPlayers(updated);

      setGmScore((prev) => prev + 3);

      setMessage(
        praises[Math.floor(Math.random() * praises.length)](
          closeImpostor
        )
      );
    } else {
      setGmScore((prev) => prev - 5);

      setMessage(
        `🎯 ${closeImpostor} was exposed.`
      );
    }

    setPhase("results");
  };

  // CONTINUE GAME
  const continueGame = () => {
    setPhase("newWord");

    setCurrentPlayer(0);

    setRevealed(false);

    setGuess("");

    setMessage("");
  };

  // NEXT ROUND
  const startNextRound = () => {
    if (newWord.trim() === "") return;

    setWord(newWord);

    setNewWord("");

    generateRoles();

    setCurrentPlayer(0);

    setRevealed(false);

    setGuess("");

    setMessage("");

    setDiscussionOrder([]);

    setDiscussionIndex(0);

    setPhase("turn");
  };

  return (
    <div style={styles.container}>
      {/* SCOREBOARD */}
      <div style={styles.topBar}>
        <div style={styles.gmBox}>
          👑 GM: {gmScore}
        </div>

        {players.map((p, index) => (
          <div key={index} style={styles.scoreBox}>
            {p.name}: {p.score}
          </div>
        ))}
      </div>

      {/* NEW ROUND */}
      {phase === "newWord" && (
        <div style={styles.card}>
          <h1>👑 New Round</h1>

          <p>Enter New Secret Word</p>

          <input
            style={styles.input}
            value={newWord}
            onChange={(e) =>
              setNewWord(e.target.value)
            }
          />

          <button
            style={styles.button}
            onClick={startNextRound}
          >
            🚀 START ROUND
          </button>
        </div>
      )}

      {/* ROLE REVEAL */}
      {phase === "turn" && (
        <div style={styles.card}>
          <h1>👤 {currentName}'s Turn</h1>

          {!revealed ? (
            <button
              style={styles.bigButton}
              onClick={() =>
                setRevealed(true)
              }
            >
              TAP TO REVEAL
            </button>
          ) : (
            <>
              <div style={styles.roleBox}>
                <h1>
                  {getRole(currentName).title}
                </h1>

                <h2>
                  {getRole(currentName).text}
                </h2>
              </div>

              <button
                style={styles.button}
                onClick={nextPlayer}
              >
                NEXT PLAYER
              </button>
            </>
          )}
        </div>
      )}

      {/* DISCUSSION */}
{phase === "discussion" && (
  <div style={styles.card}>
    <h1>🗣️ Discussion Time</h1>

    <h2>
      🎯 {discussionOrder[discussionIndex]?.name} is speaking
    </h2>

    <p>
      Everyone must question this player before moving on.
    </p>

    {/* FULL ORDER */}
    <div style={{ marginTop: 20 }}>
      <h3>📋 Discussion Order</h3>

      {discussionOrder.map((p, index) => (
        <p
          key={index}
          style={{
            color: index === discussionIndex ? "cyan" : "white",
            fontWeight: index === discussionIndex ? "bold" : "normal",
          }}
        >
          👤 {p.name}
        </p>
      ))}
    </div>

    <button
      style={styles.button}
      onClick={nextDiscussionPlayer}
    >
      NEXT PLAYER
    </button>
  </div>
)}

      {/* MAIN VOTE */}
      {phase === "voteMain" && (
        <div style={styles.card}>
          <h1>😈 Vote Main Impostor</h1>

          {players.map((p, index) => (
            <button
              key={index}
              style={styles.voteButton}
              onClick={() =>
                voteMain(p.name)
              }
            >n
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* GUESS WORD */}
      {phase === "guess" && (
        <div style={styles.card}>
          <h1>🎯 Guess The Word</h1>

          <p>
            {mainImpostor}, type the
            secret word
          </p>

          <input
            style={styles.input}
            value={guess}
            onChange={(e) =>
              setGuess(e.target.value)
            }
          />

          <button
            style={styles.button}
            onClick={submitGuess}
          >
            SUBMIT
          </button>
        </div>
      )}

      {/* CLOSE IMPOSTOR */}
      {phase === "voteClose" &&
        closeImpostor && (
          <div style={styles.card}>
            <h1>
              🕵️ Vote Close Impostor
            </h1>

            {players
              .filter(
                (p) =>
                  p.name !==
                  mainImpostor
              )
              .map((p, index) => (
                <button
                  key={index}
                  style={styles.voteButton}
                  onClick={() =>
                    voteClose(p.name)
                  }
                >
                  {p.name}
                </button>
              ))}
          </div>
        )}

      {/* RESULTS */}
      {phase === "results" && (
        <div style={styles.card}>
          <h1>🏆 Results</h1>

          <p style={styles.message}>
            {message}
          </p>

          <h2>
            😈 Main Impostor:
            {mainImpostor}
          </h2>

          {closeImpostor && (
            <h2>
              🕵️ Close Impostor:
              {closeImpostor}
            </h2>
          )}

          <h2>🔑 Word: {word}</h2>

          <button
            style={styles.button}
            onClick={continueGame}
          >
            ▶ CONTINUE
          </button>

          <button
            style={styles.exitBtn}
            onClick={resetGame}
          >
            ❌ NEW GAME
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: 20,
    fontFamily: "Arial",
  },

  topBar: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },

  gmBox: {
    background: "gold",
    color: "black",
    padding: 10,
    borderRadius: 10,
    fontWeight: "bold",
  },

  scoreBox: {
    background: "#1e293b",
    padding: 10,
    borderRadius: 10,
  },

  card: {
    maxWidth: 500,
    margin: "auto",
    background: "#111827",
    padding: 30,
    borderRadius: 20,
    textAlign: "center",
    boxShadow: "0 0 25px cyan",
  },

  roleBox: {
    background: "#1e293b",
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
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
  },

  bigButton: {
    width: "100%",
    padding: 20,
    marginTop: 30,
    borderRadius: 15,
    border: "none",
    background: "crimson",
    color: "white",
    fontWeight: "bold",
    fontSize: 22,
    cursor: "pointer",
  },

  voteButton: {
    width: "100%",
    padding: 14,
    marginTop: 10,
    borderRadius: 10,
    border: "none",
    background: "#dc2626",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    marginTop: 10,
  },

  exitBtn: {
    width: "100%",
    padding: 14,
    marginTop: 10,
    borderRadius: 10,
    border: "none",
    background: "#374151",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },

  message: {
    color: "yellow",
    fontSize: 20,
  },
};