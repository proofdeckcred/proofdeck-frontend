import React, { useRef, useEffect, useState, useCallback } from "react";
import Konva from "konva";
import {
  Stage,
  Layer,
  Image,
  Text,
  Transformer,
  Group,
  Rect,
  Line,
} from "react-konva";
import useImage from "use-image";

// ─── Constants ──────────────────────────────────────────────
const SNAP_THRESHOLD = 5; // px proximity to snap
const GUIDELINE_COLOR = "#6366f1"; // indigo-500
const GUIDELINE_DASH = [4, 4];

// ─── Snapping Utilities ─────────────────────────────────────

/**
 * Gather all interesting snap lines from existing elements + canvas edges/centers.
 * Returns { vertical: number[], horizontal: number[] } – the x/y values to snap to.
 */
const getSnapLines = (skipNodeId, elements, canvasSize) => {
  const vertical = new Set();
  const horizontal = new Set();

  // Canvas edges + center
  vertical.add(0);
  vertical.add(canvasSize.width / 2);
  vertical.add(canvasSize.width);
  horizontal.add(0);
  horizontal.add(canvasSize.height / 2);
  horizontal.add(canvasSize.height);

  // Other element edges + centers
  elements.forEach((el) => {
    if (el.id === skipNodeId) return;
    const w = el.width || 200;
    const h = el.height || 30;
    // Left, center, right
    vertical.add(el.x);
    vertical.add(el.x + w / 2);
    vertical.add(el.x + w);
    // Top, center, bottom
    horizontal.add(el.y);
    horizontal.add(el.y + h / 2);
    horizontal.add(el.y + h);
  });

  return {
    vertical: [...vertical],
    horizontal: [...horizontal],
  };
};

/**
 * Given a dragging node's edges + center, find the closest snap for each axis.
 * Returns { x: number|null, y: number|null, guides: Array<{points, orientation}> }
 */
