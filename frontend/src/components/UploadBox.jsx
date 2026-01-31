import { useState } from "react";

export default function UploadBox({ onUpload }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    await onUpload(file);
    setLoading(false);
  };

  return (
  <div className="upload-card">
    <h3>Upload Equipment CSV</h3>

    <div
      className="drop-zone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        setFile(e.dataTransfer.files[0]);
      }}
    >
      {file ? (
        <p>{file.name}</p>
      ) : (
        <p>Drag & drop CSV here or click to browse</p>
      )}

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        hidden
        id="fileInput"
      />
    </div>

    {loading && <div className="progress-bar" />}

    <button onClick={handleSubmit} disabled={loading || !file}>
      {loading ? "Uploading..." : "Upload & Analyze"}
    </button>
  </div>
);

}
