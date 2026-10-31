import React, { useState } from "react";
import { Check, LayoutTemplate, Award, ChevronDown, ChevronUp } from "lucide-react";
import TemplateRenderer from "./templates/TemplateRenderer";

/**
 * A visual selector for certificate layouts.
 *
 * @param {string} value - The currently selected layout style or template id.
 * @param {function} onChange - Callback when a layout is selected.
 * @param {Array} options - Array of layout style strings or template objects.
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
      <div className="custom-scrollbar grid grid-cols-2 lg:grid-cols-3 gap-3 p-1 max-h-[520px] overflow-y-auto pr-2 animate-in slide-in-from-top-2 duration-300">
        {options.map((option) => {
          const isObject = typeof option === 'object';
          const optionValue = isObject ? option.id : option;
          const optionLabel = isObject ? option.title : option.replace(/_/g, " ");
          const isSelected = String(value) === String(optionValue);
          
          // Create a prepared template object for the renderer
          let mockTemplate;
          if (isObject) {
             mockTemplate = option;
          } else {
             mockTemplate = {
                layout_style: option,
                title: optionLabel,
                primary_color: "#4F46E5",
                secondary_color: "#E2E8F0",
                body_font_color: "#1F2937",
                font_family: "Inter",
                custom_text: {
                  title: optionLabel,
                  body: "For outstanding performance and dedication",
                }
             };
          }

          let parsedLayout = mockTemplate.layout_data;
          if (typeof parsedLayout === "string") {
            try {
              parsedLayout = JSON.parse(parsedLayout);
            } catch (e) {
              parsedLayout = null;
            }
          }

          const renderableTemplate = {
            ...mockTemplate,
            layout_data: parsedLayout || mockTemplate.layout_data,
            custom_text: mockTemplate.custom_text || {
              title: mockTemplate.title || "Certificate of Completion",
              body: "For outstanding performance and dedication"
            }
          };

          return (
            <div
              key={optionValue}
              onClick={() => onChange(optionValue)}
              className={`
                group relative cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md
                ${isSelected 
                  ? "border-indigo-600 ring-2 ring-indigo-600/20 ring-offset-1 scale-[1.01]" 
                  : "border-slate-200 hover:border-indigo-300 hover:-translate-y-0.5"
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 z-10 bg-indigo-600 text-white p-1 rounded-full shadow-md animate-in fade-in zoom-in duration-200">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}

              {/* Premium Badge */}
              {isObject && option.is_premium && (
                 <div className="absolute top-2.5 left-2.5 z-10 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 uppercase tracking-wider">
                    <Award size={10} /> PRO
                 </div>
              )}

              {/* Preview Area */}
              <div className="aspect-[1.414/1] w-full relative pointer-events-none select-none overflow-hidden border-b border-slate-100 bg-slate-50">
                <div className="w-[200%] h-[200%] origin-top-left transform scale-50 pointer-events-none select-none">
                  <TemplateRenderer template={renderableTemplate} />
                </div>
                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-slate-900/0 transition-colors duration-200 ${isSelected ? "bg-indigo-950/5" : "group-hover:bg-slate-950/5"}`} />
              </div>

              {/* Label */}
              <div className={`
                py-2 px-2 text-center text-xs font-semibold tracking-wide border-t transition-colors duration-200
                ${isSelected ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-white text-slate-700 border-slate-100 group-hover:text-indigo-600"}
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
