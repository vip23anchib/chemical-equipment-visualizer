import { useState } from "react";

export default function UploadBox({ onUpload }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    setLoading(true);
    await onUpload(file);
    setLoading(false);
  }

  return (
    <div className="card">
      <h3>Upload Equipment CSV</h3>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload & Analyze"}
        </button>
      </form>
    </div>
  );
}
