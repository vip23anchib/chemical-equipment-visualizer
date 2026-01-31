import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { PieChart, Zap } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const chartColors = [
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#ec4899", // pink-500
];

export default function Charts({ summary }) {
  if (!summary) return null;

  const labels = Object.keys(summary.equipment_type_distribution || {});
  const values = Object.values(summary.equipment_type_distribution || {});

  if (labels.length === 0) return null;

  const total = values.reduce((a, b) => a + b, 0);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: chartColors.slice(0, labels.length),
        borderColor: '#0a0a0f',
        borderWidth: 4,
        hoverOffset: 8,
        hoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "70%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 4,
      },
    },
  };

  return (
    <div className="card-gradient">
      <div className="flex items-center gap-4 mb-6">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}
        >
          <PieChart className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Equipment Distribution</h3>
          <p className="text-sm text-slate-400">Breakdown by equipment type</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Chart */}
        <div className="relative flex justify-center">
          <div className="w-64 h-64 relative">
            <Doughnut data={data} options={options} />
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{total}</span>
              <span className="text-sm text-slate-400">Total Units</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {labels.map((label, idx) => {
            const percentage = ((values[idx] / total) * 100).toFixed(1);
            return (
              <div
                key={label}
                className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                style={{ background: 'rgba(148, 163, 184, 0.05)' }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: chartColors[idx] }}
                  />
                  <span className="text-sm font-medium text-slate-300">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white">{values[idx]}</span>
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{
                      background: `${chartColors[idx]}20`,
                      color: chartColors[idx]
                    }}
                  >
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight badge */}
      <div
        className="mt-6 flex items-center gap-2 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
      >
        <Zap className="w-4 h-4 text-indigo-400" />
        <span className="text-sm text-slate-300">
          <span className="text-indigo-400 font-medium">Insight:</span> {labels[0]} accounts for the highest portion of your equipment
        </span>
      </div>
    </div>
  );
}
