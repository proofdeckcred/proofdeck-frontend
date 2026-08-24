import React, { useState, useEffect } from "react";
import { Row, Col, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Radar, Doughnut, Line, Bar } from "react-chartjs-2";
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
  RadialLinearScale,
  ArcElement,
} from "chart.js";
import { getUserAnalytics } from "../api";
import {
  Target,
  Award,
  BarChart2,
  Users,
  TrendingUp,
  Mail,
  FolderOpen,
  Clock,
  PieChart,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
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
  Filler,
  RadialLinearScale,
  ArcElement
);

const formatNumber = (num) => num?.toLocaleString() ?? "0";

// --- COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, color, subtext, trend }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-100 transition-all hover:shadow-md">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span
          className={`flex items-center text-sm font-medium ${
            trend > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend > 0 ? (
            <ArrowUpRight size={16} className="mr-1" />
          ) : (
            <ArrowDownRight size={16} className="mr-1" />
          )}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-gray-500 text-sm font-medium mb-0">{title}</p>
    {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
  </div>
);

const ChartCard = ({ title, children, emptyMessage }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-100">
    <h4 className="text-lg font-bold text-gray-800 mb-6">{title}</h4>
    {children ? (
      <div className="w-100">{children}</div>
    ) : (
      <div className="h-64 flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <BarChart2 className="text-gray-300 mb-3" size={48} />
        <p className="text-gray-500 font-medium">{emptyMessage}</p>
      </div>
    )}
  </div>
);

const UpgradePrompt = () => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>
    <div className="bg-green-50 p-4 rounded-full mb-6">
      <TrendingUp size={48} className="text-green-600" />
    </div>
    <h2 className="text-3xl font-bold text-gray-900 mb-4">
      Unlock Professional Insights
    </h2>
    <p className="text-gray-600 max-w-2xl text-lg mb-8">
      Gain a competitive edge with peer benchmarking, performance scores, and
      detailed issuance trends. See how you stack up against others and identify
      your top-performing programs.
    </p>
    <Link
      to="/dashboard/settings"
      state={{ defaultTab: "billing" }}
      className="inline-flex items-center px-8 py-3 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
    >
      <Lock size={20} className="mr-2" /> Upgrade to Pro
    </Link>
  </div>
);

const FullDashboard = ({ insights }) => {
  const {
    kpis,
    benchmarking,
    charts,
    status_breakdown,
    top_recipient,
    template_usage,
    group_stats,
    email_metrics,
    recent_activity,
  } = insights;

  // Calculate MoM Growth
  const momData = charts.certs_over_time.data;
  const currentMonth = momData[momData.length - 1];
  const prevMonth = momData[momData.length - 2];
  const momGrowth =
    prevMonth > 0
      ? (((currentMonth - prevMonth) / prevMonth) * 100).toFixed(1)
      : "0";

  // Chart Options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, padding: 20 },
      },
    },
  };

  const radarData = {
    labels: benchmarking.labels,
    datasets: [
      {
        label: "You",
        data: benchmarking.user_data,
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        borderColor: "#4F46E5",
        borderWidth: 2,
      },
      {
        label: "Peer Avg",
        data: benchmarking.peer_average_data,
        backgroundColor: "rgba(107, 114, 128, 0.2)",
        borderColor: "#6B7280",
        borderWidth: 2,
      },
    ],
  };

  const lineData = {
    labels: charts.certs_over_time.labels,
    datasets: [
      {
        label: "Issued",
        data: charts.certs_over_time.data,
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14, 165, 233, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <>
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
          Core Performance
        </h3>
        <Row className="g-4">
          <Col md={3}>
            <StatCard
              title="Performance Score"
              value={kpis.performance_score}
              icon={Target}
              color="bg-indigo-50 text-indigo-600"
              subtext="Based on volume & consistency"
            />
          </Col>
          <Col md={3}>
            <StatCard
              title="Issuer Rank"
              value={`Top ${100 - kpis.percentile_rank}%`}
              icon={Award}
              color="bg-green-50 text-green-600"
              subtext="Compared to similar issuers"
            />
          </Col>
          <Col md={3}>
            <StatCard
              title="Total Certificates"
              value={formatNumber(kpis.total_certificates)}
              icon={BarChart2}
              color="bg-blue-50 text-blue-600"
              trend={momGrowth}
            />
          </Col>
          <Col md={3}>
            <StatCard
              title="Distinct Programs"
              value={formatNumber(kpis.total_programs)}
              icon={Users}
              color="bg-purple-50 text-purple-600"
            />
          </Col>
        </Row>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
          Operational Metrics
        </h3>
        <Row className="g-4">
          <Col md={3}>
            <StatCard
              title="Last 7 Days"
              value={formatNumber(recent_activity.last_7_days)}
              icon={Clock}
              color="bg-orange-50 text-orange-600"
            />
          </Col>
          <Col md={3}>
            <StatCard
              title="Email Delivery"
              value={`${email_metrics.send_rate}%`}
              icon={Mail}
              color="bg-teal-50 text-teal-600"
            />
          </Col>
          <Col md={3}>
            <StatCard
              title="Groups Created"
              value={formatNumber(group_stats.num_groups)}
              icon={FolderOpen}
              color="bg-gray-100 text-gray-600"
            />
          </Col>
          <Col md={3}>
            <StatCard
              title="Avg Certs / Group"
              value={group_stats.avg_certs_per_group}
              icon={PieChart}
              color="bg-pink-50 text-pink-600"
            />
          </Col>
        </Row>
      </div>

      <Row className="g-4 mb-8">
        <Col lg={4}>
          <ChartCard title="Performance Benchmarking">
            <div className="h-64">
              <Radar
                data={radarData}
                options={{
                  ...commonOptions,
                  scales: { r: { suggestedMin: 0, ticks: { display: false } } },
                }}
              />
            </div>
          </ChartCard>
        </Col>
        <Col lg={8}>
          <ChartCard title="Issuance Trends (12 Months)">
            <div className="h-64">
              <Line data={lineData} options={commonOptions} />
            </div>
          </ChartCard>
        </Col>
      </Row>

      <Row className="g-4 mb-8">
        <Col lg={6}>
          <ChartCard
            title="Top 5 Programs"
            emptyMessage="No program data available yet."
          >
            {charts.top_programs.data.length > 0 && (
              <div className="h-64">
                <Bar
                  data={{
                    labels: charts.top_programs.labels,
                    datasets: [
                      {
                        label: "Certificates",
                        data: charts.top_programs.data,
                        backgroundColor: "#3b82f6",
                        borderRadius: 4,
                      },
                    ],
                  }}
                  options={{ ...commonOptions, indexAxis: "y" }}
                />
              </div>
            )}
          </ChartCard>
        </Col>
        <Col lg={6}>
          <ChartCard
            title="Top Recipients"
            emptyMessage="No recipient data available yet."
          >
            {top_recipient.data.length > 0 && (
              <div className="h-64">
                <Bar
                  data={{
                    labels: top_recipient.labels,
                    datasets: [
                      {
                        label: "Certificates",
                        data: top_recipient.data,
                        backgroundColor: "#f59e0b",
                        borderRadius: 4,
                      },
                    ],
                  }}
                  options={{ ...commonOptions, indexAxis: "y" }}
                />
              </div>
            )}
          </ChartCard>
        </Col>
      </Row>

      <Row className="g-4 mb-8">
        <Col md={6}>
          <ChartCard
            title="Status Breakdown"
            emptyMessage="No status data yet."
          >
            {status_breakdown.data.length > 0 && (
              <div className="h-64">
                <Doughnut
                  data={{
                    labels: status_breakdown.labels,
                    datasets: [
                      {
                        data: status_breakdown.data,
                        backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
                      },
                    ],
                  }}
                  options={commonOptions}
                />
              </div>
            )}
          </ChartCard>
        </Col>
        <Col md={6}>
          <ChartCard
            title="Template Usage"
            emptyMessage="No template data yet."
          >
            {template_usage.data.length > 0 && (
              <div className="h-64">
                <Doughnut
                  data={{
                    labels: template_usage.labels,
                    datasets: [
                      {
                        data: template_usage.data,
                        backgroundColor: [
                          "#6366f1",
                          "#ec4899",
                          "#8b5cf6",
                          "#14b8a6",
                          "#f97316",
                        ],
                      },
                    ],
                  }}
                  options={commonOptions}
                />
              </div>
            )}
          </ChartCard>
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <p className="text-gray-500 font-medium">Crunching the numbers...</p>
      </div>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!analyticsData)
    return <Alert variant="info">No analytics data found.</Alert>;

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm">
            Visualize your issuance data and performance.
          </p>
        </div>
      </div>

      {analyticsData.upgrade_required ? (
        <UpgradePrompt />
      ) : (
        <FullDashboard insights={analyticsData} />
      )}
    </div>
  );
}

export default AnalyticsPage;
