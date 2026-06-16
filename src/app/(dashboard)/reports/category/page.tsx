"use client";

import { useRef, useEffect } from "react";
import PanelCard from "@/components/ui/PanelCard";
import DataTable, { Column } from "@/components/ui/DataTable";

interface CategoryStat {
  category: string;
  color: string;
  unitsSold: number;
  revenue: string;
  revenueRaw: number;
  percentage: number;
  avgSale: string;
}

const STATS: CategoryStat[] = [
  { category: "TVs & Displays", color: "#2980B9", unitsSold: 48, revenue: "KES 3,744,000", revenueRaw: 3744000, percentage: 42, avgSale: "KES 78,000" },
  { category: "PA Systems", color: "#E74C3C", unitsSold: 34, revenue: "KES 2,856,000", revenueRaw: 2856000, percentage: 32, avgSale: "KES 84,000" },
  { category: "Audio Devices", color: "#8E44AD", unitsSold: 62, revenue: "KES 1,240,000", revenueRaw: 1240000, percentage: 14, avgSale: "KES 20,000" },
  { category: "Power & Cables", color: "#E6B800", unitsSold: 120, revenue: "KES 712,000", revenueRaw: 712000, percentage: 8, avgSale: "KES 5,933" },
  { category: "Accessories", color: "#27AE60", unitsSold: 310, revenue: "KES 356,000", revenueRaw: 356000, percentage: 4, avgSale: "KES 1,148" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const MONTHLY_DATA: Record<string, number[]> = {
  "TVs & Displays": [320, 410, 380, 520, 490, 620],
  "PA Systems": [180, 240, 290, 310, 280, 350],
  "Audio Devices": [90, 120, 145, 165, 130, 180],
  "Power & Cables": [55, 70, 80, 95, 88, 110],
  "Accessories": [30, 45, 50, 60, 52, 70],
};

function BarChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const categories = STATS.map((s) => s.category);
    const colors = STATS.map((s) => s.color);
    const barWidth = 14;
    const groupGap = 28;
    const barGap = 3;
    const paddingLeft = 56;
    const paddingBottom = 36;
    const paddingTop = 20;
    const chartHeight = canvas.height - paddingBottom - paddingTop;
    const chartWidth = canvas.width - paddingLeft - 20;

    const allValues = Object.values(MONTHLY_DATA).flat();
    const maxVal = Math.max(...allValues);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Y-axis grid + labels
    const steps = 5;
    ctx.textAlign = "right";
    ctx.font = "11px Source Sans 3, sans-serif";
    ctx.fillStyle = "#4e6073";
    for (let i = 0; i <= steps; i++) {
      const y = paddingTop + chartHeight - (i / steps) * chartHeight;
      const val = Math.round((i / steps) * maxVal);
      ctx.fillText(`${val}k`, paddingLeft - 6, y + 4);
      ctx.beginPath();
      ctx.strokeStyle = "#eceef1";
      ctx.lineWidth = 1;
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(canvas.width - 20, y);
      ctx.stroke();
    }

    // Bars
    const groupWidth = (chartWidth) / MONTHS.length;

    MONTHS.forEach((month, mIdx) => {
      const groupX = paddingLeft + mIdx * groupWidth;
      const totalBarsWidth = categories.length * (barWidth + barGap) - barGap;
      const startX = groupX + (groupWidth - totalBarsWidth) / 2;

      categories.forEach((cat, cIdx) => {
        const val = MONTHLY_DATA[cat][mIdx];
        const barH = (val / maxVal) * chartHeight;
        const x = startX + cIdx * (barWidth + barGap);
        const y = paddingTop + chartHeight - barH;

        ctx.fillStyle = colors[cIdx];
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, [2, 2, 0, 0]);
        ctx.fill();
      });

      // X-axis label
      ctx.textAlign = "center";
      ctx.fillStyle = "#4e6073";
      ctx.font = "11px Source Sans 3, sans-serif";
      ctx.fillText(month, groupX + groupWidth / 2, canvas.height - 10);
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={240}
      className="w-full"
      style={{ height: "240px" }}
    />
  );
}

export default function CategoryReportPage() {
  const columns: Column<CategoryStat>[] = [
    {
      header: "Category",
      render: (s) => (
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }}></span>
          <span className="font-body-semibold">{s.category}</span>
        </div>
      ),
    },
    { header: "Units Sold", align: "center", render: (s) => s.unitsSold },
    { header: "Revenue (KES)", render: (s) => <span className="font-body-semibold text-primary">{s.revenue}</span> },
    {
      header: "% of Total Revenue",
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
            />
          </div>
          <span className="text-[12px] font-bold w-8 text-right" style={{ color: s.color }}>
            {s.percentage}%
          </span>
        </div>
      ),
    },
    { header: "Avg Sale Value", render: (s) => s.avgSale },
  ];

  return (
    <div className="flex flex-col gap-[15px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-page-title font-page-title text-on-background">Sales by Category</h1>
          <p className="text-secondary text-label-sm">Revenue breakdown across all product categories</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-outline-variant/30 rounded px-2 py-1 shadow-sm gap-2">
            <input className="border-none focus:ring-0 p-0 text-body-reg bg-transparent" type="date" defaultValue="2024-01-01" />
            <span className="text-secondary text-label-sm">to</span>
            <input className="border-none focus:ring-0 p-0 text-body-reg bg-transparent" type="date" defaultValue="2024-06-30" />
          </div>
          <button className="bg-primary text-on-primary px-4 py-2 flex items-center gap-2 rounded shadow-sm hover:opacity-90 transition-opacity font-body-semibold">
            <span className="material-symbols-outlined text-[18px]">bar_chart</span>
            Generate
          </button>
          <button className="bg-on-secondary-fixed-variant text-on-primary px-4 py-2 flex items-center gap-2 rounded shadow-sm hover:opacity-90 transition-opacity font-body-semibold">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
        </div>
      </div>

      {/* Summary stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[15px]">
        {STATS.map((s) => (
          <div
            key={s.category}
            className="bg-white border border-[#EEEEEE] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-4 relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: s.color }}
            />
            <p className="text-label-sm text-secondary pl-3">{s.category}</p>
            <p className="font-tile-number text-[22px] font-bold pl-3 mt-1" style={{ color: s.color }}>
              {s.percentage}%
            </p>
            <p className="text-label-sm text-secondary pl-3">{s.revenue}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown table */}
      <PanelCard title="Category Revenue Breakdown" icon="pie_chart">
        <DataTable columns={columns} rows={STATS} rowKey={(s) => s.category} />
      </PanelCard>

      {/* Bar chart — 6-month trend by category */}
      <PanelCard title="Monthly Revenue by Category — Last 6 Months (KES thousands)" icon="bar_chart">
        <div className="p-4">
          <div className="flex flex-wrap gap-4 mb-4">
            {STATS.map((s) => (
              <div key={s.category} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                <span className="text-[11px] text-secondary">{s.category}</span>
              </div>
            ))}
          </div>
          <BarChart />
        </div>
      </PanelCard>
    </div>
  );
}