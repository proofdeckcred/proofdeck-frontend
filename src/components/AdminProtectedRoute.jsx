import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { Spinner } from "react-bootstrap";

function AdminProtectedRoute() {
  const { admin, loading, error } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!admin) {
    return (
        <Navigate
            to="/admin/login"
            state={{ from: location, error: error || "Please log in to access the admin portal." }}
            replace
        />
    );
  }

  return <Outlet />;
}

export default AdminProtectedRoute;
