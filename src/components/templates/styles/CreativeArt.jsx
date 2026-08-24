import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const CreativeArt = ({ data }) => {
    const { primary_color, secondary_color, textStyle, backgroundStyle, logo_url, recipient_name, course_title } = data;

    return (
         <div className="h-full w-full bg-[#fffbf0] relative overflow-hidden shadow-lg" style={backgroundStyle}>
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full mix-blend-multiply filter blur-xl opacity-70" style={{backgroundColor: primary_color}}></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full mix-blend-multiply filter blur-xl opacity-70" style={{backgroundColor: secondary_color}}></div>
            
            <div className="h-full flex flex-col items-center justify-center relative z-10 text-center p-8">
                 <h1 className="font-serif italic text-6xl text-gray-900 mb-6 opacity-80" style={{color: primary_color}}>Certificate</h1>
                 <div className="border border-gray-900 px-12 py-12 bg-white/50 backdrop-blur-sm shadow-sm rotate-1">
                     <p className="uppercase text-xs tracking-[0.3em] text-gray-500 mb-4">Presented To</p>
                     <h2 className="text-3xl font-bold text-gray-900 mb-2 font-sans" style={textStyle}>{recipient_name}</h2>
                     <div className="w-12 h-1 bg-gray-900 mx-auto mb-4"></div>
                     <p className="text-gray-600 italic">For artistic excellence in</p>
                     <h3 className="text-xl font-bold mt-1 mb-4 text-gray-800">{course_title}</h3>
                     
                     {/* Custom Fields */}
                     {data.customFieldsArray && data.customFieldsArray.length > 0 && (
                         <div className="flex flex-col gap-2 mb-6 w-full px-8">
                             {data.customFieldsArray.map((field, index) => (
                                  field.key !== "amount" && (
                                     <div key={index} className="flex justify-between text-xs border-b border-gray-200 pb-1">
                                         <span className="font-bold text-gray-500 uppercase tracking-widest">{field.key}</span>
                                         <span className="font-semibold text-gray-900">{field.value}</span>
                                     </div>
                                 )
                             ))}
                         </div>
                     )}

                     <p className="text-xs text-gray-400 uppercase">{data.issueDateFormatted}</p>
                 </div>
                 <div className="mt-8 opacity-50">
                     {logo_url && <img src={logo_url.startsWith("blob:") ? logo_url : `${SERVER_BASE_URL}${logo_url}`} className="h-10 grayscale" alt="Logo"/>}
                 </div>
            </div>
         </div>
    );
};
export default CreativeArt;
