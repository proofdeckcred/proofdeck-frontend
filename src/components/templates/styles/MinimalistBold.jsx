import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const MinimalistBold = ({ data }) => {
    const { primary_color, body_font_color, textStyle, backgroundStyle, logo_url, recipient_name, certificateBody, course_title } = data;

    return (
        <div className="h-full w-full bg-white relative p-10 flex flex-row shadow-lg" style={backgroundStyle}>
           <div className="w-24 h-full absolute left-0 top-0 flex flex-col justify-end p-6" style={{backgroundColor: primary_color}}>
               <div className="text-white text-xs font-bold -rotate-90 origin-bottom-left whitespace-nowrap opacity-50 absolute bottom-32 left-8">
                   CERTIFICATE ID: {data.verification_id || '000000'}
               </div>
           </div>
           <div className="pl-24 flex flex-col justify-center w-full">
                {logo_url && <img src={logo_url.startsWith("blob:") ? logo_url : `${SERVER_BASE_URL}${logo_url}`} alt="Logo" className="h-14 object-contain mb-6 self-start" />}
                <h1 className="text-6xl font-black text-gray-900 tracking-tighter leading-none mb-2" style={{color: body_font_color}}>
                   CERTIFICATE
                </h1>
                <h2 className="text-2xl font-medium text-gray-400 mb-12 tracking-wide">OF COMPLETION</h2>
                
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Proudly Presented To</p>
                <p className="text-4xl font-bold text-gray-900 mb-8" style={textStyle}>{recipient_name}</p>
                
                <p className="text-gray-600 max-w-lg mb-8">
                   {certificateBody} <span className="font-bold" style={{color: primary_color}}>{course_title}</span> on {data.issueDateFormatted}.
                </p>

                {/* Custom Fields */}
                {data.customFieldsArray && data.customFieldsArray.length > 0 && (
                    <div className="flex flex-col gap-2 mb-8 max-w-lg">
                        {data.customFieldsArray.map((field, index) => (
                             field.key !== "amount" && (
                                <div key={index} className="flex gap-2 text-sm">
                                    <span className="font-bold text-gray-400 uppercase tracking-wider text-xs w-32 shrink-0">{field.key}:</span>
                                    <span className="font-bold text-gray-900">{field.value}</span>
                                </div>
                            )
                        ))}
                    </div>
                )}
                
                <div className="flex gap-12">
                    <div>
                        <div className="h-12 w-32 border-b border-gray-300 mb-2 flex items-end font-signature text-lg">{data.signature || 'Sign'}</div>
                        <p className="text-xs font-bold text-gray-900">Signature</p>
                    </div>
                    <div>
                        <div className="h-12 w-32 border-b border-gray-300 mb-2 flex items-end text-sm">{data.issueDateFormatted}</div>
                        <p className="text-xs font-bold text-gray-900">Date</p>
                    </div>
                </div>
           </div>
        </div>
    );
};
export default MinimalistBold;
