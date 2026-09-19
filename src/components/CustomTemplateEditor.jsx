import React, { useRef, useEffect, useState, useCallback } from "react";
import Konva from "konva";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text,
  Transformer,
  Group,
  Rect,
  Circle,
  Line,
  Star,
} from "react-konva";
import useImage from "use-image";
import { SERVER_BASE_URL } from "../config";

const resolveImageUrl = (src) => {
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  const cleanBase = (SERVER_BASE_URL || "").replace(/\/+$/, "");
  const cleanPath = src.startsWith("/") ? src : `/${src}`;
  return `${cleanBase}${cleanPath}`;
};

// ─── Constants ──────────────────────────────────────────────
const SNAP_THRESHOLD = 6;
const GUIDELINE_COLOR = "#6366f1";
const GUIDELINE_DASH = [4, 4];

// ─── Snapping Utilities ─────────────────────────────────────
const getSnapLines = (skipNodeId, elements, canvasSize) => {
  const vertical = new Set();
  const horizontal = new Set();

  vertical.add(0);
  vertical.add(canvasSize.width / 2);
  vertical.add(canvasSize.width);
  horizontal.add(0);
  horizontal.add(canvasSize.height / 2);
  horizontal.add(canvasSize.height);

  elements.forEach((el) => {
    if (el.id === skipNodeId) return;
    const w = el.width || 100;
    const h = el.height || 30;
    vertical.add(el.x);
    vertical.add(el.x + w / 2);
    vertical.add(el.x + w);
    horizontal.add(el.y);
    horizontal.add(el.y + h / 2);
    horizontal.add(el.y + h);
  });

  return {
    vertical: [...vertical],
    horizontal: [...horizontal],
  };
};

const getSnappedPosition = (nodeX, nodeY, nodeW, nodeH, snapLines) => {
  const guides = [];
  const nodeXAnchors = [nodeX, nodeX + nodeW / 2, nodeX + nodeW];
  const nodeYAnchors = [nodeY, nodeY + nodeH / 2, nodeY + nodeH];

  let bestDx = null;
  let bestAbsDx = SNAP_THRESHOLD + 1;
  let bestDy = null;
  let bestAbsDy = SNAP_THRESHOLD + 1;
  let snapGuideX = null;
  let snapGuideY = null;

  for (const anchor of nodeXAnchors) {
    for (const line of snapLines.vertical) {
      const dist = Math.abs(anchor - line);
      if (dist < SNAP_THRESHOLD && dist < bestAbsDx) {
        bestAbsDx = dist;
        bestDx = line - anchor;
        snapGuideX = line;
      }
    }
  }

  for (const anchor of nodeYAnchors) {
    for (const line of snapLines.horizontal) {
      const dist = Math.abs(anchor - line);
      if (dist < SNAP_THRESHOLD && dist < bestAbsDy) {
        bestAbsDy = dist;
        bestDy = line - anchor;
        snapGuideY = line;
      }
    }
  }

  if (snapGuideX !== null) {
    guides.push({
      points: [snapGuideX, -9999, snapGuideX, 9999],
      orientation: "V",
    });
  }
  if (snapGuideY !== null) {
    guides.push({
      points: [-9999, snapGuideY, 9999, snapGuideY],
      orientation: "H",
    });
  }

  return {
    x: bestDx !== null ? nodeX + bestDx : null,
    y: bestDy !== null ? nodeY + bestDy : null,
    guides,
  };
};

// ─── Image Element Helper ────────────────────────────────────
const KonvaLoadedImage = ({ src, width, height }) => {
  const resolvedSrc = resolveImageUrl(src);
  const isDataOrBlob = resolvedSrc.startsWith("data:") || resolvedSrc.startsWith("blob:");
  const [image, status] = useImage(resolvedSrc, isDataOrBlob ? undefined : "anonymous");
  const [fallbackImage] = useImage(status === "failed" && !isDataOrBlob ? resolvedSrc : null);
  const finalImage = image || fallbackImage;

  return finalImage ? (
    <KonvaImage image={finalImage} width={width} height={height} listening={false} />
  ) : null;
};

