import React, { useState, useEffect } from "react";
import {
  Users,
  FileBadge,
  DollarSign,
  BarChart2,
  ListOrdered,
  ShoppingCart,
  Loader2,
  AlertCircle,
  Inbox,
  Activity
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
import { Link } from "react-router-dom";
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
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'super_admin';
  const isBusinessAdmin = admin?.role === 'business_admin';
  const can = (perm) => isSuperAdmin || admin?.permissions?.[perm];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const responseData = await getAdminDashboardStats();
        setData(responseData.data || responseData);
      } catch (err) {
        setError("Failed to load dashboard stats. Please refresh.");
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
        <AlertCircle size={20} />
        {error}
      </div>
    );
  if (!data || (!data.kpi && !data.recent_users))
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex items-center gap-2">
        <Inbox size={20} />
        No dashboard data found or database is empty.
      </div>
    );

  const { kpi, recent_users, recent_payments, revenue_trend_30d, revenue_by_plan } = data;

  // Chart Data for Pulse Trend (Revenue)
  const revenueChartData = {
    labels: (revenue_trend_30d || []).map((item) =>
      new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    ),
    datasets: [
      {
        label: "Daily Revenue (USD)",
        data: (revenue_trend_30d || []).map((item) => item.revenue),
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { 
        beginAtZero: true, 
        ticks: { callback: (value) => `$${value}`, color: '#94a3b8' },
        grid: { color: '#334155' }
      },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
    },
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Executive Pulse</h1>
            <div className="flex items-center gap-3 mt-2">
                <p className="text-sm text-gray-500 mb-0">
                Performance overview for {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                {isSuperAdmin && <span className="badge-pill bg-purple-100 text-purple-800 border-purple-200">Super Admin</span>}
                {isBusinessAdmin && <span className="badge-pill bg-blue-100 text-blue-800 border-blue-200">Business Admin</span>}
            </div>
        </div>
      </div>

       {/* System Health (Super Admin Only) */}
       {isSuperAdmin && <SystemHealthWidget />}

       {/* 1. PULSE SECTION (Top Row) */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {can('view_payments') && (
                <PulseCard 
                    title="Revenue Today"
                    value={formatCurrency(kpi?.revenue_today)}
                    subtext="vs yesterday" // Placeholder logic
                    icon={DollarSign}
                    color="bg-green-100" subColor="text-green-600"
                    trend="up"
                />
            )}
            {can('view_users') && (
                <PulseCard 
                    title="Total Users"
                    value={formatNumber(kpi?.total_users)}
                    subtext={`+${kpi?.new_users_30d} this month`}
                    icon={Users}
                    color="bg-indigo-100" subColor="text-indigo-600"
                    trend="up"
                />
            )}
             {can('view_certificates') && (
                <PulseCard 
                    title="Certs Issued"
                    value={formatNumber(kpi?.total_certificates)}
                    subtext={`+${kpi?.new_certs_30d} this month`}
                    icon={FileBadge}
                    color="bg-blue-100" subColor="text-blue-600"
                    trend={kpi?.new_certs_30d > 0 ? "up" : "neutral"}
                />
            )}
            <PulseCard 
                title="Avg Certs/User"
                value={kpi?.avg_certs_user}
                subtext="Engagement Score"
                icon={Activity}
                color="bg-orange-100" subColor="text-orange-600"
            />
       </div>

       {/* 2. MAIN GRID (Revenue & Engagement) */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Financials & Trends */}
            <div className="lg:col-span-2 space-y-6">
                {can('view_analytics') ? (
                    <RevenueWidget 
                        revenueToday={kpi?.revenue_today}
                        revenueMonth={kpi?.revenue_this_month}
                        revenueTotal={kpi?.total_revenue}
                        revenueByPlan={revenue_by_plan}
                    />
                ) : (
                    <div className="h-64 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                        Revenue Analytics Hidden
                    </div>
                )}

                 {/* Revenue Trend Chart */}
                 {can('view_analytics') && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart2 size={20} className="text-gray-400" /> Revenue Trend (30 Days)
                        </h3>
                        <div className="h-64">
                             <Line data={revenueChartData} options={lineOptions} />
                        </div>
                    </div>
                 )}
            </div>

            {/* Right Column: Churn, Active Orgs & Signups */}
            <div className="lg:col-span-1 space-y-6">
                 {can('view_companies') && (
                     <div className="h-64">
                         <ActiveOrgsWidget total={kpi?.total_companies} active30d={kpi?.active_companies_30d} />
                     </div>
                 )}

                 {can('view_payments') && (
                     <ChurnWidget 
                        failedPayments={kpi?.failed_payments_30d} 
                        expiredSubs={kpi?.expired_subs_count} 
                    />
                 )}

                 {/* Signups List (Moved to Right Column) */}
                 {can('view_users') && (
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[400px]">
                        <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 rounded-t-xl">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <ListOrdered size={20} className="text-gray-400" /> New Signups
                            </h3>
                            <Link to="/admin/users" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</Link>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {recent_users && recent_users.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                {recent_users.map((user) => (
                                    <Link to={`/admin/users/${user.id}`} key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 no-underline text-current transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900 mb-0">{user.name}</p>
                                                <p className="text-xs text-gray-500 mb-0">{user.email}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">{new Date(user.date).toLocaleDateString()}</span>
                                    </Link>
                                ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 p-8">No new users.</p>
                            )}
                        </div>
                     </div>
                 )}
            </div>
       </div>

      {/* 3. Transaction Table (Bottom) */}
      {can('view_payments') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingCart size={20} className="text-gray-400" /> Recent Transactions
                </h3>
                 <Link to="/admin/payments" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</Link>
            </div>
            <div className="overflow-x-auto">
            {recent_payments && recent_payments.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {recent_payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{p.user_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold uppercase rounded-full bg-indigo-100 text-indigo-800">{p.plan}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{formatCurrency(p.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            ) : (
                <p className="text-center text-gray-500 p-8">No recent transactions.</p>
            )}
            </div>
        </div>
      )}

       {/* Style override for badges since I used inline styles in previous edit, cleaning up */}
       <style>{`
         .badge-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; border-width: 1px; }
       `}</style>
    </div>
  );
}

export default AdminDashboardPage;

