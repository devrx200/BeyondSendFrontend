import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
const PageLoader = ({ text, subtext, inline = false }) => {
  const { isHindi } = useLanguage ? useLanguage() : { isHindi: true };

  const defaultSubtext = isHindi ? "कृपया प्रतीक्षा करें..." : "Loading, please wait...";

  if (inline) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center p-3 w-100"
        style={{ minHeight: "180px" }}
        role="status"
        aria-live="polite"
      >
        <img
          src="/loader.gif"
          alt="Loading..."
          className="site-loader-gif"
          style={{ width: "56px", height: "auto" }}
        />
        {subtext !== false && (
          <small className="text-muted mt-2 fw-medium" style={{ fontSize: "12px" }}>
            {subtext || text || defaultSubtext}
          </small>
        )}
      </div>
    );
  }

  return (
    <div className="site-global-loader-backdrop" role="status" aria-live="polite">
      <img
        src="/loader.gif"
        alt="Loading..."
        className="site-loader-gif"
        style={{ width: "68px", height: "auto" }}
      />
      {subtext !== false && (
        <span
          className="mt-2 text-dark fw-semibold"
          style={{
            fontSize: "12.5px",
            letterSpacing: "0.2px",
            textShadow: "0 1px 4px rgba(255, 255, 255, 0.95)",
          }}
        >
          {subtext || text || defaultSubtext}
        </span>
      )}
    </div>
  );
};

export default PageLoader;
