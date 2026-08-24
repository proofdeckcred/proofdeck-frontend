import React from 'react';
import { SERVER_BASE_URL } from '../../../config';
import QRCode from "react-qr-code";

const Receipt = ({ data, isFullscreen }) => {
    const {
        primary_color,
        secondary_color,
        body_font_color,
        font_family,
        background_url,
        logo_url,
        certificateTitle,
        recipient_name,
        certificateBody, // Not used much in receipt but kept for consistency
        course_title,
        issueDateFormatted,
        signature,
        issuer_name,
        verification_id,
        textStyle,
        backgroundStyle,
        extra_fields, // Used for amount
        amount, 
    } = data;

    // Handle amount from extra_fields if not explicitly passed
    const receiptAmount = amount || (extra_fields && extra_fields.amount) || "PAID";
    const recipientEmail = data.recipient_email || "recipient@example.com";

    const containerStyle = {
        aspectRatio: "1.414 / 1",
        width: "100%",
        transform: isFullscreen ? "scale(1)" : "scale(1)",
        transition: "transform 0.3s ease",
        position: "relative",
        overflow: "hidden",
      };

    return (
        <div style={containerStyle} className="shadow-lg bg-white p-4">
        <div
          className="h-full w-full flex flex-col p-6 border border-gray-200 bg-white"
          style={{ fontFamily: "sans-serif" }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              {logo_url ? (
                <img
                  src={logo_url.startsWith("blob:") ? logo_url : `${SERVER_BASE_URL}${logo_url}`}
                  className="h-12 object-contain mb-2"
                  alt="Logo"
                />
              ) : (
                <h2
                  className="text-xl font-bold"
                  style={{ color: primary_color }}
                >
                  {issuer_name}
                </h2>
              )}
            </div>
            <div className="text-right text-xs text-gray-500">
              <p className="font-bold text-base text-gray-800">{issuer_name}</p>
              <p>Payment Receipt</p>
              <p>{issueDateFormatted}</p>
            </div>
          </div>

          <div
            className="p-3 mb-6 rounded flex justify-between items-center"
            style={{ backgroundColor: primary_color, color: "white" }}
          >
            <span className="font-bold text-lg tracking-wider uppercase">
              {certificateTitle || "PAYMENT RECEIPT"}
            </span>
            <span className="font-mono text-sm opacity-80">#{verification_id ? verification_id.substring(0,8).toUpperCase() : '12345678'}</span>
          </div>

          <div className="flex justify-between mb-6 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                Bill To
              </p>
              <p className="font-bold text-lg text-gray-800">{recipient_name}</p>
              <p className="text-gray-500 text-xs">{recipientEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                Status
              </p>
              <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-xs">
                PAID
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 mb-2">
            <div className="flex justify-between py-2 bg-gray-50 px-3 text-xs font-bold text-gray-500 uppercase rounded-t">
              <span>Description</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between py-4 px-3 text-sm">
              <span className="font-medium text-gray-800">
                {course_title}
              </span>
              <span className="font-bold" style={{ color: primary_color }}>
                {receiptAmount}
              </span>
            </div>
            
            {/* Custom Fields */}
            {data.customFieldsArray && data.customFieldsArray.map((field, index) => (
                field.key !== "amount" && (
                <div key={index} className="flex justify-between py-2 px-3 text-sm border-t border-gray-100">
                    <span className="font-medium text-gray-600">
                        {field.key}
                    </span>
                    <span className="font-semibold text-gray-800">
                        {field.value}
                    </span>
                </div>
                )
            ))}
          </div>

          <div className="flex justify-end mt-4 mb-auto">
            <div className="w-1/2 flex justify-between border-t-2 border-gray-800 pt-3">
              <span className="font-bold text-lg">Total</span>
              <span
                className="font-bold text-lg"
                style={{ color: primary_color }}
              >
                {receiptAmount}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4 text-xs text-gray-400 flex justify-between items-end">
            <div>
              <p>Auth Signature: {signature || 'Signature'}</p>
              <p className="mt-1">Thank you for your business.</p>
            </div>
            <div className="bg-gray-100 flex items-center justify-center text-[10px] p-1">
                <QRCode
                    value={`${window.location.origin}/verify/${verification_id || 'pending'}`}
                    size={48}
                />
            </div>
          </div>
        </div>
      </div>
    );
};

export default Receipt;
