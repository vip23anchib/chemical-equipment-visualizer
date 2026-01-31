export default function SummaryCards({ summary }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "20px",
      marginTop: "30px"
    }}>
      <div className="summary-card">
        <h4>Total Equipment</h4>
        <h2>{summary.total_equipment}</h2>
      </div>

      <div className="summary-card">
        <h4>Avg Flowrate</h4>
        <h2>{summary.average_flowrate}</h2>
      </div>

      <div className="summary-card">
        <h4>Avg Pressure</h4>
        <h2>{summary.average_pressure}</h2>
      </div>

      <div className="summary-card">
        <h4>Avg Temperature</h4>
        <h2>{summary.average_temperature}</h2>
      </div>
    </div>
  );
}
