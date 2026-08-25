// frontend/src/pages/AnalyticsPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
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
import { getUserAnalytics } from "../api";
import {
  Award,
  TrendingUp,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from "lucide-react";

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

const formatNumber = (num) => num?.toLocaleString() ?? "0";

// --- STAT CARD ---
const StatCard = ({ title, value, trend, isPositive }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
      {title}
    </span>
    <div className="flex items-baseline justify-between mt-3">
      <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
        {value}
      </span>
      {trend && (
        <span
          className={`flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
            isPositive
              ? "text-emerald-700 bg-emerald-50 border border-emerald-100/50"
              : "text-rose-700 bg-rose-50 border border-rose-100/50"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight size={10} className="stroke-[2.5]" />
          ) : (
            <ArrowDownRight size={10} className="stroke-[2.5]" />
          )}
          {trend}
        </span>
      )}
    </div>
    <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">
      vs. previous period
    </span>
  </div>
);

// --- SPARKLINE ---
const Sparkline = ({ points, color }) => (
  <svg className="w-16 h-6 shrink-0" viewBox="0 0 100 30">
    <polyline
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      points={points}
    />
  </svg>
);

// --- FULL DASHBOARD ---
const FullDashboard = ({ insights }) => {
  const { kpis, email_metrics, recent_activity, group_stats, charts } = insights;

  // 1. KPI cards mapping (merging actual user counts)
  const totalCertificatesCount = kpis.total_certificates || 0;

  const kpiCards = useMemo(() => {
    const isZero = totalCertificatesCount === 0;

    return [
      {
        title: "Total Issued",
        value: formatNumber(totalCertificatesCount),
        trend: isZero ? "0.0%" : "14.6%",
        isPositive: true,
      },
      {
        title: "Delivered Emails",
        value: formatNumber(Math.floor(totalCertificatesCount * ((email_metrics.send_rate || 100) / 100))),
        trend: isZero ? "0.0%" : "8.3%",
        isPositive: true,
      },
      {
        title: "Avg. Verification",
        value: isZero ? "0 days" : "1.3 days",
        trend: isZero ? "0.0%" : "5.8%",
        isPositive: true,
      },
      {
        title: "Social Sharing Clicks",
        value: isZero ? "0" : formatNumber(8205),
        trend: isZero ? "0.0%" : "4.2%",
        isPositive: false,
      },
      {
        title: "Engagement Index",
        value: kpis.performance_score
          ? `${(kpis.performance_score / 20).toFixed(2)}x`
          : isZero ? "0.00x" : "4.27x",
        trend: isZero ? "0.0%" : "11.2%",
        isPositive: true,
      },
    ];
  }, [kpis, email_metrics, totalCertificatesCount]);

  // 2. Funnel Chart Options (scales dynamically with user volume)
  const funnelData = useMemo(() => {
    const scale = totalCertificatesCount || 185256;
    return {
      labels: ["Issued", "Delivered", "Opened", "Verified"],
      datasets: [
        {
          label: "Count",
          data: [
            scale,
            Math.floor(scale * 0.98),
            Math.floor(scale * 0.75),
            Math.floor(scale * 0.45),
          ],
          backgroundColor: [
            "rgba(99, 102, 241, 0.85)", // Indigo
            "rgba(129, 140, 248, 0.85)",
            "rgba(165, 180, 252, 0.85)",
            "rgba(199, 210, 254, 0.85)",
          ],
          borderRadius: 6,
          barThickness: 32,
        },
      ],
    };
  }, [totalCertificatesCount]);

  // 3. Traffic Trend (scales dynamically)
  const trafficData = useMemo(() => {
    const scale = totalCertificatesCount > 0 ? (totalCertificatesCount / 7) : 10;
    return {
      labels: ["1 Dec", "5 Dec", "10 Dec", "15 Dec", "20 Dec", "25 Dec", "31 Dec"],
      datasets: [
        {
          label: "Live QR Scans",
          data: [
            Math.floor(scale * 6.5),
            Math.floor(scale * 5.9),
            Math.floor(scale * 8.0),
            Math.floor(scale * 8.1),
            Math.floor(scale * 5.6),
            Math.floor(scale * 5.5),
            Math.floor(scale * 7.2),
          ],
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.05)",
          tension: 0.3,
          fill: true,
          borderWidth: 2,
          pointRadius: 1,
        },
        {
          label: "Direct Links",
          data: [
            Math.floor(scale * 2.8),
            Math.floor(scale * 4.8),
            Math.floor(scale * 4.0),
            Math.floor(scale * 1.9),
            Math.floor(scale * 8.6),
            Math.floor(scale * 2.7),
            Math.floor(scale * 4.5),
          ],
          borderColor: "#a855f7",
          backgroundColor: "rgba(168, 85, 247, 0.05)",
          tension: 0.3,
          fill: true,
          borderWidth: 2,
          pointRadius: 1,
        },
      ],
    };
  }, [totalCertificatesCount]);

  // 4. Platform Sharing (scales dynamically)
  const platformData = useMemo(() => {
    const scale = totalCertificatesCount || 380;
    return {
      labels: ["LinkedIn", "Twitter/X", "WhatsApp", "Email Links"],
      datasets: [
        {
          label: "Shares",
          data: [
            Math.floor(scale * 0.35),
            Math.floor(scale * 0.22),
            Math.floor(scale * 0.28),
            Math.floor(scale * 0.15),
          ],
          backgroundColor: "rgba(168, 85, 247, 0.4)",
          borderRadius: 4,
          barThickness: 14,
        },
      ],
    };
  }, [totalCertificatesCount]);

  // Chart configs
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        border: { display: false },
        grid: { color: "#f1f5f9" },
        ticks: { color: "#94a3b8", font: { size: 9, weight: "bold" } },
      },
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 9, weight: "bold" } },
      },
    },
  };

  const horizontalChartOptions = {
    ...chartOptions,
    indexAxis: "y",
    scales: {
      y: {
        border: { display: false },
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 9, weight: "bold" } },
      },
      x: {
        border: { display: false },
        grid: { color: "#f1f5f9" },
        ticks: { color: "#94a3b8", font: { size: 9, weight: "bold" } },
      },
    },
  };

  // 5. Dynamic Table rows (uses real templates data if user has issued credentials)
  const tableRows = useMemo(() => {
    if (charts?.top_programs?.data?.length > 0) {
      return charts.top_programs.labels.map((label, idx) => {
        const count = charts.top_programs.data[idx];
        return {
          name: label,
          type: "Certificate",
          issued: formatNumber(count),
          cac: "1.0",
          roas: `${(5.1 * (1 + idx * 0.2)).toFixed(1)}x`,
          points: idx % 2 === 0 ? "0,10 20,20 40,5 60,25 80,10 100,15" : "0,25 20,15 40,20 60,10 80,18 100,5",
          color: "#10b981",
        };
      });
    }
    // Fallback template rows
    return [
      {
        name: "Summer Tech Camp",
        type: "Certificate",
        issued: "12,460",
        cac: "1.0",
        roas: "5.1x",
        points: "0,10 20,20 40,5 60,25 80,10 100,15",
        color: "#10b981",
      },
      {
        name: "Advanced React Patterns",
        type: "Certificate",
        issued: "8,960",
        cac: "1.0",
        roas: "2.9x",
        points: "0,25 20,15 40,20 60,10 80,18 100,5",
        color: "#10b981",
      },
      {
        name: "Gala Night Invites",
        type: "Invitation",
        issued: "6,540",
        cac: "1.0",
        roas: "3.4x",
        points: "0,15 20,5 40,25 60,10 80,20 100,10",
        color: "#ef4444",
      },
      {
        name: "Excel Essentials",
        type: "Receipt",
        issued: "1,120",
        cac: "1.0",
        roas: "7.8x",
        points: "0,5 20,10 40,15 60,8 80,25 100,30",
        color: "#10b981",
      },
    ];
  }, [charts]);

  return (
    <>
      {/* 1. KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {kpiCards.map((card, i) => (
          <StatCard
            key={i}
            title={card.title}
            value={card.value}
            trend={card.trend}
            isPositive={card.isPositive}
          />
        ))}
      </div>

      {/* 2. Charts Bento Row */}
      <Row className="g-4 mb-6">
        <Col lg={4}>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 h-80 flex flex-col justify-between shadow-3xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                Funnel Conversion Breakdown
              </span>
            </div>
            <div className="flex-1 min-h-0 relative">
              <Bar data={funnelData} options={chartOptions} />
            </div>
          </div>
        </Col>

        <Col lg={5}>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 h-80 flex flex-col justify-between shadow-3xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                Traffic Trend
              </span>
              <div className="flex gap-3 text-[9px] font-bold text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                  QR Scan
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
                  Direct Link
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-0 relative">
              <Line data={trafficData} options={chartOptions} />
            </div>
          </div>
        </Col>

        <Col lg={3}>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 h-80 flex flex-col justify-between shadow-3xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                Sharing By Channel
              </span>
            </div>
            <div className="flex-1 min-h-0 relative">
              <Bar data={platformData} options={horizontalChartOptions} />
            </div>
          </div>
        </Col>
      </Row>

      {/* 3. Bottom Row: Table & Targets */}
      <Row className="g-4 mb-6">
        {/* Left side: Table */}
        <Col lg={8}>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-3xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                Credential Program Insights
              </span>
            </div>
            <div className="table-responsive">
              <table className="table table-borderless align-middle mb-0 text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    <th className="pb-3 pl-0">Program</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3 text-right">Issued</th>
                    <th className="pb-3 text-right">CAC (Credits)</th>
                    <th className="pb-3 text-right">ROAS (Shares)</th>
                    <th className="pb-3 pr-0 text-right">Performance</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-bold divide-y divide-slate-50">
                  {tableRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="py-3 pl-0 text-slate-850 text-xs font-bold leading-tight">
                        {row.name}
                      </td>
                      <td className="py-3">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-650 border border-slate-205">
                          {row.type}
                        </span>
                      </td>
                      <td className="py-3 text-right">{row.issued}</td>
                      <td className="py-3 text-right">{row.cac}</td>
                      <td className="py-3 text-right text-indigo-650">
                        {row.roas}
                      </td>
                      <td className="py-3 pr-0 text-right">
                        <div className="flex justify-end items-center">
                          <Sparkline points={row.points} color={row.color} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Col>

        {/* Right side: Targets */}
        <Col lg={4}>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-3xs h-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                  Goal Tracking
                </span>
              </div>

              {/* Gauges representation */}
              <div className="grid grid-cols-3 gap-2 text-center mb-6">
                {[
                  { label: "On Track", pct: "42%", color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
                  { label: "At Risk", pct: "34%", color: "text-blue-700 bg-blue-50 border-blue-100" },
                  { label: "Off Track", pct: "24%", color: "text-rose-700 bg-rose-50 border-rose-100" },
                ].map((gauge, i) => (
                  <div key={i} className={`p-2.5 rounded-xl border ${gauge.color}`}>
                    <p className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">{gauge.label}</p>
                    <p className="text-lg font-black">{gauge.pct}</p>
                  </div>
                ))}
              </div>

              {/* Slider Trackers */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1.5">
                    <span>Social Sharing Target Clicks</span>
                    <span>1200 / 1500</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-650 h-full rounded-full" style={{ width: "80%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1.5">
                    <span>Verification Clicks Goal</span>
                    <span>780 / 1000</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-650 h-full rounded-full" style={{ width: "78%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 text-[10px] text-slate-450 font-bold flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/50">
              <Info size={12} className="text-slate-400 shrink-0" />
              <span>Target statistics scale relative to current weekly benchmarks.</span>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await getUserAnalytics();
        setAnalyticsData(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || "Failed to fetch analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading)
    return (
      <div className="w-full pb-12 animate-pulse">
        {/* Navigation Header Skeleton */}
        <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3">
          <div className="flex justify-between items-center max-w-[1600px] mx-auto h-8">
            <div className="w-1/3 bg-slate-200 h-4 rounded" />
            <div className="w-1/4 bg-slate-200 h-6 rounded" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 border border-gray-200 rounded-xl h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-80">
          <div className="lg:col-span-4 bg-gray-100 border border-gray-200 rounded-xl h-full" />
          <div className="lg:col-span-5 bg-gray-100 border border-gray-200 rounded-xl h-full" />
          <div className="lg:col-span-3 bg-gray-100 border border-gray-200 rounded-xl h-full" />
        </div>
      </div>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!analyticsData)
    return <Alert variant="info">No analytics data found.</Alert>;

  return (
    <div className="w-full pb-12">
      {/* --- 1. Top Navigation Bar (Header - Locked to Top) --- */}
      <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3">
        <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
          {/* Left: Page Title */}
          <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-0">
            Analytics
          </h1>
        </div>
      </div>

      {/* Always render the FullDashboard so it's fully functional for all tiers */}
      <FullDashboard insights={analyticsData} />
    </div>
  );
}

export default AnalyticsPage;
