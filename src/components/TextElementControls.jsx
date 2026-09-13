import React, { useState } from "react";
import {
  Trash2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronUp,
  ChevronDown,
  Check,
  RotateCw,
  Copy,
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

const FONT_SIZE_PRESETS = [12, 16, 20, 24, 32, 48, 64, 72];

const COLOR_PRESETS = [
  "#000000", "#FFFFFF", "#1e293b", "#4b5563", "#94a3b8",
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6",
  "#6366f1", "#a855f7", "#ec4899", "#14b8a6", "#d97706",
  "#1e3a8a",
];

const TextElementControls = ({ element, onUpdate, onDelete, onDone }) => {
  const [showColorGrid, setShowColorGrid] = useState(false);

  const handleStyleToggle = (style) => {
    const currentStyle = element.fontStyle || "normal";
    if (currentStyle.includes(style)) {
      onUpdate({ fontStyle: currentStyle.replace(style, "").trim() || "normal" });
    } else {
      onUpdate({ fontStyle: `${currentStyle === "normal" ? "" : currentStyle} ${style}`.trim() });
    }
  };

  const handleDecorationToggle = (decoration) => {
    const current = element.textDecoration || "";
    if (current.includes(decoration)) {
      onUpdate({ textDecoration: current.replace(decoration, "").trim() });
    } else {
      onUpdate({ textDecoration: `${current} ${decoration}`.trim() });
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
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Position & Size</span>
      <div className="grid grid-cols-4 gap-1.5">
        <div>
          <label className="text-[9px] text-gray-400 block font-medium">X</label>
          <input
            type="number"
            value={Math.round(element.x)}
            onChange={(e) => handleCoordinateChange("x", e.target.value)}
            className="w-full mt-0.5 p-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-400 block font-medium">Y</label>
          <input
            type="number"
            value={Math.round(element.y)}
            onChange={(e) => handleCoordinateChange("y", e.target.value)}
            className="w-full mt-0.5 p-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-400 block font-medium">W</label>
          <input
            type="number"
            value={Math.round(element.width)}
            onChange={(e) => handleCoordinateChange("width", e.target.value)}
            className="w-full mt-0.5 p-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-400 block font-medium">H</label>
          <input
            type="number"
            value={Math.round(element.height)}
            onChange={(e) => handleCoordinateChange("height", e.target.value)}
            className="w-full mt-0.5 p-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
            disabled={element.isQr}
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

        {/* Rotation */}
        <div className="space-y-1 pt-2 border-t border-gray-100 mt-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Rotation</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={360}
              value={element.rotation || 0}
              onChange={(e) => onUpdate({ rotation: parseInt(e.target.value, 10) })}
              className="flex-1 accent-indigo-600 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
            />
            <div className="flex items-center gap-0.5">
              <input
                type="number"
                value={Math.round(element.rotation || 0)}
                onChange={(e) => onUpdate({ rotation: parseInt(e.target.value, 10) || 0 })}
                className="w-12 p-1 text-[11px] border border-gray-200 rounded focus:outline-none bg-gray-50/50 text-center"
              />
              <span className="text-[9px] text-gray-400">°</span>
            </div>
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
    <div className="space-y-3 p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
      {commonHeader("Text Element Properties")}

      {/* Text Content / Variable */}
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Text / Variable</label>
        <input
          type="text"
          value={element.text || ""}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="e.g. {{recipient_name}} or Certificate Title"
          className="w-full mt-1 p-1.5 text-xs font-medium border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
        />
      </div>

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

      {/* Font Size with presets */}
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Font Size</label>
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
            className="w-16 p-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-center"
          />
          <span className="text-[9px] text-gray-400">px</span>
        </div>
        {/* Quick size presets */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {FONT_SIZE_PRESETS.map((size) => (
            <button
              key={size}
              onClick={() => onUpdate({ fontSize: size })}
              className={`text-[9px] px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                element.fontSize === size
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-gray-50 text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color with swatches */}
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Color</label>
        <div className="flex items-center gap-1.5 mt-1">
          <input
            type="color"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer border border-gray-200 p-0"
          />
          <input
            type="text"
            value={element.fill}
            onChange={(e) => {
              const val = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                onUpdate({ fill: val });
              }
            }}
            className="flex-1 p-1 text-[10px] font-mono border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
          />
          <button
            onClick={() => setShowColorGrid(!showColorGrid)}
            className="text-[8px] px-1.5 py-1 rounded border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer"
          >
            {showColorGrid ? "Hide" : "Swatches"}
          </button>
        </div>
        {showColorGrid && (
          <div className="grid grid-cols-8 gap-1 mt-1.5 p-1.5 bg-gray-50 rounded border border-gray-100">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => onUpdate({ fill: color })}
                className={`w-5 h-5 rounded-sm cursor-pointer border transition-all hover:scale-110 ${
                  element.fill === color
                    ? "border-indigo-500 ring-1 ring-indigo-300 scale-110"
                    : "border-gray-200"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Formatting: Bold, Italic, Underline, Strikethrough */}
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
            <button
              onClick={() => handleDecorationToggle("underline")}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                element.textDecoration?.includes("underline")
                  ? "bg-indigo-600 text-white"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              title="Underline"
            >
              <Underline size={11} />
            </button>
            <button
              onClick={() => handleDecorationToggle("line-through")}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                element.textDecoration?.includes("line-through")
                  ? "bg-indigo-600 text-white"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              title="Strikethrough"
            >
              <Strikethrough size={11} />
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

      {/* Opacity */}
      <div className="space-y-1 pt-2 border-t border-gray-100 mt-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Opacity</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round((element.opacity != null ? element.opacity : 1) * 100)}
            onChange={(e) => onUpdate({ opacity: parseInt(e.target.value, 10) / 100 })}
            className="flex-1 accent-indigo-600 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] font-mono text-gray-500 w-8 text-right">
            {Math.round((element.opacity != null ? element.opacity : 1) * 100)}%
          </span>
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-1 pt-2 border-t border-gray-100 mt-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Rotation</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={360}
            value={element.rotation || 0}
            onChange={(e) => onUpdate({ rotation: parseInt(e.target.value, 10) })}
            className="flex-1 accent-indigo-600 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
          />
          <div className="flex items-center gap-0.5">
            <input
              type="number"
              value={Math.round(element.rotation || 0)}
              onChange={(e) => onUpdate({ rotation: parseInt(e.target.value, 10) || 0 })}
              className="w-12 p-1 text-[11px] border border-gray-200 rounded focus:outline-none bg-gray-50/50 text-center"
            />
            <span className="text-[9px] text-gray-400">°</span>
          </div>
        </div>
      </div>

      {/* Letter Spacing & Line Height */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 mt-2">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Letter Spacing</label>
          <div className="flex items-center gap-1 mt-1">
            <input
              type="number"
              value={element.letterSpacing || 0}
              onChange={(e) => onUpdate({ letterSpacing: parseFloat(e.target.value) || 0 })}
              step={0.5}
              className="w-full p-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
            />
            <span className="text-[9px] text-gray-400">px</span>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Line Height</label>
          <div className="flex items-center gap-1 mt-1">
            <input
              type="number"
              value={element.lineHeight || 1}
              onChange={(e) => onUpdate({ lineHeight: parseFloat(e.target.value) || 1 })}
              step={0.1}
              min={0.5}
              max={3}
              className="w-full p-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
            />
            <span className="text-[9px] text-gray-400">×</span>
          </div>
        </div>
      </div>

      {coordinatesSection}
      {arrangeSection}

      {/* Keyboard shortcuts hint */}
      <div className="text-[9px] text-gray-400 mt-2 leading-relaxed bg-gray-50 p-2 rounded border border-gray-100">
        <span className="font-bold text-gray-500 block mb-0.5">Shortcuts</span>
        <span className="block">Arrow keys: move 1px · Shift+Arrow: 10px</span>
        <span className="block">Ctrl+D: duplicate · Del: delete · Esc: deselect</span>
      </div>
    </div>
  );
};

export default TextElementControls;
