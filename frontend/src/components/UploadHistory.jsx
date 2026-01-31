import React from "react";

export default function UploadHistory({ history }) {
  return (
    <div className="history-card">
      <h3>Upload History (Last 5)</h3>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Total Equipment</th>
            <th>Avg Pressure</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, idx) => (
            <tr key={idx}>
              <td>{new Date(item.created_at).toLocaleString()}</td>
              <td>{item.total_equipment}</td>
              <td>{item.average_pressure}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
