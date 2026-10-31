if (typeof window !== "undefined") {
  if (
    window.location.search.includes("desktop=0") ||
    window.location.search.includes("web=1")
  ) {
    try {
      localStorage.removeItem("pd_desktop_mode");
    } catch (e) {}
  } else if (window.location.search.includes("desktop=1")) {
    try {
      localStorage.setItem("pd_desktop_mode", "1");
    } catch (e) {}
  }
}

const isDesktopUrl =
  typeof window !== "undefined" &&
  !window.location.search.includes("desktop=0") &&
  !window.location.search.includes("web=1") &&
  (window.location.search.includes("desktop=1") ||
    localStorage.getItem("pd_desktop_mode") === "1" ||
    window.navigator.userAgent.includes("Electron"));

export const IS_DESKTOP_APP = Boolean(isDesktopUrl);

export const SERVER_BASE_URL = IS_DESKTOP_APP
  ? "http://127.0.0.1:5000"
  : import.meta.env.VITE_SERVER_URL || "http://127.0.0.1:5000";

export const API_BASE_URL = IS_DESKTOP_APP
  ? "http://127.0.0.1:5000/api"
  : import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export const APP_NAME = "ProofDeck";

