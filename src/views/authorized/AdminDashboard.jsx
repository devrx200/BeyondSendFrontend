import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Badge
} from "reactstrap";
import PageLoader from "../../components/PageLoader";
import {
  FaUniversity,
  FaSchool,
  FaNewspaper,
  FaBullhorn,
  FaUserGraduate,
  FaBook,
  FaBars,
  FaImages,
  FaDownload,
  FaLink,
  FaListAlt,
  FaTags,
  FaAddressBook,
  FaInfoCircle,
  FaFolderOpen,
  FaBolt,
  FaArrowRight
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
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
  const employeeType = (
    sessionStorage.getItem("employeeType") ||
    storedUser?.employeeType ||
    window.employeeType ||
    "DIRECTORATE"
  ).toUpperCase();

  const [statsData, setStatsData] = useState(null);
  const [academicYear, setAcademicYear] = useState("");
  const [loading, setLoading] = useState(true);

  /* ---------- FETCH EDUCATION STATS ---------- */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/education-stats/current`);
        if (res.data?.success) {
          setStatsData(res.data.data);
          setAcademicYear(res.data.academicYear);
        }
      } catch (error) {
        console.error("Failed to fetch education stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  /* ---------- STATS CARDS CONFIG ---------- */
  const stats = [
    {
      title: "Total Universities",
      icon: FaUniversity,
      value: statsData?.totalUniversities ?? 0,
      bgGradient: "linear-gradient(135deg, #4f6ef7 0%, #3b5bdb 100%)",
      shadowColor: "rgba(79, 110, 247, 0.22)",
      lightBg: "rgba(255, 255, 255, 0.18)"
    },
    {
      title: "Total Colleges",
      icon: FaSchool,
      value: statsData?.totalColleges ?? 0,
      bgGradient: "linear-gradient(135deg, #20c997 0%, #0d9488 100%)",
      shadowColor: "rgba(32, 201, 151, 0.22)",
      lightBg: "rgba(255, 255, 255, 0.18)"
    },
    {
      title: "Total Students",
      icon: FaUserGraduate,
      value: statsData?.totalStudents ?? 0,
      bgGradient: "linear-gradient(135deg, #fe5d70 0%, #e11d48 100%)",
      shadowColor: "rgba(254, 93, 112, 0.22)",
      lightBg: "rgba(255, 255, 255, 0.18)"
    },
    {
      title: "Total Courses",
      icon: FaBook,
      value: statsData?.totalCourses ?? 0,
      bgGradient: "linear-gradient(135deg, #fe9365 0%, #ea580c 100%)",
      shadowColor: "rgba(254, 147, 101, 0.22)",
      lightBg: "rgba(255, 255, 255, 0.18)"
    }
  ];

  /* ---------- QUICK ACTIONS CONFIG ---------- */
  const quickActions = [
    // Admin + Directorate
    ...(userRole === "ADMIN" && employeeType === "DIRECTORATE"
      ? [
          { label: "Menu Setup", icon: FaBars, path: "/authorized/menu", color: "#20c997" },
          { label: "Quick Access", icon: FaBolt, path: "/authorized/quick-access", color: "#4f6ef7" },
          { label: "Header Mgmt", icon: FaBars, path: "/authorized/header-management", color: "#00c5eb" },
          { label: "Footer Mgmt", icon: FaBars, path: "/authorized/footer-section-manager", color: "#64748b" },
          { label: "Footer Brands", icon: FaTags, path: "/authorized/brands", color: "#fe9365" },
          { label: "Users Mgmt", icon: FaAddressBook, path: "/authorized/users-management", color: "#1e293b" }
        ]
      : []),
    // Admin + Officer
    ...(userRole === "ADMIN" || userRole === "OFFICER"
      ? [
          { label: "Latest Updates", icon: FaBullhorn, path: "/authorized/new-updates", color: "#fe5d70" },
          { label: "Downloads", icon: FaDownload, path: "/authorized/download-management", color: "#20c997" },
          { label: "Media Library", icon: FaFolderOpen, path: "/authorized/media-library-mangments", color: "#4f6ef7" }
        ]
      : []),
    // NIC
    ...(userRole === "NIC" && employeeType === "NIC"
      ? [
          { label: "Activity Logs", icon: FaListAlt, path: "/authorized/activity-logs", color: "#1e293b" },
          { label: "User Sessions", icon: FaAddressBook, path: "/authorized/session-manager", color: "#64748b" },
          { label: "Help Guidance", icon: FaInfoCircle, path: "/authorized/help-guidance", color: "#00c5eb" }
        ]
      : [])
  ];

  return (
    <main className="dashboard-container pb-4" aria-label="Admin Dashboard">
      {/* ================= PAGE HEADER ================= */}
      <header className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.15rem", letterSpacing: "-0.2px" }}>
            Overview & Metrics
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: "0.77rem" }}>
            System health, institutional statistics, and quick navigation shortcuts
          </p>
        </div>
        {academicYear && (
          <Badge
            color="light"
            className="text-primary border px-2.5 py-1 rounded-pill"
            style={{ fontSize: "0.72rem", background: "#f8fafc" }}
          >
            Academic Session: {academicYear}
          </Badge>
        )}
      </header>

      {/* ================= METRIC CARDS ================= */}
      <section aria-label="Institutional Statistics" className="mb-3">
        <Row className="g-2.5">
          {loading ? (
            <Col xs={12} className="py-4 bg-white rounded-3 shadow-xs">
              <PageLoader inline={true} />
            </Col>
          ) : (
            stats.map((item, i) => {
              const Icon = item.icon;
              return (
                <Col xl={3} lg={6} md={6} sm={6} xs={12} key={i}>
                  <div
                    className="p-3 px-3.5 rounded-3 text-white d-flex align-items-center justify-content-between position-relative overflow-hidden"
                    style={{
                      background: item.bgGradient,
                      boxShadow: `0 4px 14px ${item.shadowColor}`,
                      minHeight: "86px",
                      transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "default"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 8px 18px ${item.shadowColor}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = `0 4px 14px ${item.shadowColor}`;
                    }}
                  >
                    {/* Decorative Background Glow Circle */}
                    <div
                      style={{
                        position: "absolute",
                        right: "-12px",
                        bottom: "-15px",
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.1)",
                        pointerEvents: "none"
                      }}
                    />

                    <div>
                      <div
                        className="text-uppercase fw-bold opacity-80"
                        style={{ fontSize: "10.5px", letterSpacing: "0.6px" }}
                      >
                        {item.title}
                      </div>
                      <div
                        className="fw-bold mt-0.5 text-white"
                        style={{ fontSize: "22px", lineHeight: "1.15", fontFamily: "inherit" }}
                      >
                        {item.value}
                      </div>
                    </div>

                    <div
                      className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs"
                      style={{
                        width: "38px",
                        height: "38px",
                        background: item.lightBg,
                        backdropFilter: "blur(4px)"
                      }}
                    >
                      <Icon size={18} />
                    </div>
                  </div>
                </Col>
              );
            })
          )}
        </Row>
      </section>

      {/* ================= QUICK ACTIONS ================= */}
      {quickActions.length > 0 && (
        <section aria-labelledby="quick-actions-heading">
          <Card className="border shadow-xs rounded-3 mb-4 bg-white overflow-hidden">
            <CardBody className="p-3 p-md-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2.5 pb-2 border-bottom border-light">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="p-1 rounded-2 d-flex align-items-center justify-content-center text-primary"
                    style={{ background: "rgba(79, 110, 247, 0.12)", width: 24, height: 24 }}
                  >
                    <FaBolt size={11} />
                  </div>
                  <h2 id="quick-actions-heading" className="fw-bold mb-0 text-dark" style={{ fontSize: "0.88rem" }}>
                    Quick Actions
                  </h2>
                </div>
                <Badge
                  color="light"
                  className="text-muted fw-semibold border px-2 py-0.5 rounded-pill"
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
                        <span className="adm-quick-label">
                          {action.label}
                        </span>
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

export default AdminDashboard;
