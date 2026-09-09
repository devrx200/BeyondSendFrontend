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
import CGStateCalendar from "../../components/CGStateCalendar";

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
      bgGradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
      shadowColor: "rgba(79, 70, 229, 0.25)",
      lightBg: "rgba(255, 255, 255, 0.18)"
    },
    {
      title: "Total Colleges",
      icon: FaSchool,
      value: statsData?.totalColleges ?? 0,
      bgGradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      shadowColor: "rgba(5, 150, 105, 0.25)",
      lightBg: "rgba(255, 255, 255, 0.18)"
    },
    {
      title: "Total Students",
      icon: FaUserGraduate,
      value: statsData?.totalStudents ?? 0,
      bgGradient: "linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)",
      shadowColor: "rgba(225, 29, 72, 0.25)",
      lightBg: "rgba(255, 255, 255, 0.18)"
    },
    {
      title: "Total Courses",
      icon: FaBook,
      value: statsData?.totalCourses ?? 0,
      bgGradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
      shadowColor: "rgba(217, 119, 6, 0.25)",
      lightBg: "rgba(255, 255, 255, 0.18)"
    }
  ];

  /* ---------- QUICK ACTIONS CONFIG ---------- */
  const quickActions = [
    // Admin + Directorate
    ...(userRole === "ADMIN" && employeeType === "DIRECTORATE"
      ? [
          { label: "Add Menu", icon: FaBars, path: "/admin/menu", color: "#10b981" },
          { label: "Home Slider", icon: FaImages, path: "/admin/slider", color: "#f59e0b" },
          { label: "Header Mgmt", icon: FaBars, path: "/admin/header-management", color: "#3b82f6" },
          { label: "Footer Mgmt", icon: FaBars, path: "/admin/footer-section-manager", color: "#64748b" },
          { label: "About Section", icon: FaInfoCircle, path: "/admin/about-section", color: "#06b6d4" },
          { label: "Important Links", icon: FaLink, path: "/admin/important-links", color: "#059669" },
          { label: "Footer Brands", icon: FaTags, path: "/admin/brands", color: "#8b5cf6" },
          { label: "Users Mgmt", icon: FaAddressBook, path: "/admin/users-management", color: "#1e293b" }
        ]
      : []),
    // Admin + Officer
    ...(userRole === "ADMIN" || userRole === "OFFICER"
      ? [
          { label: "Latest Updates", icon: FaBullhorn, path: "/admin/new-updates", color: "#ef4444" },
          { label: "Announcements", icon: FaBullhorn, path: "/admin/announcements", color: "#0d9488" },
          ...(employeeType === "DIRECTORATE"
            ? [{ label: "Directorate Notices", icon: FaBullhorn, path: "/admin/directorate-notices", color: "#f59e0b" }]
            : []),
          ...(employeeType === "DEPARTMENT"
            ? [{ label: "Department Notices", icon: FaBullhorn, path: "/admin/department-notices", color: "#f59e0b" }]
            : []),
          { label: "Photo Galleries", icon: FaNewspaper, path: "/admin/gallery", color: "#0284c7" },
          { label: "Downloads", icon: FaDownload, path: "/admin/download-management", color: "#16a34a" },
          { label: "Media & Library", icon: FaFolderOpen, path: "/admin/media-library-mangments", color: "#7c3aed" }
        ]
      : []),
    // NIC
    ...(userRole === "NIC" && employeeType === "NIC"
      ? [
          { label: "Activity Logs", icon: FaListAlt, path: "/admin/activity-logs", color: "#334155" },
          { label: "User Sessions", icon: FaAddressBook, path: "/admin/session-manager", color: "#475569" },
          { label: "Help Guidance", icon: FaInfoCircle, path: "/admin/help-guidance", color: "#0284c7" }
        ]
      : [])
  ];

  return (
    <div className="dashboard-container pb-4">
      {/* Centralized Reusable Dashboard Styles */}
      <style>{`
        .adm-quick-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
          gap: 10px;
        }
        .adm-quick-tile {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 5px 10px 5px 5px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
          width: 100%;
        }
        .adm-quick-tile:hover {
          border-color: var(--tile-color);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }
        .adm-quick-tile-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .adm-quick-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          background: var(--tile-color);
          font-size: 14px;
          flex-shrink: 0;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
        }
        .adm-quick-label {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .adm-quick-arrow {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-left: 6px;
          transition: all 0.2s ease;
        }
        .adm-quick-tile:hover .adm-quick-arrow {
          background: var(--tile-color);
          color: #ffffff;
          transform: translateX(2px);
        }
      `}</style>

      {/* ================= TOP HEADER BANNER ================= */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
        <CardHeader
          className="p-3 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3 text-white border-0"
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            borderBottom: "3px solid #3b82f6"
          }}
        >
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fs-4">📊</span>
              <h4 className="fw-bold mb-0 text-white" style={{ letterSpacing: "-0.3px" }}>
                Dashboard Overview
              </h4>
            </div>
            <small className="text-slate-400 text-white-50">
              Department of Higher Education • Government of Chhattisgarh
            </small>
          </div>

          {academicYear && (
            <Badge
              color="light"
              pill
              className="text-dark fs-6 px-3 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }}></span>
              Academic Year: {academicYear}
            </Badge>
          )}
        </CardHeader>
      </Card>

      <Row className="g-3 mb-4">
        {loading ? (
          <Col xs={12} className="py-4 bg-white rounded-4 shadow-sm">
            <PageLoader inline={true} />
          </Col>
        ) : (
          stats.map((item, i) => {
            const Icon = item.icon;
            return (
              <Col xl={3} lg={6} md={6} sm={6} xs={12} key={i}>
                <div
                  className="p-3.5 px-4 rounded-4 text-white d-flex align-items-center justify-content-between position-relative overflow-hidden"
                  style={{
                    background: item.bgGradient,
                    boxShadow: `0 8px 20px ${item.shadowColor}`,
                    minHeight: "105px",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "default"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 14px 26px ${item.shadowColor}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 8px 20px ${item.shadowColor}`;
                  }}
                >
                  {/* Decorative Background Glow Circle */}
                  <div
                    style={{
                      position: "absolute",
                      right: "-15px",
                      bottom: "-20px",
                      width: "110px",
                      height: "110px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.1)",
                      pointerEvents: "none"
                    }}
                  />

                  <div>
                    <div
                      className="text-uppercase fw-bold opacity-80"
                      style={{ fontSize: "11.5px", letterSpacing: "0.8px" }}
                    >
                      {item.title}
                    </div>
                    <div
                      className="fw-bolder mt-1 text-white"
                      style={{ fontSize: "28px", lineHeight: "1.15", fontFamily: "inherit" }}
                    >
                      {item.value}
                    </div>
                  </div>

                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                    style={{
                      width: "50px",
                      height: "50px",
                      background: item.lightBg,
                      backdropFilter: "blur(4px)"
                    }}
                  >
                    <Icon size={24} />
                  </div>
                </div>
              </Col>
            );
          })
        )}
      </Row>

      {/* ================= QUICK ACTIONS ================= */}
      {quickActions.length > 0 && (
        <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
          <CardBody className="p-3.5 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-light">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="p-1.5 rounded-2 d-flex align-items-center justify-content-center text-warning"
                  style={{ background: "#fef3c7", width: 28, height: 28 }}
                >
                  <FaBolt size={13} />
                </div>
                <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: "15px" }}>
                  Quick Actions
                </h6>
              </div>
              <Badge
                color="light"
                className="text-muted fw-semibold border px-2.5 py-1 rounded-pill"
                style={{ fontSize: "11.5px", background: "#f8fafc" }}
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
                      <FaArrowRight size={9} />
                    </div>
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* ================= CHHATTISGARH STATE GOVERNMENT HOLIDAY CALENDAR ================= */}
      <CGStateCalendar />
    </div>
  );
};

export default AdminDashboard;