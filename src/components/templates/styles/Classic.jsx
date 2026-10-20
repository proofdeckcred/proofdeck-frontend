import React from "react";
import { SERVER_BASE_URL } from "../../../config";
import QRCode from "react-qr-code";

const Classic = ({ data }) => {
  const {
    primary_color = "#0284C7",
    secondary_color = "#E2E8F0",
    body_font_color = "#1E293B",
    font_family = "Georgia, serif",
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
        border: `16px double ${primary_color}`,
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: font_family || "Georgia, serif",
        overflow: "hidden",
        ...backgroundStyle,
      }}
    >
      {/* Top gradient bar */}
      <div
        style={{
          height: "14px",
          width: "100%",
          borderBottom: `4px solid ${primary_color}`,
          background: `linear-gradient(to right, ${primary_color}, ${secondary_color})`,
          flexShrink: 0,
        }}
      />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "24px 72px 16px 72px",
        }}
      >
        {logoSrc && (
          <img
            src={logoSrc}
            alt="Logo"
            style={{
              width: "96px",
              height: "96px",
              objectFit: "contain",
              marginBottom: "14px",
            }}
          />
        )}

        <h1
          style={{
            fontSize: "40px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: primary_color,
            margin: "0 0 8px 0",
            lineHeight: 1.15,
          }}
        >
          {titleText}
        </h1>

        <p
          style={{
            fontStyle: "italic",
            fontSize: "18px",
            color: "#4B5EAA",
            margin: "0 0 12px 0",
          }}
        >
          This is to certify that
        </p>

        <h2
          style={{
            fontSize: "52px",
            fontWeight: 800,
            fontFamily: "'Georgia', serif",
            color: "#1F2937",
            margin: "0 0 12px 0",
            lineHeight: 1.15,
            ...textStyle,
          }}
        >
          {recipient_name}
        </h2>

        <p
          style={{
            fontStyle: "italic",
            fontSize: "18px",
            color: body_font_color,
            maxWidth: "820px",
            margin: "0 0 12px 0",
          }}
        >
          {bodyText}
        </p>

        <p
          style={{
            fontSize: "28px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: secondary_color,
            margin: "0 0 12px 0",
          }}
        >
          {course_title}
        </p>

        <p
          style={{
            fontSize: "15px",
            color: body_font_color,
            margin: "0 0 14px 0",
          }}
        >
          Awarded on {issueDateFormatted}
        </p>

        {/* Custom Fields */}
        {data.customFieldsArray && data.customFieldsArray.filter((f) => f.key !== "amount").length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px 32px",
              width: "760px",
              margin: "6px auto 12px auto",
              textAlign: "left",
            }}
          >
            {data.customFieldsArray
              .filter((f) => f.key !== "amount")
              .map((field, index) => (
                <div
                  key={index}
                  style={{
                    borderBottom: `1px solid ${secondary_color}`,
                    paddingBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#6B7280",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      display: "block",
                    }}
                  >
                    {field.key}
                  </span>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: body_font_color,
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
          justifyContent: "space-between",
          alignItems: "flex-end",
          padding: "0 88px 36px 88px",
          width: "100%",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <div style={{ width: "260px", textAlign: "center" }}>
          <div
            style={{
              borderBottom: `2px solid ${primary_color}`,
              paddingBottom: "6px",
              marginBottom: "6px",
              minHeight: "48px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            {data.signature_image ? (
              <img
                src={data.signature_image}
                alt="Signature"
                style={{ height: "44px", objectFit: "contain" }}
              />
            ) : (
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "18px",
                  color: "#1F2937",
                  ...textStyle,
                }}
              >
                {signature || issuer_name}
              </span>
            )}
          </div>
          <span style={{ color: "#6B7280", fontSize: "12px" }}>Signature</span>
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "6px",
              borderRadius: "6px",
              display: "inline-block",
            }}
          >
            <QRCode
              value={`${typeof window !== "undefined" ? window.location.origin : "https://www.proofdeck.app"}/verify/${verification_id || "pending"}`}
              size={68}
            />
          </div>
          <div style={{ fontSize: "10px", color: "#6B7280", marginTop: "4px" }}>
            ID: {verification_id || "PENDING"}
          </div>
        </div>

        <div style={{ width: "260px", textAlign: "center" }}>
          <div
            style={{
              borderBottom: `2px solid ${primary_color}`,
              paddingBottom: "6px",
              marginBottom: "6px",
              minHeight: "48px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: "18px",
                color: "#1F2937",
                ...textStyle,
              }}
            >
              {issuer_name}
            </span>
          </div>
          <span style={{ color: "#6B7280", fontSize: "12px" }}>Issuer</span>
        </div>
      </div>
    </div>
  );
};

export default Classic;
