import React from 'react';
import { SERVER_BASE_URL } from '../../../config';

const AchievementStar = ({ data }) => {
   const { backgroundStyle, logo_url, textStyle, recipient_name, certificateBody, course_title } = data;

    return (
        <div className="h-full w-full bg-indigo-900 text-white relative overflow-hidden flex shadow-lg" style={{...backgroundStyle, backgroundColor: '#312e81'}}>
             <div className="absolute inset-0 overflow-hidden">
                 <div className="absolute -right-24 -top-24 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
                 <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>
             </div>

             <div className="w-16 h-full bg-yellow-500 flex flex-col items-center py-8 relative z-10 shadow-lg">
                  <div className="text-indigo-900 font-black text-2xl rotate-90 mt-12 whitespace-nowrap tracking-widest origin-center translate-y-24">
                      ACHIEVEMENT
                  </div>
             </div>

             <div className="flex-1 p-10 flex flex-col justify-center relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                          {logo_url ? <img src={logo_url.startsWith("blob:") ? logo_url : `${SERVER_BASE_URL}${logo_url}`} className="h-8" alt="Logo"/> : <span className="text-2xl">⭐</span>}
                      </div>
                      <p className="text-indigo-200 uppercase tracking-widest text-sm font-semibold">Star Student Award</p>
                  </div>

                  <h1 className="text-5xl font-bold mb-2 text-white">Congratulations!</h1>
                  <h2 className="text-4xl font-extrabold text-yellow-400 mb-6" style={textStyle}>{recipient_name}</h2>
                  
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 mb-8 max-w-lg">
                      <p className="text-lg text-indigo-100 leading-relaxed mb-4">
                          {certificateBody} <strong>{course_title}</strong>.
                          <br/>Your hard work has truly shone through!
                      </p>

                      {/* Custom Fields */}
                      {data.customFieldsArray && data.customFieldsArray.length > 0 && (
                          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                              {data.customFieldsArray.map((field, index) => (
                                   field.key !== "amount" && (
                                      <div key={index}>
                                          <p className="text-xs text-indigo-300 uppercase font-bold mb-1">{field.key}</p>
                                          <p className="text-sm font-semibold text-white">{field.value}</p>
                                      </div>
                                  )
                              ))}
                          </div>
                      )}
                  </div>

                  <div className="flex items-center gap-8">
                       <div>
                           <p className="text-xs text-indigo-300 uppercase font-bold mb-1">Total Points</p>
                           <p className="text-2xl font-bold text-white">2,500 XP</p>
                       </div>
                       <div className="h-8 w-px bg-indigo-700"></div>
                       <div>
                           <p className="text-xs text-indigo-300 uppercase font-bold mb-1">Rank</p>
                           <p className="text-2xl font-bold text-white">#1</p>
                       </div>
                       <div className="h-8 w-px bg-indigo-700"></div>
                       <div>
                           <p className="text-xs text-indigo-300 uppercase font-bold mb-1">Date</p>
                           <p className="text-lg font-medium text-white">{data.issueDateFormatted}</p>
                       </div>
                  </div>
             </div>
         </div>
    );
};
export default AchievementStar;
