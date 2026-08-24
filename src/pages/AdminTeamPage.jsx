import React, { useState, useEffect } from "react";
import { Users, Trash2, Key, Shield, Plus, MoreVertical, CheckCircle } from "lucide-react";
import axios from "axios";
import { SERVER_BASE_URL } from "../config";
import { Spinner } from "react-bootstrap";
import { useAdminAuth } from "../context/AdminAuthContext";

const API_URL = `${SERVER_BASE_URL}/api/admin/admins`;

function AdminTeamPage() {
  const { admin: currentAdmin } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "business_admin" });
  const [permissionModal, setPermissionModal] = useState({ show: false, adminId: null, permissions: {} });

  const availablePermissions = [
      { key: "view_users", label: "User Management" },
      { key: "view_companies", label: "Companies" },
      { key: "view_payments", label: "Payments" },
      { key: "view_certificates", label: "Certificates" },
      { key: "view_analytics", label: "Analytics" },
      { key: "view_support", label: "Support Tickets" },
      { key: "view_messaging", label: "Messaging" }
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(API_URL, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchAdmins();
      setFormData({ name: "", email: "", password: "", role: "business_admin" });
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create admin");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdmins();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const openPermissionModal = (admin) => {
      // Default permissions if null
      const currentPerms = admin.permissions || {};
      setPermissionModal({ show: true, adminId: admin.id, permissions: currentPerms });
  };

  const togglePermission = (key) => {
      setPermissionModal(prev => ({
          ...prev,
          permissions: {
              ...prev.permissions,
              [key]: !prev.permissions[key]
          }
      }));
  };

  const savePermissions = async () => {
      try {
          const token = localStorage.getItem("adminToken");
          await axios.put(`${API_URL}/${permissionModal.adminId}`, 
              { permissions: permissionModal.permissions },
              { headers: { Authorization: `Bearer ${token}` } }
          );
          setPermissionModal({ show: false, adminId: null, permissions: {} });
          fetchAdmins();
      } catch (err) {
          alert("Failed to update permissions");
      }
  };

  /* ... return JSX ... */
  return (
    <div className="space-y-6">
      {/* ... header ... */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-500 text-sm">Manage admins and their roles</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={18} /> Add New Admin
        </button>
      </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {admins.map(adm => (
                    <tr key={adm.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{adm.name}</div>
                            <div className="text-xs text-gray-500">{adm.email}</div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${
                                adm.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                {adm.role.replace('_', ' ')}
                            </span>
                        </td>
                         <td className="px-6 py-4">
                            {adm.is_verified ? (
                                <span className="text-green-600 flex items-center gap-1 text-xs font-medium"><CheckCircle size={14}/> Verified</span>
                            ) : (
                                <span className="text-yellow-600 text-xs">Pending</span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                             {/* Permissions Button for everyone except self */}
                            {adm.id !== currentAdmin?.id && (
                                <button onClick={() => openPermissionModal(adm)} className="text-gray-400 hover:text-indigo-600 p-2" title="Manage Permissions">
                                    <Shield size={18}/>
                                </button>
                            )}
                            
                            {adm.id !== currentAdmin?.id && (
                                <button onClick={() => handleDelete(adm.id)} className="text-gray-400 hover:text-red-600 p-2" title="Delete Admin">
                                    <Trash2 size={18}/>
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Add New Admin</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input required type="text" className="w-full mt-1 border rounded-lg p-2"
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input required type="email" className="w-full mt-1 border rounded-lg p-2"
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input required type="password" className="w-full mt-1 border rounded-lg p-2"
                            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select className="w-full mt-1 border rounded-lg p-2"
                            value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="business_admin">Business Admin</option>
                            <option value="super_admin">Super Admin</option>
                            <option value="support_admin">Support Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Admin</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Permissions Modal */}
      {permissionModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Manage Permissions</h3>
                <p className="text-sm text-gray-500 mb-4">Toggle features accessible to this admin.</p>
                
                <div className="space-y-3 mb-6">
                    {availablePermissions.map(p => (
                        <div key={p.key} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer" onClick={() => togglePermission(p.key)}>
                            <span className="text-sm font-medium text-gray-700">{p.label}</span>
                            <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${permissionModal.permissions[p.key] ? 'bg-indigo-600 justify-end' : 'bg-gray-300 justify-start'}`}>
                                <div className="bg-white w-4 h-4 rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    ))}
                </div>

                 <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setPermissionModal({show:false, adminId:null, permissions:{}})} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="button" onClick={savePermissions} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Permissions</button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
}

export default AdminTeamPage;
