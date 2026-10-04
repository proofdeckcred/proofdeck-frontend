import React from "react";
import { FaLinkedinIn } from "react-icons/fa6";
import {
  SiX,
  SiFacebook,
  SiInstagram,
  SiWhatsapp,
  SiYoutube,
  SiGithub,
  SiPython,
  SiJavascript,
  SiPostman,
} from "react-icons/si";

const BRAND_CONFIGS = {
  linkedin: {
    icon: FaLinkedinIn,
    brandColor: "#0A66C2",
    label: "LinkedIn",
  },
  x: {
    icon: SiX,
    brandColor: "#000000",
    label: "X (formerly Twitter)",
  },
  twitter: {
    icon: SiX,
    brandColor: "#000000",
    label: "X (formerly Twitter)",
  },
  facebook: {
    icon: SiFacebook,
    brandColor: "#1877F2",
    label: "Facebook",
  },
  instagram: {
    icon: SiInstagram,
    brandColor: "#E4405F",
    label: "Instagram",
  },
  whatsapp: {
    icon: SiWhatsapp,
    brandColor: "#25D366",
    label: "WhatsApp",
  },
  youtube: {
    icon: SiYoutube,
    brandColor: "#FF0000",
    label: "YouTube",
  },
  github: {
    icon: SiGithub,
    brandColor: "#181717",
    label: "GitHub",
  },
  python: {
    icon: SiPython,
    brandColor: "#3776AB",
    label: "Python",
  },
  javascript: {
    icon: SiJavascript,
    brandColor: "#F7DF1E",
    label: "JavaScript",
  },
  postman: {
    icon: SiPostman,
    brandColor: "#FF6C37",
    label: "Postman",
  },
};

export function BrandIcon({
  name,
  size = 18,
  useBrandColor = false,
  className = "",
  style = {},
  ariaLabel,
}) {
  const brandKey = (name || "").toLowerCase().trim();
  const config = BRAND_CONFIGS[brandKey];

  if (!config) {
    return null;
  }

  const IconComponent = config.icon;
  const computedStyle = useBrandColor
    ? { color: config.brandColor, ...style }
    : style;

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={computedStyle}
      aria-label={ariaLabel || config.label}
      role={ariaLabel || config.label ? "img" : undefined}
    >
      <IconComponent size={size} />
    </span>
  );
}

export default BrandIcon;
