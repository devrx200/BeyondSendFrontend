import React from "react";
import { Badge, Button } from "reactstrap";
import { FaExternalLinkAlt } from "react-icons/fa";

const AdminLoginIllustration = ({ isHindi }) => {
  return (
    <div className="login-illustration-container d-flex flex-column align-items-center justify-content-between h-100 p-1 p-lg-4 text-center position-relative">
      {/* BACKGROUND DECORATIVE LINES (lines-greeen-drow.png) */}
      <div
        className="illustration-bg-wave position-absolute start-0 bottom-5 w-100 h-100 pointer-events-none"
        style={{
          backgroundImage: "url('/lines-greeen-drow.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom right",
          backgroundSize: "cover",
          opacity: 0.35,
          zIndex: 0,
          pointerEvents: "none"
        }}
      />

      {/* TOP BADGE */}
      <div className="illustration-top-badge z-1 mb-2">
        <Badge
          color="light"
          className="py-2 px-3 rounded-pill fw-semibold shadow-xs border text-primary"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            borderColor: "rgba(191, 219, 254, 0.8)",
            fontSize: "12px",
            letterSpacing: "0.3px"
          }}
        >
          🎓 {isHindi ? "उच्च शिक्षा विभाग छत्तीसगढ़ " : "Higher Education Department Chhattisgarh"}
        </Badge>
      </div>

      {/* CENTER ANIMATED SVG */}
      <div className="svg-wrapper z-1 my-auto w-100 d-flex justify-content-center align-items-center">
        <svg
          viewBox="0 0 540 380"
          className="animated-login-svg img-fluid"
          style={{ maxHeight: "310px", width: "100%", overflow: "visible" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="deskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8d6e63" />
              <stop offset="100%" stopColor="#5d4037" />
            </linearGradient>

            <linearGradient id="laptopBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fba868" />
            </linearGradient>

            <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="dnaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>

            <linearGradient id="gearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Filters */}
            <filter id="softShadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.12" floodColor="#0f172a" />
            </filter>

            <filter id="bulbGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACKDROP SOFT ILLUMINATION CIRCLES */}
          <circle cx="270" cy="210" r="150" fill="url(#glowGrad)" opacity="0.18" />
          <circle cx="390" cy="110" r="65" fill="#bae6fd" opacity="0.25" />
          <circle cx="110" cy="130" r="50" fill="#fed7aa" opacity="0.2" />

          {/* ── 1. FLOATING ANIMATED ITEMS AROUND THE SCENE ── */}

          {/* CLOCK (Floating top-left) */}
          <g transform="translate(45, 30)">
            <g className="anim-float-slow">
              <circle cx="32" cy="32" r="30" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" filter="url(#softShadow)" />
              <circle cx="32" cy="32" r="26" fill="#f8fafc" />
              {/* Marks */}
              <line x1="32" y1="9" x2="32" y2="14" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
              <line x1="32" y1="50" x2="32" y2="55" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
              <line x1="9" y1="32" x2="14" y2="32" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
              <line x1="50" y1="32" x2="55" y2="32" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
              {/* Hands */}
              <line x1="32" y1="32" x2="22" y2="22" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="32" y1="32" x2="43" y2="26" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="32" cy="32" r="2.8" fill="#e11d48" />
            </g>
          </g>

          {/* LIGHT BULB (Floating top-center with pulsating rays) */}
          <g transform="translate(195, 38)">
            <g className="anim-pulse-glow">
              {/* Rays */}
              <g stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" opacity="0.85">
                <line x1="22" y1="2" x2="22" y2="8" />
                <line x1="7" y1="8" x2="12" y2="13" />
                <line x1="37" y1="8" x2="32" y2="13" />
                <line x1="1" y1="22" x2="7" y2="22" />
                <line x1="43" y1="22" x2="37" y2="22" />
              </g>
              {/* Bulb Glass */}
              <path
                d="M15 28 C11 24 9 20 9 16 C9 9 15 3 22 3 C29 3 35 9 35 16 C35 20 33 24 29 28 L27 34 L17 34 Z"
                fill="#fbbf24"
                stroke="#d97706"
                strokeWidth="1.5"
                filter="url(#bulbGlow)"
              />
              <path d="M18 21 Q22 14 26 21" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="18" y="34" width="8" height="2.5" rx="1" fill="#94a3b8" />
              <rect x="19" y="37" width="6" height="2" rx="1" fill="#64748b" />
            </g>
          </g>

          {/* DNA HELIX (Floating top-center-right) */}
          <g transform="translate(295, 32)">
            <g className="anim-float-gentle">
              <circle cx="20" cy="32" r="22" fill="#fff" opacity="0.85" filter="url(#softShadow)" />
              <path
                d="M14 12 Q26 22 14 32 Q26 42 14 52"
                fill="none"
                stroke="url(#dnaGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M26 12 Q14 22 26 32 Q14 42 26 52"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line x1="16" y1="18" x2="24" y2="18" stroke="#f59e0b" strokeWidth="1.8" />
              <line x1="15" y1="32" x2="25" y2="32" stroke="#10b981" strokeWidth="1.8" />
              <line x1="16" y1="46" x2="24" y2="46" stroke="#f59e0b" strokeWidth="1.8" />
            </g>
          </g>

          {/* ATOM MODEL (Floating top-right with rotating orbit) */}
          <g transform="translate(415, 35)">
            <g className="anim-orbit-spin">
              <circle cx="28" cy="28" r="28" fill="transparent" />
              <ellipse cx="28" cy="28" rx="26" ry="10" fill="none" stroke="#2563eb" strokeWidth="1.8" transform="rotate(30 28 28)" opacity="0.8" />
              <ellipse cx="28" cy="28" rx="26" ry="10" fill="none" stroke="#0d9488" strokeWidth="1.8" transform="rotate(90 28 28)" opacity="0.8" />
              <ellipse cx="28" cy="28" rx="26" ry="10" fill="none" stroke="#e11d48" strokeWidth="1.8" transform="rotate(150 28 28)" opacity="0.8" />
              <circle cx="28" cy="28" r="6" fill="#f59e0b" filter="url(#softShadow)" />
              <circle cx="50" cy="20" r="2.8" fill="#2563eb" />
              <circle cx="28" cy="54" r="2.8" fill="#0d9488" />
              <circle cx="6" cy="22" r="2.8" fill="#e11d48" />
            </g>
          </g>

          {/* RINGED PLANET (Floating mid-left) */}
          <g transform="translate(48, 145)">
            <g className="anim-float-bob">
              <circle cx="24" cy="24" r="16" fill="#f97316" />
              <path d="M12 18 Q24 22 36 18" fill="none" stroke="#ea580c" strokeWidth="2.5" opacity="0.6" />
              <path d="M10 25 Q24 29 38 25" fill="none" stroke="#c2410c" strokeWidth="2" opacity="0.6" />
              <ellipse cx="24" cy="24" rx="27" ry="7" fill="none" stroke="#38bdf8" strokeWidth="3" transform="rotate(-20 24 24)" />
            </g>
          </g>

          {/* CHEMICAL FLASK (Floating mid-right) */}
          <g transform="translate(425, 140)">
            <g className="anim-float-gentle">
              <path
                d="M15 5 L15 16 L5 34 C3 38 6 42 10 42 L24 42 C29 42 32 38 30 34 L20 16 L20 5 Z"
                fill="#e0f2fe"
                stroke="#0284c7"
                strokeWidth="1.8"
              />
              <path
                d="M8 30 Q17 27 27 30 L28 35 C28 39 26 40 22 40 L12 40 C8 40 6 39 6 35 Z"
                fill="#06b6d4"
                opacity="0.8"
              />
              <circle cx="17" cy="33" r="1.8" fill="#ffffff" opacity="0.85" className="anim-pulse-glow" />
              <circle cx="14" cy="37" r="1.3" fill="#ffffff" opacity="0.85" />
              <circle cx="21" cy="35" r="1.3" fill="#ffffff" opacity="0.85" />
              <rect x="13" y="3" width="9" height="2.5" rx="1" fill="#0284c7" />
            </g>
          </g>

          {/* ROTATING GEARS (Floating lower-right behind desk) */}
          <g transform="translate(435, 230)">
            <g className="anim-spin-gear">
              <path
                d="M18 4 L22 4 L23 8 L27 9 L30 6 L33 9 L31 13 L33 16 L37 17 L37 21 L33 22 L31 26 L34 29 L31 32 L27 29 L23 31 L22 35 L18 35 L17 31 L13 29 L10 32 L7 29 L9 26 L7 22 L3 21 L3 17 L7 16 L9 13 L6 9 L9 6 L13 9 L17 8 Z"
                fill="url(#gearGrad)"
                opacity="0.65"
              />
              <circle cx="20" cy="20" r="5" fill="#f8fafc" />
            </g>
          </g>

          {/* FORMULA (Floating soft text) */}
          <g transform="translate(235, 145)">
            <g className="anim-float-slow">
              <text
                x="0"
                y="0"
                fill="#e11d48"
                fontSize="17"
                fontWeight="bold"
                fontFamily="Georgia, serif"
                fontStyle="italic"
                opacity="0.85"
              >
                e = mc²
              </text>
            </g>
          </g>

          {/* ── 2. DESK & WORKSTATION PLATFORM ── */}
          <rect x="40" y="318" width="460" height="14" rx="7" fill="url(#deskGrad)" filter="url(#softShadow)" />
          <rect x="48" y="330" width="444" height="4" fill="#3e2723" opacity="0.5" />

          {/* ── 3. BOOKS & GLOBE ON DESK ── */}
          <g transform="translate(68, 238)">
            {/* Book 1 (Blue) */}
            <rect x="0" y="55" width="80" height="14" rx="3" fill="#2563eb" />
            <rect x="6" y="57" width="68" height="10" rx="1" fill="#f8fafc" />
            <rect x="74" y="55" width="6" height="14" rx="1" fill="#1e40af" />
            {/* Book 2 (Green) */}
            <rect x="5" y="38" width="72" height="14" rx="3" fill="#10b981" />
            <rect x="11" y="40" width="60" height="10" rx="1" fill="#f8fafc" />
            <rect x="71" y="38" width="6" height="14" rx="1" fill="#047857" />
            {/* Book 3 (Orange) */}
            <rect x="12" y="22" width="60" height="13" rx="3" fill="#f97316" />
            <rect x="16" y="24" width="50" height="9" rx="1" fill="#f8fafc" />
            <rect x="66" y="22" width="6" height="13" rx="1" fill="#c2410c" />

            {/* Globe on top of books */}
            <g transform="translate(24, -30)">
              <path d="M18 42 L24 42 M21 34 L21 42" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M10 24 C10 34 32 34 32 24" fill="none" stroke="#64748b" strokeWidth="2.5" />
              <circle cx="21" cy="20" r="13" fill="#38bdf8" />
              <path d="M12 18 Q16 14 20 18 Q24 22 28 17 Q32 20 30 26 Q24 28 18 24 Z" fill="#4ade80" />
            </g>
          </g>

          {/* Plant Pot on Desk */}
          <g transform="translate(385, 260)">
            <path d="M10 32 L14 56 L34 56 L38 32 Z" fill="#fdba74" stroke="#ea580c" strokeWidth="1.5" />
            <rect x="8" y="28" width="32" height="5" rx="2" fill="#fb923c" />
            <path d="M24 28 Q14 12 8 18 Q16 28 24 28 Z" fill="#22c55e" />
            <path d="M24 28 Q34 10 40 16 Q32 28 24 28 Z" fill="#16a34a" />
            <path d="M24 28 Q24 6 20 8 Q20 20 24 28 Z" fill="#4ade80" />
          </g>

          {/* ── 4. PERSON (ADMINISTRATOR / SCHOLAR / OFFICER) ── */}
          <g transform="translate(150, 160)">
            {/* Body / Shirt */}
            <path
              d="M35 155 L25 90 C25 80 40 68 65 68 C90 68 105 80 105 90 L95 155 Z"
              fill="url(#shirtGrad)"
              filter="url(#softShadow)"
            />
            {/* Shirt Collar */}
            <path d="M52 68 L65 86 L78 68" fill="#ffffff" />
            <polygon points="65,72 61,86 65,92 69,86" fill="#f59e0b" />

            {/* Left Arm */}
            <path d="M30 92 Q25 125 70 145" fill="none" stroke="#2563eb" strokeWidth="18" strokeLinecap="round" />
            <circle cx="72" cy="146" r="8" fill="url(#skinGrad)" />

            {/* Right Arm */}
            <path d="M98 92 Q115 125 92 145" fill="none" stroke="#1d4ed8" strokeWidth="18" strokeLinecap="round" />
            <circle cx="90" cy="146" r="8" fill="url(#skinGrad)" />

            {/* Neck */}
            <rect x="57" y="52" width="16" height="18" rx="4" fill="url(#skinGrad)" />

            {/* Head */}
            <ellipse cx="65" cy="40" rx="22" ry="24" fill="url(#skinGrad)" />

            {/* Face Features */}
            <circle cx="72" cy="38" r="3.5" fill="#1e293b" />
            <circle cx="73" cy="37" r="1.2" fill="#ffffff" />
            <path d="M68 31 Q74 29 78 32" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
            <path d="M68 47 Q75 54 80 48" fill="none" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="44" cy="42" rx="4" ry="6" fill="url(#skinGrad)" />

            {/* Hair */}
            <path
              d="M44 36 C42 16 54 8 72 8 C88 8 92 18 90 26 C88 32 86 34 84 34 C80 26 74 24 64 24 C52 24 46 28 44 36 Z"
              fill="#1e293b"
            />
          </g>

          {/* ── 5. LAPTOP & INTERACTIVE SCREEN ── */}
          <g transform="translate(235, 222)">
            {/* Laptop Screen Open */}
            <path
              d="M12 95 L30 10 L135 10 L145 95 Z"
              fill="url(#laptopBody)"
              filter="url(#softShadow)"
            />
            {/* Inner Screen Display */}
            <polygon
              points="34,15 131,15 140,90 20,90"
              fill="url(#screenGrad)"
            />

            {/* Screen Top Bar */}
            <line x1="36" y1="23" x2="128" y2="23" stroke="#38bdf8" strokeWidth="2" opacity="0.6" />
            {/* Dashboard Graphs */}
            <path
              d="M40 70 L55 52 L72 62 L90 40 L110 48 L126 32"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Security Shield */}
            <path
              d="M80 46 Q86 42 92 46 L92 56 Q86 64 80 56 Z"
              fill="#f59e0b"
              opacity="0.9"
            />

            {/* Base */}
            <polygon
              points="10,95 155,95 170,105 0,105"
              fill="#94a3b8"
            />
            <rect x="68" y="98" width="28" height="5" rx="1.5" fill="#64748b" />
          </g>
        </svg>
      </div>
      {/* BOTTOM "Visit WebApplication" SMALL TEXT LINK */}
      <div className="z-1  mt-1 ">

        <a
          href="https://heonline.cg.nic.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="d-inline-flex align-items-center gap-1 text-primary text-decoration-none fw-semibold small bg-white bg-opacity-75 px-3 py-1  rounded-pill border border-primary border-opacity-25 shadow-xs"
          title={isHindi ? "उच्च शिक्षा पोर्टल वेब एप्लिकेशन खोलें" : "Visit Higher Education WebApplication"}
          style={{ fontSize: "12px" }}
        >
          <span>🌐</span>
          <span>{isHindi ? "वेब एप्लिकेशन देखें:" : "Visit WebApplication:"}</span>
          <span className="text-primary">https://heonline.cg.nic.in</span>
          <FaExternalLinkAlt size={10} className="ms-1 opacity-75" />
        </a>
      </div>
    </div>
  );
};

export default AdminLoginIllustration;
