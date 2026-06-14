export default function About({ setShowAbout }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h1>🎮 About The Game</h1>

        <p>
          This game was created to bring fun, bluffing, and
          social interaction to friends anywhere in the world.
        </p>

        <h3>👨‍💻 Creator</h3>
        <p>Prince Lech, David Adetokunboh, Victor Nnanna, Daniel Agwu, Samuel Nwachukwu, Favour Tony, God'swill Kingsley </p>
        

        <h3>💡 Reason</h3>
        <p>
          To build a fun multiplayer bluff game where players
          test their creativity, lies, and intuition.
        </p>

        <button
          style={styles.button}
          onClick={() => setShowAbout(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: 350,
    background: "#111827",
    padding: 25,
    borderRadius: 15,
    textAlign: "center",
    boxShadow: "0 0 20px cyan",
    color: "white",
  },

  button: {
    width: "100%",
    padding: 12,
    marginTop: 15,
    borderRadius: 10,
    border: "none",
    background: "cyan",
    fontWeight: "bold",
    cursor: "pointer",
  },
};