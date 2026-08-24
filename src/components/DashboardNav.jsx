import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

function DashboardNav() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold">
          <span style={{ color: "#22C55E" }}>Certify</span>
          <span style={{ color: "#2563EB" }}>Me</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="dashboard-nav" />
        <Navbar.Collapse id="dashboard-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard" className="mx-2">
              My Certificates
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard/templates" className="mx-2">
              Templates
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard/bulk-create" className="mx-2">
              Bulk Create
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard/settings" className="mx-2">
              Settings
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default DashboardNav;
