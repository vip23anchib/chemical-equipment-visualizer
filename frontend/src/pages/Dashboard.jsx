import { useState } from "react";
import Layout from "../components/Layout";
import UploadBox from "../components/UploadBox";
import SummaryCards from "../components/SummaryCards";
import Charts from "../components/Charts";
import History from "../components/History";
import { uploadCSV } from "../services/api";
import { Download, FileText, Clock, BarChart3, Sparkles, Shield, Zap } from "lucide-react";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  async function handleUpload(file) {
    try {
      setIsLoading(true);
      console.log("Starting upload for file:", file.name);
      const data = await uploadCSV(file, () => { });
      console.log("Upload successful:", data);
      setSummary(data);
      
      // Extract and store validation warnings
      const validationWarnings = data.validation_warnings || [];
      setWarnings(validationWarnings);
      
      // Show alert if warnings exist
      if (validationWarnings && validationWarnings.length > 0) {
        let warningText = "⚠️ Data Validation Warnings:\n\n";
        validationWarnings.forEach(warning => {
          warningText += `${warning.message}\n`;
          warning.details.slice(0, 2).forEach(detail => {
            warningText += `  • ${detail}\n`;
          });
          if (warning.details.length > 2) {
            warningText += `  ... and ${warning.details.length - 2} more\n`;
          }
          warningText += "\n";
        });
        alert(warningText);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed: " + err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownloadReport = () => {
    window.open("http://127.0.0.1:8000/api/download-pdf/", "_blank");
  };

  const renderContent = () => {
    switch (activeNav) {
      case "dashboard":
        return (
          <div className="space-y-8">
            {/* Upload Section */}
            <section className="animate-fade-up">
              <UploadBox onUpload={handleUpload} isLoading={isLoading} />
            </section>

            {/* Summary Cards */}
            {summary && (
              <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-300">ℹ️ Data shown below is derived from the last uploaded CSV file.</p>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Analysis Summary</h3>
                    <p className="text-sm text-slate-500">Real-time equipment metrics</p>
                  </div>
                  <button
                    onClick={handleDownloadReport}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Report
                  </button>
                </div>
                <SummaryCards summary={summary} warnings={warnings} />
              </section>
            )}

            {/* Charts */}
            {summary && (
              <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <Charts summary={summary} />
              </section>
            )}
          </div>
        );

      case "upload":
        return (
          <div className="space-y-8">
            <section className="animate-fade-up">
              <UploadBox onUpload={handleUpload} isLoading={isLoading} />
            </section>
            {summary && (
              <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
                <SummaryCards summary={summary} />
              </section>
            )}
          </div>
        );

      case "history":
        return (
          <div className="animate-fade-up">
            <History />
          </div>
        );

      case "reports":
        return (
          <div className="animate-fade-up space-y-6">
            {/* Reports Header Card */}
            <div className="card-gradient">
              <div className="flex items-start gap-6">
                <div
                  className="flex items-center justify-center w-16 h-16 rounded-2xl flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <FileText className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Generate Reports</h3>
                  <p className="text-slate-400 mb-6">
                    Export comprehensive PDF reports with detailed equipment analysis, performance metrics, and trend insights.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(148, 163, 184, 0.05)' }}>
                      <BarChart3 className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm text-slate-300">Summary Statistics</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(148, 163, 184, 0.05)' }}>
                      <Zap className="w-5 h-5 text-amber-400" />
                      <span className="text-sm text-slate-300">Performance Metrics</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(148, 163, 184, 0.05)' }}>
                      <Shield className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm text-slate-300">Anomaly Detection</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadReport}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Latest Report
                  </button>
                </div>
              </div>
            </div>

            {/* Report Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                    <Clock className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Latest Upload Report</h4>
                    <p className="text-xs text-slate-500">Based on most recent data</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Generates a comprehensive report from your most recent CSV upload including all equipment metrics and distributions.
                </p>
                <button
                  onClick={handleDownloadReport}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Generate PDF
                </button>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                    <Sparkles className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Report Features</h4>
                    <p className="text-xs text-slate-500">What's included</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Equipment count and classification
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                    Average flowrate, pressure, temperature
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                    Equipment type distribution
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Professional PDF formatting
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro tip */}
            <div
              className="flex items-start gap-4 px-6 py-4 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}
            >
              <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-white mb-1">Pro Tip</h4>
                <p className="text-sm text-slate-400">
                  Upload a CSV file first to generate meaningful reports. Each report captures a snapshot of your equipment data at the time of upload.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout activeNav={activeNav} setActiveNav={setActiveNav}>
      {renderContent()}
    </Layout>
  );
}