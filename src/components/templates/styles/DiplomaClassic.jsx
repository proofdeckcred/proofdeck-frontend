import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const DiplomaClassic = ({ data }) => {
    const { backgroundStyle, logo_url, textStyle, recipient_name, certificateBody, course_title } = data;
    
    return (
         <div className="h-full w-full bg-[#fdfbf7] relative p-12 flex flex-col items-center justify-between text-center shadow-lg" 
              style={backgroundStyle}>
            <div className="absolute inset-4 border-[3px] border-black pointer-events-none"></div>
            <div className="absolute inset-6 border border-black pointer-events-none"></div>
            
            <div className="mt-4">
                 {logo_url && <img src={logo_url.startsWith("blob:") ? logo_url : `${SERVER_BASE_URL}${logo_url}`} className="h-20 mx-auto mb-4" alt="Logo"/>}
                 <h1 className="text-4xl font-black uppercase text-gray-900 tracking-wider font-serif">Diploma</h1>
                 <p className="text-sm text-gray-500 uppercase tracking-[0.5em] mt-2">Of Graduation</p>
            </div>

            <div className="my-4 w-full">
                 <p className="italic font-serif text-gray-600 text-lg mb-4">This is to certify that</p>
                 <h2 className="text-4xl font-serif font-bold text-black border-b border-black inline-block px-12 pb-2 mb-6" style={textStyle}>
                     {recipient_name}
                 </h2>
                 <p className="font-serif text-gray-800 text-xl">
                     Has completed the prescribed course of study in<br/>
                     <strong className="text-2xl mt-2 block">{certificateBody} {course_title}</strong>
                 </p>

                 {/* Custom Fields */}
                 {data.customFieldsArray && data.customFieldsArray.length > 0 && (
                     <div className="grid grid-cols-1 gap-1 max-w-lg mx-auto mt-6 text-left border-t border-gray-300 pt-4">
                         {data.customFieldsArray.map((field, index) => (
                              field.key !== "amount" && (
                                 <div key={index} className="flex justify-between font-serif text-sm">
                                     <span className="font-bold text-gray-500 uppercase">{field.key}</span>
                                     <span className="font-bold text-gray-900">{field.value}</span>
                                 </div>
                             )
                         ))}
                     </div>
                 )}
            </div>

            <div className="w-full flex justify-around items-end mb-4">
                 <div className="flex flex-col items-center">
                     <div className="h-px w-40 bg-black mb-2"></div>
                     <p className="font-serif text-xs uppercase font-bold">Principal</p>
                 </div>
                 <div className="flex flex-col items-center">
                      <div className="w-24 h-24 relative">
                          <div className="absolute inset-0 bg-yellow-600 rounded-full opacity-20 animate-pulse"></div>
                          <div className="w-full h-full border-4 border-yellow-600 rounded-full flex items-center justify-center text-yellow-800 text-xs font-bold text-center p-2 uppercase">
                              Official<br/>Seal
                          </div>
                      </div>
                 </div>
                 <div className="flex flex-col items-center">
                     <div className="h-px w-40 bg-black mb-2"></div>
                     <p className="font-serif text-xs uppercase font-bold">Secretary</p>
                 </div>
            </div>
        </div>
    );
};
export default DiplomaClassic;