// ─── DraggableText ──────────────────────────────────────────
const DraggableText = ({
  shapeProps,
  isSelected,
  isEditing,
  onSelect,
  onStartEdit,
  onChange,
  onDragMoveSnap,
  onDragEndSnap,
}) => {
  const groupRef = useRef();
  const width = shapeProps.width || 200;
  const height = shapeProps.height || 30;

  return (
    <Group
      ref={groupRef}
      id={shapeProps.id}
      x={shapeProps.x}
      y={shapeProps.y}
      rotation={shapeProps.rotation || 0}
      draggable={!isEditing}
      visible={!isEditing}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onDblClick={(e) => {
        e.cancelBubble = true;
        onStartEdit();
      }}
      onDblTap={(e) => {
        e.cancelBubble = true;
        onStartEdit();
      }}
      onDragMove={(e) => {
        if (onDragMoveSnap) {
          onDragMoveSnap(e, shapeProps.id, width, height);
        }
      }}
      onDragEnd={(e) => {
        if (onDragEndSnap) onDragEndSnap();
        onChange({
          ...shapeProps,
          x: Math.round(e.target.x()),
          y: Math.round(e.target.y()),
        });
        onSelect();
      }}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "move";
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
      onTransformEnd={() => {
        const node = groupRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          ...shapeProps,
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          width: Math.max(30, Math.round(width * scaleX)),
          height: Math.max(15, Math.round(height * scaleY)),
          rotation: Math.round(node.rotation()),
        });
      }}
    >
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="rgba(255,255,255,0.01)"
        stroke={isSelected ? "transparent" : "rgba(99, 102, 241, 0.45)"}
        strokeWidth={1}
        dash={isSelected ? undefined : [4, 4]}
        strokeScaleEnabled={false}
        cornerRadius={2}
        listening={true}
        perfectDrawEnabled={false}
      />
      <Text
        x={0}
        y={0}
        width={width}
        height={height}
        text={shapeProps.text}
        fontSize={shapeProps.fontSize || 20}
        fontFamily={shapeProps.fontFamily || "Arial"}
        fill={shapeProps.fill || "#000000"}
        align={shapeProps.align || "left"}
        fontStyle={shapeProps.fontStyle || "normal"}
        verticalAlign={shapeProps.verticalAlign || "middle"}
        opacity={shapeProps.opacity != null ? shapeProps.opacity : 1}
        letterSpacing={shapeProps.letterSpacing || 0}
        lineHeight={shapeProps.lineHeight || 1}
        textDecoration={shapeProps.textDecoration || ""}
        listening={true}
      />
    </Group>
  );
};

