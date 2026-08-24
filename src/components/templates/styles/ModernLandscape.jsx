import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const ModernLandscape = ({ data }) => {
    const { primary_color, secondary_color, font_family, logo_url, certificateTitle, recipient_name, certificateBody, course_title, textStyle, backgroundStyle } = data;
    
    return (
      <div className="h-full w-full bg-white relative p-8 flex flex-col justify-between shadow-lg"
           style={backgroundStyle}>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-opacity-10 pointer-events-none"
               style={{background: `linear-gradient(225deg, ${primary_color}22 0%, transparent 100%)`}}></div>
          <div className="flex justify-between items-center z-10">
              {logo_url && <img src={logo_url.startsWith("blob:") ? logo_url : `${SERVER_BASE_URL}${logo_url}`} alt="Logo" className="h-12 object-contain" />}
              <div className="text-right">
                  <p className="text-xs uppercase tracking-widest font-semibold text-gray-400">{certificateTitle}</p>
                  <p className="font-bold text-sm" style={{color: primary_color}}>Date: {data.issueDateFormatted}</p>
              </div>
          </div>
          <div className="flex-grow flex flex-col justify-center max-w-2xl z-10">
              <h1 className="text-4xl font-light mb-2 text-gray-900" style={{fontFamily: font_family}}>
                  <span className="font-bold" style={{color: primary_color}}>PRO</span> CERTIFIED
              </h1>
              <p className="text-lg text-gray-500 mb-6">This document verifies that</p>
              <h2 className="text-5xl font-extrabold mb-6 tracking-tight text-gray-900" style={{fontFamily: font_family, ...textStyle}}>
                  {recipient_name}
              </h2>
              <div className="h-1 w-20 mb-6" style={{backgroundColor: secondary_color}}></div>
              <p className="text-lg text-gray-600 mb-8">
                  {certificateBody} <span className="font-bold text-gray-900">{course_title}</span>
              </p>

              {/* Custom Fields */}
              {data.customFieldsArray && data.customFieldsArray.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 w-full mb-8">
                      {data.customFieldsArray.map((field, index) => (
                           field.key !== "amount" && (
                              <div key={index} className="text-left">
                                  <span className="text-xs uppercase font-bold text-gray-400 block">{field.key}</span>
                                  <span className="text-base font-semibold text-gray-800">{field.value}</span>
                              </div>
                          )
                      ))}
                  </div>
              )}
          </div>
          <div className="flex items-end justify-between z-10">
              <div className="text-xs text-gray-400">
                  <p>ID: {data.verification_id || '123456'}</p>
                  <p>Verified Securely</p>
              </div>
               <div className="text-center">
                  <div className="w-32 border-b border-gray-300 mb-1 font-signature text-xl">{data.signature || 'Signature'}</div>
                  <p className="text-xs font-bold uppercase text-gray-500">Authorized Signature</p>
              </div>
          </div>
      </div>
    );
};
export default ModernLandscape;
