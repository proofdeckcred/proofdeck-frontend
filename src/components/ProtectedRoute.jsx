// --- START OF FILE frontend/src/components/ProtectedRoute.jsx ---
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Check for the JWT in local storage
  const token = localStorage.getItem("token");

  // If a token exists, render the child routes (the dashboard).
  // The <Outlet /> component is a placeholder for the nested routes.
  // If no token exists, redirect the user to the /login page.
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
// --- END OF FILE frontend/src/components/ProtectedRoute.jsx ---
