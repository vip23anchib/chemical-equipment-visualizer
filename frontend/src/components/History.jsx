import { useEffect, useState } from "react";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/history/")
      .then(res => res.json())
      .then(data => {
        console.log("Raw history response:", data);

        if (Array.isArray(data)) {
          setHistory(data);
        } else if (Array.isArray(data.history)) {
          setHistory(data.history);
        } else if (Array.isArray(data.results)) {
          setHistory(data.results);
        } else {
          setHistory([]);
        }
      })
      .catch(err => {
        console.error("History fetch failed", err);
        setHistory([]);
      });
  }, []);

  return (
  <div className="history fade-in">
    <h2>Upload History</h2>

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
        {history.map((item, index) => (
          <tr key={index}>
            <td>{new Date(item.uploaded_at).toLocaleString()}</td>
            <td>{item.total_equipment}</td>
            <td>{item.average_flowrate}</td>
            <td>{item.average_pressure}</td>
            <td>{item.average_temperature}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

}