// ─── DraggableShape (Rect, Circle, Line, Star, Badge, Border) ──
const DraggableShape = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  onDragMoveSnap,
  onDragEndSnap,
}) => {
  const groupRef = useRef();
  const width = shapeProps.width || 100;
  const height = shapeProps.height || 100;
  const type = shapeProps.type;

  const handleDragEnd = (e) => {
    if (onDragEndSnap) onDragEndSnap();
    onChange({
      ...shapeProps,
      x: Math.round(e.target.x()),
      y: Math.round(e.target.y()),
    });
    onSelect();
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      ...shapeProps,
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      width: Math.max(10, Math.round(width * scaleX)),
      height: Math.max(10, Math.round(height * scaleY)),
      rotation: Math.round(node.rotation()),
    });
  };

  return (
    <Group
      ref={groupRef}
      id={shapeProps.id}
      x={shapeProps.x}
      y={shapeProps.y}
      rotation={shapeProps.rotation || 0}
      draggable
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onDragMove={(e) => {
        if (onDragMoveSnap) {
          onDragMoveSnap(e, shapeProps.id, width, height);
        }
      }}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "move";
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
    >
      {type === "rect" && (
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={shapeProps.fill || "transparent"}
          stroke={shapeProps.stroke || "transparent"}
          strokeWidth={shapeProps.strokeWidth || 0}
          cornerRadius={shapeProps.cornerRadius || 0}
          dash={shapeProps.dash}
          opacity={shapeProps.opacity != null ? shapeProps.opacity : 1}
          listening={true}
        />
      )}

      {type === "circle" && (
        <Circle
          x={width / 2}
          y={height / 2}
          radius={Math.min(width, height) / 2}
          fill={shapeProps.fill || "transparent"}
          stroke={shapeProps.stroke || "transparent"}
          strokeWidth={shapeProps.strokeWidth || 0}
          dash={shapeProps.dash}
          opacity={shapeProps.opacity != null ? shapeProps.opacity : 1}
          listening={true}
        />
      )}

      {type === "line" && (
        <Line
          x={0}
          y={height / 2}
          points={[0, 0, width, 0]}
          stroke={shapeProps.stroke || "#000000"}
          strokeWidth={Math.max(1, shapeProps.strokeWidth || 2)}
          dash={shapeProps.dash}
          opacity={shapeProps.opacity != null ? shapeProps.opacity : 1}
          listening={true}
          hitStrokeWidth={Math.max(12, shapeProps.strokeWidth || 2)}
        />
      )}

      {type === "star" && (
        <Star
          x={width / 2}
          y={height / 2}
          numPoints={shapeProps.numPoints || 5}
          innerRadius={(Math.min(width, height) / 2) * 0.45}
          outerRadius={Math.min(width, height) / 2}
          fill={shapeProps.fill || "#f59e0b"}
          stroke={shapeProps.stroke || "transparent"}
          strokeWidth={shapeProps.strokeWidth || 0}
          opacity={shapeProps.opacity != null ? shapeProps.opacity : 1}
          listening={true}
        />
      )}

      {type === "badge" && (
        <Group x={0} y={0} opacity={shapeProps.opacity != null ? shapeProps.opacity : 1} listening={true}>
          {/* Ribbon Tail Left */}
          <Line
            points={[width * 0.25, height * 0.65, width * 0.12, height * 0.95, width * 0.38, height * 0.85, width * 0.5, height * 0.7]}
            fill={shapeProps.stroke || "#b45309"}
            closed={true}
            listening={false}
          />
          {/* Ribbon Tail Right */}
          <Line
            points={[width * 0.75, height * 0.65, width * 0.88, height * 0.95, width * 0.62, height * 0.85, width * 0.5, height * 0.7]}
            fill={shapeProps.stroke || "#b45309"}
            closed={true}
            listening={false}
          />
          {/* Rosette Base Circle */}
          <Circle
            x={width / 2}
            y={height * 0.45}
            radius={(Math.min(width, height) / 2) * 0.85}
            fill={shapeProps.fill || "#d97706"}
            stroke={shapeProps.stroke || "#b45309"}
            strokeWidth={shapeProps.strokeWidth || 2}
            listening={true}
          />
          {/* Dotted Inner Ring */}
          <Circle
            x={width / 2}
            y={height * 0.45}
            radius={(Math.min(width, height) / 2) * 0.68}
            stroke="#ffffff"
            strokeWidth={1.5}
            dash={[3, 3]}
            listening={false}
          />
          {/* Center Emblem Star */}
          <Star
            x={width / 2}
            y={height * 0.45}
            numPoints={5}
            innerRadius={(Math.min(width, height) / 2) * 0.25}
            outerRadius={(Math.min(width, height) / 2) * 0.5}
            fill="#ffffff"
            listening={false}
          />
        </Group>
      )}

      {type === "border" && (
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          stroke={shapeProps.stroke || "#1e3a8a"}
          strokeWidth={shapeProps.strokeWidth || 4}
          cornerRadius={shapeProps.cornerRadius || 0}
          dash={shapeProps.dash}
          opacity={shapeProps.opacity != null ? shapeProps.opacity : 1}
          listening={true}
          hitStrokeWidth={12}
        />
      )}

      {type === "image" && shapeProps.src && (
        <Group x={0} y={0} opacity={shapeProps.opacity != null ? shapeProps.opacity : 1} listening={true}>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="rgba(0,0,0,0.01)"
            listening={true}
          />
          <KonvaLoadedImage src={shapeProps.src} width={width} height={height} />
        </Group>
      )}
    </Group>
  );
};

