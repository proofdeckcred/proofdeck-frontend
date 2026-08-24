import React, { useState } from "react";
import { Check, LayoutTemplate, Award, ChevronDown, ChevronUp } from "lucide-react";
import TemplateRenderer from "./templates/TemplateRenderer";

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
      <div className="custom-scrollbar grid grid-cols-2 lg:grid-cols-3 gap-6 p-2 max-h-[500px] overflow-y-auto pr-3 animate-in slide-in-from-top-2 duration-300">
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

              {/* Preview Area - Scaled Down */}
              <div className="aspect-[1.414/1] w-full bg-slate-50 relative pointer-events-none select-none overflow-hidden">
                <div className="w-[200%] h-[200%] origin-top-left transform scale-50 transition-transform duration-500 group-hover:scale-[0.52]">
                    <TemplateRenderer template={mockTemplate} />
                </div>
                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-indigo-900/0 transition-colors duration-300 ${isSelected ? "bg-indigo-900/5" : "group-hover:bg-indigo-900/5"}`} />
              </div>

              {/* Label */}
              <div className={`
                py-3 px-4 text-center text-sm font-bold tracking-wide border-t transition-colors duration-300
                ${isSelected ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-white text-slate-600 border-slate-50 group-hover:text-indigo-600"}
              `}>
                {optionLabel}
              </div>
            </div>
          );
        })}
      </div>
      )}
      <style jsx>{`
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
