import React, { useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text,
  Rect,
  Group,
} from "react-konva";
import useImage from "use-image";
import { SERVER_BASE_URL } from "../config";

const BackgroundImage = ({ src, width, height }) => {
  const [image] = useImage(src, "anonymous");
  return image ? (
    <KonvaImage image={image} width={width} height={height} />
  ) : null;
};

const KonvaPreview = ({ layoutData, dynamicData }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 566 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = width / 1.414;
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  if (!layoutData) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <p className="text-gray-500">No visual template data available.</p>
      </div>
    );
  }

  const baseWidth = layoutData?.canvas?.width || 842;
  const baseHeight = layoutData?.canvas?.height || 595;
  const scaleX = dimensions.width / baseWidth;
  const scaleY = dimensions.height / baseHeight;

  const backgroundImageSrc = layoutData?.background?.image
    ? layoutData.background.image.startsWith("http")
      ? layoutData.background.image
      : `${SERVER_BASE_URL}${layoutData.background.image}`
    : null;

  const textElements = (layoutData?.elements || []).map((el) => {
    let text = el.text || "";
    if (dynamicData) {
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
      // Try to parse amount from course title if it contains currency symbols, else default
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
    }
    return { ...el, text };
  });

  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          {backgroundImageSrc && (
            <BackgroundImage
              src={backgroundImageSrc}
              width={dimensions.width}
              height={dimensions.height}
            />
          )}

          {textElements.map((el, index) => {
            if (el.isQr) {
              return (
                <Group
                  key={index}
                  x={el.x * scaleX}
                  y={el.y * scaleY}
                  width={el.width * scaleX}
                  height={el.height * scaleY}
                >
                  <Rect
                    width={el.width * scaleX}
                    height={el.height * scaleY}
                    fill="white"
                  />
                  <Text
                    text="QR"
                    width={el.width * scaleX}
                    height={el.height * scaleY}
                    align="center"
                    verticalAlign="middle"
                    fontSize={12 * scaleX}
                  />
                </Group>
              );
            }
            return (
              <Text
                key={index}
                x={el.x * scaleX}
                y={el.y * scaleY}
                text={el.text}
                fontSize={(el.fontSize || 20) * Math.min(scaleX, scaleY)}
                fontFamily={el.fontFamily || "Arial"}
                fill={el.fill || "#000"}
                align={el.align || "left"}
                rotation={el.rotation || 0}
                width={el.width ? el.width * scaleX : undefined}
                fontStyle={el.fontStyle}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default KonvaPreview;
