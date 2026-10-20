import React from "react";
import { SERVER_BASE_URL } from "../../../config";
import QRCode from "react-qr-code";

const Modern = ({ data }) => {
  const {
    primary_color = "#0284C7",
    secondary_color = "#E2E8F0",
    body_font_color = "#1E293B",
    font_family = "Arial, sans-serif",
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

  const titleText = certificateTitle || "CERTIFICATE OF COMPLETION";
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
        display: "flex",
        backgroundColor: "#ffffff",
        border: `8px solid ${primary_color}`,
        boxSizing: "border-box",
        fontFamily: font_family || "Arial, sans-serif",
        overflow: "hidden",
        ...backgroundStyle,
      }}
    >
      {/* Left Sidebar */}
      <div
        style={{
          width: "380px",
          height: "100%",
          background: `linear-gradient(135deg, ${primary_color}, ${secondary_color})`,
          padding: "48px 32px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <div style={{ marginTop: "24px" }}>
          {logoSrc && (
            <img
              src={logoSrc}
              alt="Logo"
              style={{
                width: "116px",
                height: "116px",
                borderRadius: "58px",
                border: "4px solid #ffffff",
                objectFit: "cover",
                backgroundColor: "#ffffff",
                marginBottom: "16px",
                display: "inline-block",
              }}
            />
          )}
          <p
            style={{
              fontWeight: 700,
              color: "#ffffff",
              fontSize: "18px",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              margin: 0,
            }}
          >
            {issuer_name}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "16px",
            display: "inline-block",
          }}
        >
          <QRCode
            value={`${typeof window !== "undefined" ? window.location.origin : "https://www.proofdeck.app"}/verify/${verification_id || "pending"}`}
            size={84}
          />
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          height: "100%",
          padding: "56px 60px",
          boxSizing: "border-box",
          backgroundColor: "rgba(255, 255, 255, 0.94)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ marginTop: "16px" }}>
          <h1
            style={{
              fontWeight: 300,
              textTransform: "uppercase",
              letterSpacing: "4px",
              fontSize: "32px",
              color: primary_color,
              margin: "0 0 18px 0",
            }}
          >
            {titleText}
          </h1>

          <h2
            style={{
              fontWeight: 800,
              fontSize: "52px",
              color: "#111827",
              margin: "0 0 14px 0",
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
              margin: "0 0 16px 0",
            }}
          >
            {bodyText}
          </p>

          <p
            style={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontSize: "24px",
              color: secondary_color,
              margin: "0 0 22px 0",
            }}
          >
            {course_title}
          </p>

          <p
            style={{
              fontSize: "16px",
              color: body_font_color,
              margin: "0 0 24px 0",
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
                gap: "12px 24px",
                maxWidth: "540px",
                marginBottom: "16px",
              }}
            >
              {data.customFieldsArray
                .filter((f) => f.key !== "amount")
                .map((field, index) => (
                  <div key={index}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#4B5563",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "2px",
                      }}
                    >
                      {field.key}:
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "15px",
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
            borderTop: `2px solid ${primary_color}`,
            paddingTop: "16px",
            width: "100%",
          }}
        >
          <div style={textStyle}>
            {data.signature_image ? (
              <img
                src={data.signature_image}
                alt="Signature"
                style={{
                  height: "44px",
                  objectFit: "contain",
                  display: "block",
                  marginBottom: "4px",
                }}
              />
            ) : (
              <p
                style={{
                  fontWeight: 700,
                  fontSize: "16px",
                  margin: "0 0 4px 0",
                }}
              >
                {signature || issuer_name}
              </p>
            )}
            <p style={{ color: "#6B7280", fontSize: "12px", margin: 0 }}>
              Authorized Signature
            </p>
          </div>

          <div style={{ textAlign: "right", ...textStyle }}>
            <p
              style={{
                fontWeight: 700,
                fontSize: "16px",
                margin: "0 0 4px 0",
              }}
            >
              {verification_id || "PENDING"}
            </p>
            <p style={{ color: "#6B7280", fontSize: "12px", margin: 0 }}>
              Verification ID
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modern;
