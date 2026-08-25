import React, { useState } from "react";
import { Check, LayoutTemplate, Award, ChevronDown, ChevronUp } from "lucide-react";
import TemplateRenderer from "./templates/TemplateRenderer";
import { SERVER_BASE_URL } from "../config";

/**
 * A visual selector for certificate layouts.
 *
 * @param {string} value - The currently selected layout style.
 * @param {function} onChange - Callback when a layout is selected (passes layout name string).
 * @param {string[]} options - Array of layout style strings (e.g. ['classic', 'modern', ...]).
 * @param {boolean} collapsible - Whether the selector works as a collapsible accordion.
 */
const TemplateSelector = ({ value, onChange, options = [], collapsible = true }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-3">
      <button 
        type="button"
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-gray-700 font-semibold text-sm transition-colors ${collapsible ? 'hover:text-indigo-600 cursor-pointer' : ''}`}
      >
        <span className="flex items-center gap-2">
            <LayoutTemplate size={16} />
            Choose {options.length > 0 && typeof options[0] === 'object' ? 'Template' : 'Layout'}
        </span>
        {collapsible && (
            isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />
        )}
      </button>
      
      {isOpen && (
      <div className="custom-scrollbar grid grid-cols-2 lg:grid-cols-3 gap-3 p-1 max-h-[500px] overflow-y-auto pr-3 animate-in slide-in-from-top-2 duration-300">
        {options.map((option) => {
          const isObject = typeof option === 'object';
          const optionValue = isObject ? option.id : option;
          const optionLabel = isObject ? option.title : option.replace(/_/g, " ");
          const isSelected = String(value) === String(optionValue);
          
          // Create a mock template object for the renderer
          let mockTemplate;
          if (isObject) {
             mockTemplate = option;
          } else {
             mockTemplate = {
                layout_style: option,
                title: option,
                primary_color: "#4F46E5",
                secondary_color: "#E2E8F0",
                body_font_color: "#1F2937",
                font_family: "Inter",
                custom_text: {
                  title: "Certificate",
                  body: "Sample Text",
                }
             };
          }

          return (
            <div
              key={optionValue}
              onClick={() => onChange(optionValue)}
              className={`
                group relative cursor-pointer rounded-xl border-2 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg
                ${isSelected 
                  ? "border-indigo-600 ring-2 ring-indigo-600 ring-offset-2 scale-[1.02]" 
                  : "border-slate-100 hover:border-indigo-300 hover:-translate-y-1"
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 bg-indigo-600 text-white p-1.5 rounded-full shadow-md animate-in fade-in zoom-in duration-200">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}

              {/* Premium Badge */}
              {isObject && option.is_premium && (
                 <div className="absolute top-3 left-3 z-10 bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Award size={12} /> PRO
                 </div>
              )}

              {/* Preview Area */}
              <div className="aspect-[1.414/1] w-full relative pointer-events-none select-none overflow-hidden border-b border-slate-100 bg-white">
                {(() => {
                  if (mockTemplate.layout_style === "visual" || mockTemplate.background_url) {
                    const bg = mockTemplate.background_url || mockTemplate.layout_data?.background?.image;
                    const bgUrl = bg
                      ? (bg.startsWith("data:") || bg.startsWith("blob:") || bg.startsWith("http"))
                        ? bg
                        : `${SERVER_BASE_URL}${bg}`
                      : "";
                    return (
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: bgUrl ? `url("${bgUrl}")` : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    );
                  }

                  switch (mockTemplate.layout_style) {
                    case "classic":
                      return (
                        <svg className="w-full h-full bg-[#fdfdfd]" viewBox="0 0 140 100">
                          <rect x="5" y="5" width="130" height="90" fill="none" stroke="#1e3a8a" strokeWidth="1.5" />
                          <rect x="8" y="8" width="124" height="84" fill="none" stroke="#d97706" strokeWidth="0.5" />
                          <line x1="30" y1="30" x2="110" y2="30" stroke="#94a3b8" strokeWidth="1" />
                          <line x1="45" y1="50" x2="95" y2="50" stroke="#1e3a8a" strokeWidth="2" />
                          <line x1="50" y1="65" x2="90" y2="65" stroke="#cbd5e1" strokeWidth="1" />
                          <line x1="35" y1="80" x2="60" y2="80" stroke="#cbd5e1" strokeWidth="1" />
                          <line x1="80" y1="80" x2="105" y2="80" stroke="#cbd5e1" strokeWidth="1" />
                        </svg>
                      );
                    case "modern":
                      return (
                        <svg className="w-full h-full bg-slate-50" viewBox="0 0 140 100">
                          <rect x="0" y="0" width="8" height="100" fill="#2563eb" />
                          <circle cx="25" cy="20" r="6" fill="#facc15" />
                          <line x1="40" y1="20" x2="110" y2="20" stroke="#e2e8f0" strokeWidth="2" />
                          <line x1="20" y1="45" x2="80" y2="45" stroke="#1e293b" strokeWidth="2.5" />
                          <line x1="20" y1="60" x2="100" y2="60" stroke="#64748b" strokeWidth="1" />
                          <line x1="20" y1="80" x2="50" y2="80" stroke="#cbd5e1" strokeWidth="1" />
                        </svg>
                      );
                    case "receipt":
                      return (
                        <svg className="w-full h-full bg-white" viewBox="0 0 140 100">
                          <rect x="5" y="5" width="130" height="90" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                          <line x1="15" y1="18" x2="50" y2="18" stroke="#475569" strokeWidth="2" />
                          <line x1="100" y1="18" x2="125" y2="18" stroke="#94a3b8" strokeWidth="1" />
                          <line x1="15" y1="35" x2="125" y2="35" stroke="#e2e8f0" strokeWidth="1" />
                          <line x1="15" y1="50" x2="70" y2="50" stroke="#94a3b8" strokeWidth="1.5" />
                          <line x1="110" y1="50" x2="125" y2="50" stroke="#475569" strokeWidth="1.5" />
                          <line x1="15" y1="65" x2="80" y2="65" stroke="#94a3b8" strokeWidth="1.5" />
                          <line x1="110" y1="65" x2="125" y2="65" stroke="#475569" strokeWidth="1.5" />
                          <line x1="15" y1="80" x2="125" y2="80" stroke="#e2e8f0" strokeWidth="1" />
                        </svg>
                      );
                    case "invitation":
                      return (
                        <svg className="w-full h-full bg-rose-50/50" viewBox="0 0 140 100">
                          <rect x="5" y="5" width="130" height="90" fill="none" stroke="#db2777" strokeWidth="1" />
                          <path d="M15 15 L70 50 L125 15" fill="none" stroke="#f472b6" strokeWidth="1.5" />
                          <line x1="40" y1="60" x2="100" y2="60" stroke="#db2777" strokeWidth="2" />
                          <line x1="30" y1="75" x2="110" y2="75" stroke="#94a3b8" strokeWidth="1" />
                        </svg>
                      );
                    case "elegant_serif":
                      return (
                        <svg className="w-full h-full bg-[#fbfbf8]" viewBox="0 0 140 100">
                          <rect x="6" y="6" width="128" height="88" fill="none" stroke="#27272a" strokeWidth="0.75" />
                          <rect x="10" y="10" width="120" height="80" fill="none" stroke="#991b1b" strokeWidth="0.25" strokeDasharray="2,1" />
                          <line x1="30" y1="35" x2="110" y2="35" stroke="#1f2937" strokeWidth="1.5" />
                          <line x1="45" y1="55" x2="95" y2="55" stroke="#991b1b" strokeWidth="1" />
                          <line x1="40" y1="75" x2="100" y2="75" stroke="#71717a" strokeWidth="0.5" />
                        </svg>
                      );
                    default:
                      return (
                        <svg className="w-full h-full bg-slate-50" viewBox="0 0 140 100">
                          <rect x="8" y="8" width="124" height="84" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                          <line x1="20" y1="30" x2="120" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
                          <line x1="30" y1="50" x2="110" y2="50" stroke="#64748b" strokeWidth="2" />
                          <line x1="40" y1="70" x2="100" y2="70" stroke="#cbd5e1" strokeWidth="1" />
                        </svg>
                      );
                  }
                })()}
                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-indigo-900/0 transition-colors duration-300 ${isSelected ? "bg-indigo-900/5" : "group-hover:bg-indigo-900/5"}`} />
              </div>

              {/* Label */}
              <div className={`
                py-2 px-2 text-center text-xs font-semibold tracking-wide border-t transition-colors duration-300
                ${isSelected ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-white text-slate-600 border-slate-50 group-hover:text-indigo-600"}
              `}>
                {optionLabel}
              </div>
            </div>
          );
        })}
      </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default TemplateSelector;
