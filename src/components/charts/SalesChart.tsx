"use client";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend
);

export default function SalesChart() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
    datasets: [
      {
        label: "Revenue",
        data: [4.2, 3.8, 5.1, 4.4, 6.2, 5.8, 6.1, 7.2, 6.9, 8.1, 7.8],
        borderColor: "#27AE60",
        backgroundColor: "rgba(39, 174, 96, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "VAT",
        data: [0.6, 0.5, 0.7, 0.6, 0.9, 0.8, 0.9, 1.0, 0.9, 1.1, 1.0],
        borderColor: "#2980B9",
        backgroundColor: "rgba(41, 128, 185, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Discounts",
        data: [0.2, 0.1, 0.2, 0.3, 0.2, 0.4, 0.3, 0.5, 0.4, 0.6, 0.5],
        borderColor: "#2C3E50",
        backgroundColor: "rgba(44, 62, 80, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#eceef1" },
        ticks: {
          callback: (value: string | number) => `${value}k`,
        },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return <Line data={data} options={options} />;
}