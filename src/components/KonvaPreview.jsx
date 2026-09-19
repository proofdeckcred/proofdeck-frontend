import React, { useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text,
  Rect,
  Circle,
  Line,
  Star,
  Group,
} from "react-konva";
import useImage from "use-image";
import { SERVER_BASE_URL } from "../config";

const KonvaLoadedImage = ({ src, width, height }) => {
  const [image] = useImage(src, "anonymous");
  return image ? (
    <KonvaImage image={image} width={width} height={height} />
  ) : null;
};

const KonvaPreview = ({ layoutData, dynamicData }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 566 });

  let data = layoutData;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      data = {};
    }
  }

  const baseWidth = data?.canvas?.width || 842;
  const baseHeight = data?.canvas?.height || 595;
  const aspectRatio = baseWidth / baseHeight;

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = width / aspectRatio;
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [aspectRatio]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <p className="text-gray-500">No visual template data available.</p>
      </div>
    );
  }

  const scaleX = dimensions.width / baseWidth;
  const scaleY = dimensions.height / baseHeight;
  const scaleMin = Math.min(scaleX, scaleY);

  const rawBg = data?.background?.image;
  const bgFill = data?.background?.fill || "#ffffff";
  const backgroundImageSrc = rawBg
    ? (rawBg.startsWith("http") || rawBg.startsWith("data:") || rawBg.startsWith("blob:"))
      ? rawBg
      : `${SERVER_BASE_URL.replace(/\/+$/, "")}${rawBg.startsWith("/") ? rawBg : `/${rawBg}`}`
    : null;

  const elements = (data?.elements || []).map((el) => {
    let text = el.text || "";
    if (dynamicData && text) {
      const recipientName = dynamicData.recipient_name || "Recipient Name";
      const issuerName = dynamicData.issuer_name || "Issuer Name";
      const issueDate = dynamicData.issue_date
        ? new Date(dynamicData.issue_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Issue Date";
      const signature = dynamicData.signature || issuerName;
      const courseTitle = dynamicData.course_title || "Course Title";
      const verificationId = dynamicData.verification_id || "pending-id";

      // Receipt specific logic
      let amount = "0.00";
      if (
        courseTitle &&
        (courseTitle.includes("$") || courseTitle.includes("₦"))
      ) {
        amount = courseTitle.match(/[$₦]\s?[\d,]+(\.\d{2})?/)
          ? courseTitle.match(/[$₦]\s?[\d,]+(\.\d{2})?/)[0]
          : "PAID";
      }

      text = text
        .replace(/{{recipient_name}}/gi, recipientName)
        .replace(/{{issuer_name}}/gi, issuerName)
        .replace(/{{issue_date}}/gi, issueDate)
        .replace(/{{signature}}/gi, signature)
        .replace(/{{course_title}}/gi, courseTitle)
        .replace(/{{verification_id}}/gi, verificationId)
        .replace(/{{amount}}/gi, amount);

      // Replace custom fields from extra_fields
      if (dynamicData.extra_fields) {
        let extra = dynamicData.extra_fields;
        if (typeof extra === "string") {
          try {
            extra = JSON.parse(extra);
          } catch (e) {
            extra = {};
          }
        }
        if (typeof extra === "object" && extra !== null) {
          Object.entries(extra).forEach(([k, v]) => {
            if (v !== undefined && v !== null) {
              const reg1 = new RegExp(`{{${k}}}`, "gi");
              text = text.replace(reg1, String(v));
              const cleanK = k.replace(/_/g, " ");
              const reg2 = new RegExp(`{{${cleanK}}}`, "gi");
              text = text.replace(reg2, String(v));
            }
          });
        }
      }
    }
    return { ...el, text };
  });

  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          {/* Base background fill */}
          <Rect
            width={dimensions.width}
            height={dimensions.height}
            fill={bgFill}
          />

          {backgroundImageSrc && (
            <KonvaLoadedImage
              src={backgroundImageSrc}
              width={dimensions.width}
              height={dimensions.height}
            />
          )}

          {elements.map((el, index) => {
            const isQr = el.isQr || el.type === "qr";
            const elType = el.type;

            if (isQr) {
              return (
                <Group
                  key={el.id || index}
                  x={el.x * scaleX}
                  y={el.y * scaleY}
                  width={el.width * scaleX}
                  height={el.height * scaleY}
                  rotation={el.rotation || 0}
                >
                  <Rect
                    width={el.width * scaleX}
                    height={el.height * scaleY}
                    fill="white"
                    stroke="#e2e8f0"
                    strokeWidth={1}
                    cornerRadius={3}
                  />
                  <Text
                    text="QR"
                    width={el.width * scaleX}
                    height={el.height * scaleY}
                    align="center"
                    verticalAlign="middle"
                    fontSize={Math.max(9, 12 * scaleMin)}
                    fontStyle="bold"
                    fill="#1e293b"
                  />
                </Group>
              );
            }

            if (elType === "rect" || elType === "border") {
              return (
                <Rect
                  key={el.id || index}
                  x={el.x * scaleX}
                  y={el.y * scaleY}
                  width={el.width * scaleX}
                  height={el.height * scaleY}
                  fill={el.fill || "transparent"}
                  stroke={el.stroke || "transparent"}
                  strokeWidth={(el.strokeWidth || 0) * scaleMin}
                  cornerRadius={(el.cornerRadius || 0) * scaleMin}
                  dash={el.dash}
                  opacity={el.opacity != null ? el.opacity : 1}
                  rotation={el.rotation || 0}
                />
              );
            }

            if (elType === "circle") {
              const radius = ((el.width || 60) / 2) * scaleMin;
              return (
                <Circle
                  key={el.id || index}
                  x={(el.x + (el.width || 60) / 2) * scaleX}
                  y={(el.y + (el.height || 60) / 2) * scaleY}
                  radius={radius}
                  fill={el.fill || "transparent"}
                  stroke={el.stroke || "transparent"}
                  strokeWidth={(el.strokeWidth || 0) * scaleMin}
                  dash={el.dash}
                  opacity={el.opacity != null ? el.opacity : 1}
                  rotation={el.rotation || 0}
                />
              );
            }

            if (elType === "line") {
              const w = (el.width || 200) * scaleX;
              return (
                <Line
                  key={el.id || index}
                  x={el.x * scaleX}
                  y={el.y * scaleY}
                  points={[0, 0, w, 0]}
                  stroke={el.stroke || "#000000"}
                  strokeWidth={Math.max(1, (el.strokeWidth || 2) * scaleMin)}
                  dash={el.dash}
                  opacity={el.opacity != null ? el.opacity : 1}
                  rotation={el.rotation || 0}
                />
              );
            }

            if (elType === "star") {
              const outerRadius = ((el.width || 50) / 2) * scaleMin;
              const innerRadius = outerRadius * 0.45;
              return (
                <Star
                  key={el.id || index}
                  x={(el.x + (el.width || 50) / 2) * scaleX}
                  y={(el.y + (el.height || 50) / 2) * scaleY}
                  numPoints={el.numPoints || 5}
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  fill={el.fill || "#f59e0b"}
                  stroke={el.stroke || "transparent"}
                  strokeWidth={(el.strokeWidth || 0) * scaleMin}
                  opacity={el.opacity != null ? el.opacity : 1}
                  rotation={el.rotation || 0}
                />
              );
            }

            if (elType === "badge") {
              const w = (el.width || 80) * scaleX;
              const h = (el.height || 100) * scaleY;
              const cx = w / 2;
              const cy = (w / 2);
              const r = (w / 2) * 0.85;
              return (
                <Group
                  key={el.id || index}
                  x={el.x * scaleX}
                  y={el.y * scaleY}
                  rotation={el.rotation || 0}
                  opacity={el.opacity != null ? el.opacity : 1}
                >
                  <Circle
                    x={cx}
                    y={cy}
                    radius={r}
                    fill={el.fill || "#d97706"}
                    stroke={el.stroke || "#b45309"}
                    strokeWidth={Math.max(1, 2 * scaleMin)}
                  />
                  <Circle
                    x={cx}
                    y={cy}
                    radius={r * 0.8}
                    stroke="#ffffff"
                    strokeWidth={Math.max(1, 1.5 * scaleMin)}
                    dash={[3, 3]}
                  />
                  <Star
                    x={cx}
                    y={cy}
                    numPoints={5}
                    innerRadius={r * 0.3}
                    outerRadius={r * 0.6}
                    fill="#ffffff"
                  />
                </Group>
              );
            }

            if (elType === "image" && el.src) {
              return (
                <Group
                  key={el.id || index}
                  x={el.x * scaleX}
                  y={el.y * scaleY}
                  rotation={el.rotation || 0}
                  opacity={el.opacity != null ? el.opacity : 1}
                >
                  <KonvaLoadedImage
                    src={el.src}
                    width={el.width * scaleX}
                    height={el.height * scaleY}
                  />
                </Group>
              );
            }

            return (
              <Text
                key={el.id || index}
                x={el.x * scaleX}
                y={el.y * scaleY}
                text={el.text}
                fontSize={(el.fontSize || 20) * scaleMin}
                fontFamily={el.fontFamily || "Arial"}
                fill={el.fill || "#000"}
                align={el.align || "left"}
                verticalAlign={el.verticalAlign || "middle"}
                rotation={el.rotation || 0}
                width={el.width ? el.width * scaleX : undefined}
                height={el.height ? el.height * scaleY : undefined}
                fontStyle={el.fontStyle}
                textDecoration={el.textDecoration || ""}
                opacity={el.opacity != null ? el.opacity : 1}
                letterSpacing={(el.letterSpacing || 0) * scaleMin}
                lineHeight={el.lineHeight || 1}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default KonvaPreview;
