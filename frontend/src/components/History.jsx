import { useEffect, useState } from "react";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/history/")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
        } else if (Array.isArray(data.history)) {
          setHistory(data.history);
        } else {
          setHistory([]);
        }
      })
      .catch(() => setHistory([]));
  }, []);

  // 🔹 Compare last two uploads
  const latest = history[0];
  const previous = history[1];

  const comparison =
    latest && previous
      ? {
          flowrate: (
            ((latest.average_flowrate - previous.average_flowrate) /
              previous.average_flowrate) *
            100
          ).toFixed(2),

          pressure: (
            ((latest.average_pressure - previous.average_pressure) /
              previous.average_pressure) *
            100
          ).toFixed(2),

          temperature: (
            ((latest.average_temperature - previous.average_temperature) /
              previous.average_temperature) *
            100
          ).toFixed(2),
        }
      : null;

  return (
    <div className="history fade-in">
      <h2>Upload History</h2>

      {/* 🔹 Comparison box */}
      {comparison && (
        <div className="comparison-box">
          <h4>Change from last upload</h4>
          <p>Flowrate: {comparison.flowrate}%</p>
          <p>Pressure: {comparison.pressure}%</p>
          <p>Temperature: {comparison.temperature}%</p>
        </div>
      )}

      {/* 🔹 Empty state */}
      {history.length === 0 ? (
        <p style={{ opacity: 0.7 }}>
          📁 Upload a CSV to see historical analysis here
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Total</th>
              <th>Avg Flow</th>
              <th>Avg Pressure</th>
              <th>Avg Temp</th>
            </tr>
          </thead>

          <tbody>
            {history.map(item => {
              // 🔥 Anomaly detection
              const isAnomaly =
                item.average_pressure > 10 ||
                item.average_temperature > 150;

              return (
                <tr
                  key={item.uploaded_at}
                  className={isAnomaly ? "anomaly" : ""}
                >
                  <td>{new Date(item.uploaded_at).toLocaleString()}</td>
                  <td>{item.total_equipment}</td>
                  <td>{item.average_flowrate}</td>
                  <td>{item.average_pressure}</td>
                  <td>{item.average_temperature}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
