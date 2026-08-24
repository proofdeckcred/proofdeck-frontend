import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { resetPassword } from "../api";
import "../styles/Auth.css";

function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await resetPassword(token, formData.password);
      setMessage(response.data.msg + " Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Failed to reset password. The link may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-panel">
          <h2>Create a New Password</h2>
          <p>
            Your new password must be different from previously used passwords.
          </p>
        </div>
        <div className="auth-form-container">
          <img
            src="/logo.png"
            alt="ProofDeck Logo"
            className="auth-logo mx-auto d-block"
            style={{ maxHeight: "45px" }}
          />
          <h3>Set New Password</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3 position-relative" controlId="password">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your new password"
                required
                className="password-input"
                disabled={!!message}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </Form.Group>

            <Form.Group className="mb-4 position-relative" controlId="confirmPassword">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                required
                disabled={!!message}
                className="password-input"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </Form.Group>

            <Button
              className="btn-auth w-100"
              type="submit"
              disabled={loading || !!message}
            >
              {loading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Reset Password"
              )}
            </Button>
          </Form>
          {message && (
            <p className="text-center mt-4 text-muted">
              <Link to="/login" className="auth-switch-link">
                Go to Login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
