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
  <div className="dashboard">

    <header className="dashboard-header">
      <h1>Chemical Equipment Visualizer</h1>
      <p>Upload equipment CSV files to analyze plant performance</p>
    </header>

    <section className="upload-section">
      <UploadBox onUpload={handleUpload} />
    </section>

    {summary && (
      <>
        <section className="summary-section fade-in">
          <SummaryCards summary={summary} />
        </section>

        <section className="charts-section fade-in delay">
          <Charts summary={summary} />
        </section>
      </>
    )}

  </div>
);

}