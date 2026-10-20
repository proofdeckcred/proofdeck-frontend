import React from "react";
import { SERVER_BASE_URL } from "../../../config";
import QRCode from "react-qr-code";

const Receipt = ({ data }) => {
  const {
    primary_color = "#0284C7",
    body_font_color = "#1E293B",
    logo_url,
    certificateTitle,
    recipient_name,
    course_title,
    issueDateFormatted,
    signature,
    issuer_name,
    verification_id,
    extra_fields,
    amount,
  } = data;

  const receiptAmount = amount || (extra_fields && extra_fields.amount) || "PAID";
  const recipientEmail = data.recipient_email || "recipient@example.com";
  const titleText = certificateTitle || "PAYMENT RECEIPT";
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
        padding: "28px",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          border: "1px solid #E5E7EB",
          backgroundColor: "#ffffff",
          padding: "36px 48px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          {/* Top Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "24px",
            }}
          >
            <div>
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt="Logo"
                  style={{ height: "56px", objectFit: "contain", marginBottom: "6px" }}
                />
              ) : (
                <h2
                  style={{
                    fontSize: "26px",
                    fontWeight: 700,
                    color: primary_color,
                    margin: 0,
                  }}
                >
                  {issuer_name}
                </h2>
              )}
            </div>
            <div style={{ textAlign: "right", fontSize: "14px", color: "#6B7280" }}>
              <p style={{ fontWeight: 700, fontSize: "18px", color: "#1F2937", margin: "0 0 2px 0" }}>
                {issuer_name}
              </p>
              <p style={{ margin: "0 0 2px 0" }}>Payment Receipt</p>
              <p style={{ margin: 0 }}>{issueDateFormatted}</p>
            </div>
          </div>

          {/* Primary Banner */}
          <div
            style={{
              backgroundColor: primary_color,
              color: "#ffffff",
              padding: "14px 20px",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: "20px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              {titleText}
            </span>
            <span style={{ fontFamily: "monospace", fontSize: "16px", opacity: 0.85 }}>
              #{verification_id ? verification_id.substring(0, 8).toUpperCase() : "12345678"}
            </span>
          </div>

          {/* Bill To & Status */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  margin: "0 0 4px 0",
                }}
              >
                Bill To
              </p>
              <p style={{ fontWeight: 700, fontSize: "22px", color: "#1F2937", margin: "0 0 2px 0" }}>
                {recipient_name}
              </p>
              <p style={{ color: "#6B7280", fontSize: "14px", margin: 0 }}>{recipientEmail}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  margin: "0 0 6px 0",
                }}
              >
                Status
              </p>
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  backgroundColor: "#DCFCE7",
                  color: "#15803D",
                  borderRadius: "9999px",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                PAID
              </span>
            </div>
          </div>

          {/* Line Items */}
          <div style={{ borderBottom: "1px solid #E5E7EB", marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                backgroundColor: "#F9FAFB",
                fontSize: "13px",
                fontWeight: 700,
                color: "#6B7280",
                textTransform: "uppercase",
                borderRadius: "4px 4px 0 0",
              }}
            >
              <span>Description</span>
              <span>Amount</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "16px 14px",
                fontSize: "16px",
              }}
            >
              <span style={{ fontWeight: 600, color: "#1F2937" }}>{course_title}</span>
              <span style={{ fontWeight: 700, color: primary_color }}>{receiptAmount}</span>
            </div>

            {data.customFieldsArray &&
              data.customFieldsArray
                .filter((f) => f.key !== "amount")
                .map((field, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      fontSize: "15px",
                      borderTop: "1px solid #F3F4F6",
                    }}
                  >
                    <span style={{ fontWeight: 500, color: "#4B5563" }}>{field.key}</span>
                    <span style={{ fontWeight: 600, color: body_font_color }}>{field.value}</span>
                  </div>
                ))}
          </div>

          {/* Total */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
            <div
              style={{
                width: "45%",
                display: "flex",
                justifyContent: "space-between",
                borderTop: "2px solid #1F2937",
                paddingTop: "12px",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "20px", color: "#1F2937" }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: "20px", color: primary_color }}>
                {receiptAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid #E5E7EB",
            paddingTop: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: "13px",
            color: "#9CA3AF",
          }}
        >
          <div>
            {data.signature_image ? (
              <div style={{ marginBottom: "4px" }}>
                <img
                  src={data.signature_image}
                  alt="Signature"
                  style={{ height: "42px", objectFit: "contain" }}
                />
              </div>
            ) : (
              <p style={{ margin: 0, color: "#4B5563", fontWeight: 600 }}>
                Auth Signature: {signature || issuer_name || "Signature"}
              </p>
            )}
            <p style={{ margin: "4px 0 0 0" }}>Thank you for your business.</p>
          </div>
          <div
            style={{
              backgroundColor: "#F3F4F6",
              padding: "6px",
              borderRadius: "4px",
              display: "inline-block",
            }}
          >
            <QRCode
              value={`${typeof window !== "undefined" ? window.location.origin : "https://www.proofdeck.app"}/verify/${verification_id || "pending"}`}
              size={58}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
