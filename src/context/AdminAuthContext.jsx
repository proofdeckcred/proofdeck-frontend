import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAdminProfile } from '../api';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdmin = async () => {
    setLoading(true);
    try {
      const res = await getAdminProfile();
      // Expecting { id, name, email, role, permissions, is_admin }
      setAdmin(res.data);
      setError(null);
    } catch (err) {
      console.error("Admin Auth Context Error:", err);
      setAdmin(null);
      setError(err.response?.data?.msg || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  const login = (adminData) => {
    setAdmin(adminData);
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('adminToken'); // Ensure token is cleared using the key you use
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, error, refreshAdmin: fetchAdmin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
