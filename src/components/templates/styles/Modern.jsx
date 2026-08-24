import React from 'react';
import { SERVER_BASE_URL } from '../../../config';
import QRCode from "react-qr-code";

const Modern = ({ data, isFullscreen }) => {
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
          className="flex h-full w-full bg-white text-black border-4 shadow-lg"
          style={{ borderColor: primary_color, ...backgroundStyle }}
        >
          <div
            className="w-[35%] p-4 flex flex-col justify-between items-center text-center"
            style={{
              background: `linear-gradient(135deg, ${primary_color}, ${secondary_color})`,
            }}
          >
            <div>
              {logo_url && (
                <img
                  src={logo_url.startsWith("blob:") ? logo_url : `${SERVER_BASE_URL}${logo_url}`}
                  className="w-20 h-20 rounded-full border-4 border-white object-cover bg-white shadow-sm mb-2"
                  alt="Logo"
                />
              )}
              <p className="font-bold text-white text-xs uppercase tracking-wider">
                {issuer_name}
              </p>
            </div>
            <div className="bg-white/90 p-2 rounded shadow-sm">
               <QRCode
                    value={`${window.location.origin}/verify/${verification_id || 'pending'}`}
                    size={64}
                />
            </div>
          </div>
          <div className="w-[65%] p-6 flex flex-col justify-center bg-white/90 backdrop-blur-sm">
            <h1
              className="font-light uppercase tracking-widest mb-4"
              style={{
                fontSize: isFullscreen ? "3rem" : "1.8rem", // Increased from 1.5/1
                color: primary_color,
              }}
            >
              {certificateTitle}
            </h1>
            <h2
              className="font-extrabold mb-3"
              style={{
                fontSize: isFullscreen ? "5rem" : "3rem", // Increased from 2.5/1.6
                ...textStyle,
              }}
            >
              {recipient_name}
            </h2>
            <p className="italic mb-4" style={{ 
                color: body_font_color, 
                fontSize: isFullscreen ? "1.5rem" : "1rem" // Increased base size
            }}>
              {certificateBody}
            </p>
            <p
              className="font-bold uppercase tracking-wide mb-6"
              style={{
                fontSize: isFullscreen ? "2rem" : "1.2rem",
                color: secondary_color,
              }}
            >
              {course_title}
            </p>
            <p className="text-sm mb-4">Awarded on {issueDateFormatted}</p>

            {/* Custom Fields */}
            {data.customFieldsArray && data.customFieldsArray.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6 w-full max-w-md">
                    {data.customFieldsArray.map((field, index) => (
                        field.key !== "amount" && (
                            <div key={index} className="text-sm">
                                <span className="font-semibold text-gray-600 block text-xs uppercase tracking-wide">{field.key}:</span>
                                <span className="font-medium" style={{ color: body_font_color }}>{field.value}</span>
                            </div>
                        )
                    ))}
                </div>
            )}

            <div
              className="flex justify-between mt-auto pt-3 border-t-2"
              style={{ borderColor: primary_color }}
            >
              <div className="text-xs" style={textStyle}>
                {data.signature_image ? (
                    <img src={data.signature_image} alt="Signature" className="h-10 object-contain mb-1" />
                ) : (
                    <p className="font-bold">{signature || issuer_name}</p>
                )}
                <p className="text-gray-500">Authorized Signature</p>
              </div>
              <div className="text-xs text-right" style={textStyle}>
                <p className="font-bold">{verification_id || 'PENDING'}</p>
                <p className="text-gray-500">Verification ID</p>
              </div>
            </div>
          </div>
        </div>
      );
};

export default Modern;
