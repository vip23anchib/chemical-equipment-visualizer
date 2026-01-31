import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Charts({ summary }) {
  if (!summary) return null;

  const labels = Object.keys(summary.equipment_type_distribution);
  const values = Object.values(summary.equipment_type_distribution);

  const data = {
    labels,
    datasets: [
      {
        label: "Equipment Count",
        data: values,
        backgroundColor: [
          "#4CAF50",
          "#2196F3",
          "#FF9800",
          "#E91E63",
          "#9C27B0"
        ],
      },
    ],
  };

  return (
  <div className="chart-wrapper">
    <h3>Equipment Type Distribution</h3>
    <Pie data={data} />
  </div>
);

}
