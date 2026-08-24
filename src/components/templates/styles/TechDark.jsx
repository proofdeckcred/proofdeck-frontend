import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const TechDark = ({ data }) => {
    const { primary_color, secondary_color, textStyle, backgroundStyle, logo_url, certificateTitle, recipient_name, certificateBody, course_title } = data;
    
    return (
          <div className="h-full w-full bg-gray-900 text-white relative overflow-hidden font-mono shadow-lg" style={{...backgroundStyle, color: '#fff'}}>
              <div className="absolute top-0 left-0 w-full h-full opacity-20" 
                   style={{backgroundImage: `radial-gradient(${primary_color} 1px, transparent 1px)`, backgroundSize: '20px 20px'}}></div>
              
              <div className="h-full flex flex-col justify-center p-12 relative z-10 border-l-8" style={{borderColor: primary_color}}>
                  <div className="flex items-center gap-4 mb-8 opacity-70">
                      {logo_url && <img src={logo_url.startsWith("blob:") ? logo_url : `${SERVER_BASE_URL}${logo_url}`} className="h-8 invert" alt="Logo"/>}
                      <span className="uppercase text-xs tracking-widest">System Validation</span>
                  </div>

                  <h1 className="text-5xl font-bold mb-2" style={{color: primary_color}}>{certificateTitle}</h1>
                  <div className="text-sm text-gray-400 mb-8 font-mono">HASH: 8f2a9c...1b4 | BLOCK: #9921</div>

                  <p className="text-gray-300 mb-2">Is hereby granted to:</p>
                  <h2 className="text-4xl font-bold bg-white text-black inline-block px-4 py-2 mb-8 transform -skew-x-12" style={textStyle}>
                      <span className="transform skew-x-12 inline-block">{recipient_name}</span>
                  </h2>

                  <p className="text-gray-300 max-w-lg mb-8 border-l border-gray-700 pl-4">
                      {certificateBody} <span style={{color: primary_color}}>{course_title}</span>.
                      Skills verified algorithmically.
                  </p>

                  {/* Custom Fields */}
                  {data.customFieldsArray && data.customFieldsArray.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 max-w-lg mb-8 pl-4">
                          {data.customFieldsArray.map((field, index) => (
                               field.key !== "amount" && (
                                  <div key={index} className="text-left">
                                      <span className="text-xs uppercase font-mono text-gray-500 block mb-1">&gt;&gt; {field.key}</span>
                                      <span className="text-sm font-bold text-gray-200">{field.value}</span>
                                  </div>
                              )
                          ))}
                      </div>
                  )}

                  <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-[10px]">AI</div>
                          <div className="text-xs text-gray-500">
                              <p className="text-white">Verified</p>
                              <p>Automated Sign</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="text-3xl font-bold" style={{color: secondary_color}}>100%</p>
                          <p className="text-xs text-gray-500">Score</p>
                      </div>
                  </div>
              </div>
          </div>
    );
};
export default TechDark;
