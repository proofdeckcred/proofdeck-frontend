import React from "react";
import { ArrowUp, ArrowDown, DollarSign, Users, AlertCircle, Activity, Building, CreditCard } from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";

export const PulseCard = ({ title, value, subtext, icon: Icon, trend, color, subColor }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      {subtext && <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
         {trend === 'up' ? <ArrowUp size={12}/> : trend === 'down' ? <ArrowDown size={12}/> : null} {subtext}
      </p>}
    </div>
    <div className={`p-3 rounded-xl ${color} ${subColor} flex items-center justify-center`}>
      <Icon size={24} />
    </div>
  </div>
);

export const RevenueWidget = ({ revenueToday, revenueMonth, revenueTotal, revenueByPlan }) => {
    const data = {
        labels: Object.keys(revenueByPlan || {}).map(k => k.toUpperCase()),
        datasets: [
          {
            data: Object.values(revenueByPlan || {}),
            backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
            borderWidth: 0,
          },
        ],
    };

    const options = {
        plugins: { legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8 } } },
        cutout: '75%',
        maintainAspectRatio: false
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <DollarSign size={20} className="text-blue-600"/> Financial Overview
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Metrics */}
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase">Revenue Today</p>
                        <p className="text-xl font-bold text-gray-900">${(revenueToday || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase">This Month</p>
                        <p className="text-xl font-bold text-gray-900">${(revenueMonth || 0).toLocaleString()}</p>
                    </div>
                     <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase">Total Revenue</p>
                        <p className="text-xl font-bold text-gray-900">${(revenueTotal || 0).toLocaleString()}</p>
                    </div>
                </div>

                {/* Chart */}
                <div className="h-48 relative">
                   <p className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 font-medium pointer-events-none">REVENUE<br/>BY PACKAGE</p>
                   <Doughnut data={data} options={options} />
                </div>
            </div>
        </div>
    );
};

export const ChurnWidget = ({ failedPayments, expiredSubs }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500"/> Churn Risks
        </h3>
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full text-red-600 shadow-sm"><CreditCard size={16}/></div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Failed Payments</p>
                        <p className="text-xs text-red-600">Action Required</p>
                    </div>
                </div>
                <span className="text-2xl font-bold text-gray-900">{failedPayments}</span>
            </div>

             <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full text-orange-600 shadow-sm"><Users size={16}/></div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Inactive Users</p>
                        <p className="text-xs text-orange-600">No Activity</p>
                    </div>
                </div>
                <span className="text-2xl font-bold text-gray-900">{expiredSubs}</span>
            </div>
             <p className="text-xs text-gray-400 mt-2 text-center">Data based on last 30 days activity.</p>
        </div>
    </div>
);

export const ActiveOrgsWidget = ({ total, active30d }) => (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl shadow-lg p-6 text-white h-full relative overflow-hidden">
        <div className="relative z-10">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                <Building size={20} className="text-indigo-200"/> Active Organizations
            </h3>
            <p className="text-indigo-200 text-sm mb-6">Companies issuing certificates</p>
            
            <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold">{active30d}</span>
                <span className="text-lg text-indigo-200 mb-1">/ {total}</span>
            </div>
            
            <div className="w-full bg-indigo-900/30 rounded-full h-2">
                <div 
                    className="bg-white h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((active30d / (total || 1)) * 100, 100)}%` }}
                ></div>
            </div>
            <p className="text-xs text-indigo-200 mt-2">{(active30d / (total || 1) * 100).toFixed(1)}% Engagement Rate</p>
        </div>
        
        {/* Decorative Background */}
        <Building size={120} className="absolute -bottom-4 -right-4 text-white opacity-10 rotate-12" />
    </div>
);
