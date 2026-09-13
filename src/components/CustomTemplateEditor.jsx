import React, { useRef, useEffect, useState, useCallback } from "react";
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

// --- Sub-components ---

const DraggableText = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
}) => {
  const groupRef = useRef();
  const trRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.forceUpdate();
      trRef.current.getLayer().batchDraw();
    }
  }, [
    isSelected,
    shapeProps.x,
    shapeProps.y,
    shapeProps.width,
    shapeProps.height,
    shapeProps.fontSize,
    shapeProps.fontFamily,
    shapeProps.rotation,
  ]);

  const width = shapeProps.width || 200;
  const height = shapeProps.height || 30;

  return (
    <>
      <Group
        ref={groupRef}
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
        onDragStart={() => {
          onSelect();
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: Math.round(e.target.x()),
            y: Math.round(e.target.y()),
          });
        }}
        onMouseEnter={(e) => {
          setIsHovered(true);
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = "move";
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = "default";
        }}
        onTransformEnd={() => {
          const node = groupRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(20, width * scaleX),
            height: Math.max(10, height * scaleY),
            rotation: node.rotation(),
          });
        }}
      >
        {/*
          100% Reliable Hit Rectangle:
          - fill="white" gives the hit canvas solid pixels with colorKey
          - sceneFunc draws nothing (completely transparent on screen), or a subtle tint on hover
          - hitFunc draws a full rectangular path that guarantees 100% hit coverage
        */}
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="white"
          sceneFunc={(context, shape) => {
            if (isHovered && !isSelected) {
              context.beginPath();
              context.rect(0, 0, shape.width(), shape.height());
              context.fillStyle = "rgba(99, 102, 241, 0.08)";
              context.fill();
            }
          }}
          hitFunc={(context, shape) => {
            context.beginPath();
            context.rect(0, 0, shape.width(), shape.height());
            context.closePath();
            context.fillShape(shape);
          }}
          listening={true}
          onClick={(e) => {
            e.cancelBubble = true;
            onSelect();
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            onSelect();
          }}
        />
        {/* Visual Border Rectangle */}
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          stroke={
            isSelected
              ? "transparent"
              : isHovered
              ? "rgba(99, 102, 241, 0.85)"
              : "rgba(148, 163, 184, 0.45)"
          }
          strokeWidth={isHovered ? 1.5 : 1}
          dash={isSelected ? undefined : [4, 4]}
          cornerRadius={2}
          listening={false}
        />
        {/* Visible Text with active hit testing */}
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
          listening={true}
          onClick={(e) => {
            e.cancelBubble = true;
            onSelect();
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            onSelect();
          }}
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={false}
          anchorStroke="#4f46e5"
          anchorFill="#ffffff"
          anchorSize={7}
          borderStroke="#4f46e5"
          borderStrokeWidth={1.5}
          rotateAnchorOffset={15}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 15 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const DraggableQR = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
}) => {
  const groupRef = useRef();
  const trRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.forceUpdate();
      trRef.current.getLayer().batchDraw();
    }
  }, [
    isSelected,
    shapeProps.x,
    shapeProps.y,
    shapeProps.width,
    shapeProps.height,
    shapeProps.rotation,
  ]);

  const width = shapeProps.width || 100;
  const height = shapeProps.height || 100;

  return (
    <>
      <Group
        ref={groupRef}
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
        onDragStart={() => {
          onSelect();
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: Math.round(e.target.x()),
            y: Math.round(e.target.y()),
          });
        }}
        onMouseEnter={(e) => {
          setIsHovered(true);
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = "move";
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = "default";
        }}
        onTransformEnd={() => {
          const node = groupRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(20, width * scaleX),
            height: Math.max(20, height * scaleY),
            rotation: node.rotation(),
          });
        }}
      >
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="white"
          stroke={
            isSelected
              ? "transparent"
              : isHovered
              ? "rgba(99, 102, 241, 0.9)"
              : "rgba(0, 0, 0, 0.7)"
          }
          strokeWidth={isHovered ? 1.5 : 1}
          cornerRadius={2}
          listening={true}
          onClick={(e) => {
            e.cancelBubble = true;
            onSelect();
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            onSelect();
          }}
        />
        <Text
          x={0}
          y={0}
          text="QR Code"
          width={width}
          height={height}
          align="center"
          verticalAlign="middle"
          fontSize={12}
          fill="black"
          listening={true}
          onClick={(e) => {
            e.cancelBubble = true;
            onSelect();
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            onSelect();
          }}
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          anchorStroke="#4f46e5"
          anchorFill="#ffffff"
          anchorSize={7}
          borderStroke="#4f46e5"
          borderStrokeWidth={1.5}
          rotateAnchorOffset={15}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

// --- Main Editor Component ---

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

  // --- Keyboard Precision Control & Deletion ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedId) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        // Prevent default browser behavior if focusing on canvas
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
          return; // Don't delete elements when typing in inputs!
        }
        e.preventDefault();
        setElements((prevElements) => prevElements.filter((el) => el.id !== selectedId));
        setSelectedId(null);
        return;
      }

      const MOVE_STEP = e.shiftKey ? 10 : 1; // Shift + Arrow = 10px, else 1px
      let dx = 0;
      let dy = 0;

      if (e.key === "ArrowUp") dy = -MOVE_STEP;
      else if (e.key === "ArrowDown") dy = MOVE_STEP;
      else if (e.key === "ArrowLeft") dx = -MOVE_STEP;
      else if (e.key === "ArrowRight") dx = MOVE_STEP;
      else return;

      e.preventDefault();

      setElements((prevElements) =>
        prevElements.map((el) => {
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

  const checkDeselect = (e) => {
    // Only deselect if explicitly clicking on the stage background itself or background Image
    const isStage = e.target === e.target.getStage();
    const isImage =
      e.target &&
      typeof e.target.getClassName === "function" &&
      e.target.getClassName() === "Image";
    if (isStage || isImage) {
      setSelectedId(null);
    }
  };

  // Grid lines
  const gridSize = 50;
  const gridLines = [];
  if (showGrid) {
    for (let i = 0; i < canvasSize.width / gridSize; i++) {
      gridLines.push(
        <Line
          key={`v${i}`}
          points={[i * gridSize, 0, i * gridSize, canvasSize.height]}
          stroke="#ddd"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      );
    }
    for (let j = 0; j < canvasSize.height / gridSize; j++) {
      gridLines.push(
        <Line
          key={`h${j}`}
          points={[0, j * gridSize, canvasSize.width, j * gridSize]}
          stroke="#ddd"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      );
    }
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
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        <Layer>
          {showGrid && gridLines}

          <Image
            image={image}
            width={canvasSize.width}
            height={canvasSize.height}
            listening={false} // Allow clicking through image to deselect
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
            };

            return el.isQr ? (
              <DraggableQR {...props} />
            ) : (
              <DraggableText {...props} />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default CustomTemplateEditor;
