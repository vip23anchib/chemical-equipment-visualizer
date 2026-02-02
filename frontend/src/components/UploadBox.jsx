import { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle, CloudUpload, Sparkles } from "lucide-react";

export default function UploadBox({ onUpload, isLoading }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async () => {
    if (!file) return;
    console.log("Uploading file:", file.name);
    await onUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      setFile(droppedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="card-gradient">
      <div className="flex items-center gap-4 mb-6">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}
        >
          <CloudUpload className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Upload Equipment Data</h3>
          <p className="text-sm text-slate-400">
            Import CSV files for comprehensive analysis
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative flex flex-col items-center justify-center p-10 rounded-xl cursor-pointer transition-all duration-300"
        style={{
          background: isDragging
            ? 'rgba(99, 102, 241, 0.1)'
            : file
              ? 'rgba(16, 185, 129, 0.1)'
              : 'rgba(15, 23, 42, 0.5)',
          border: isDragging
            ? '2px dashed rgba(99, 102, 241, 0.5)'
            : file
              ? '2px dashed rgba(16, 185, 129, 0.5)'
              : '2px dashed rgba(148, 163, 184, 0.2)',
        }}
      >
        {file ? (
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-xl"
              style={{ background: 'rgba(16, 185, 129, 0.15)' }}
            >
              <FileText className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-white">{file.name}</p>
              <p className="text-sm text-slate-400">
                {(file.size / 1024).toFixed(1)} KB - Ready to analyze
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="p-2 ml-4 rounded-lg transition-colors text-slate-400 hover:text-white"
              style={{ background: 'rgba(148, 163, 184, 0.1)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <div
              className="flex items-center justify-center w-16 h-16 mb-4 rounded-2xl"
              style={{ background: 'rgba(148, 163, 184, 0.05)' }}
            >
              <Upload className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-white font-medium mb-1">
              Drag and drop your CSV file here
            </p>
            <p className="text-sm text-slate-500">or click to browse files</p>
            <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full" style={{ background: 'rgba(148, 163, 184, 0.05)' }}>
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span className="text-xs text-slate-500">AI-powered analysis</span>
            </div>
          </>
        )}

        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
      </div>

      {/* Progress Bar */}
      {isLoading && (
        <div className="mt-4 overflow-hidden rounded-full h-1.5" style={{ background: 'rgba(148, 163, 184, 0.1)' }}>
          <div
            className="h-full rounded-full animate-pulse"
            style={{
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)',
              width: '100%'
            }}
          ></div>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className="btn-primary flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Upload & Analyze
            </>
          )}
        </button>
      </div>
    </div>
  );
}
