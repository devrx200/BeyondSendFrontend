import React, { useState, useRef } from "react";
import { Card, CardHeader, CardBody, Button, Spinner, ButtonGroup } from "reactstrap";
import {
  FaRedo,
  FaExpand,
  FaCompress
} from "react-icons/fa";

const CGStateCalendar = () => {
  const [lang, setLang] = useState("hi"); // 'hi' or 'en'
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);

  const directUrl = lang === "hi" ? "https://cgstate.gov.in/hi/calendar" : "https://cgstate.gov.in/en/calendar";
  const frameSrc = `/cg-calendar-frame/${lang}/calendar`;

  const handleIframeLoad = () => {
    setLoading(false);
    try {
      const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
      if (doc) {
        const styleId = "cg-isolate-main";
        let style = doc.getElementById(styleId);
        if (!style) {
          style = doc.createElement("style");
          style.id = styleId;
          doc.head.appendChild(style);
        }
        style.innerHTML = `
          html, body {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow-x: hidden !important;
          }
          body > *:not(#main-content) {
            display: none !important;
          }
          header, footer, nav, .header, .footer, .site-header, .site-footer,
          .top-header, .navbar, .breadcrumb, .top-bar, .marquee, .sub-header,
          #header, #footer, .skip-to-content, #top-header, .bg-header, .portal-header,
          .quick-links, .social-links-header, .bhashini-widget, .footer-section,
          .gov-header, .global-header, .global-footer, .cg-chatbot, .uw-widget-custom-trigger,
          .rbt-progress-parent, a.close_side_menu {
            display: none !important;
          }
          #main-content {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            padding: 0 !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .rbt-page-banner-wrapper {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            padding: 20px 0 !important;
            margin-bottom: 10px !important;
          }
          .page-list {
            display: flex !important;
            visibility: visible !important;
          }
          /* Hide Android and iOS app download buttons */
          .download-btn,
          .download-btn.android,
          .download-btn.ios,
          a[href*="play.google.com"],
          a[href*="apps.apple.com"],
          .download-btn-area {
            display: none !important;
          }
          .rbt-counterup-area {
            padding: 0 !important;
          }
          .container {
            max-width: 100% !important;
            width: 100% !important;
            padding-left: 15px !important;
            padding-right: 15px !important;
          }
        `;

        // Direct DOM isolation
        const main = doc.getElementById("main-content");
        if (main && doc.body) {
          Array.from(doc.body.children).forEach((el) => {
            if (el !== main && el.tagName !== "SCRIPT" && el.tagName !== "STYLE") {
              el.style.setProperty("display", "none", "important");
            }
          });
          main.style.setProperty("display", "block", "important");
        }
      }
    } catch (e) {
      console.warn("Iframe style injection:", e);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = frameSrc + "?t=" + new Date().getTime();
    }
  };

  const handleLangChange = (selectedLang) => {
    if (selectedLang !== lang) {
      setLoading(true);
      setLang(selectedLang);
    }
  };

  return (
    <Card
      className={`shadow-sm border-0 mb-4 transition-all ${isFullscreen ? "position-fixed top-0 start-0 w-100 h-100 rounded-0" : "rounded-3"
        }`}
      style={{
        zIndex: isFullscreen ? 9999 : 1,
        maxHeight: isFullscreen ? "100vh" : "none"
      }}
    >
      {/* Header Banner */}
      <CardHeader
        className="p-3 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3 text-white border-0"
        style={{
          background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
          borderBottom: "3px solid #f59e0b"
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="bg-white p-1 rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
            style={{ width: 44, height: 44, overflow: "hidden" }}
          >
            <img
              src="/Chhattisgarh.svg"
              alt="Chhattisgarh Govt Logo"
              style={{ width: 36, height: 36, objectFit: "contain" }}
            />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-white" style={{ letterSpacing: "0.2px" }}>
              {lang === "hi" ? "छत्तीसगढ़ शासन शासकीय कैलेंडर" : "Chhattisgarh Govt Official Calendar"}
            </h5>
            <small className="text-white-50">
              {lang === "hi"
                ? "राज्य पोर्टल - शासकीय, स्थानीय एवं ऐच्छिक अवकाश"
                : "Official State Portal - Gazetted, Local & Optional Holidays"}
            </small>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Language Switch */}
          <div className="btn-group btn-group-sm bg-black bg-opacity-25 p-1 rounded-pill">
            <Button
              size="sm"
              className={`px-3 py-1 fw-bold rounded-pill border-0 transition-all ${lang === "hi" ? "bg-white text-dark shadow-sm" : "bg-transparent text-white"
                }`}
              style={{ fontSize: "12.5px" }}
              onClick={() => handleLangChange("hi")}
            >
              हिन्दी
            </Button>
            <Button
              size="sm"
              className={`px-3 py-1 fw-bold rounded-pill border-0 transition-all ${lang === "en" ? "bg-white text-dark shadow-sm" : "bg-transparent text-white"
                }`}
              style={{ fontSize: "12.5px" }}
              onClick={() => handleLangChange("en")}
            >
              English
            </Button>
          </div>

          {/* Refresh Button */}
          <Button
            size="sm"
            color="light"
            className="text-dark d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill shadow-sm fw-bold border-0"
            style={{ fontSize: "12.5px" }}
            onClick={handleRefresh}
            title="Refresh Calendar"
          >
            <FaRedo size={11} className={loading ? "fa-spin" : ""} /> Refresh
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            size="sm"
            color="light"
            className="text-dark d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill shadow-sm fw-bold border-0"
            style={{ fontSize: "12.5px" }}
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}
          </Button>
        </div>
      </CardHeader>

      <CardBody
        className="p-0 position-relative overflow-hidden"
        style={{ height: isFullscreen ? "calc(100vh - 75px)" : "760px" }}
      >
        {/* Loading Spinner Overlay */}
        {loading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white"
            style={{ zIndex: 5 }}
          >
            <Spinner color="success" style={{ width: "3rem", height: "3rem" }} />
            <p className="mt-3 text-muted fw-semibold">
              {lang === "hi" ? "शासकीय कैलेंडर लोड हो रहा है..." : "Loading Official Calendar..."}
            </p>
          </div>
        )}

        {/* Direct Live Government Website Iframe */}
        <iframe
          key={lang}
          ref={iframeRef}
          src={frameSrc}
          title="Chhattisgarh State Government Calendar"
          width="100%"
          height="100%"
          style={{
            border: "none",
            display: "block",
            background: "#ffffff",
            width: "100%",
            height: "100%"
          }}
          onLoad={handleIframeLoad}
        />
      </CardBody>
    </Card>
  );
};

export default CGStateCalendar;
