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
    <section className="history-section">
      <header className="history-header">
        <h2>Historical Analysis</h2>
        <p className="subtitle">
          Trends, anomalies, and comparisons across recent uploads
        </p>
      </header>

      {comparison && (
        <div className="comparison-grid">
          <div className="metric-card">
            <span>Flowrate change</span>
            <strong>{comparison.flowrate}%</strong>
          </div>
          <div className="metric-card">
            <span>Pressure change</span>
            <strong>{comparison.pressure}%</strong>
          </div>
          <div className="metric-card">
            <span>Temperature change</span>
            <strong>{comparison.temperature}%</strong>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="empty-state">
          📁 Upload a CSV to see historical analysis here
        </div>
      ) : (
        <>
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Units</th>
                  <th>Avg Flowrate</th>
                  <th>Avg Pressure</th>
                  <th>Avg Temperature</th>
                </tr>
              </thead>

              <tbody>
                {history.map(item => {
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
          </div>

          <button
            className="secondary"
            onClick={() =>
              window.open(
                "http://127.0.0.1:8000/api/download-pdf/",
                "_blank"
              )
            }
          >
            Download latest PDF report
          </button>
        </>
      )}
    </section>
  );
}