const getSnappedPosition = (nodeX, nodeY, nodeW, nodeH, snapLines) => {
  const guides = [];

  // Check all 3 anchor points on each axis
  const nodeXAnchors = [nodeX, nodeX + nodeW / 2, nodeX + nodeW];
  const nodeYAnchors = [nodeY, nodeY + nodeH / 2, nodeY + nodeH];

  let bestDx = null;
  let bestAbsDx = SNAP_THRESHOLD + 1;
  let bestDy = null;
  let bestAbsDy = SNAP_THRESHOLD + 1;
  let snapGuideX = null;
  let snapGuideY = null;

  // Vertical snap lines (affect x position)
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

  // Horizontal snap lines (affect y position)
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

// ─── DraggableText ──────────────────────────────────────────
// NOTE: No Transformer here. A single global Transformer lives in CustomTemplateEditor.

const DraggableText = ({
  shapeProps,
  isSelected,
  onSelect,
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
        onChange({
          ...shapeProps,
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          width: Math.max(20, Math.round(width * scaleX)),
          height: Math.max(10, Math.round(height * scaleY)),
          rotation: node.rotation(),
        });
      }}
    >
      {/* FIX: rgba(255,255,255,0.01) → alpha≈3 in RGBA8 hit canvas (>0 = hittable).
          Old fill rgba(0,0,0,0.001) rounded to alpha=0 in the hit canvas,
          making Konva treat the entire rect as transparent. Every click fell
          through to whatever element was rendered first underneath. */}
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
        hitStrokeWidth={0}
      />
      {/* Text listening=true — contributes its own bounding-box hit surface */}
      <Text
        x={0}
        y={0}
        width={width}
        height={height}
        text={shapeProps.text}
        fontSize={shapeProps.fontSize}
        fontFamily={shapeProps.fontFamily}
        fill={shapeProps.fill}
        align={shapeProps.align}
        fontStyle={shapeProps.fontStyle}
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
        onChange({
          ...shapeProps,
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          width: Math.max(20, Math.round(width * scaleX)),
          height: Math.max(20, Math.round(height * scaleY)),
          rotation: node.rotation(),
        });
      }}
    >
      {/* QR background + hit area — white fill = alpha 255, always hittable */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="white"
        stroke={isSelected ? "transparent" : "rgba(99, 102, 241, 0.45)"}
        strokeWidth={1}
        dash={isSelected ? undefined : [4, 4]}
        cornerRadius={2}
        listening={true}
      />
      {/* QR grid pattern for visual clarity */}
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
                  fill="rgba(0,0,0,0.15)"
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
        fill="rgba(0,0,0,0.6)"
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
  elements,
  setElements,
  selectedId,
  setSelectedId,
  canvasSize,
  showGrid = true,
  zoomScale = 1,
}) => {
  const [image] = useImage(backgroundImageUrl, "anonymous");
  const guidesLayerRef = useRef(null);

  // ── SINGLE global Transformer ──
  // One Transformer for the entire canvas. When selectedId changes,
  // this effect finds the Konva node by id and attaches it.
  // Having one Transformer per element causes stale ref conflicts — only
  // the first-rendered element responds to clicks/drags.
  const trRef = useRef();

  useEffect(() => {
    if (!trRef.current || !stageRef?.current) return;
    if (selectedId) {
      const node = stageRef.current.findOne("#" + selectedId);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer()?.batchDraw();
      }
    } else {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, stageRef]);

  // ── Keyboard: Precision Move, Delete, Duplicate, Deselect ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't interfere with form inputs
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
        return;
      }

      // Escape → deselect
      if (e.key === "Escape") {
        e.preventDefault();
        setSelectedId(null);
        return;
      }

      if (!selectedId) return;

      // Delete / Backspace → remove element
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        setElements((prev) => prev.filter((el) => el.id !== selectedId));
        setSelectedId(null);
        return;
      }

      // Ctrl+D → duplicate selected element
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        setElements((prev) => {
          const source = prev.find((el) => el.id === selectedId);
          if (!source) return prev;
          const clone = {
            ...source,
            id: `el_${Math.random().toString(36).substring(2, 11)}`,
            x: source.x + 20,
            y: source.y + 20,
          };
          setSelectedId(clone.id);
          return [...prev, clone];
        });
        return;
      }

      // Arrow keys → precision move
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
  }, [selectedId, setElements, setSelectedId]);

  // ── Deselect when clicking empty space ──
  // CRITICAL FIX: Only use onClick/onTap — NOT onMouseDown/onTouchStart.
  // onMouseDown fires BEFORE onClick on child elements, causing a race
  // condition that deselects before the element can re-select itself.
  const checkDeselect = useCallback(
    (e) => {
      const clickedOnEmpty =
        e.target === e.target.getStage() ||
        (e.target.getClassName && e.target.getClassName() === "Image");
      if (clickedOnEmpty) {
        setSelectedId(null);
      }
    },
    [setSelectedId]
  );

  // ── Snap-on-drag handler (imperative, zero React re-renders) ──
  const handleDragMoveSnap = useCallback(
    (e, nodeId, nodeW, nodeH) => {
      const node = e.target;
      const snapLineData = getSnapLines(nodeId, elements, canvasSize);
      const snap = getSnappedPosition(
        node.x(),
        node.y(),
        nodeW,
        nodeH,
        snapLineData
      );

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

  // ── Grid lines ──
  const gridSize = 50;
  const gridLines = [];
  if (showGrid) {
    for (let i = 0; i < canvasSize.width / gridSize; i++) {
      gridLines.push(
        <Line
          key={`v${i}`}
          points={[i * gridSize, 0, i * gridSize, canvasSize.height]}
          stroke="rgba(0,0,0,0.06)"
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
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={0.5}
          listening={false}
        />
      );
    }
    // Canvas center crosshair (subtle)
    gridLines.push(
      <Line
        key="center-v"
        points={[canvasSize.width / 2, 0, canvasSize.width / 2, canvasSize.height]}
        stroke="rgba(99, 102, 241, 0.12)"
        strokeWidth={0.5}
        dash={[8, 8]}
        listening={false}
      />,
      <Line
        key="center-h"
        points={[0, canvasSize.height / 2, canvasSize.width, canvasSize.height / 2]}
        stroke="rgba(99, 102, 241, 0.12)"
        strokeWidth={0.5}
        dash={[8, 8]}
        listening={false}
      />
    );
  }

  return (
    <div
      className="shadow-2xl border border-gray-200/50 rounded overflow-hidden transition-all duration-200"
      style={{
        width: canvasSize.width * zoomScale,
        height: canvasSize.height * zoomScale,
        backgroundColor: "#fff",
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
          {showGrid && gridLines}

          {/* Background image — listening={true} so clicking it deselects */}
          <Image
            image={image}
            width={canvasSize.width}
            height={canvasSize.height}
            listening={true}
          />

          {elements.map((el) => {
            const props = {
              key: el.id,
              shapeProps: el,
              isSelected: el.id === selectedId,
              onSelect: () => setSelectedId(el.id),
              onChange: (newAttrs) => {
                const updatedElements = elements.map((elem) => {
                  if (elem.id === el.id) return { ...elem, ...newAttrs };
                  return elem;
                });
                setElements(updatedElements);
              },
              onDragMoveSnap: handleDragMoveSnap,
              onDragEndSnap: handleDragEndSnap,
            };

            return el.isQr ? (
              <DraggableQR {...props} />
            ) : (
              <DraggableText {...props} />
            );
          })}

          {/* ── SINGLE global Transformer ──
              Wired to the selected node via the useEffect above.
              This is the ONLY Transformer; per-element ones were removed. */}
          <Transformer
            ref={trRef}
            keepRatio={false}
            anchorStroke="#4f46e5"
            anchorFill="#ffffff"
            anchorSize={8}
            anchorCornerRadius={2}
            borderStroke="#4f46e5"
            borderStrokeWidth={1.5}
            rotateAnchorOffset={20}
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

        {/* Snap guide lines — dedicated layer updated imperatively for maximum performance */}
        <Layer ref={guidesLayerRef} listening={false} />
      </Stage>
    </div>
  );
};

export default CustomTemplateEditor;
