function UploadBox({ onUpload }) {
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDrag(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }

  return (
    <div
      className={`upload-box ${drag ? "drag" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
    >
      <p>{file ? file.name : "Drag & drop CSV here or click to browse"}</p>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={() => onUpload(file)}>
        Upload & Analyze
      </button>
    </div>
  );
}
