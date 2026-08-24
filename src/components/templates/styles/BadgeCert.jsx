import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const BadgeCert = ({ data }) => {
    const { certificateTitle, backgroundStyle, logo_url, textStyle, recipient_name, certificateBody, course_title } = data;
    
    return (
      <div className="h-full w-full bg-slate-50 relative flex items-center p-8 shadow-lg" style={backgroundStyle}>
           <div className="w-1/3 h-full bg-slate-800 rounded-xl flex flex-col items-center justify-center text-white p-6 shadow-2xl mr-8 relative overflow-hidden">
               <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
               <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-4 border-4 border-white/20">
                   <span className="text-4xl font-bold">🏆</span>
               </div>
               <h2 className="text-xl font-bold text-center mb-1">{certificateTitle}</h2>
               <p className="text-xs text-slate-400 uppercase tracking-widest text-center">Top Performer</p>
           </div>
           
           <div className="flex-1 flex flex-col justify-center">
               <div className="flex justify-between items-start mb-8">
                    <div>
                         <p className="text-sm text-slate-500 font-bold uppercase mb-1">Awarded To</p>
                         <h1 className="text-3xl font-black text-slate-900" style={textStyle}>{recipient_name}</h1>
                    </div>
                    {logo_url && <img src={logo_url.startsWith("blob:") ? logo_url : `${SERVER_BASE_URL}${logo_url}`} className="h-12" alt="Logo"/>}
               </div>
               
                <p className="text-slate-600 mb-6 border-l-4 border-slate-200 pl-4 py-1">
                    {certificateBody} <strong className="text-slate-900">{course_title}</strong>.
                    Recognized for outstanding dedication and skill.
                </p>

                {/* Custom Fields */}
                {data.customFieldsArray && data.customFieldsArray.length > 0 && (
                    <div className="flex flex-col gap-2 mb-6">
                        {data.customFieldsArray.map((field, index) => (
                                field.key !== "amount" && (
                                <div key={index} className="flex gap-2 text-sm pl-4">
                                    <span className="font-bold text-slate-500 uppercase tracking-wide w-32 shrink-0">{field.key}:</span>
                                    <span className="font-semibold text-slate-800">{field.value}</span>
                                </div>
                            )
                        ))}
                    </div>
                )}
               
               <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex justify-between items-center">
                   <div>
                       <p className="text-xs text-slate-400 font-bold uppercase">Date Awarded</p>
                       <p className="text-sm font-semibold text-slate-700">{data.issueDateFormatted}</p>
                   </div>
                   <div className="text-right">
                       <p className="text-xs text-slate-400 font-bold uppercase">Signature</p>
                       <p className="font-script text-lg text-slate-700">{data.signature || 'Manager'}</p>
                   </div>
               </div>
           </div>
      </div>
    );
};
export default BadgeCert;
