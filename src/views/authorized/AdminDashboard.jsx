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
          { label: "Footer Brands", icon: FaTags, path: "/admin/brands", color: "#8b5cf6" },
          { label: "Users Mgmt", icon: FaAddressBook, path: "/admin/users-management", color: "#1e293b" }
        ]
      : []),
    // Admin + Officer
    ...(userRole === "ADMIN" || userRole === "OFFICER"
      ? [
          { label: "Latest Updates", icon: FaBullhorn, path: "/admin/new-updates", color: "#ef4444" },
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
    </div>
  );
};

export default AdminDashboard;
