import React, { useState, useEffect } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
    Users,
    DollarSign,
    FileText,
    TrendingUp,
    Download,
} from "lucide-react";
import { getAdminAnalytics } from "../api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const formatNumber = (num) =>
  num ? num.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0";

function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("1y");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getAdminAnalytics(period);
      setAnalytics(res.data);
    } catch (err) {
      setError("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  const getChartOptions = (text) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text },
    },
  });

  const generateChartData = (label, data, color) => ({
    labels: data?.map((g) => `${g.month}/${g.year}`) || [],
    datasets: [
      {
        label: label,
        data: data?.map((g) => g.count || g.total) || [],
        borderColor: color,
        backgroundColor: `${color}40`,
        tension: 0.3, // Smoother curve
        fill: true,
      },
    ],
  });

  if (loading) {
     return <div className="flex justify-center items-center h-[60vh] text-gray-500">Loading Analytics...</div>
  }
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">{error}</div>;
  if (!analytics) return <div className="p-4 bg-blue-50 text-blue-600 rounded-lg">No analytics data found.</div>;

  const { kpi_stats } = analytics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-sm text-gray-500">
             Comprehensive view of platform performance
          </p>
        </div>
         <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            {['30d', '90d', '1y', 'all'].map((p) => (
                <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all
                        ${period === p ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    {p === 'all' ? 'All Time' : p.toUpperCase()}
                </button>
            ))}
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Users size={24}/>
                </div>
                 <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{formatNumber(kpi_stats.total_users)}</h3>
            <p className="text-sm text-gray-500">Total Users</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                    <DollarSign size={24}/>
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${formatNumber(kpi_stats.total_revenue)}</h3>
            <p className="text-sm text-gray-500">Total Revenue</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                    <FileText size={24}/>
                </div>
                 <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+24%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{formatNumber(kpi_stats.total_certificates)}</h3>
            <p className="text-sm text-gray-500">Total Certificates</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                    <TrendingUp size={24}/>
                </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{formatNumber(kpi_stats.avg_certs_per_user)}</h3>
            <p className="text-sm text-gray-500">Avg. Certs / User</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[350px]">
            <Line
                options={getChartOptions("Revenue Growth (USD)")}
                data={generateChartData(
                  "Revenue",
                  analytics.revenue_growth,
                  "#10B981" // Tailwind Green-500
                )}
            />
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[350px]">
            <Line
                options={getChartOptions("New User Signups")}
                data={generateChartData(
                  "Users",
                  analytics.user_growth,
                  "#3B82F6" // Tailwind Blue-500
                )}
            />
         </div>
      </div>

       {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[350px]">
             <Line
                options={getChartOptions("Certificates Issued")}
                data={generateChartData(
                  "Certificates",
                  analytics.cert_growth,
                  "#F59E0B" // Tailwind Amber-500
                )}
              />
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[350px] flex flex-col justify-center">
             <Doughnut
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' },
                        title: { display: true, text: 'Plan Distribution' }
                    }
                }}
                data={{
                  labels: analytics.plan_distribution?.map((p) => p.role.toUpperCase()) || [],
                  datasets: [
                    {
                      label: "Users",
                      data: analytics.plan_distribution?.map((p) => p.count) || [],
                      backgroundColor: [
                        "#F472B6", // Pink
                        "#60A5FA", // Blue
                        "#FBBF24", // Amber
                        "#34D399", // Emerald
                        "#A78BFA", // Violet
                      ],
                      borderWidth: 0
                    },
                  ],
                }}
              />
         </div>
      </div>

      {/* Top Users Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[400px]">
         <Bar
            options={getChartOptions("Top 5 Users by Certificates Issued")}
            data={{
                labels: analytics.top_users?.map((u) => u.name) || [],
                datasets: [
                {
                    label: "Certificates",
                    data: analytics.top_users?.map((u) => u.cert_count) || [],
                    backgroundColor: "#6366F1", // Indigo
                    borderRadius: 4,
                },
                ],
            }}
            />
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;
