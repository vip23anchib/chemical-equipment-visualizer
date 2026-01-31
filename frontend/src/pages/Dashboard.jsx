import History from "../components/History";
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

    <section className="dashboard-section">
    {/* Upload */}
    <UploadBox onUpload={handleUpload} />
    </section>

    <section className="dashboard-section">
    {/* Summary */}
    {summary && (
      <div className="fade-in">
        <SummaryCards summary={summary} />
      </div>
    )}
    </section>

    <section className="dashboard-section">
    {/* Charts */}
    {summary && (
      <div className="fade-in delay">
        <Charts summary={summary} />
      </div>
    )}
    </section>

    {/* 🔥 THIS WAS MISSING */}
    <History />

  </div>
);


}