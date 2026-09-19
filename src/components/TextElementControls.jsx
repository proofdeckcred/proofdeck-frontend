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
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronUp,
  ChevronDown,
  Check,
  RotateCw,
  Copy,
  Square,
  Circle as CircleIcon,
  Minus,
  Star as StarIcon,
  Award,
  Box,
  Image as ImageIcon,
  Type,
} from "lucide-react";

const FONT_FAMILIES = [
  "Inter",
  "Playfair Display",
  "Cinzel",
  "Montserrat",
  "Cormorant Garamond",
  "Great Vibes",
  "Alex Brush",
  "Sacramento",
  "Prompt",
  "Lexend",
  "Product Sans",
  "Oswald",
  "Georgia",
  "Times New Roman",
  "Arial",
  "Verdana",
  "Courier New",
  "Impact",
];

const FONT_SIZE_PRESETS = [12, 14, 16, 20, 24, 28, 32, 40, 48, 60, 72];

const COLOR_PRESETS = [
  "#000000", "#ffffff", "#1e293b", "#475569", "#94a3b8",
  "#1e3a8a", "#2563eb", "#38bdf8", "#0284c7", "#0d9488",
  "#16a34a", "#65a30d", "#d97706", "#b45309", "#ea580c",
  "#dc2626", "#be123c", "#7c3aed", "#4f46e5", "#c026d3",
];

