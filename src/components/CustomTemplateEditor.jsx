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
  onDragMove,
  onDragEnd,
}) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragMove={(e) => onDragMove(e)}
        onDragEnd={(e) => {
          onDragEnd();
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
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
  onDragMove,
  onDragEnd,
}) => {
  const groupRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Group
        onClick={onSelect}
        onTap={onSelect}
        ref={groupRef}
        x={shapeProps.x}
        y={shapeProps.y}
        rotation={shapeProps.rotation}
        draggable
        onDragMove={(e) => onDragMove(e)}
        onDragEnd={(e) => {
          onDragEnd();
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
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
            width: Math.max(5, shapeProps.width * scaleX),
            height: Math.max(5, shapeProps.height * scaleY),
            rotation: node.rotation(),
          });
        }}
      >
        <Rect
          width={shapeProps.width}
          height={shapeProps.height}
          fill="white"
          stroke="black"
          strokeWidth={1}
          cornerRadius={2}
        />
        <Text
          text="QR Code"
          width={shapeProps.width}
          height={shapeProps.height}
          align="center"
          verticalAlign="middle"
          fontSize={12}
          fill="black"
          listening={false}
        />
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
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
}) => {
  const [image] = useImage(backgroundImageUrl, "anonymous");
  const [guides, setGuides] = useState([]);

  // --- Keyboard Precision Control ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedId) return;

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
  }, [selectedId, setElements]);

  // --- Snapping Logic ---
  const getLineGuideStops = (skipShape) => {
    const vertical = [0, canvasSize.width / 2, canvasSize.width];
    const horizontal = [0, canvasSize.height / 2, canvasSize.height];

    // Optional: Add snapping to other elements
    elements.forEach((guideItem) => {
      if (guideItem.id === skipShape.id()) return;
      // Center snapping only to keep it clean
      vertical.push(guideItem.x + guideItem.width / 2);
      horizontal.push(guideItem.y + guideItem.height / 2);
    });

    return { vertical, horizontal };
  };

  const getObjectSnappingEdges = (node) => {
    const box = node.getClientRect({ relativeTo: stageRef.current });
    const absPos = node.absolutePosition();

    return {
      vertical: [
        {
          guide: Math.round(box.x),
          offset: Math.round(absPos.x - box.x),
          snap: "start",
        },
        {
          guide: Math.round(box.x + box.width / 2),
          offset: Math.round(absPos.x - box.x - box.width / 2),
          snap: "center",
        },
        {
          guide: Math.round(box.x + box.width),
          offset: Math.round(absPos.x - box.x - box.width),
          snap: "end",
        },
      ],
      horizontal: [
        {
          guide: Math.round(box.y),
          offset: Math.round(absPos.y - box.y),
          snap: "start",
        },
        {
          guide: Math.round(box.y + box.height / 2),
          offset: Math.round(absPos.y - box.y - box.height / 2),
          snap: "center",
        },
        {
          guide: Math.round(box.y + box.height),
          offset: Math.round(absPos.y - box.y - box.height),
          snap: "end",
        },
      ],
    };
  };

  const getGuides = (lineGuideStops, itemBounds) => {
    const resultV = [];
    const resultH = [];
    const GUIDELINE_OFFSET = 5;

    lineGuideStops.vertical.forEach((lineGuide) => {
      itemBounds.vertical.forEach((itemBound) => {
        const diff = Math.abs(lineGuide - itemBound.guide);
        if (diff < GUIDELINE_OFFSET) {
          resultV.push({
            lineGuide,
            diff,
            snap: itemBound.snap,
            offset: itemBound.offset,
          });
        }
      });
    });

    lineGuideStops.horizontal.forEach((lineGuide) => {
      itemBounds.horizontal.forEach((itemBound) => {
        const diff = Math.abs(lineGuide - itemBound.guide);
        if (diff < GUIDELINE_OFFSET) {
          resultH.push({
            lineGuide,
            diff,
            snap: itemBound.snap,
            offset: itemBound.offset,
          });
        }
      });
    });

    const minV = resultV.sort((a, b) => a.diff - b.diff)[0];
    const minH = resultH.sort((a, b) => a.diff - b.diff)[0];
    const guides = [];
    if (minV)
      guides.push({
        lineGuide: minV.lineGuide,
        offset: minV.offset,
        orientation: "V",
        snap: minV.snap,
      });
    if (minH)
      guides.push({
        lineGuide: minH.lineGuide,
        offset: minH.offset,
        orientation: "H",
        snap: minH.snap,
      });
    return guides;
  };

  const handleDragMove = (e) => {
    const layer = e.target.getLayer();
    setGuides([]); // Clear previous guides

    const lineGuideStops = getLineGuideStops(e.target);
    const itemBounds = getObjectSnappingEdges(e.target);
    const guides = getGuides(lineGuideStops, itemBounds);

    if (!guides.length) return;

    // Draw Guides
    setGuides(guides);

    // Force Snap
    const absPos = e.target.absolutePosition();
    guides.forEach((lg) => {
      if (lg.orientation === "V") {
        absPos.x = lg.lineGuide + lg.offset;
      } else if (lg.orientation === "H") {
        absPos.y = lg.lineGuide + lg.offset;
      }
    });
    e.target.absolutePosition(absPos);
  };

  const handleDragEnd = () => {
    setGuides([]);
  };

  const checkDeselect = (e) => {
    const clickedOnEmpty =
      e.target === e.target.getStage() || e.target.getClassName() === "Image";
    if (clickedOnEmpty) {
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
        />
      );
    }
  }

  return (
    <div
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
        boxShadow: "0 0 20px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
      }}
    >
      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
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
              onDragMove: handleDragMove,
              onDragEnd: handleDragEnd,
            };

            return el.isQr ? (
              <DraggableQR {...props} />
            ) : (
              <DraggableText {...props} />
            );
          })}

          {/* Guide Lines */}
          {guides.map((guide, i) => {
            if (guide.orientation === "V") {
              return (
                <Line
                  key={i}
                  points={[
                    guide.lineGuide,
                    0,
                    guide.lineGuide,
                    canvasSize.height,
                  ]}
                  stroke="rgb(0, 161, 255)"
                  strokeWidth={1}
                  dash={[4, 6]}
                />
              );
            } else {
              return (
                <Line
                  key={i}
                  points={[
                    0,
                    guide.lineGuide,
                    canvasSize.width,
                    guide.lineGuide,
                  ]}
                  stroke="rgb(0, 161, 255)"
                  strokeWidth={1}
                  dash={[4, 6]}
                />
              );
            }
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default CustomTemplateEditor;
