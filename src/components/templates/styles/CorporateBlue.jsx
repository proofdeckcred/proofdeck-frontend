import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const CorporateBlue = ({ data }) => {
    const { primary_color, secondary_color, textStyle, backgroundStyle, logo_url, recipient_name, course_title } = data;
    
    return (
        <div className="h-full w-full bg-white relative border-[20px] border-white outline outline-1 outline-gray-200 shadow-lg" style={backgroundStyle}>
             <div className="absolute top-0 left-0 w-full h-1/3" style={{backgroundColor: primary_color, clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0% 100%)'}}></div>
             <div className="absolute bottom-0 right-0 w-1/2 h-1/4 opacity-10" style={{backgroundColor: secondary_color, clipPath: 'polygon(20% 100%, 100% 0, 100% 100%)'}}></div>

             <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8 text-white">
                  <div className="mb-auto mt-4">
                       {logo_url ? <img src={logo_url.startsWith("blob:") ? logo_url : `${SERVER_BASE_URL}${logo_url}`} className="h-16 bg-white p-2 rounded shadow-lg" alt="Logo"/> : <div className="h-16 w-16 bg-white rounded-full mx-auto shadow-lg"></div>}
                  </div>
                  
                  <div className="text-gray-900 mb-8 mt-12 bg-white/90 p-8 rounded-xl shadow-xl backdrop-blur-sm w-3/4">
                      <h1 className="text-2xl uppercase tracking-[0.2em] font-light text-gray-500 mb-2">Certificate of Excellence</h1>
                      <h2 className="text-4xl font-bold text-gray-900 mb-6" style={textStyle}>{recipient_name}</h2>
                      <div className="w-16 h-1 mx-auto mb-6" style={{backgroundColor: primary_color}}></div>
                      <p className="text-gray-600">This award certifies the successful completion of</p>
                      <h3 className="text-2xl font-bold mt-2 mb-1" style={{color: primary_color}}>{course_title}</h3>
                      <p className="text-sm text-gray-400 mb-6">Given on this day {data.issueDateFormatted}</p>

                      {/* Custom Fields */}
                      {data.customFieldsArray && data.customFieldsArray.length > 0 && (
                          <div className="grid grid-cols-2 gap-4 w-full px-8 mb-4">
                              {data.customFieldsArray.map((field, index) => (
                                  field.key !== "amount" && (
                                      <div key={index} className="text-center">
                                          <span className="text-xs font-bold uppercase text-gray-400 block tracking-wider">{field.key}</span>
                                          <span className="text-base font-semibold text-gray-800">{field.value}</span>
                                      </div>
                                  )
                              ))}
                          </div>
                      )}
                  </div>

                  <div className="mt-auto flex gap-12 text-gray-900 w-full justify-between items-end px-12 pb-4">
                      <div className="text-center">
                          <p className="font-script text-2xl mb-1">{data.signature || 'Jane Doe'}</p>
                          <div className="h-px w-32 bg-gray-300"></div>
                          <p className="text-xs uppercase mt-1 text-gray-400">Instructor</p>
                      </div>
                      <div className="text-center">
                          <p className="font-script text-2xl mb-1">John Smith</p>
                          <div className="h-px w-32 bg-gray-300"></div>
                          <p className="text-xs uppercase mt-1 text-gray-400">Director</p>
                      </div>
                  </div>
             </div>
        </div>
    );
};
export default CorporateBlue;
