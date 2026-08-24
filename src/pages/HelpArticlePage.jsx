// frontend/src/pages/HelpArticlePage.jsx

import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { ArrowLeft, ChatDots } from "react-bootstrap-icons";
import { helpArticles } from "../data/helpArticles.jsx";
import "../styles/HelpCenter.css"; // --- IMPORT THE NEW STYLESHEET

function HelpArticlePage() {
  const { slug } = useParams();
  const article = helpArticles.find((art) => art.slug === slug);

  if (!article) {
    return <Navigate to="/dashboard/support" />;
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={8}>
          <Link
            to="/dashboard/support"
            className="text-decoration-none text-muted d-inline-block mb-4"
          >
            <ArrowLeft /> Back to Help Center
          </Link>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4 p-md-5">
              <h1 className="fw-bold mb-4">{article.title}</h1>
              {/* This div now gets styled by our new CSS */}
              <div className="article-content">{article.content}</div>
            </Card.Body>
          </Card>

          <div className="p-4 mt-5 rounded-3 bg-light text-center">
            <h4 className="fw-bold">Still need help?</h4>
            <p className="text-muted">
              If this article didn't solve your issue, our team is ready to
              assist.
            </p>
            <Button as={Link} to="/dashboard/support/tickets" variant="primary">
              <ChatDots className="me-2" /> Contact Support
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default HelpArticlePage;
