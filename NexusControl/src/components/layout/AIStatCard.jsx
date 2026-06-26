export default function AIStatCard({ title, value, color }) {
  return (
    <div style={styles.card}>
      <h4>{title}</h4>

      <p style={{ color: color || "white", fontSize: 20 }}>
        {value}
      </p>
    </div>
  );
}

const styles = {
  card: {
    background: "#1a1a1a",
    padding: "16px",
    borderRadius: 10,
    width: 180,
    color: "white",
    boxShadow: "0 0 10px rgba(0,0,0,0.4)",
  },
};