// ─── DraggableQR ────────────────────────────────────────────
const DraggableQR = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  onDragMoveSnap,
  onDragEndSnap,
}) => {
  const groupRef = useRef();
  const width = shapeProps.width || 100;
  const height = shapeProps.height || 100;

  return (
    <Group
      ref={groupRef}
      id={shapeProps.id}
      x={shapeProps.x}
      y={shapeProps.y}
      rotation={shapeProps.rotation || 0}
      draggable
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onDragMove={(e) => {
        if (onDragMoveSnap) {
          onDragMoveSnap(e, shapeProps.id, width, height);
        }
      }}
      onDragEnd={(e) => {
        if (onDragEndSnap) onDragEndSnap();
        onChange({
          ...shapeProps,
          x: Math.round(e.target.x()),
          y: Math.round(e.target.y()),
        });
        onSelect();
      }}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "move";
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
      onTransformEnd={() => {
        const node = groupRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        const newSize = Math.max(30, Math.round(width * Math.max(scaleX, scaleY)));
        onChange({
          ...shapeProps,
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          width: newSize,
          height: newSize,
          rotation: Math.round(node.rotation()),
        });
      }}
    >
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="white"
        stroke={isSelected ? "#4f46e5" : "#e2e8f0"}
        strokeWidth={1}
        cornerRadius={4}
        listening={true}
      />
      {(() => {
        const cells = 5;
        const cellW = width / cells;
        const cellH = height / cells;
        const qrPattern = [
          [1, 1, 1, 0, 1],
          [1, 0, 1, 0, 0],
          [1, 1, 1, 0, 1],
          [0, 0, 0, 1, 0],
          [1, 0, 1, 1, 1],
        ];
        const rects = [];
        for (let r = 0; r < cells; r++) {
          for (let c = 0; c < cells; c++) {
            if (qrPattern[r][c]) {
              rects.push(
                <Rect
                  key={`qr-${r}-${c}`}
                  x={c * cellW + cellW * 0.15}
                  y={r * cellH + cellH * 0.15}
                  width={cellW * 0.7}
                  height={cellH * 0.7}
                  fill="rgba(0,0,0,0.18)"
                  listening={false}
                />
              );
            }
          }
        }
        return rects;
      })()}
      <Text
        x={0}
        y={0}
        text="QR Code"
        width={width}
        height={height}
        align="center"
        verticalAlign="middle"
        fontSize={Math.max(9, Math.min(12, width / 8))}
        fill="rgba(0,0,0,0.65)"
        fontStyle="bold"
        listening={false}
      />
    </Group>
  );
};

