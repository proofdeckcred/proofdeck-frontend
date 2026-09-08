import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  FileBadge,
  DollarSign,
  BarChart2,
  ListOrdered,
  Loader2,
  AlertCircle,
  Inbox,
  Activity,
  Mail,
  CreditCard,
  FileText,
  Radio,
  Plus,
  ArrowUpRight,
  Shield,
  RefreshCw,
  TrendingUp,
  Building,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from "chart.js";
import { getAdminDashboardStats } from "../api";
import { useAdminAuth } from "../context/AdminAuthContext";
import SystemHealthWidget from "../components/SystemHealthWidget";
import { PulseCard, RevenueWidget, ChurnWidget, ActiveOrgsWidget } from "../components/DashboardWidgets";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const formatNumber = (num) => (num || 0).toLocaleString();
const formatCurrency = (num) =>
  `$${(num || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'super_admin';
  const isBusinessAdmin = admin?.role === 'business_admin';
  const can = (perm) => isSuperAdmin || admin?.permissions?.[perm];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const responseData = await getAdminDashboardStats();
      setData(responseData.data || responseData);
      setError("");
    } catch (err) {
      setError("Failed to load dashboard stats. Please refresh.");
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-[#5B4CF5] mb-3" size={36} />
        <span className="text-xs text-slate-400 font-medium">Synchronizing Mission Control...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <AlertCircle size={16} />
          {error}
        </div>
        <button
          onClick={() => fetchStats()}
          className="text-xs font-bold text-rose-800 underline cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || (!data.kpi && !data.recent_users)) {
    return (
      <div className="bg-indigo-50/50 border border-indigo-100 text-indigo-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-medium">
        <Inbox size={16} />
        No platform activity recorded yet.
      </div>
    );
  }

  const { kpi, recent_users, revenue_trend_30d, revenue_by_plan } = data;

  // Chart Data for Pulse Trend (Revenue)
  const revenueChartData = {
    labels: (revenue_trend_30d || []).map((item) =>
      new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ),
    datasets: [
      {
        label: "Daily Revenue (USD)",
        data: (revenue_trend_30d || []).map((item) => item.revenue),
        borderColor: "#5B4CF5",
        backgroundColor: "rgba(91, 76, 245, 0.08)",
        pointBackgroundColor: "#5B4CF5",
        pointBorderColor: "#FFFFFF",
        pointHoverRadius: 5,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { size: 11 },
        bodyFont: { size: 12, weight: 'bold' },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `$${Number(context.raw || 0).toLocaleString()} USD`
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        ticks: { 
          callback: (value) => `$${value}`, 
          color: '#94A3B8',
          font: { size: 10 }
        },
        grid: { color: '#F1F5F9' }
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#94A3B8', font: { size: 10 } } 
      },
    },
  };

  // Quick Operations for Admin (matching User Dashboard quickActions format)
  const adminQuickActions = [
    {
      title: "Email Broadcasts",
      description: "Dispatch marketing and updates",
      buttonText: "Compose",
      icon: <Mail className="w-4 h-4 text-[#5B4CF5]" />,
      onClick: () => navigate("/admin/broadcasts"),
    },
    {
      title: "User Management",
      description: "Adjust quotas, plans and roles",
      buttonText: "Directory",
      icon: <Users className="w-4 h-4 text-emerald-600" />,
      onClick: () => navigate("/admin/users"),
    },
    {
      title: "Payments & Invoices",
      description: "Monitor Paystack and renewals",
      buttonText: "Billing",
      icon: <CreditCard className="w-4 h-4 text-amber-600" />,
      onClick: () => navigate("/admin/payments"),
    },
    {
      title: "Certificates Registry",
      description: "Inspect live cryptographic proofs",
      buttonText: "Ledger",
      icon: <FileText className="w-4 h-4 text-indigo-600" />,
      onClick: () => navigate("/admin/certificates"),
    },
    {
      title: "Support Tickets",
      description: "Resolve issuer help requests",
      buttonText: "Tickets",
      icon: <Radio className="w-4 h-4 text-purple-600" />,
      onClick: () => navigate("/admin/support"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* --- 1. Executive Top Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Executive Pulse
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/70">
              {isSuperAdmin ? 'Super Admin' : isBusinessAdmin ? 'Business Admin' : 'Admin'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time platform performance for {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="px-3 py-1.5 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh statistics"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#5B4CF5]' : 'text-slate-400'} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {can('view_messaging') && (
            <Link
              to="/admin/broadcasts"
              className="px-3.5 py-1.5 bg-[#5B4CF5] hover:bg-[#4738E8] text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1.5 no-underline"
            >
              <Plus size={14} />
              <span>New Broadcast</span>
            </Link>
          )}
        </div>
      </div>

      {/* --- 2. System Vitals Bar (Super Admin Only) --- */}
      {isSuperAdmin && <SystemHealthWidget />}

      {/* --- 3. Core Platform KPIs Bento Grid (User Dashboard Style) --- */}
      <div className="border border-slate-200/80 bg-white rounded-xl shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
          {can('view_payments') && (
            <PulseCard 
              title="Revenue Today"
              value={formatCurrency(kpi?.revenue_today)}
              subtext="Real-time intake"
              icon={DollarSign}
              color="bg-emerald-50 text-emerald-600"
              trend="up"
            />
          )}

          {can('view_users') && (
            <PulseCard 
              title="Total Issuers"
              value={formatNumber(kpi?.total_users)}
              subtext={`+${kpi?.new_users_30d || 0} this month`}
              icon={Users}
              color="bg-indigo-50 text-[#5B4CF5]"
              trend="up"
            />
          )}

          {can('view_certificates') && (
            <PulseCard 
              title="Certs Issued"
              value={formatNumber(kpi?.total_certificates)}
              subtext={`+${kpi?.new_certs_30d || 0} this month`}
              icon={FileBadge}
              color="bg-blue-50 text-blue-600"
              trend={kpi?.new_certs_30d > 0 ? "up" : "neutral"}
            />
          )}

          <PulseCard 
            title="Avg Certs / User"
            value={kpi?.avg_certs_user || "0.0"}
            subtext="Platform Engagement"
            icon={Activity}
            color="bg-amber-50 text-amber-600"
            trend="neutral"
          />
        </div>
      </div>

      {/* --- 4. Admin Quick Operations Strip (Matching User Dashboard Quick Actions) --- */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Quick Operations
          </h3>
          <span className="text-[10px] font-semibold text-slate-400">1-Click Platform Shortcuts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {adminQuickActions.map((action, i) => (
            <div
              key={i}
              onClick={action.onClick}
              className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-xs hover:shadow-sm hover:border-[#5B4CF5]/40 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-slate-50 group-hover:bg-indigo-50/60 rounded-lg transition-colors">
                  {action.icon}
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#5B4CF5] transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#5B4CF5] transition-colors">
                  {action.title}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {action.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- 5. Main Split (Financial Trends & Live Feeds) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Revenue Analytics & Line Chart */}
        <div className="lg:col-span-8 space-y-6">
          {can('view_analytics') && (
            <RevenueWidget 
              revenueToday={kpi?.revenue_today}
              revenueMonth={kpi?.revenue_this_month}
              revenueTotal={kpi?.total_revenue}
              revenueByPlan={revenue_by_plan}
            />
          )}

          {can('view_analytics') && (
            <div className="border border-slate-200/80 bg-white rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Revenue Trajectory (30 Days)</h3>
                  <p className="text-[10px] text-slate-400">Daily gross payment intake in USD</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  <TrendingUp size={13} />
                  <span>30-Day Pacing</span>
                </div>
              </div>

              <div className="h-64">
                <Line data={revenueChartData} options={lineOptions} />
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Orgs, Churn & Recent Signups */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Organizations Meter */}
          {can('view_companies') && (
            <ActiveOrgsWidget total={kpi?.total_companies} active30d={kpi?.active_companies_30d} />
          )}

          {/* Churn & Failed Payments */}
          {can('view_payments') && (
            <ChurnWidget 
              failedPayments={kpi?.failed_payments_30d} 
              expiredSubs={kpi?.expired_subs_count} 
            />
          )}

          {/* New Signups Live Stream */}
          {can('view_users') && (
            <div className="border border-slate-200/80 bg-white rounded-xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <ListOrdered size={15} className="text-[#5B4CF5]" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-0">
                    Recent Signups
                  </h3>
                </div>
                <Link
                  to="/admin/users"
                  className="text-[11px] font-bold text-[#5B4CF5] hover:underline"
                >
                  View All →
                </Link>
              </div>

              <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
                {recent_users && recent_users.length > 0 ? (
                  recent_users.map((user) => (
                    <div
                      key={user.id}
                      className="p-3.5 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate mb-0">
                            {user.name || "Anonymous Issuer"}
                          </p>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            user.plan === 'enterprise'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                              : user.plan === 'pro'
                              ? 'bg-indigo-50 text-[#5B4CF5] border border-indigo-200/60'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {user.plan || 'Starter'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : '—'}
                        </span>
                        <Link
                          to={`/admin/users/${user.id}`}
                          className="text-[10px] font-semibold text-[#5B4CF5] hover:underline mt-0.5 block"
                        >
                          Audit →
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new signups in the last 7 days.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
