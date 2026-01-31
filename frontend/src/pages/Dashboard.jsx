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

    {/* Upload */}
    <UploadBox onUpload={handleUpload} />

    {/* Summary */}
    {summary && (
      <div className="fade-in">
        <SummaryCards summary={summary} />
      </div>
    )}

    {/* Charts */}
    {summary && (
      <div className="fade-in delay">
        <Charts summary={summary} />
      </div>
    )}

    {/* 🔥 THIS WAS MISSING */}
    <History />

  </div>
);


}