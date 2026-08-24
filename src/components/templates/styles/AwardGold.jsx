import React from 'react';

const AwardGold = ({ data }) => {
    const { backgroundStyle, textStyle, recipient_name, course_title } = data;

    return (
     <div className="h-full w-full bg-white relative border-[24px] border-[#c0a062] flex flex-col items-center justify-center p-8 text-center shadow-lg" 
          style={{backgroundImage: 'radial-gradient(circle, #fffff0 0%, #ffffff 100%)', ...backgroundStyle}}>
        <div className="absolute inset-2 border border-[#c0a062] opacity-50 pointer-events-none"></div>
        <div className="absolute inset-4 border border-[#c0a062] opacity-30 pointer-events-none"></div>
        
        <div className="w-16 h-16 mb-4 text-[#c0a062]">
             <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/></svg>
        </div>
        
        <h1 className="text-4xl font-serif uppercase text-[#c0a062] mb-2 tracking-widest">Achievement Award</h1>
        <p className="text-gray-400 text-xs uppercase tracking-[0.4em] mb-8">Highest Honor</p>
        
        <p className="font-serif italic text-lg text-gray-500 mb-2">This certifies that</p>
        <h2 className="text-5xl font-script text-black mb-6" style={textStyle}>{recipient_name}</h2>
        
        <p className="max-w-md mx-auto text-gray-600 mb-8 font-serif">
            Has successfully met all the criteria required for the completion of
            <span className="block font-bold text-xl mt-2 text-black">{course_title}</span>
        </p>

        {/* Custom Fields */}
        {data.customFieldsArray && data.customFieldsArray.length > 0 && (
            <div className="grid grid-cols-1 gap-2 mb-8 w-full max-w-md px-12">
                {data.customFieldsArray.map((field, index) => (
                     field.key !== "amount" && (
                        <div key={index} className="flex justify-between border-b border-[#c0a062]/30 pb-1 text-sm">
                            <span className="font-serif italic text-gray-500">{field.key}</span>
                            <span className="font-bold text-gray-800">{field.value}</span>
                        </div>
                    )
                ))}
            </div>
        )}
        
        <div className="w-full max-w-lg flex justify-between px-8 pt-6 border-t border-[#c0a062]/30">
             <div className="text-center">
                 <p className="text-sm font-bold text-gray-800">Date</p>
                 <p className="text-xs text-gray-500">{data.issueDateFormatted}</p>
             </div>
             <div className="text-center">
                 <p className="text-sm font-bold text-gray-800">Signature</p>
                 <p className="font-script text-gray-500">{data.signature || 'Authorized'}</p>
             </div>
        </div>
    </div>
    );
};
export default AwardGold;
