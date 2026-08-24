import React, { useState, useEffect } from "react";
import { X, Smartphone } from "lucide-react";

const MobileWarning = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if device is mobile (width < 768px)
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        // Check if user has already dismissed it in this session
        const dismissed = sessionStorage.getItem("mobile_warning_dismissed");
        if (!dismissed) {
          setShow(true);
        }
      } else {
        setShow(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("mobile_warning_dismissed", "true");
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-600 text-white px-4 py-3 shadow-md animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Smartphone size={18} className="shrink-0" />
          <span>
            For the best experience, we recommend using a <strong>tablet</strong>{" "}
            or <strong>desktop</strong>.
          </span>
        </div>
        <button
          onClick={dismiss}
          className="p-1 rounded-full hover:bg-white/20 transition-colors shrink-0"
          aria-label="Dismiss warning"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default MobileWarning;