const TextElementControls = ({ element, onUpdate, onDelete, onDone }) => {
  const [showColorGrid, setShowColorGrid] = useState(false);
  const [showStrokeGrid, setShowStrokeGrid] = useState(false);

  if (!element) return null;

  const isQr = element.isQr || element.type === "qr";
  const isImage = element.type === "image";
  const isShape = ["rect", "circle", "line", "star", "badge", "border"].includes(element.type);
  const isText = !isQr && !isImage && !isShape;

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

  const commonHeader = (title, icon = null) => (
    <div className="flex justify-between items-center pb-2 border-b border-gray-100 mb-3">
      <div className="flex items-center gap-1.5 min-w-0">
        {icon}
        <span className="font-bold text-xs text-gray-800 truncate">{title}</span>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={onDone}
          className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-50 transition-colors"
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
    <div className="space-y-1.5 pt-2.5 border-t border-gray-100 mt-2.5">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Layer Depth</span>
      <div className="grid grid-cols-4 gap-1">
        <button
          onClick={() => onUpdate({ arrange: "front" })}
          className="flex flex-col items-center justify-center p-1 rounded border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-gray-600 transition-all text-center cursor-pointer"
          title="Bring to Front"
        >
          <ArrowUpToLine size={12} />
          <span className="text-[8px] mt-0.5 font-semibold">Front</span>
        </button>
        <button
          onClick={() => onUpdate({ arrange: "forward" })}
          className="flex flex-col items-center justify-center p-1 rounded border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-gray-600 transition-all text-center cursor-pointer"
          title="Move Forward"
        >
          <ChevronUp size={12} />
          <span className="text-[8px] mt-0.5 font-semibold">Forward</span>
        </button>
        <button
          onClick={() => onUpdate({ arrange: "backward" })}
          className="flex flex-col items-center justify-center p-1 rounded border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-gray-600 transition-all text-center cursor-pointer"
          title="Move Backward"
        >
          <ChevronDown size={12} />
          <span className="text-[8px] mt-0.5 font-semibold">Backward</span>
        </button>
        <button
          onClick={() => onUpdate({ arrange: "back" })}
          className="flex flex-col items-center justify-center p-1 rounded border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-gray-600 transition-all text-center cursor-pointer"
          title="Send to Back"
        >
          <ArrowDownToLine size={12} />
          <span className="text-[8px] mt-0.5 font-semibold">Back</span>
        </button>
      </div>
    </div>
  );

  const coordinatesSection = (
    <div className="space-y-1.5 pt-2.5 border-t border-gray-100 mt-2.5">
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
            value={Math.round(element.width || 0)}
            onChange={(e) => handleCoordinateChange("width", e.target.value)}
            className="w-full mt-0.5 p-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-400 block font-medium">H</label>
          <input
            type="number"
            value={Math.round(element.height || 0)}
            onChange={(e) => handleCoordinateChange("height", e.target.value)}
            className="w-full mt-0.5 p-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
            disabled={isQr}
          />
        </div>
      </div>
    </div>
  );

  const rotationSection = (
    <div className="space-y-1 pt-2.5 border-t border-gray-100 mt-2.5">
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
  );

  const opacitySection = (
    <div className="space-y-1 pt-2.5 border-t border-gray-100 mt-2.5">
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
  );

  // ──────────────── QR Element Controls ────────────────
  if (isQr) {
    return (
      <div className="space-y-3 p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
        {commonHeader("Verification QR Code", <Box size={14} className="text-indigo-600" />)}
        
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Size (px)</label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="range"
              min={40}
              max={300}
              value={element.width || 100}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onUpdate({ width: val, height: val });
              }}
              className="flex-1 accent-indigo-600 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
            />
            <input
              type="number"
              value={element.width || 100}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onUpdate({ width: val, height: val });
              }}
              className="w-12 p-1 text-[11px] border border-gray-200 rounded focus:outline-none bg-gray-50/50 text-center"
            />
          </div>
        </div>

        {rotationSection}
        {opacitySection}
        {coordinatesSection}
        {arrangeSection}

        <p className="text-[9px] text-gray-500 mt-2 leading-relaxed bg-indigo-50/60 p-2 rounded border border-indigo-100/50">
          The verification QR code is generated dynamically when issuing the certificate, linking to the public proof page.
        </p>
      </div>
    );
  }

  // ──────────────── Image Element Controls ────────────────
  if (isImage) {
    return (
      <div className="space-y-3 p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
        {commonHeader("Image / Logo", <ImageIcon size={14} className="text-indigo-600" />)}
        
        {element.src && (
          <div className="flex justify-center p-2 bg-gray-50 rounded-lg border border-gray-200/60">
            <img src={element.src} alt="element" className="max-h-24 max-w-full object-contain rounded" />
          </div>
        )}

        {opacitySection}
        {rotationSection}
        {coordinatesSection}
        {arrangeSection}
      </div>
    );
  }

  // ──────────────── Shape Element Controls ────────────────
  if (isShape) {
    const shapeTitles = {
      rect: "Rectangle / Card",
      circle: "Circle / Seal",
      line: "Divider Line",
      star: "Award Star",
      badge: "Rosette Badge",
      border: "Certificate Border",
    };

    const isLine = element.type === "line";
    const isRectOrBorder = element.type === "rect" || element.type === "border";

    return (
      <div className="space-y-3 p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
        {commonHeader(shapeTitles[element.type] || "Shape Properties", <Square size={14} className="text-indigo-600" />)}

        {/* Fill Color (not for line) */}
        {!isLine && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fill Color</label>
              <button
                type="button"
                onClick={() => onUpdate({ fill: "transparent" })}
                className="text-[9px] text-indigo-600 hover:underline cursor-pointer"
              >
                Transparent
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={element.fill === "transparent" ? "#ffffff" : (element.fill || "#3b82f6")}
                onChange={(e) => onUpdate({ fill: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer border border-gray-200 p-0"
              />
              <input
                type="text"
                value={element.fill || "transparent"}
                onChange={(e) => onUpdate({ fill: e.target.value })}
                className="flex-1 p-1 text-[10px] font-mono border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
              />
              <button
                type="button"
                onClick={() => setShowColorGrid(!showColorGrid)}
                className="text-[9px] px-1.5 py-1 rounded border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer"
              >
                {showColorGrid ? "Hide" : "Palette"}
              </button>
            </div>
            {showColorGrid && (
              <div className="grid grid-cols-10 gap-1 mt-1.5 p-1.5 bg-gray-50 rounded border border-gray-100">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onUpdate({ fill: c })}
                    className="w-4 h-4 rounded-xs border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stroke / Border Color */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            {isLine ? "Line Color" : "Border / Outline"}
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={element.stroke || "#000000"}
              onChange={(e) => onUpdate({ stroke: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer border border-gray-200 p-0"
            />
            <input
              type="text"
              value={element.stroke || "transparent"}
              onChange={(e) => onUpdate({ stroke: e.target.value })}
              className="flex-1 p-1 text-[10px] font-mono border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
            />
            <button
              type="button"
              onClick={() => setShowStrokeGrid(!showStrokeGrid)}
              className="text-[9px] px-1.5 py-1 rounded border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer"
            >
              {showStrokeGrid ? "Hide" : "Palette"}
            </button>
          </div>
          {showStrokeGrid && (
            <div className="grid grid-cols-10 gap-1 mt-1.5 p-1.5 bg-gray-50 rounded border border-gray-100">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onUpdate({ stroke: c })}
                  className="w-4 h-4 rounded-xs border border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stroke Width */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            {isLine ? "Thickness (px)" : "Border Width (px)"}
          </label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="range"
              min={isLine ? 1 : 0}
              max={30}
              value={element.strokeWidth || (isLine ? 2 : 0)}
              onChange={(e) => onUpdate({ strokeWidth: parseInt(e.target.value, 10) })}
              className="flex-1 accent-indigo-600 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono text-gray-600 w-8 text-right">
              {element.strokeWidth || (isLine ? 2 : 0)}px
            </span>
          </div>
        </div>

        {/* Stroke Style: Solid, Dashed, Dotted */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Style</label>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => onUpdate({ dash: undefined })}
              className={`py-1 text-[10px] font-semibold rounded border cursor-pointer ${
                !element.dash ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Solid
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ dash: [8, 6] })}
              className={`py-1 text-[10px] font-semibold rounded border cursor-pointer ${
                element.dash && element.dash[0] === 8 ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Dashed
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ dash: [3, 3] })}
              className={`py-1 text-[10px] font-semibold rounded border cursor-pointer ${
                element.dash && element.dash[0] === 3 ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Dotted
            </button>
          </div>
        </div>

        {/* Corner Radius (for Rect and Border) */}
        {isRectOrBorder && (
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Corner Radius</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="range"
                min={0}
                max={50}
                value={element.cornerRadius || 0}
                onChange={(e) => onUpdate({ cornerRadius: parseInt(e.target.value, 10) })}
                className="flex-1 accent-indigo-600 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-gray-600 w-8 text-right">
                {element.cornerRadius || 0}px
              </span>
            </div>
          </div>
        )}

        {opacitySection}
        {rotationSection}
        {coordinatesSection}
        {arrangeSection}
      </div>
    );
  }

  // ──────────────── Text Element Controls (Default) ────────────────
  return (
    <div className="space-y-3 p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
      {commonHeader("Text Element", <Type size={14} className="text-indigo-600" />)}

      {/* Text / Variable Input */}
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
          Content / Variable
        </label>
        <input
          type="text"
          value={element.text || ""}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="e.g. Certificate of Appreciation or {{recipient_name}}"
          className="w-full p-1.5 text-xs font-medium border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
        />
        <span className="text-[8px] text-gray-400 mt-0.5 block">
          Tip: You can also double-click the text directly on the canvas to edit inline!
        </span>
      </div>

      {/* Font Family */}
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Font Family</label>
        <select
          value={element.fontFamily || "Arial"}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="w-full p-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white cursor-pointer"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size with quick presets */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Font Size</label>
          <span className="text-[10px] font-mono text-gray-500">{element.fontSize || 20}px</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={8}
            max={100}
            value={element.fontSize || 20}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value, 10) })}
            className="flex-1 accent-indigo-600 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
          />
          <input
            type="number"
            value={element.fontSize || 20}
            onChange={(e) => onUpdate({ fontSize: Math.max(1, parseInt(e.target.value, 10) || 1) })}
            className="w-12 p-1 text-xs border border-gray-200 rounded text-center bg-gray-50/50"
          />
        </div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {FONT_SIZE_PRESETS.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onUpdate({ fontSize: size })}
              className={`text-[9px] px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                element.fontSize === size
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker & Swatches */}
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Color</label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={element.fill || "#000000"}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer border border-gray-200 p-0"
          />
          <input
            type="text"
            value={element.fill || "#000000"}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="flex-1 p-1 text-[10px] font-mono border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
          />
          <button
            type="button"
            onClick={() => setShowColorGrid(!showColorGrid)}
            className="text-[9px] px-1.5 py-1 rounded border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer"
          >
            {showColorGrid ? "Hide" : "Palette"}
          </button>
        </div>
        {showColorGrid && (
          <div className="grid grid-cols-10 gap-1 mt-1.5 p-1.5 bg-gray-50 rounded border border-gray-100">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onUpdate({ fill: color })}
                className="w-4 h-4 rounded-xs border border-gray-200 hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Formatting & Alignment */}
      <div className="space-y-2 pt-1 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-2">
          {/* Styles */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Styles</label>
            <div className="flex rounded-md border border-gray-200 p-0.5 w-max bg-gray-50 gap-0.5">
              <button
                type="button"
                onClick={() => handleStyleToggle("bold")}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  element.fontStyle?.includes("bold") ? "bg-indigo-600 text-white font-bold" : "text-gray-500 hover:text-gray-800"
                }`}
                title="Bold"
              >
                <Bold size={11} />
              </button>
              <button
                type="button"
                onClick={() => handleStyleToggle("italic")}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  element.fontStyle?.includes("italic") ? "bg-indigo-600 text-white italic" : "text-gray-500 hover:text-gray-800"
                }`}
                title="Italic"
              >
                <Italic size={11} />
              </button>
              <button
                type="button"
                onClick={() => handleDecorationToggle("underline")}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  element.textDecoration?.includes("underline") ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-800"
                }`}
                title="Underline"
              >
                <Underline size={11} />
              </button>
              <button
                type="button"
                onClick={() => handleDecorationToggle("line-through")}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  element.textDecoration?.includes("line-through") ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-800"
                }`}
                title="Strikethrough"
              >
                <Strikethrough size={11} />
              </button>
            </div>
          </div>

          {/* Alignment */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Alignment</label>
            <div className="flex rounded-md border border-gray-200 p-0.5 w-max bg-gray-50 gap-0.5">
              <button
                type="button"
                onClick={() => onUpdate({ align: "left" })}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  (!element.align || element.align === "left") ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-800"
                }`}
                title="Align Left"
              >
                <AlignLeft size={11} />
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ align: "center" })}
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  element.align === "center" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-800"
                }`}
                title="Align Center"
              >
                <AlignCenter size={11} />
              </button>
              <button
                type="button"
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

        {/* Letter Spacing & Line Height */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Letter Space</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={element.letterSpacing || 0}
                onChange={(e) => onUpdate({ letterSpacing: parseFloat(e.target.value) || 0 })}
                step={0.5}
                className="w-full p-1 text-[11px] border border-gray-200 rounded focus:outline-none bg-gray-50/50"
              />
              <span className="text-[9px] text-gray-400">px</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Line Height</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={element.lineHeight || 1}
                onChange={(e) => onUpdate({ lineHeight: parseFloat(e.target.value) || 1 })}
                step={0.1}
                min={0.5}
                max={3}
                className="w-full p-1 text-[11px] border border-gray-200 rounded focus:outline-none bg-gray-50/50"
              />
              <span className="text-[9px] text-gray-400">×</span>
            </div>
          </div>
        </div>
      </div>

      {opacitySection}
      {rotationSection}
      {coordinatesSection}
      {arrangeSection}

      {/* Keyboard shortcuts */}
      <div className="text-[9px] text-gray-400 mt-2 leading-relaxed bg-gray-50 p-2 rounded border border-gray-100">
        <span className="font-bold text-gray-500 block mb-0.5">Shortcuts</span>
        <span className="block">Arrow keys: move 1px · Shift+Arrow: 10px</span>
        <span className="block">Ctrl+D: duplicate · Del: delete · Esc: deselect</span>
      </div>
    </div>
  );
};

export default TextElementControls;
