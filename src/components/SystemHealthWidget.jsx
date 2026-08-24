import React, { useEffect, useState } from "react";
import { HardDrive, Database, Cpu, AlertTriangle } from "lucide-react";
import axios from "axios";
import { SERVER_BASE_URL } from "../config";
import { Spinner } from "react-bootstrap";
import { useAdminAuth } from "../context/AdminAuthContext";

const API_URL = `${SERVER_BASE_URL}/api/admin/system/stats`;

const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <h4 className="text-xl font-bold text-gray-900">{value}</h4>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  </div>
);

const SystemHealthWidget = () => {
    const { admin } = useAdminAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                const res = await axios.get(API_URL, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load system stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <Spinner size="sm"/>;
    if (error) return <div className="text-red-500 text-xs">{error}</div>;
    if (!stats) return null;

    const disk = stats.disk || {};
    const db = stats.db || {};

    const isDiskCritical = disk.percent_used > 90;
    const isDiskWarning = disk.percent_used > 75;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Cpu size={20}/> System Health
            </h3>
            
            {(isDiskCritical || isDiskWarning) && (
                 <div className={`p-3 rounded-lg flex items-center gap-2 ${isDiskCritical ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    <AlertTriangle size={18}/>
                    <span className="text-sm font-bold">Warning: High Disk Usage ({disk.percent_used}%)</span>
                 </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    icon={HardDrive} 
                    label="Disk Usage" 
                    value={`${disk.used_gb} GB / ${disk.total_gb} GB`}
                    subtext={`${disk.percent_used}% Used`}
                    color={isDiskCritical ? "bg-red-500" : isDiskWarning ? "bg-yellow-500" : "bg-emerald-500"}
                />
                 <StatCard 
                    icon={Database} 
                    label="DB Users" 
                    value={db.users}
                    subtext="Total Registered"
                    color="bg-blue-500"
                />
                 <StatCard 
                    icon={Database} 
                    label="DB Certificates" 
                    value={db.certificates}
                    subtext="Total Issued"
                    color="bg-indigo-500"
                />
            </div>
        </div>
    );

};

export default SystemHealthWidget;
