import { useEffect, useState } from "react";
import {
  History as HistoryIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle,
  BarChart3,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function TrendBadge({ value, label }) {
  const numValue = parseFloat(value);
  const isPositive = numValue > 0;
  const isNegative = numValue < 0;

  return (
    <div className="card text-center">
      <p className="text-sm font-medium text-slate-400 mb-2">{label}</p>
      <div className="flex items-center justify-center gap-2">
        {isPositive ? (
          <div className="p-1.5 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
        ) : isNegative ? (
          <div className="p-1.5 rounded-lg" style={{ background: 'rgba(244, 63, 94, 0.15)' }}>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
        ) : (
          <div className="p-1.5 rounded-lg" style={{ background: 'rgba(148, 163, 184, 0.1)' }}>
            <Minus className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <span
          className={`text-2xl font-bold ${isPositive
              ? "text-emerald-400"
              : isNegative
                ? "text-rose-400"
                : "text-slate-400"
            }`}
        >
          {isPositive ? "+" : ""}
          {value}%
        </span>
      </div>
    </div>
  );
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("http://127.0.0.1:8000/api/history/")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHistory(data);
        } else if (Array.isArray(data.history)) {
          setHistory(data.history);
        } else {
          setHistory([]);
        }
      })
      .catch(() => setHistory([]))
      .finally(() => setIsLoading(false));
  }, []);

  const latest = history[0];
  const previous = history[1];

  const comparison =
    latest && previous
      ? {
        flowrate: (
          ((latest.average_flowrate - previous.average_flowrate) /
            previous.average_flowrate) *
          100
        ).toFixed(1),
        pressure: (
          ((latest.average_pressure - previous.average_pressure) /
            previous.average_pressure) *
          100
        ).toFixed(1),
        temperature: (
          ((latest.average_temperature - previous.average_temperature) /
            previous.average_temperature) *
          100
        ).toFixed(1),
      }
      : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#94a3b8",
          font: { size: 12, family: "Inter" },
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b" },
      },
      y: {
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: { color: "#64748b" },
      },
    },
  };

  const trendChartData = {
    labels: history.slice().reverse().map((_, i) => `Upload ${i + 1}`),
    datasets: [
      {
        label: "Flowrate (m³/h)",
        data: history.slice().reverse().map((h) => h.average_flowrate),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#0a0a0f",
        pointBorderWidth: 2,
      },
      {
        label: "Pressure (bar)",
        data: history.slice().reverse().map((h) => h.average_pressure),
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#06b6d4",
        pointBorderColor: "#0a0a0f",
        pointBorderWidth: 2,
      },
      {
        label: "Temperature (°C)",
        data: history.slice().reverse().map((h) => h.average_temperature),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#f59e0b",
        pointBorderColor: "#0a0a0f",
        pointBorderWidth: 2,
      },
    ],
  };

  const equipmentChartData = {
    labels: history.slice().reverse().map((_, i) => `Upload ${i + 1}`),
    datasets: [
      {
        label: "Total Equipment",
        data: history.slice().reverse().map((h) => h.total_equipment),
        backgroundColor: ["#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-16">
          <div
            className="animate-spin w-8 h-8 rounded-full border-2 border-t-transparent"
            style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}
          >
            <HistoryIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Historical Analysis</h3>
            <p className="text-sm text-slate-400">
              Tracking {history.length} uploads - Performance trends
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => window.open("http://127.0.0.1:8000/api/download-pdf/", "_blank")}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Analysis Report
          </button>
        )}
      </div>

      {/* Comparison Cards */}
      {comparison && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TrendBadge value={comparison.flowrate} label="Flowrate Change" />
          <TrendBadge value={comparison.pressure} label="Pressure Change" />
          <TrendBadge value={comparison.temperature} label="Temperature Change" />
        </div>
      )}

      {history.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div
            className="flex items-center justify-center w-20 h-20 mb-6 rounded-2xl"
            style={{ background: 'rgba(148, 163, 184, 0.05)' }}
          >
            <FileSpreadsheet className="w-10 h-10 text-slate-600" />
          </div>
          <h4 className="text-xl font-semibold text-white mb-2">No historical data</h4>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Upload your first CSV file to start tracking equipment performance trends
          </p>
          <button className="btn-secondary flex items-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-gradient">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                  <Activity className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Parameter Trends</h4>
                  <p className="text-xs text-slate-500">Average values over time</p>
                </div>
              </div>
              <Line data={trendChartData} options={chartOptions} />
            </div>

            <div className="card-gradient">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                  <BarChart3 className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Equipment Volume</h4>
                  <p className="text-xs text-slate-500">Units per upload</p>
                </div>
              </div>
              <Bar data={equipmentChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
            </div>
          </div>

          {/* Data Table */}
          <div className="card overflow-hidden p-0">
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}
            >
              <h4 className="font-semibold text-white">Upload Records</h4>
              <span className="text-xs text-slate-500">{history.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Units</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Flowrate</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Pressure</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Temp</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => {
                    const isAnomaly = item.average_pressure > 10 || item.average_temperature > 150;
                    return (
                      <tr
                        key={item.uploaded_at || index}
                        className="transition-colors"
                        style={{
                          background: isAnomaly ? 'rgba(244, 63, 94, 0.05)' : 'transparent',
                          borderBottom: '1px solid rgba(148, 163, 184, 0.05)'
                        }}
                      >
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {new Date(item.uploaded_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-white">{item.total_equipment}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{item.average_flowrate} m³/h</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{item.average_pressure} bar</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{item.average_temperature}°C</td>
                        <td className="px-6 py-4">
                          {isAnomaly ? (
                            <span className="badge badge-danger flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" /> Anomaly
                            </span>
                          ) : (
                            <span className="badge badge-success flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" /> Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
