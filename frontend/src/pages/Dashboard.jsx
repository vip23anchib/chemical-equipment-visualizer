import Charts from "../components/Charts";


import { useState } from "react";

import UploadBox from "../components/UploadBox";
import SummaryCards from "../components/SummaryCards";
import { uploadCSV } from "../services/api";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  async function handleUpload(file) {
    try {
      const data = await uploadCSV(file);
      setSummary(data);
    } catch (err) {
  console.error("UPLOAD ERROR:", err);
  alert("Upload failed — check console");
}

  }


return (
  <div>
    <h1>Chemical Equipment Visualizer</h1>

    <UploadBox onUpload={handleUpload} />

    {summary && <SummaryCards summary={summary} />}

    {summary && <Charts summary={summary} />}
  </div>
);
}
