import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const ElegantSerif = ({ data }) => {
    const { primary_color, secondary_color, textStyle, backgroundStyle, logo_url, recipient_name, course_title } = data;
    
    return (
      <div className="h-full w-full bg-[#FAFAFA] relative p-12 flex flex-col items-center text-center border-[16px] border-double shadow-lg"
           style={{borderColor: primary_color, ...backgroundStyle, aspectRatio: "1/1.414"}}>
         {logo_url && <img src={logo_url.startsWith("blob:") ? logo_url : `${SERVER_BASE_URL}${logo_url}`} alt="Logo" className="h-24 object-contain mb-8 filter grayscale opacity-80" />}
         <h1 className="text-3xl font-serif italic mb-2 text-gray-800">Certificate of Achievement</h1>
         <div className="w-16 h-px bg-gray-300 mb-12"></div>
         
         <p className="text-gray-500 font-serif italic text-lg mb-4">Presented to</p>
         <h2 className="text-4xl font-serif font-bold text-gray-900 mb-8 border-b pb-4 px-8 inline-block" 
             style={{borderColor: secondary_color, ...textStyle}}>
             {recipient_name}
         </h2>
         
         <p className="text-gray-600 font-serif leading-relaxed max-w-sm mb-12">
             For the successful completion of the curriculum and requirements for:
             <br/><br/>
             <span className="text-2xl font-bold uppercase tracking-widest block mt-2" style={{color: primary_color}}>{course_title}</span>
         </p>

         {/* Custom Fields */}
         {data.customFieldsArray && data.customFieldsArray.length > 0 && (
             <div className="grid grid-cols-1 gap-2 mb-12 max-w-sm">
                 {data.customFieldsArray.map((field, index) => (
                      field.key !== "amount" && (
                         <div key={index} className="text-center font-serif">
                             <span className="text-xs uppercase tracking-widest text-gray-400 block mb-1">{field.key}</span>
                             <span className="text-lg text-gray-800 italic border-b border-gray-200 pb-1 px-4 inline-block">{field.value}</span>
                         </div>
                     )
                 ))}
             </div>
         )}

         <div className="mt-auto flex w-full justify-between items-end px-4">
              <div className="flex flex-col items-center">
                 <div className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center p-2 mb-2" style={{borderColor: secondary_color}}>
                      <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-[8px] text-center">OFFICIAL<br/>SEAL</div>
                 </div>
              </div>
              <div className="flex flex-col items-center">
                  <div className="w-40 border-b border-gray-800 mb-2 text-center text-lg font-signature">{data.signature || 'Director'}</div>
                  <p className="text-xs font-serif italic">Director Signature</p>
              </div>
         </div>
      </div>
     );
};
export default ElegantSerif;
