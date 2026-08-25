import React from "react";
import {
  Trash2,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronUp,
  ChevronDown,
  Check,
} from "lucide-react";

const FONT_FAMILIES = [
  "Prompt",
  "Inter",
  "Lexend",
  "Cinzel",
  "Product Sans",
  "Montserrat",
  "Oswald",
  "Cormorant Garamond",
  "Playfair Display",
  "Great Vibes",
  "Alex Brush",
  "Sacramento",
  "Arial",
  "Verdana",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Lucida Console",
  "Impact",
  "Comic Sans MS",
];

const TextElementControls = ({ element, onUpdate, onDelete, onDone }) => {
  const handleStyleToggle = (style) => {
    const currentStyle = element.fontStyle || "normal";
    if (currentStyle.includes(style)) {
      onUpdate({ fontStyle: currentStyle.replace(style, "").trim() || "normal" });
    } else {
      onUpdate({ fontStyle: `${currentStyle === "normal" ? "" : currentStyle} ${style}`.trim() });
    }
  };

  const handleCoordinateChange = (prop, value) => {
    const parsedVal = parseInt(value, 10);
    if (!isNaN(parsedVal)) {
      onUpdate({ [prop]: parsedVal });
    }
  };

  const commonHeader = (title) => (
    <div className="flex justify-between items-center pb-2 border-b border-gray-100 mb-3">
      <span className="font-semibold text-xs text-gray-700">{title}</span>
      <div className="flex gap-1.5">
        <button
          onClick={onDone}
          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
          title="Done Editing"
        >
          <Check size={14} />
        </button>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
          title="Delete Element"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  const arrangeSection = (
    <div className="space-y-1.5 pt-2 border-t border-gray-100 mt-2">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Arrange Layer</span>
      <div className="grid grid-cols-4 gap-1">
        <button
          onClick={() => onUpdate({ arrange: "front" })}
          className="flex flex-col items-center justify-center p-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
          title="Bring to Front"
        >
          <ArrowUpToLine size={12} />
          <span className="text-[8px] mt-0.5 font-medium">Front</span>
        </button>
        <button
          onClick={() => onUpdate({ arrange: "forward" })}
          className="flex flex-col items-center justify-center p-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
          title="Move Forward"
        >
          <ChevronUp size={12} />
          <span className="text-[8px] mt-0.5 font-medium">Forward</span>
        </button>
        <button
          onClick={() => onUpdate({ arrange: "backward" })}
          className="flex flex-col items-center justify-center p-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
          title="Move Backward"
        >
          <ChevronDown size={12} />
          <span className="text-[8px] mt-0.5 font-medium">Backward</span>
        </button>
        <button
          onClick={() => onUpdate({ arrange: "back" })}
          className="flex flex-col items-center justify-center p-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
          title="Send to Back"
        >
          <ArrowDownToLine size={12} />
          <span className="text-[8px] mt-0.5 font-medium">Back</span>
        </button>
      </div>
    </div>
  );

  const coordinatesSection = (
    <div className="space-y-1.5 pt-2 border-t border-gray-100 mt-2">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Coordinates & Size</span>
      <div className="grid grid-cols-4 gap-1.5">
        <div>
          <label className="text-[9px] text-gray-400 block font-medium">X (px)</label>
          <input
            type="number"
            value={Math.round(element.x)}
            onChange={(e) => handleCoordinateChange("x", e.target.value)}
            className="w-full mt-0.5 p-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-400 block font-medium">Y (px)</label>
          <input
            type="number"
            value={Math.round(element.y)}
            onChange={(e) => handleCoordinateChange("y", e.target.value)}
            className="w-full mt-0.5 p-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-400 block font-medium">Width</label>
          <input
            type="number"
            value={Math.round(element.width)}
            onChange={(e) => handleCoordinateChange("width", e.target.value)}
            className="w-full mt-0.5 p-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-400 block font-medium">Height</label>
          <input
            type="number"
            value={Math.round(element.height)}
            onChange={(e) => handleCoordinateChange("height", e.target.value)}
            className="w-full mt-0.5 p-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
            disabled={element.isQr} // QR dimensions are square
          />
        </div>
      </div>
    </div>
  );

  if (element.isQr) {
    return (
      <div className="space-y-3 p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
        {commonHeader("QR Code Properties")}
        
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Size (px)</label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="range"
              min={40}
              max={300}
              value={element.width}
              onChange={(e) => onUpdate({ width: parseInt(e.target.value, 10), height: parseInt(e.target.value, 10) })}
              className="flex-1 accent-indigo-600 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
            />
            <input
              type="number"
              value={element.width}
              onChange={(e) => onUpdate({ width: parseInt(e.target.value, 10), height: parseInt(e.target.value, 10) })}
              className="w-12 p-1 text-[11px] border border-gray-200 rounded focus:outline-none bg-gray-50/50 text-center"
            />
          </div>
        </div>

        {coordinatesSection}
        {arrangeSection}

        <p className="text-[9px] text-gray-400 mt-2 leading-relaxed bg-indigo-50/50 p-2 rounded border border-indigo-100/30">
          The verification QR code is generated dynamically when issuing the certificate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
      {commonHeader("Text Element Properties")}

      {/* Font Family */}
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Font Family</label>
        <select
          value={element.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="w-full mt-1 p-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size & Color */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Size (px)</label>
          <div className="flex items-center gap-1.5 mt-1">
            <input
              type="number"
              value={element.fontSize || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  onUpdate({ fontSize: "" });
                } else {
                  const parsed = parseInt(val, 10);
                  if (!isNaN(parsed)) {
                    onUpdate({ fontSize: Math.max(1, parsed) });
                  }
                }
              }}
              onBlur={() => {
                if (!element.fontSize || isNaN(element.fontSize)) {
                  onUpdate({ fontSize: 60 });
                }
              }}
              className="w-full p-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Color</label>
          <div className="flex items-center gap-1.5 mt-1 border border-gray-200 rounded p-0.5 bg-gray-50/50 w-full h-[26px]">
            <input
              type="color"
              value={element.fill}
              onChange={(e) => onUpdate({ fill: e.target.value })}
              className="w-6 h-full rounded cursor-pointer border-0 p-0"
            />
            <span className="text-[9px] font-mono text-gray-500 select-all">{element.fill}</span>
          </div>
        </div>
      </div>

      {/* Formatting & Alignment */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Styles</label>
          <div className="flex rounded-md border border-gray-200 p-0.5 w-max bg-gray-50">
            <button
              onClick={() => handleStyleToggle("bold")}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                element.fontStyle?.includes("bold")
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              title="Bold"
            >
              <Bold size={11} />
            </button>
            <button
              onClick={() => handleStyleToggle("italic")}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                element.fontStyle?.includes("italic")
                  ? "bg-indigo-600 text-white italic"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              title="Italic"
            >
              <Italic size={11} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Align</label>
          <div className="flex rounded-md border border-gray-200 p-0.5 w-max bg-gray-50">
            <button
              onClick={() => onUpdate({ align: "left" })}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                element.align === "left" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-800"
              }`}
              title="Align Left"
            >
              <AlignLeft size={11} />
            </button>
            <button
              onClick={() => onUpdate({ align: "center" })}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                element.align === "center" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-800"
              }`}
              title="Align Center"
            >
              <AlignCenter size={11} />
            </button>
            <button
              onClick={() => onUpdate({ align: "right" })}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                element.align === "right" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-800"
              }`}
              title="Align Right"
            >
              <AlignRight size={11} />
            </button>
          </div>
        </div>
      </div>

      {coordinatesSection}
      {arrangeSection}
    </div>
  );
};

export default TextElementControls;
