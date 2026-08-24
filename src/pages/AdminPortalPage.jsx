import React, { useState, useEffect } from "react";
import { getAdminStatus } from "../api";
import AdminLoginPage from "./AdminLoginPage";
import AdminSignupPage from "./AdminSignupPage";
import { Spinner } from "react-bootstrap";

// This component acts as a gatekeeper, showing either the signup or login page.
function AdminPortalPage() {
  const [adminExists, setAdminExists] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await getAdminStatus();
        setAdminExists(response.data.admin_exists);
      } catch (error) {
        console.error("Could not verify admin status", error);
        // Fail securely - assume admin exists if API fails
        setAdminExists(true);
      } finally {
        setLoading(false);
      }
    };
    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return adminExists ? <AdminLoginPage /> : <AdminSignupPage />;
}

export default AdminPortalPage;
