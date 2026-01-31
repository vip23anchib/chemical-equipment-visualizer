import Charts from "../components/Charts";


import { useState } from "react";

import UploadBox from "../components/UploadBox";
import SummaryCards from "../components/SummaryCards";
import { uploadCSV } from "../services/api";

export default function Dashboard() {
    const [progress, setProgress] = useState(0);

  const [summary, setSummary] = useState(null);

  async function handleUpload(file) {
  try {
    setProgress(0);
    const data = await uploadCSV(file, setProgress);
    setSummary(data);
  } catch (err) {
    alert("Upload failed");
  }
}


return (
  <div className="app-container">
    <h1>Chemical Equipment Visualizer</h1>
    <p className="subtitle">
      Upload equipment CSV files to analyze plant performance
    </p>

    <div className="card">
      <UploadBox onUpload={handleUpload} />
    </div>

    {progress > 0 && progress < 100 && (
  <div className="progress-bar">
    <div
      className="progress-fill"
      style={{ width: `${progress}%` }}
    />
    <span>{progress}%</span>
  </div>
)}


    {summary && (
  <div className="fade-in">
    <SummaryCards summary={summary} />
  </div>
)}

{summary && (
  <div className="fade-in delay">
    <Charts summary={summary} />
  </div>
)}

  </div>
);
}