import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

const WhiteLabelContext = createContext({
  brand: null,
  isWhiteLabel: false,
  loading: true,
});

export const WhiteLabelProvider = ({ children }) => {
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const testDomain = params.get("test_domain");
    const hostname = testDomain || window.location.hostname;

    const standardHostnames = [
      "proofdeck.app",
      "www.proofdeck.app",
      "proofdeck-frontend.vercel.app",
      "localhost",
      "127.0.0.1",
      "domains.proofdeck.app",
    ];

    if (!hostname || standardHostnames.includes(hostname)) {
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE_URL}/whitelabel/config?domain=${encodeURIComponent(hostname)}`)
      .then((res) => {
        if (res.data?.is_whitelabel && !res.data?.is_pending) {
          const brandData = res.data;
          setBrand(brandData);

          // 1. Dynamic Document Title
          if (brandData.company_name) {
            document.title = `${brandData.company_name} — Official Verification Portal`;
          }

          // 2. Dynamic Favicon
          if (brandData.favicon_url) {
            let faviconLink = document.querySelector("link[rel*='icon']");
            if (!faviconLink) {
              faviconLink = document.createElement("link");
              faviconLink.rel = "shortcut icon";
              document.head.appendChild(faviconLink);
            }
            faviconLink.href = brandData.favicon_url;
          }

          // 3. Dynamic Primary CSS Color Injection
          if (brandData.primary_color) {
            document.documentElement.style.setProperty("--pd-indigo", brandData.primary_color);
            document.documentElement.style.setProperty("--pd-indigo-dark", brandData.accent_color || brandData.primary_color);
          }
        }
      })
      .catch((err) => {
        // Not a registered white-label domain or error
        console.debug("Whitelabel domain lookup skipped or not found:", err?.message);
        setBrand(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <WhiteLabelContext.Provider
      value={{
        brand,
        isWhiteLabel: Boolean(brand && !brand.is_pending),
        loading,
      }}
    >
      {children}
    </WhiteLabelContext.Provider>
  );
};

export const useWhiteLabel = () => useContext(WhiteLabelContext);
export default WhiteLabelContext;
