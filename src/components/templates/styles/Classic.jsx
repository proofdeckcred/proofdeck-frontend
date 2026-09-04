import React from 'react';
import { SERVER_BASE_URL } from '../../../config';
import QRCode from "react-qr-code";

const Classic = ({ data, isFullscreen }) => {
    const {
        primary_color,
        secondary_color,
        body_font_color,
        font_family,
        background_url,
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

    return (
        <div
          className="h-full w-full bg-white relative flex flex-col shadow-xl overflow-hidden"
          style={{
            border: `8px double ${primary_color}`,
            ...backgroundStyle,
            fontFamily: font_family,
          }}
        >
          <div
            style={{
              height: "12px",
              borderBottom: `4px solid ${primary_color}`,
              background: `linear-gradient(to right, ${primary_color}, ${secondary_color})`,
            }}
          />
          <div className="flex-grow flex flex-col justify-center items-center text-center p-8">
            {logo_url && (
              <img
                src={logo_url.startsWith("blob:") ? logo_url : `${SERVER_BASE_URL}${logo_url}`}
                alt="Logo"
                className="mb-4 object-contain"
                style={{ width: "80px", height: "80px" }}
              />
            )}
            <h1
              className="font-bold uppercase tracking-wider leading-tight mb-1"
              style={{
                fontSize: isFullscreen ? "2.5rem" : "1.4rem",
                color: primary_color,
              }}
            >
              {certificateTitle}
            </h1>
            <p
              className="italic my-1"
              style={{
                fontSize: isFullscreen ? "1.1rem" : "0.75rem",
                color: "#4B5EAA",
              }}
            >
              This is to certify that
            </p>
            <h2
              className="font-extrabold my-1.5"
              style={{
                fontSize: isFullscreen ? "2.5rem" : "1.5rem",
                fontFamily: "'Georgia', serif",
                ...textStyle,
              }}
            >
              {recipient_name}
            </h2>
            <p
              className="italic my-1 max-w-[85%] mx-auto text-xs sm:text-sm"
              style={{
                color: body_font_color,
              }}
            >
              {certificateBody}
            </p>
            <p
              className="font-bold uppercase my-2"
              style={{
                fontSize: isFullscreen ? "1.5rem" : "0.95rem",
                color: secondary_color,
              }}
            >
              {course_title}
            </p>

            {/* Custom Fields */}
            {data.customFieldsArray && data.customFieldsArray.length > 0 && (
                <div className="grid grid-cols-2 gap-3 max-w-[80%] mx-auto my-3 text-left">
                    {data.customFieldsArray.map((field, index) => (
                         field.key !== "amount" && (
                            <div key={index} className="border-b pb-0.5" style={{ borderColor: secondary_color }}>
                                <span className="font-bold text-gray-500 text-[10px] uppercase block">{field.key}</span>
                                <span className="text-xs font-semibold" style={{ color: body_font_color }}>{field.value}</span>
                            </div>
                        )
                    ))}
                </div>
            )}

            <div className="w-full flex justify-between items-end px-12 sm:px-16 mt-auto pb-4 pt-2">
              <div className="text-center w-1/3">
                <p
                  className="font-semibold border-b border-gray-400 pb-0.5 mb-0.5 text-xs sm:text-sm"
                  style={textStyle}
                >
                  {signature || issuer_name}
                </p>
                <span className="text-gray-500 text-[10px]">Signature</span>
              </div>
              <div className="text-center w-1/3">
                 <p
                  className="font-semibold border-b border-gray-400 pb-0.5 mb-0.5 text-xs sm:text-sm"
                  style={textStyle}
                >
                  {issuer_name}
                </p>
                <span className="text-gray-500 text-[10px]">Issuer</span>
              </div>
            </div>
             <div className="mt-1">
                 <QRCode
                    value={`${window.location.origin}/verify/${verification_id || 'pending'}`}
                    size={40}
                  />
             </div>
          </div>
        </div>
      );
};

export default Classic;
