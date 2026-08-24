import React from "react";
import {
  Trash2,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Check,
} from "lucide-react";

const FONT_FAMILIES = [
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
      onUpdate({ fontStyle: currentStyle.replace(style, "").trim() });
    } else {
      onUpdate({ fontStyle: `${currentStyle} ${style}`.trim() });
    }
  };

  if (element.isQr) {
    const handleSizeChange = (e) => {
      const val = parseInt(e.target.value, 10);
      onUpdate({ width: val, height: val });
    };

    return (
      <div className="space-y-4 p-4 border rounded-lg bg-white">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-gray-800">QR Code Placeholder</h4>
          <div className="flex gap-2">
            <button
              onClick={onDone}
              className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-100"
            >
              <Check size={18} />
            </button>
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Size (px)</label>
          <input
            type="number"
            value={element.width}
            onChange={handleSizeChange}
            className="w-full mt-1 p-2 border rounded-md"
            min={5}
          />
        </div>
        <p className="text-sm text-gray-500">
          The QR Code will be generated automatically when issuing the
          certificate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-800">Element Properties</h4>
        <div className="flex gap-2">
          <button
            onClick={onDone}
            className="text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-100"
          >
            <Check size={18} />
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-600">Font Family</label>
        <select
          value={element.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="w-full mt-1 p-2 border rounded-md"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Size (px)</label>
          <input
            type="number"
            value={element.fontSize}
            onChange={(e) =>
              onUpdate({ fontSize: parseInt(e.target.value, 10) })
            }
            className="w-full mt-1 p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Color</label>
          <input
            type="color"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="w-full mt-1 h-10 p-1 border rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Style</label>
          <div className="flex mt-1">
            <button
              onClick={() => handleStyleToggle("bold")}
              className={`p-2 border rounded-l-md ${
                element.fontStyle?.includes("bold")
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => handleStyleToggle("italic")}
              className={`p-2 border-t border-b border-r rounded-r-md ${
                element.fontStyle?.includes("italic")
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              <Italic size={16} />
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">
            Horizontal Align
          </label>
          <div className="flex mt-1">
            <button
              onClick={() => onUpdate({ align: "left" })}
              className={`p-2 border rounded-l-md ${
                element.align === "left"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => onUpdate({ align: "center" })}
              className={`p-2 border-t border-b ${
                element.align === "center"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => onUpdate({ align: "right" })}
              className={`p-2 border rounded-r-md ${
                element.align === "right"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              <AlignRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600">
            Vertical Align
          </label>
          <div className="flex mt-1">
            <button
              onClick={() => onUpdate({ verticalAlign: "top" })}
              className={`p-2 border rounded-l-md ${
                element.verticalAlign === "top"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              <AlignVerticalJustifyStart size={16} />
            </button>
            <button
              onClick={() => onUpdate({ verticalAlign: "middle" })}
              className={`p-2 border-t border-b ${
                element.verticalAlign === "middle"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              <AlignVerticalJustifyCenter size={16} />
            </button>
            <button
              onClick={() => onUpdate({ verticalAlign: "bottom" })}
              className={`p-2 border rounded-r-md ${
                element.verticalAlign === "bottom"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              <AlignVerticalJustifyEnd size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextElementControls;
