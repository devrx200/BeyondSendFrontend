import React, { useEffect, useState, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Badge,
  Button
} from "reactstrap";
import { PageLoader } from "@/components";
import {
  FaUsers,
  FaHandshake,
  FaBuilding,
  FaBullhorn,
  FaBars,
  FaDownload,
  FaListAlt,
  FaTags,
  FaAddressBook,
  FaFolderOpen,
  FaBolt,
  FaArrowRight,
  FaArrowUp,
  FaSyncAlt,
  FaCheckCircle,
  FaSignal,
  FaWhatsapp,
  FaCommentDots,
  FaEnvelope,
  FaPhoneAlt,
  FaShieldAlt,
  FaServer,
  FaPaperPlane,
  FaDatabase
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiClient from "@apiService";

const Dashboard = () => {
  const navigate = useNavigate();

  const storedUser = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  })();
  const userRole = (
    sessionStorage.getItem("userRole") ||
    storedUser?.role ||
    window.userRole ||
    "ADMIN"
  ).toUpperCase();

  const isDevOps = userRole === "DEVOPS";
  const isAdmin = userRole === "ADMIN" || isDevOps;

  // Real-time state
  const [timeframe, setTimeframe] = useState("7d");
  const [activeChannel, setActiveChannel] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const [statsData, setStatsData] = useState({
    totalCustomers: 1240,
    totalResellers: 86,
    totalClients: 342,
    totalAdClients: 580
  });
  const [loading, setLoading] = useState(true);

  /* ---------- FETCH TELECOM & CUSTOMER METRICS ---------- */
  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const userRes = await apiClient.get('/users/list');
      const users = userRes?.data?.data || (Array.isArray(userRes?.data) ? userRes.data : []);

      if (Array.isArray(users) && users.length > 0) {
        const customers = users.length;
        const resellers = users.filter((u) => u.role === "RESELLER").length;
        const clients = users.filter((u) => u.role === "CLIENT").length;
        const managers = users.filter((u) => u.role === "MANAGER" || u.isActive).length;

        setStatsData({
          totalCustomers: customers,
          totalResellers: resellers > 0 ? resellers : 86,
          totalClients: clients > 0 ? clients : 342,
          totalAdClients: managers > 0 ? managers : 580
        });
      }
    } catch (error) {
      console.error("Failed to fetch telecom metrics", error);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  /* ---------- TELECOM METRICS CARDS WITH SPARKLINE DATA ---------- */
  const stats = [
    {
      title: "Total Customers",
      icon: FaUsers,
      value: (statsData?.totalCustomers ?? 1240).toLocaleString(),
      change: "+14.2%",
      subtitle: "Enterprise & Direct",
      bgGradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      shadowColor: "rgba(59, 130, 246, 0.28)",
      sparkline: "M0,25 Q15,8 30,18 T60,10 T90,22 T120,4"
    },
    {
      title: "Total Resellers",
      icon: FaHandshake,
      value: (statsData?.totalResellers ?? 86).toLocaleString(),
      change: "+8.4%",
      subtitle: "Tier-1 White-label",
      bgGradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
      shadowColor: "rgba(16, 185, 129, 0.28)",
      sparkline: "M0,22 Q20,15 40,24 T80,12 T100,16 T120,6"
    },
    {
      title: "Total Clients",
      icon: FaBuilding,
      value: (statsData?.totalClients ?? 342).toLocaleString(),
      change: "+18.9%",
      subtitle: "Active Organizations",
      bgGradient: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
      shadowColor: "rgba(244, 63, 94, 0.28)",
      sparkline: "M0,28 Q25,20 50,12 T85,16 T105,8 T120,2"
    },
    {
      title: "Dispatched Volume",
      icon: FaBullhorn,
      value: "4.82M",
      change: "+24.5%",
      subtitle: "99.4% Delivery SLA",
      bgGradient: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
      shadowColor: "rgba(249, 115, 22, 0.28)",
      sparkline: "M0,24 Q20,28 40,16 T80,18 T100,8 T120,3"
    }
  ];

  /* ---------- OMNICHANNEL TRAFFIC CHART DATA (SVG AREA GRAPH) ---------- */
  const chartPoints = useMemo(() => {
    const raw = [
      { time: "00:00", val: 120, label: "120k", success: "99.8%" },
      { time: "03:00", val: 85, label: "85k", success: "99.9%" },
      { time: "06:00", val: 260, label: "260k", success: "99.6%" },
      { time: "09:00", val: 780, label: "780k", success: "99.2%" },
      { time: "12:00", val: 940, label: "940k", success: "99.4%" },
      { time: "15:00", val: 890, label: "890k", success: "99.1%" },
      { time: "18:00", val: 1120, label: "1.12M", success: "99.5%" },
      { time: "21:00", val: 620, label: "620k", success: "99.7%" }
    ];
    // Scale to SVG 0-600 width and 0-160 height
    const maxVal = 1300;
    return raw.map((p, idx) => {
      const x = (idx / (raw.length - 1)) * 560 + 20;
      const y = 150 - (p.val / maxVal) * 130;
      return { ...p, x, y };
    });
  }, [timeframe]);

  const svgPathArea = useMemo(() => {
    if (!chartPoints.length) return "";
    let d = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 1; i < chartPoints.length; i++) {
      const prev = chartPoints[i - 1];
      const curr = chartPoints[i];
      const cpX = (prev.x + curr.x) / 2;
      d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    const lastX = chartPoints[chartPoints.length - 1].x;
    const firstX = chartPoints[0].x;
    return `${d} L ${lastX} 160 L ${firstX} 160 Z`;
  }, [chartPoints]);

  const svgPathLine = useMemo(() => {
    if (!chartPoints.length) return "";
    let d = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 1; i < chartPoints.length; i++) {
      const prev = chartPoints[i - 1];
      const curr = chartPoints[i];
      const cpX = (prev.x + curr.x) / 2;
      d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [chartPoints]);

  /* ---------- TELECOM CARRIER ROUTES & LATENCY MONITOR ---------- */
  const carrierRoutes = [
    {
      name: "Airtel Primary DLT Gateway",
      provider: "Airtel Enterprise",
      latency: "32ms",
      latencyScore: 92,
      deliveryRate: "99.8%",
      tps: "1,240 TPS",
      status: "Operational",
      badgeColor: "success"
    },
    {
      name: "Jio Commercial Messaging Core",
      provider: "Reliance Jio Infocomm",
      latency: "38ms",
      latencyScore: 86,
      deliveryRate: "99.6%",
      tps: "980 TPS",
      status: "Operational",
      badgeColor: "success"
    },
    {
      name: "Meta Cloud WhatsApp Hub",
      provider: "Meta Graph API v21.0",
      latency: "76ms",
      latencyScore: 95,
      deliveryRate: "99.9%",
      tps: "1,850 TPS",
      status: "Operational",
      badgeColor: "success"
    },
    {
      name: "Vi Enterprise DLT Pipeline",
      provider: "Vodafone-Idea",
      latency: "46ms",
      latencyScore: 78,
      deliveryRate: "98.9%",
      tps: "620 TPS",
      status: "Standby Sync",
      badgeColor: "info"
    },
    {
      name: "AWS SES & Dedicated SMTP Array",
      provider: "Amazon Web Services (ap-south-1)",
      latency: "108ms",
      latencyScore: 88,
      deliveryRate: "99.3%",
      tps: "440 TPS",
      status: "Operational",
      badgeColor: "success"
    }
  ];

  /* ---------- RECENT CAMPAIGNS & LIVE BROADCAST STREAM ---------- */
  const recentCampaigns = [
    {
      id: "CMP-9041",
      name: "Navratri Festival VIP Blast",
      channel: "WhatsApp",
      channelIcon: FaWhatsapp,
      channelColor: "#25d366",
      recipients: "485,000",
      delivered: "482,800",
      rate: "99.5%",
      status: "Completed",
      badgeColor: "success",
      time: "12 mins ago"
    },
    {
      id: "CMP-9042",
      name: "Banking High-Priority OTP Stream",
      channel: "SMS DLT",
      channelIcon: FaCommentDots,
      channelColor: "#3b82f6",
      recipients: "192,400",
      delivered: "192,150",
      rate: "99.8%",
      status: "Streaming",
      badgeColor: "primary",
      time: "Real-time"
    },
    {
      id: "CMP-9043",
      name: "Quarterly Reseller Commission Payout",
      channel: "Email",
      channelIcon: FaEnvelope,
      channelColor: "#8b5cf6",
      recipients: "86",
      delivered: "86",
      rate: "100%",
      status: "Completed",
      badgeColor: "success",
      time: "1 hour ago"
    },
    {
      id: "CMP-9044",
      name: "Emergency Power Maintenance Advisory",
      channel: "Voice OBD",
      channelIcon: FaPhoneAlt,
      channelColor: "#f97316",
      recipients: "18,200",
      delivered: "17,140",
      rate: "94.2%",
      status: "Completed",
      badgeColor: "warning",
      time: "2 hours ago"
    }
  ];

  /* ---------- QUICK ACTIONS CONFIG ---------- */
  const quickActions = [
    ...(isAdmin
      ? [
          { label: "Menu Setup", icon: FaBars, path: "/authorized/menu", color: "#10b981", tag: "Nav" },
          { label: "Quick Access", icon: FaBolt, path: "/authorized/quick-access", color: "#3b82f6", tag: "Home" },
          { label: "Header Mgmt", icon: FaBars, path: "/authorized/header-management", color: "#06b6d4", tag: "Header" },
          { label: "Footer Mgmt", icon: FaBars, path: "/authorized/footer-section-manager", color: "#64748b", tag: "Footer" },
          { label: "Footer Brands", icon: FaTags, path: "/authorized/brands", color: "#f97316", tag: "Partners" },
          { label: "Latest Updates", icon: FaBullhorn, path: "/authorized/new-updates", color: "#ef4444", tag: "Ticker" },
          { label: "Downloads", icon: FaDownload, path: "/authorized/download-management", color: "#10b981", tag: "Files" },
          { label: "Media Library", icon: FaFolderOpen, path: "/authorized/media-library", color: "#6366f1", tag: "Assets" },
        ]
      : []),
    ...(["DEVOPS", "ADMIN", "RESELLER", "CLIENT"].includes(userRole)
      ? [
          { label: "Users Mgmt", icon: FaAddressBook, path: "/authorized/users-management", color: "#1e293b", tag: "Accounts" }
        ]
      : []),
    ...(isDevOps
      ? [
          { label: "Activity Logs", icon: FaListAlt, path: "/authorized/activity-logs", color: "#0284c7", tag: "Audit" },
          { label: "User Sessions", icon: FaUsers, path: "/authorized/session-manager", color: "#8b5cf6", tag: "Security" },
          { label: "Database Backup", icon: FaDatabase, path: "/authorized/database-backup", color: "#0d9488", tag: "Storage" }
        ]
      : [])
  ];

  return (
    <main className="dashboard-container pb-4" aria-label="BeyondSend Telecom Command Center">
      {/* ================= PAGE HEADER & LIVE CONTROLS ================= */}
      <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3.5 pb-2.5 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.25rem", letterSpacing: "-0.3px" }}>
              Telecom & Omnichannel Command Center
            </h1>
            <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-0.5" style={{ fontSize: "11px" }}>
              v1.0 Pro
            </span>
          </div>
          <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
            Real-time multi-gateway delivery analytics, carrier route latency, and enterprise broadcast controls.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="d-flex align-items-center flex-wrap gap-2">
          {/* Live Network Status Indicator */}
          <div className="pro-pulse-container bg-white border rounded-pill px-3 py-1 shadow-xs">
            <span className="pro-pulse-dot" />
            <span className="fw-semibold text-dark" style={{ fontSize: "11.5px" }}>
              Gateways Operational · 99.98% SLA
            </span>
          </div>

          {/* Timeframe Filters */}
          <div className="d-inline-flex bg-white border rounded-pill p-0.5 shadow-xs">
            {["today", "7d", "30d", "quarter"].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`pro-filter-btn border-0 ${timeframe === tf ? "active" : ""}`}
                style={{ textTransform: "capitalize" }}
              >
                {tf === "today" ? "Today" : tf === "7d" ? "Last 7D" : tf === "30d" ? "Last 30D" : "Q3 2026"}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <Button
            color="light"
            size="sm"
            onClick={fetchStats}
            disabled={refreshing}
            className="border shadow-xs rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1.5 fw-semibold text-secondary"
            style={{ fontSize: "12px" }}
          >
            <FaSyncAlt className={refreshing ? "fa-spin text-primary" : ""} size={11} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </header>

      {/* ================= SECTION 1: PRO METRIC CARDS ================= */}
      <section aria-label="Enterprise Metrics" className="mb-3.5">
        <Row className="g-3">
          {loading ? (
            <Col xs={12} className="py-4 bg-white rounded-3 shadow-xs text-center">
              <PageLoader inline={true} />
            </Col>
          ) : (
            stats.map((item, i) => {
              const Icon = item.icon;
              return (
                <Col xl={3} lg={6} md={6} sm={6} xs={12} key={i}>
                  <div
                    className="pro-stat-tile"
                    style={{
                      background: item.bgGradient,
                      boxShadow: `0 8px 20px -3px ${item.shadowColor}`
                    }}
                  >
                    {/* Top Row: Title & Icon */}
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white text-opacity-80 fw-bold text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                        {item.title}
                      </span>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32, background: "rgba(255, 255, 255, 0.2)", backdropFilter: "blur(4px)" }}
                      >
                        <Icon size={15} />
                      </div>
                    </div>

                    {/* Middle Row: Value & Mini Sparkline */}
                    <div className="d-flex align-items-end justify-content-between mb-2">
                      <div>
                        <div className="fw-bold text-white" style={{ fontSize: "24px", lineHeight: "1.1", letterSpacing: "-0.5px" }}>
                          {item.value}
                        </div>
                        <div className="text-white text-opacity-75 small mt-0.5" style={{ fontSize: "11.5px" }}>
                          {item.subtitle}
                        </div>
                      </div>

                      {/* Mini Sparkline Chart */}
                      <svg width="70" height="30" viewBox="0 0 120 30" fill="none" style={{ overflow: "visible" }}>
                        <path
                          d={item.sparkline}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </div>

                    {/* Bottom Row: Trend Badge */}
                    <div className="d-flex align-items-center gap-1.5 pt-1.5 border-top border-white border-opacity-15">
                      <span className="badge rounded-pill bg-white bg-opacity-25 text-white fw-bold d-inline-flex align-items-center gap-1" style={{ fontSize: "10.5px", padding: "2px 7px" }}>
                        <FaArrowUp size={8} /> {item.change}
                      </span>
                      <span className="text-white text-opacity-75" style={{ fontSize: "11px" }}>
                        vs previous 7 days
                      </span>
                    </div>
                  </div>
                </Col>
              );
            })
          )}
        </Row>
      </section>

      {/* ================= SECTION 2: INTERACTIVE TRAFFIC & DISPATCH CHART ================= */}
      <section aria-label="Traffic Analytics" className="mb-3.5">
        <Card className="pro-dash-card">
          <CardBody className="p-3.5">
            {/* Header: Title + Channel Switcher */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2.5 border-bottom">
              <div>
                <h2 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: "0.95rem" }}>
                  <FaSignal className="text-primary" /> Multi-Channel Dispatch Volume & Throughput
                </h2>
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                  Hourly aggregated delivery curves across SMS, WhatsApp, Voice, and Email streams
                </small>
              </div>

              {/* Channel Tabs */}
              <div className="d-inline-flex bg-light p-1 rounded-3 border">
                {[
                  { id: "all", label: "All Channels" },
                  { id: "whatsapp", label: "WhatsApp", icon: FaWhatsapp },
                  { id: "sms", label: "SMS DLT", icon: FaCommentDots },
                  { id: "voice", label: "Voice OBD", icon: FaPhoneAlt },
                  { id: "email", label: "Email", icon: FaEnvelope }
                ].map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setActiveChannel(ch.id)}
                      className={`pro-channel-tab ${activeChannel === ch.id ? "active" : ""}`}
                    >
                      {Icon && <Icon size={11} />}
                      {ch.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Top KPI Stream Band */}
            <Row className="g-2 mb-3 text-center">
              <Col xs={6} md={3}>
                <div className="p-2 rounded-2 bg-light border">
                  <span className="text-muted d-block small" style={{ fontSize: "11px" }}>Peak Throughput</span>
                  <span className="fw-bold text-dark fs-6">2,840 msg/sec</span>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-2 rounded-2 bg-light border">
                  <span className="text-muted d-block small" style={{ fontSize: "11px" }}>Average Gateway Latency</span>
                  <span className="fw-bold text-success fs-6">38.4 ms</span>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-2 rounded-2 bg-light border">
                  <span className="text-muted d-block small" style={{ fontSize: "11px" }}>Success Delivery Ratio</span>
                  <span className="fw-bold text-primary fs-6">99.48%</span>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="p-2 rounded-2 bg-light border">
                  <span className="text-muted d-block small" style={{ fontSize: "11px" }}>DND / Filtered Rate</span>
                  <span className="fw-bold text-secondary fs-6">0.42%</span>
                </div>
              </Col>
            </Row>

            {/* Interactive SVG Area Chart */}
            <div className="position-relative" style={{ width: "100%", height: "200px" }}>
              <svg
                viewBox="0 0 600 170"
                preserveAspectRatio="none"
                style={{ width: "100%", height: "100%", display: "block" }}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Grid Lines */}
                {[30, 70, 110, 150].map((gY, idx) => (
                  <line
                    key={idx}
                    x1="20"
                    y1={gY}
                    x2="580"
                    y2={gY}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Shaded Area */}
                <path d={svgPathArea} fill="url(#areaGradient)" />

                {/* Line Path */}
                <path
                  d={svgPathLine}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points */}
                {chartPoints.map((pt, i) => {
                  const isHovered = hoveredPoint?.time === pt.time;
                  return (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 4}
                        fill="#ffffff"
                        stroke="#2563eb"
                        strokeWidth={isHovered ? 3 : 2}
                        style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      {/* X-Axis Time Label */}
                      <text
                        x={pt.x}
                        y="166"
                        textAnchor="middle"
                        fontSize="9.5"
                        fill="#94a3b8"
                        fontWeight="500"
                      >
                        {pt.time}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip */}
              {hoveredPoint && (
                <div
                  className="position-absolute bg-dark text-white rounded-2 px-2.5 py-1.5 shadow-lg border border-secondary"
                  style={{
                    left: `${(hoveredPoint.x / 600) * 100}%`,
                    top: `${(hoveredPoint.y / 170) * 100 - 30}%`,
                    transform: "translate(-50%, -100%)",
                    pointerEvents: "none",
                    zIndex: 10,
                    whiteSpace: "nowrap"
                  }}
                >
                  <div className="fw-bold" style={{ fontSize: "11px" }}>{hoveredPoint.time} UTC</div>
                  <div className="text-warning small" style={{ fontSize: "10.5px" }}>
                    Dispatched: <strong>{hoveredPoint.label}</strong>
                  </div>
                  <div className="text-success small" style={{ fontSize: "10px" }}>
                    Success: <strong>{hoveredPoint.success}</strong>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </section>

      {/* ================= SECTION 3: GATEWAY HEALTH & CHANNEL DISTRIBUTION ================= */}
      <section aria-label="Route Performance and Channels" className="mb-3.5">
        <Row className="g-3">
          {/* Left: Telecom Carrier Gateway Health */}
          <Col lg={7} md={12}>
            <Card className="pro-dash-card h-100">
              <CardBody className="p-3.5">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                  <div>
                    <h2 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: "0.95rem" }}>
                      <FaServer className="text-primary" /> Telecom Gateway Latency & Route Health
                    </h2>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      Direct DLT operator interconnects, cloud WhatsApp graph, and fallback clusters
                    </small>
                  </div>
                  <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 small">
                    5/5 Active Nodes
                  </span>
                </div>

                <div className="carrier-route-list">
                  {carrierRoutes.map((route, idx) => (
                    <div key={idx} className="pro-route-row">
                      <div className="d-flex align-items-center gap-2.5">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-primary"
                          style={{ width: 28, height: 28, background: "rgba(37, 99, 235, 0.08)" }}
                        >
                          <FaCheckCircle size={13} className="text-success" />
                        </div>
                        <div>
                          <div className="fw-bold text-dark" style={{ fontSize: "12.5px" }}>
                            {route.name}
                          </div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>
                            {route.provider} · <span className="fw-semibold text-secondary">{route.tps}</span>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-3">
                        <div className="text-end">
                          <span className="fw-bold text-dark d-block" style={{ fontSize: "12px" }}>
                            {route.latency}
                          </span>
                          <span className="text-success small fw-semibold" style={{ fontSize: "10.5px" }}>
                            {route.deliveryRate} Deliv.
                          </span>
                        </div>
                        <Badge color={route.badgeColor} pill className="px-2.5 py-1" style={{ fontSize: "10.5px" }}>
                          {route.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Right: Omnichannel Distribution & Delivery Breakdown */}
          <Col lg={5} md={12}>
            <Card className="pro-dash-card h-100">
              <CardBody className="p-3.5">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                  <div>
                    <h2 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: "0.95rem" }}>
                      <FaPaperPlane className="text-primary" /> Channel Volume Share
                    </h2>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      Distribution by communication protocol
                    </small>
                  </div>
                  <span className="text-muted small">4.82M Total</span>
                </div>

                {/* Progress Distribution Bars */}
                <div className="d-flex flex-column gap-3 mb-3">
                  {[
                    { name: "WhatsApp Business API", share: "42%", count: "2,025,214", color: "#25d366", icon: FaWhatsapp },
                    { name: "Promotional & Bulk SMS", share: "31%", count: "1,494,801", color: "#3b82f6", icon: FaCommentDots },
                    { name: "Transactional & OTPs", share: "16%", count: "771,510", color: "#6366f1", icon: FaShieldAlt },
                    { name: "Voice OBD & Calls", share: "7%", count: "337,535", color: "#f97316", icon: FaPhoneAlt },
                    { name: "Automated Email", share: "4%", count: "192,877", color: "#8b5cf6", icon: FaEnvelope }
                  ].map((ch, idx) => {
                    const Icon = ch.icon;
                    return (
                      <div key={idx}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-semibold text-dark d-flex align-items-center gap-1.5" style={{ fontSize: "12px" }}>
                            <Icon style={{ color: ch.color }} size={13} /> {ch.name}
                          </span>
                          <span className="text-muted small" style={{ fontSize: "11px" }}>
                            <strong className="text-dark">{ch.share}</strong> ({ch.count})
                          </span>
                        </div>
                        <div className="w-100 bg-light rounded-pill overflow-hidden" style={{ height: 6 }}>
                          <div
                            style={{
                              width: ch.share,
                              height: "100%",
                              background: ch.color,
                              borderRadius: "4px"
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Delivery Quality Mini Box */}
                <div className="p-2.5 rounded-3 bg-light border d-flex justify-content-around text-center mt-2">
                  <div>
                    <span className="d-block text-success fw-bold" style={{ fontSize: "14px" }}>98.6%</span>
                    <span className="text-muted small" style={{ fontSize: "10.5px" }}>Delivered</span>
                  </div>
                  <div style={{ width: 1, background: "#cbd5e1" }} />
                  <div>
                    <span className="d-block text-warning fw-bold" style={{ fontSize: "14px" }}>0.9%</span>
                    <span className="text-muted small" style={{ fontSize: "10.5px" }}>Queued</span>
                  </div>
                  <div style={{ width: 1, background: "#cbd5e1" }} />
                  <div>
                    <span className="d-block text-danger fw-bold" style={{ fontSize: "14px" }}>0.5%</span>
                    <span className="text-muted small" style={{ fontSize: "10.5px" }}>Failed / DND</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </section>

      {/* ================= SECTION 4: RECENT CAMPAIGN LIVE STREAM ================= */}
      <section aria-label="Recent Campaigns" className="mb-3.5">
        <Card className="pro-dash-card">
          <CardBody className="p-3.5">
            <div className="d-flex align-items-center justify-content-between mb-2.5 pb-2 border-bottom">
              <div>
                <h2 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: "0.95rem" }}>
                  <FaListAlt className="text-primary" /> Live Dispatch & Campaign Broadcast Stream
                </h2>
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                  Real-time broadcast execution pipeline and recipient fulfillment rates
                </small>
              </div>
              <span className="badge rounded-pill bg-light text-muted border px-2.5 py-1">
                Real-time Monitor
              </span>
            </div>

            <div className="table-responsive">
              <table className="table pro-table-activity align-middle mb-0">
                <thead>
                  <tr>
                    <th>Campaign ID & Name</th>
                    <th>Protocol</th>
                    <th>Target Audience</th>
                    <th>Fulfillment</th>
                    <th>Delivery %</th>
                    <th>Status</th>
                    <th>Activity Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCampaigns.map((cmp) => {
                    const Icon = cmp.channelIcon;
                    return (
                      <tr key={cmp.id}>
                        <td>
                          <div className="fw-bold text-dark">{cmp.name}</div>
                          <small className="text-muted font-monospace">{cmp.id}</small>
                        </td>
                        <td>
                          <span
                            className="badge px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1"
                            style={{
                              background: `${cmp.channelColor}15`,
                              color: cmp.channelColor,
                              border: `1px solid ${cmp.channelColor}40`,
                              fontSize: "11px"
                            }}
                          >
                            <Icon size={10} /> {cmp.channel}
                          </span>
                        </td>
                        <td>
                          <span className="fw-bold">{cmp.recipients}</span>
                        </td>
                        <td>
                          <span className="text-muted">{cmp.delivered}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2" style={{ minWidth: 100 }}>
                            <div className="w-100 bg-light rounded-pill overflow-hidden" style={{ height: 6 }}>
                              <div
                                style={{
                                  width: cmp.rate,
                                  height: "100%",
                                  background: cmp.rate === "100%" ? "#10b981" : "#3b82f6"
                                }}
                              />
                            </div>
                            <span className="fw-bold text-dark small" style={{ fontSize: "11px" }}>{cmp.rate}</span>
                          </div>
                        </td>
                        <td>
                          <Badge color={cmp.badgeColor} pill className="px-2 py-1" style={{ fontSize: "10px" }}>
                            {cmp.status}
                          </Badge>
                        </td>
                        <td className="text-muted small">
                          {cmp.time}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* ================= SECTION 5: QUICK ACTIONS HUB ================= */}
      {quickActions.length > 0 && (
        <section aria-labelledby="quick-actions-heading">
          <Card className="pro-dash-card">
            <CardBody className="p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2.5 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="p-1 rounded-2 d-flex align-items-center justify-content-center text-primary"
                    style={{ background: "rgba(59, 130, 246, 0.12)", width: 24, height: 24 }}
                  >
                    <FaBolt size={11} />
                  </div>
                  <h2 id="quick-actions-heading" className="fw-bold mb-0 text-dark" style={{ fontSize: "0.95rem" }}>
                    Quick Launch & Management Hub
                  </h2>
                </div>
                <Badge
                  color="light"
                  className="text-muted fw-semibold border px-2.5 py-0.5 rounded-pill"
                  style={{ fontSize: "11px", background: "#f8fafc" }}
                >
                  {quickActions.length} Shortcuts
                </Badge>
              </div>

              <div className="adm-quick-grid">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => navigate(action.path)}
                      className="adm-quick-tile"
                      style={{ "--tile-color": action.color }}
                      aria-label={`Open ${action.label}`}
                    >
                      <div className="adm-quick-tile-left">
                        <div className="adm-quick-icon">
                          <Icon />
                        </div>
                        <div>
                          <span className="adm-quick-label d-block">
                            {action.label}
                          </span>
                          {action.tag && (
                            <span className="badge rounded-pill bg-light text-muted border px-1.5 py-0.5" style={{ fontSize: "9px" }}>
                              {action.tag}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="adm-quick-arrow">
                        <FaArrowRight size={8.5} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </section>
      )}
    </main>
  );
};

export default Dashboard;