// ─── Main Editor Component ──────────────────────────────────
const CustomTemplateEditor = ({
  stageRef,
  backgroundImageUrl,
  backgroundConfig = {},
  elements,
  setElements,
  selectedId,
  setSelectedId,
  canvasSize,
  showGrid = true,
  zoomScale = 1,
}) => {
  const resolvedBg = resolveImageUrl(backgroundImageUrl);
  const isBgData = resolvedBg.startsWith("data:") || resolvedBg.startsWith("blob:");
  const [bgImage, bgStatus] = useImage(resolvedBg, isBgData ? undefined : "anonymous");
  const [bgFallback] = useImage(bgStatus === "failed" && !isBgData ? resolvedBg : null);
  const image = bgImage || bgFallback;
  const guidesLayerRef = useRef(null);
  const trRef = useRef();

  // ── Inline Canvas Text Editing State ──
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const editTextareaRef = useRef(null);

  const activeEditingElement = elements.find((el) => el.id === editingId);

  // Focus and select textarea on start edit
  useEffect(() => {
    if (editingId && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.select();
    }
  }, [editingId]);

  // Connect transformer to selected element
  useEffect(() => {
    if (!trRef.current || !stageRef?.current) return;
    if (selectedId && !editingId) {
      const node = stageRef.current.findOne("#" + selectedId);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer()?.batchDraw();
      }
    } else {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, editingId, stageRef]);

  // ── Keyboard: Shortcuts (Nudge, Duplicate, Delete, Deselect) ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingId) return;
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setSelectedId(null);
        return;
      }

      if (!selectedId) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        setElements((prev) => prev.filter((el) => el.id !== selectedId));
        setSelectedId(null);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        setElements((prev) => {
          const source = prev.find((el) => el.id === selectedId);
          if (!source) return prev;
          const clone = {
            ...source,
            id: `el_${Math.random().toString(36).substring(2, 11)}`,
            x: Math.min(canvasSize.width - 50, source.x + 20),
            y: Math.min(canvasSize.height - 50, source.y + 20),
          };
          setSelectedId(clone.id);
          return [...prev, clone];
        });
        return;
      }

      // Arrow precision nudge
      const MOVE_STEP = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      if (e.key === "ArrowUp") dy = -MOVE_STEP;
      else if (e.key === "ArrowDown") dy = MOVE_STEP;
      else if (e.key === "ArrowLeft") dx = -MOVE_STEP;
      else if (e.key === "ArrowRight") dx = MOVE_STEP;
      else return;

      e.preventDefault();
      setElements((prev) =>
        prev.map((el) => {
          if (el.id === selectedId) {
            return { ...el, x: el.x + dx, y: el.y + dy };
          }
          return el;
        })
      );
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, editingId, setElements, setSelectedId, canvasSize]);

  // Click empty space -> deselect
  const checkDeselect = useCallback(
    (e) => {
      const clickedOnEmpty =
        e.target === e.target.getStage() ||
        (e.target.attrs && e.target.attrs.id === "canvas-background-rect") ||
        (e.target.getClassName && e.target.getClassName() === "Image");
      if (clickedOnEmpty) {
        if (editingId) {
          commitInlineEdit();
        }
        setSelectedId(null);
      }
    },
    [editingId, setSelectedId]
  );

  const commitInlineEdit = () => {
    if (editingId) {
      setElements((prev) =>
        prev.map((el) => (el.id === editingId ? { ...el, text: editingText } : el))
      );
      setEditingId(null);
    }
  };

  const handleStartEdit = (el) => {
    setEditingId(el.id);
    setEditingText(el.text || "");
    setSelectedId(el.id);
  };

  // Snap on drag
  const handleDragMoveSnap = useCallback(
    (e, nodeId, nodeW, nodeH) => {
      const node = e.target;
      const snapLineData = getSnapLines(nodeId, elements, canvasSize);
      const snap = getSnappedPosition(node.x(), node.y(), nodeW, nodeH, snapLineData);

      if (snap.x !== null) node.x(snap.x);
      if (snap.y !== null) node.y(snap.y);

      const guidesLayer = guidesLayerRef.current;
      if (guidesLayer) {
        guidesLayer.destroyChildren();
        snap.guides.forEach((guide) => {
          guidesLayer.add(
            new Konva.Line({
              points: guide.points,
              stroke: GUIDELINE_COLOR,
              strokeWidth: 1,
              dash: GUIDELINE_DASH,
              listening: false,
            })
          );
        });
        guidesLayer.batchDraw();
      }
    },
    [elements, canvasSize]
  );

  const handleDragEndSnap = useCallback(() => {
    const guidesLayer = guidesLayerRef.current;
    if (guidesLayer) {
      guidesLayer.destroyChildren();
      guidesLayer.batchDraw();
    }
  }, []);

  // Grid lines
  const gridSize = 50;
  const gridLines = [];
  if (showGrid) {
    for (let i = 0; i < canvasSize.width / gridSize; i++) {
      gridLines.push(
        <Line
          key={`v${i}`}
          points={[i * gridSize, 0, i * gridSize, canvasSize.height]}
          stroke="rgba(0,0,0,0.05)"
          strokeWidth={0.5}
          listening={false}
        />
      );
    }
    for (let j = 0; j < canvasSize.height / gridSize; j++) {
      gridLines.push(
        <Line
          key={`h${j}`}
          points={[0, j * gridSize, canvasSize.width, j * gridSize]}
          stroke="rgba(0,0,0,0.05)"
          strokeWidth={0.5}
          listening={false}
        />
      );
    }
    // Canvas center crosshairs
    gridLines.push(
      <Line
        key="center-v"
        points={[canvasSize.width / 2, 0, canvasSize.width / 2, canvasSize.height]}
        stroke="rgba(99, 102, 241, 0.15)"
        strokeWidth={1}
        dash={[8, 8]}
        listening={false}
      />,
      <Line
        key="center-h"
        points={[0, canvasSize.height / 2, canvasSize.width, canvasSize.height / 2]}
        stroke="rgba(99, 102, 241, 0.15)"
        strokeWidth={1}
        dash={[8, 8]}
        listening={false}
      />
    );
  }

  const bgFill = backgroundConfig.fill || "#ffffff";

  return (
    <div
      className="relative shadow-2xl rounded overflow-hidden transition-all duration-200 select-none"
      style={{
        width: canvasSize.width * zoomScale,
        height: canvasSize.height * zoomScale,
        backgroundColor: bgFill,
      }}
    >
      <Stage
        ref={stageRef}
        width={canvasSize.width * zoomScale}
        height={canvasSize.height * zoomScale}
        scaleX={zoomScale}
        scaleY={zoomScale}
        onClick={checkDeselect}
        onTap={checkDeselect}
      >
        <Layer>
          {/* Base Background Rect */}
          <Rect
            id="canvas-background-rect"
            x={0}
            y={0}
            width={canvasSize.width}
            height={canvasSize.height}
            fill={bgFill}
            listening={true}
          />

          {/* Optional Certificate Border Frame on canvas */}
          {backgroundConfig.border && (
            <>
              <Rect
                x={20}
                y={20}
                width={canvasSize.width - 40}
                height={canvasSize.height - 40}
                stroke={backgroundConfig.borderColor || "#1e3a8a"}
                strokeWidth={backgroundConfig.borderWidth || 4}
                listening={false}
              />
              <Rect
                x={28}
                y={28}
                width={canvasSize.width - 56}
                height={canvasSize.height - 56}
                stroke={backgroundConfig.borderAccent || "#d97706"}
                strokeWidth={1.5}
                dash={[6, 3]}
                listening={false}
              />
            </>
          )}

          {/* Background Image / SVG preset if loaded */}
          {image && (
            <KonvaImage
              image={image}
              width={canvasSize.width}
              height={canvasSize.height}
              listening={true}
            />
          )}

          {showGrid && gridLines}

          {/* Dynamic Elements: Text, Shapes, Images, QR */}
          {elements.map((el) => {
            const isSelected = el.id === selectedId;
            const isQr = el.isQr || el.type === "qr";
            const isText = el.type === "text" || el.type === "placeholder" || !el.type;

            const commonProps = {
              key: el.id,
              shapeProps: el,
              isSelected,
              onSelect: () => setSelectedId(el.id),
              onChange: (newAttrs) => {
                const updatedElements = elements.map((elem) =>
                  elem.id === el.id ? { ...elem, ...newAttrs } : elem
                );
                setElements(updatedElements);
              },
              onDragMoveSnap: handleDragMoveSnap,
              onDragEndSnap: handleDragEndSnap,
            };

            if (isQr) {
              return <DraggableQR {...commonProps} />;
            }

            if (isText) {
              return (
                <DraggableText
                  {...commonProps}
                  isEditing={el.id === editingId}
                  onStartEdit={() => handleStartEdit(el)}
                />
              );
            }

            return <DraggableShape {...commonProps} />;
          })}

          {/* Single Global Transformer */}
          <Transformer
            ref={trRef}
            keepRatio={false}
            anchorStroke="#4f46e5"
            anchorFill="#ffffff"
            anchorSize={8}
            anchorCornerRadius={2}
            borderStroke="#4f46e5"
            borderStrokeWidth={1.5}
            rotateAnchorOffset={22}
            rotateAnchorCursor="grab"
            enabledAnchors={[
              "top-left",
              "top-center",
              "top-right",
              "middle-right",
              "bottom-right",
              "bottom-center",
              "bottom-left",
              "middle-left",
            ]}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 15 || newBox.height < 10) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>

        {/* Snap Guides Layer */}
        <Layer ref={guidesLayerRef} listening={false} />
      </Stage>

      {/* ── Canva-Style Inline Textarea Overlay ── */}
      {editingId && activeEditingElement && (
        <div
          className="absolute z-50 pointer-events-auto"
          style={{
            left: `${activeEditingElement.x * zoomScale}px`,
            top: `${activeEditingElement.y * zoomScale}px`,
            width: `${activeEditingElement.width * zoomScale}px`,
            height: `${activeEditingElement.height * zoomScale}px`,
            transform: `rotate(${activeEditingElement.rotation || 0}deg)`,
            transformOrigin: "top left",
          }}
        >
          <textarea
            ref={editTextareaRef}
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onBlur={commitInlineEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commitInlineEdit();
              } else if (e.key === "Escape") {
                setEditingId(null);
              }
            }}
            className="w-full h-full p-0 m-0 bg-white/95 border-2 border-indigo-500 rounded shadow-lg resize-none outline-none focus:ring-0 leading-tight"
            style={{
              fontSize: `${(activeEditingElement.fontSize || 20) * zoomScale}px`,
              fontFamily: activeEditingElement.fontFamily || "Arial",
              color: activeEditingElement.fill || "#000000",
              textAlign: activeEditingElement.align || "left",
              fontWeight: activeEditingElement.fontStyle?.includes("bold") ? "bold" : "normal",
              fontStyle: activeEditingElement.fontStyle?.includes("italic") ? "italic" : "normal",
              letterSpacing: `${(activeEditingElement.letterSpacing || 0) * zoomScale}px`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CustomTemplateEditor;
