import React from "react";
import { SERVER_BASE_URL } from "../../../config";
import QRCode from "react-qr-code";

const ModernLandscape = ({ data }) => {
  const {
    primary_color = "#0284C7",
    secondary_color = "#E2E8F0",
    font_family = "Lato, sans-serif",
    logo_url,
    certificateTitle,
    recipient_name,
    certificateBody,
    course_title,
    issueDateFormatted,
    signature,
    issuer_name,
    verification_id,
    textStyle,
    backgroundStyle,
  } = data;

  const titleText = certificateTitle || "Certificate of Completion";
  const bodyText = certificateBody || "has successfully completed the course";
  const logoSrc = logo_url
    ? logo_url.startsWith("blob:") || logo_url.startsWith("http") || logo_url.startsWith("data:")
      ? logo_url
      : `${SERVER_BASE_URL}${logo_url}`
    : null;

  return (
    <div
      style={{
        width: "1122px",
        height: "794px",
        backgroundColor: "#ffffff",
        position: "relative",
        padding: "52px 68px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: font_family || "Lato, sans-serif",
        overflow: "hidden",
        ...backgroundStyle,
      }}
    >
      {/* Diagonal right accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "380px",
          height: "100%",
          background: `linear-gradient(225deg, ${primary_color}22 0%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* Top Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div>
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Logo"
              style={{ height: "64px", objectFit: "contain" }}
            />
          ) : (
            <span style={{ fontWeight: 800, fontSize: "20px", color: primary_color }}>
              {issuer_name}
            </span>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontWeight: 600,
              color: "#9CA3AF",
              margin: "0 0 4px 0",
            }}
          >
            {titleText}
          </p>
          <p
            style={{
              fontWeight: 700,
              fontSize: "16px",
              color: primary_color,
              margin: 0,
            }}
          >
            Date: {issueDateFormatted}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: "820px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            fontWeight: 300,
            color: "#111827",
            margin: "0 0 10px 0",
          }}
        >
          <span style={{ fontWeight: 800, color: primary_color }}>PRO</span> CERTIFIED
        </h1>

        <p style={{ fontSize: "20px", color: "#6B7280", margin: "0 0 18px 0" }}>
          This document verifies that
        </p>

        <h2
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "#111827",
            margin: "0 0 20px 0",
            lineHeight: 1.15,
            ...textStyle,
          }}
        >
          {recipient_name}
        </h2>

        <div
          style={{
            height: "5px",
            width: "96px",
            backgroundColor: secondary_color,
            marginBottom: "22px",
          }}
        />

        <p style={{ fontSize: "22px", color: "#4B5563", margin: "0 0 24px 0" }}>
          {bodyText}{" "}
          <span style={{ fontWeight: 700, color: "#111827" }}>{course_title}</span>
        </p>

        {/* Custom Fields */}
        {data.customFieldsArray && data.customFieldsArray.filter((f) => f.key !== "amount").length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px 32px",
              width: "100%",
              marginBottom: "16px",
            }}
          >
            {data.customFieldsArray
              .filter((f) => f.key !== "amount")
              .map((field, index) => (
                <div key={index} style={{ textAlign: "left" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: "#9CA3AF",
                      display: "block",
                    }}
                  >
                    {field.key}
                  </span>
                  <span
                    style={{
                      fontSize: "17px",
                      fontWeight: 600,
                      color: "#1F2937",
                    }}
                  >
                    {field.value}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: "14px", color: "#9CA3AF" }}>
          <p style={{ margin: "0 0 2px 0", fontWeight: 600, color: "#6B7280" }}>
            ID: {verification_id || "PENDING"}
          </p>
          <p style={{ margin: 0 }}>Verified Securely • {issuer_name}</p>
        </div>

        <div>
          <QRCode
            value={`${typeof window !== "undefined" ? window.location.origin : "https://www.proofdeck.app"}/verify/${verification_id || "pending"}`}
            size={68}
          />
        </div>

        <div style={{ textAlign: "center", width: "220px" }}>
          <div
            style={{
              borderBottom: "1px solid #D1D5DB",
              marginBottom: "6px",
              paddingBottom: "6px",
              minHeight: "44px",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            {data.signature_image ? (
              <img
                src={data.signature_image}
                alt="Signature"
                style={{ height: "42px", objectFit: "contain" }}
              />
            ) : (
              <span
                className="font-signature"
                style={{ fontSize: "24px", color: "#1F2937" }}
              >
                {signature || issuer_name || "Signature"}
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#6B7280",
              margin: 0,
            }}
          >
            Authorized Signature
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernLandscape;
