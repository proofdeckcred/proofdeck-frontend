import React from "react";
import { ArrowUp, ArrowDown, DollarSign, Users, AlertCircle, Activity, Building, CreditCard, ShieldCheck } from "lucide-react";
import { Doughnut } from "react-chartjs-2";

export const PulseCard = ({ title, value, subtext, icon: Icon, trend, color, subColor }) => (
  <div className="p-4 sm:p-5 bg-white hover:bg-slate-50/20 transition-colors">
    <div className="flex items-center justify-between mb-1.5 gap-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
        {title}
      </span>
      <div className={`p-1.5 rounded-lg ${color || 'bg-slate-100'} ${subColor || 'text-slate-600'} shrink-0`}>
        <Icon size={14} />
      </div>
    </div>
    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mt-1">
      {value}
    </h3>
    {subtext && (
      <p className={`text-[10px] font-medium mt-0.5 flex items-center gap-1 ${
        trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-400'
      }`}>
        {trend === 'up' && <ArrowUp size={11} />}
        {trend === 'down' && <ArrowDown size={11} />}
        {subtext}
      </p>
    )}
  </div>
);

export const RevenueWidget = ({ revenueToday, revenueMonth, revenueTotal, revenueByPlan }) => {
  const planKeys = Object.keys(revenueByPlan || {});
  const planValues = Object.values(revenueByPlan || {});

  const data = {
    labels: planKeys.map(k => k.toUpperCase()),
    datasets: [
      {
        data: planValues.length > 0 ? planValues : [1],
        backgroundColor: ['#5B4CF5', '#10B981', '#F59E0B', '#6366F1', '#EC4899'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: { size: 11, family: 'system-ui' },
          color: '#64748B'
        }
      }
    },
    cutout: '72%',
    maintainAspectRatio: false
  };

  return (
    <div className="border border-slate-200/80 bg-white rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Financial Performance</h3>
          <p className="text-[10px] text-slate-400">Real-time revenue metrics & tier distribution</p>
        </div>
        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded text-[10px] font-bold">
          Live Billing
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Metric Cards (7 cols) */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Today</span>
            <p className="text-base font-bold text-slate-900 mt-1">${(revenueToday || 0).toLocaleString()}</p>
          </div>
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">This Month</span>
            <p className="text-base font-bold text-slate-900 mt-1">${(revenueMonth || 0).toLocaleString()}</p>
          </div>
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">All-Time</span>
            <p className="text-base font-bold text-[#5B4CF5] mt-1">${(revenueTotal || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Doughnut Chart (5 cols) */}
        <div className="md:col-span-5 h-36 relative flex items-center justify-center">
          <p className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-400 text-center pointer-events-none leading-tight">
            TIER<br/>SPLIT
          </p>
          <Doughnut data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export const ChurnWidget = ({ failedPayments, expiredSubs }) => (
  <div className="border border-slate-200/80 bg-white rounded-xl p-5 shadow-xs space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-bold text-slate-800">Retention & Billing Risks</h3>
      <span className="text-[10px] text-slate-400">Last 30 Days</span>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-100 flex flex-col justify-between">
        <div className="flex items-center justify-between text-rose-600">
          <span className="text-[10px] font-bold uppercase tracking-wider">Failed Charges</span>
          <CreditCard size={14} />
        </div>
        <div className="text-xl font-bold text-rose-700 mt-2">{failedPayments || 0}</div>
        <span className="text-[9px] text-rose-500 font-medium">Requires retry</span>
      </div>

      <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-100 flex flex-col justify-between">
        <div className="flex items-center justify-between text-amber-600">
          <span className="text-[10px] font-bold uppercase tracking-wider">Quiet / Lapsed</span>
          <Users size={14} />
        </div>
        <div className="text-xl font-bold text-amber-700 mt-2">{expiredSubs || 0}</div>
        <span className="text-[9px] text-amber-500 font-medium">Win-back eligible</span>
      </div>
    </div>
  </div>
);

export const ActiveOrgsWidget = ({ total, active30d }) => {
  const percentage = total > 0 ? Math.round(((active30d || 0) / total) * 100) : 0;

  return (
    <div className="border border-slate-200/80 bg-white rounded-xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Active Organizations</h3>
          <p className="text-[10px] text-slate-400">Companies issuing credentials (30d)</p>
        </div>
        <span className="px-2 py-0.5 bg-indigo-50 text-[#5B4CF5] border border-indigo-100 rounded text-[10px] font-bold">
          {percentage}%
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900">{active30d || 0}</span>
        <span className="text-xs text-slate-400">/ {total || 0} enrolled organizations</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-[#5B4CF5] h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};
