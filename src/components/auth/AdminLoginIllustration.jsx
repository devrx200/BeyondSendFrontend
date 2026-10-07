import React from "react";
import { Badge } from "reactstrap";
import { FaExternalLinkAlt } from "react-icons/fa";

const AdminLoginIllustration = ({ isHindi }) => {
  return (
    <div className="login-illustration-container d-flex flex-column align-items-center justify-content-between h-100 p-1 p-lg-4 text-center position-relative">
      {/* BACKGROUND DECORATIVE GLOW */}
      <div
        className="illustration-bg-wave position-absolute start-0 bottom-5 w-100 h-100 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(79, 110, 247, 0.18), transparent 70%)",
          opacity: 0.8,
          zIndex: 0,
          pointerEvents: "none"
        }}
      />

      {/* TOP BADGE */}
      <div className="illustration-top-badge z-1 mb-2">
        <Badge
          color="light"
          className="py-2 px-3 rounded-pill fw-bold shadow-xs border text-primary"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderColor: "rgba(191, 219, 254, 0.9)",
            fontSize: "12px",
            letterSpacing: "0.4px"
          }}
        >
          🚀 {isHindi ? "बियॉन्डसेंड · ओमनीचैनल टेलीकॉम प्लेटफॉर्म" : "BeyondSend · Omnichannel Messaging Suite"}
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
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            <linearGradient id="laptopBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f6ef7" />
              <stop offset="100%" stopColor="#3b5bdb" />
            </linearGradient>

            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fba868" />
            </linearGradient>

            <linearGradient id="waGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#25d366" />
              <stop offset="100%" stopColor="#128c7e" />
            </linearGradient>

            <linearGradient id="emailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="smsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>

            <linearGradient id="socialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>

            <linearGradient id="voiceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Filters */}
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.18" floodColor="#0f172a" />
            </filter>
            <filter id="glow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACKDROP SOFT ILLUMINATION */}
          <circle cx="270" cy="200" r="140" fill="#4f6ef7" opacity="0.08" />
          <circle cx="110" cy="110" r="70" fill="#25d366" opacity="0.08" />
          <circle cx="430" cy="120" r="70" fill="#38bdf8" opacity="0.08" />

          {/* ── FLOATING SERVICES & CHANNELS ICONS ── */}

          {/* 1. WHATSAPP BUSINESS BADGE (Floating Top-Left) */}
          <g transform="translate(45, 35)">
            <g className="anim-float-slow">
              <circle cx="32" cy="32" r="28" fill="url(#waGrad)" filter="url(#softShadow)" />
              {/* WhatsApp Speech Bubble */}
              <path
                d="M32 18 C24.2 18 18 24.2 18 32 C18 34.6 18.7 37.1 20 39.2 L18.5 45.5 L25 43.8 C27.1 45 29.5 45.7 32 45.7 C39.8 45.7 46 39.5 46 32 C46 24.2 39.8 18 32 18 Z"
                fill="#ffffff"
              />
              {/* WhatsApp Phone shape inside */}
              <path
                d="M27.5 25.5 C27 24.5 26.2 24.5 25.5 24.5 C25 24.5 24.2 24.8 23.8 25.5 C23.2 26.2 22 27.5 22 29.8 C22 32.2 23.8 34.5 24 34.8 C24.3 35.1 27.2 39.8 31.8 41.5 C35.6 42.9 36.4 42.6 37.2 42.5 C38.2 42.4 39.5 41.5 40 40.2 C40.5 38.9 40.5 37.8 40.3 37.5 C40.1 37.2 39.5 37 38.5 36.5 C37.5 36 33.2 34 32.7 33.8 C32.2 33.6 31.8 33.5 31.4 34.1 C30.9 34.8 29.8 36.2 29.5 36.5 C29.2 36.8 28.8 36.8 28 36.5 C27.2 36.2 25 35.2 23.8 34 Z"
                fill="#25d366"
              />
            </g>
          </g>

          {/* 2. BULK SMS & RCS MESSAGING BADGE (Floating Top-Center-Left) */}
          <g transform="translate(180, 25)">
            <g className="anim-float-gentle">
              <rect x="0" y="0" width="70" height="42" rx="12" fill="#ffffff" filter="url(#softShadow)" />
              <rect x="2" y="2" width="66" height="38" rx="10" fill="url(#smsGrad)" />
              {/* Chat lines inside */}
              <circle cx="16" cy="21" r="5" fill="#ffffff" />
              <rect x="26" y="15" width="30" height="4" rx="2" fill="#ffffff" />
              <rect x="26" y="23" width="22" height="4" rx="2" fill="#ffffff" opacity="0.8" />
              {/* Little speech tail */}
              <polygon points="12,42 20,42 16,48" fill="#4f46e5" />
            </g>
          </g>

          {/* 3. EMAIL AUTOMATION & SMTP GATEWAY (Floating Top-Right) */}
          <g transform="translate(415, 35)">
            <g className="anim-float-bob">
              <circle cx="32" cy="32" r="28" fill="url(#emailGrad)" filter="url(#softShadow)" />
              {/* Envelope */}
              <rect x="18" y="21" width="28" height="20" rx="3" fill="#ffffff" />
              <path d="M19 23 L32 32 L45 23" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="19" y1="39" x2="28" y2="30" stroke="#0284c7" strokeWidth="1.5" />
              <line x1="45" y1="39" x2="36" y2="30" stroke="#0284c7" strokeWidth="1.5" />
              {/* Notification dot */}
              <circle cx="44" cy="20" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          </g>

          {/* 4. SOCIAL MEDIA MULTI-CHANNEL (Floating Mid-Left) */}
          <g transform="translate(40, 135)">
            <g className="anim-float-bob">
              <rect x="0" y="0" width="76" height="36" rx="18" fill="#ffffff" filter="url(#softShadow)" />
              {/* Social icons row */}
              <circle cx="18" cy="18" r="11" fill="#1877f2" />
              <text x="18" y="23" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">f</text>
              <circle cx="38" cy="18" r="11" fill="#e1306c" />
              <rect x="33" y="13" width="10" height="10" rx="3" fill="none" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="58" cy="18" r="11" fill="#0a66c2" />
              <text x="58" y="22" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">in</text>
            </g>
          </g>

          {/* 5. VOICE BROADCASTING & CALLING (Floating Mid-Right) */}
          <g transform="translate(415, 130)">
            <g className="anim-float-slow">
              <circle cx="32" cy="32" r="28" fill="url(#voiceGrad)" filter="url(#softShadow)" />
              {/* Headset / Phone wave */}
              <path
                d="M22 34 C20 34 18 32 18 30 L18 26 C18 20 23 16 32 16 C41 16 46 20 46 26 L46 30 C46 32 44 34 42 34"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <rect x="17" y="26" width="5" height="10" rx="2" fill="#ffffff" />
              <rect x="42" y="26" width="5" height="10" rx="2" fill="#ffffff" />
              {/* Mic arm */}
              <path d="M42 32 Q40 40 33 40" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="31" cy="40" r="2.5" fill="#ffffff" />
            </g>
          </g>

          {/* 6. TELECOM HIGH-SPEED CONNECTIVITY CLOUD (Floating Top-Center) */}
          <g transform="translate(300, 25)">
            <g className="anim-pulse-glow">
              <rect x="0" y="0" width="72" height="34" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="1.5" filter="url(#softShadow)" />
              <circle cx="16" cy="17" r="4" fill="#10b981">
                <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
              </circle>
              <text x="44" y="21" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">API 99.9%</text>
            </g>
          </g>

          {/* ── WORKSTATION DESK ── */}
          <rect x="40" y="318" width="460" height="14" rx="7" fill="url(#deskGrad)" filter="url(#softShadow)" />
          <rect x="48" y="330" width="444" height="4" fill="#0f172a" opacity="0.6" />

          {/* ── SMARTPHONE ON STAND (DESK LEFT: Showing live message) ── */}
          <g transform="translate(85, 236)">
            {/* Phone Body */}
            <rect x="0" y="0" width="40" height="74" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" filter="url(#softShadow)" />
            {/* Screen */}
            <rect x="3" y="6" width="34" height="62" rx="4" fill="#0f172a" />
            {/* Speaker bar */}
            <rect x="15" y="3" width="10" height="2" rx="1" fill="#64748b" />
            {/* Message bubble on screen */}
            <rect x="6" y="15" width="28" height="14" rx="4" fill="#25d366" />
            <rect x="8" y="19" width="18" height="2.5" rx="1" fill="#ffffff" />
            <rect x="8" y="23" width="12" height="2.5" rx="1" fill="#ffffff" opacity="0.8" />
            {/* Second bubble */}
            <rect x="6" y="33" width="28" height="14" rx="4" fill="#3b82f6" />
            <rect x="8" y="37" width="20" height="2.5" rx="1" fill="#ffffff" />
            <rect x="8" y="41" width="14" height="2.5" rx="1" fill="#ffffff" opacity="0.8" />
            {/* Stand */}
            <polygon points="12,74 28,74 24,82 16,82" fill="#334155" />
          </g>

          {/* ── TELECOM RACK ROUTER / HARDWARE (DESK RIGHT) ── */}
          <g transform="translate(390, 260)">
            <rect x="0" y="15" width="60" height="42" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1.5" filter="url(#softShadow)" />
            <rect x="5" y="24" width="50" height="12" rx="3" fill="#0f172a" />
            {/* Blinking status LEDs */}
            <circle cx="12" cy="30" r="2.5" fill="#10b981">
              <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="20" cy="30" r="2.5" fill="#10b981">
              <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="28" cy="30" r="2.5" fill="#38bdf8">
              <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="36" cy="30" r="2.5" fill="#f59e0b" />
            <circle cx="48" cy="30" r="3" fill="#64748b" />
            {/* Antenna */}
            <line x1="50" y1="15" x2="50" y2="0" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="0" r="3.5" fill="#38bdf8" />
          </g>

          {/* ── PERSON (PROFESSIONAL OPERATIONS & CAMPAIGN MANAGER) ── */}
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
            <path d="M30 92 Q25 125 70 145" fill="none" stroke="#4f6ef7" strokeWidth="18" strokeLinecap="round" />
            <circle cx="72" cy="146" r="8" fill="url(#skinGrad)" />

            {/* Right Arm */}
            <path d="M98 92 Q115 125 92 145" fill="none" stroke="#3b5bdb" strokeWidth="18" strokeLinecap="round" />
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

          {/* ── LAPTOP & REAL-TIME CAMPAIGN CONSOLE ── */}
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
            {/* Analytics Bar Charts on Screen */}
            <rect x="36" y="58" width="12" height="26" rx="2" fill="#38bdf8" opacity="0.8" />
            <rect x="52" y="44" width="12" height="40" rx="2" fill="#4f6ef7" />
            <rect x="68" y="32" width="12" height="52" rx="2" fill="#10b981" />
            <rect x="84" y="48" width="12" height="36" rx="2" fill="#25d366" />
            <rect x="100" y="38" width="12" height="46" rx="2" fill="#f59e0b" />

            {/* Upward Growth Trendline */}
            <path
              d="M36 68 L52 50 L68 36 L84 52 L100 42 L120 28"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="120" cy="28" r="3" fill="#22c55e" />

            {/* Laptop Base */}
            <polygon
              points="10,95 155,95 170,105 0,105"
              fill="#94a3b8"
            />
            <rect x="68" y="98" width="28" height="5" rx="1.5" fill="#64748b" />
          </g>
        </svg>
      </div>

      {/* BOTTOM LINK */}
      <div className="z-1 mt-1">
        <a
          href="https://beyondsend.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="d-inline-flex align-items-center gap-1 text-primary text-decoration-none fw-semibold small bg-white bg-opacity-90 px-3 py-1 rounded-pill border border-primary border-opacity-25 shadow-xs"
          title={isHindi ? "बियॉन्डसेंड पोर्टल देखें" : "Visit BeyondSend Platform"}
          style={{ fontSize: "12px" }}
        >
          <span>🌐</span>
          <span>{isHindi ? "आधिकारिक पोर्टल:" : "Platform Console:"}</span>
          <span className="text-primary fw-bold">https://beyondsend.in</span>
          <FaExternalLinkAlt size={10} className="ms-1 opacity-75" />
        </a>
      </div>
    </div>
  );
};

export default AdminLoginIllustration;
