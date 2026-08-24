import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { verifyAdmin } from "../api";
import "../styles/Auth.css";

function AdminVerifyPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from the navigation state passed from the signup page
  const email = location.state?.email;

  if (!email) {
    // If user lands here directly, redirect them
    navigate("/admin/login");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await verifyAdmin({ email, code });
      // On success, redirect to login with a success message
      navigate("/admin/login", {
        state: { message: "Verification successful! Please log in." },
      });
    } catch (err) {
      setError(err.response?.data?.msg || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-panel" style={{ backgroundColor: "#198754" }}>
          <h2>Verify Your Admin Account</h2>
          <p>
            An email with a 6-digit verification code has been sent to{" "}
            <strong>{email}</strong>.
          </p>
        </div>
        <div className="auth-form-container">
          <img
            src="/logo.png"
            alt="ProofDeck Logo"
            className="auth-logo mx-auto d-block"
            style={{ maxHeight: "45px" }}
          />
          <h3>Enter Verification Code</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4" controlId="code">
              <Form.Label>6-Digit Code</Form.Label>
              <Form.Control
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                required
                maxLength="6"
              />
            </Form.Group>
            <Button
              className="btn-auth w-100"
              style={{ backgroundColor: "#198754", borderColor: "#198754" }}
              type="submit"
              disabled={loading}
            >
              {loading ? <Spinner as="span" size="sm" /> : "Verify Account"}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default AdminVerifyPage;
