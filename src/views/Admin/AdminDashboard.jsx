import { Row, Col, Card, CardBody, Button, Spinner, Container, Badge } from "reactstrap";
import {
  FaUniversity,
  FaSchool,
  FaNewspaper,
  FaCalendarAlt,
  FaPlus,
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
  FaFolderOpen      // <-- new icon for media library
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
/* ---------- CALENDAR HELPERS ---------- */
const today = new Date();
const currentMonth = today.toLocaleString("default", { month: "long" });
const currentYear = today.getFullYear();
const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();
const startDay = new Date(currentYear, today.getMonth(), 1).getDay();

const AdminDashboard = () => {
  const navigate = useNavigate();

  // 🔁 Replace with your actual user data (from context / session)
  const userRole = sessionStorage.getItem("userRole") || "ADMIN";
  const employeeType = sessionStorage.getItem("employeeType") || "DIRECTORATE";

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

  /* ---------- STATS CONFIG ---------- */
  const stats = [
    {
      title: "Total Universities",
      icon: FaUniversity,
      value: statsData?.totalUniversities ?? 0,
      gradient: "linear-gradient(135deg, #667eea, #764ba2)"
    },
    {
      title: "Total Colleges",
      icon: FaSchool,
      value: statsData?.totalColleges ?? 0,
      gradient: "linear-gradient(135deg, #11998e, #38ef7d)"
    },
    {
      title: "Total Students",
      icon: FaUserGraduate,
      value: statsData?.totalStudents ?? 0,
      gradient: "linear-gradient(135deg, #ff416c, #ff4b2b)"
    },
    {
      title: "Total Courses",
      icon: FaBook,
      value: statsData?.totalCourses ?? 0,
      gradient: "linear-gradient(135deg, #f7971e, #ffd200)"
    }
  ];

  return (
    <Container className="mt-4">
      <Card className="shadow-lg border-0 m-0">
        <CardBody>

          {/* ================= HEADER ================= */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-primary mb-0">
              Dashboard Overview
            </h4>
            {academicYear && (
              <Badge color="primary" pill className="fs-6">
                Academic Year: {academicYear}
              </Badge>
            )}
          </div>

          {/* ================= STATS CARDS ================= */}
          <Row>
            {loading ? (
              <Col className="text-center py-5">
                <Spinner color="primary" />
              </Col>
            ) : (
              stats.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Col xl={3} lg={4} md={6} sm={6} xs={12} key={i} className="mb-4">
                    <Card
                      className="shadow border-0 text-white h-100"
                      style={{
                        background: item.gradient,
                        transition: "transform 0.3s"
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-5px)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "translateY(0)")
                      }
                    >
                      <CardBody className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="text-uppercase small opacity-75 fw-bold">
                            {item.title}
                          </div>
                          <h2 className="fw-bold mb-0 text-white">
                            {item.value}
                          </h2>
                        </div>
                        <div className="bg-white bg-opacity-25 rounded-circle p-3">
                          <Icon size={26} />
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                );
              })
            )}
          </Row>

          {/* ================= SECOND ROW ================= */}
          <Row className="mt-2">

            {/* ---------- CALENDAR ---------- */}
            <Col lg={4} md={12} className="mb-4">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <h5 className="fw-bold mb-3">
                    <FaCalendarAlt className="me-2 text-primary" />
                    {currentMonth} {currentYear}
                  </h5>
                  <div
                    className="d-grid"
                    style={{
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: "6px"
                    }}
                  >
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="text-center fw-semibold text-muted small">
                        {d}
                      </div>
                    ))}
                    {[...Array(startDay)].map((_, i) => (
                      <div key={i} />
                    ))}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const day = i + 1;
                      const isToday = day === today.getDate();
                      return (
                        <div
                          key={day}
                          className={`text-center py-2 rounded ${isToday
                            ? "bg-primary text-white fw-bold"
                            : "bg-light"
                            }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            </Col>

            {/* ---------- QUICK ACTIONS ---------- */}
            <Col lg={8} md={12} className="mb-4">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <h5 className="fw-bold mb-3">Quick Actions</h5>
                  <Row className="g-3">

                    {/* ========== ADMIN + DIRECTORATE ========== */}
                    {userRole === "ADMIN" && employeeType === "DIRECTORATE" && (
                      <>
                        <Col md={3} sm={6}>
                          <Button
                            color="success"
                            className="w-100 py-3 fw-semibold"
                            onClick={() => navigate("/admin/menu")}
                          >
                            <FaBars size={20} className="mb-1" />
                            <div>Add Menu</div>
                          </Button>
                        </Col>
                        <Col md={3} sm={6}>
                          <Button
                            color="warning"
                            className="w-100 py-3 fw-semibold text-white"
                            onClick={() => navigate("/admin/slider")}
                          >
                            <FaImages size={20} className="mb-1" />
                            <div>Home Slider</div>
                          </Button>
                        </Col>
                        <Col md={3} sm={6}>
                          <Button
                            color="primary"
                            className="w-100 py-3 fw-semibold"
                            onClick={() => navigate("/admin/header-management")}
                          >
                            <FaBars size={20} className="mb-1" />
                            <div>Header Mgmt</div>
                          </Button>
                        </Col>
                        <Col md={3} sm={6}>
                          <Button
                            color="dark"
                            className="w-100 py-3 fw-semibold text-white"
                            onClick={() => navigate("/admin/footer-section-manager")}
                          >
                            <FaBars size={20} className="mb-1" />
                            <div>Footer Mgmt</div>
                          </Button>
                        </Col>
                        <Col md={3} sm={6}>
                          <Button
                            color="info"
                            className="w-100 py-3 fw-semibold text-white"
                            onClick={() => navigate("/admin/about-section")}
                          >
                            <FaInfoCircle size={20} className="mb-1" />
                            <div>About Section</div>
                          </Button>
                        </Col>
                        <Col md={3} sm={6}>
                          <Button
                            color="success"
                            className="w-100 py-3 fw-semibold text-white"
                            onClick={() => navigate("/admin/important-links")}
                          >
                            <FaLink size={20} className="mb-1" />
                            <div>Important Links</div>
                          </Button>
                        </Col>
                        <Col md={3} sm={6}>
                          <Button
                            color="secondary"
                            className="w-100 py-3 fw-semibold text-white"
                            onClick={() => navigate("/admin/brands")}
                          >
                            <FaTags size={20} className="mb-1" />
                            <div>Footer Brands</div>
                          </Button>
                        </Col>
                        <Col md={3} sm={6}>
                          <Button
                            color="dark"
                            className="w-100 py-3 fw-semibold text-white"
                            onClick={() => navigate("/admin/users-management")}
                          >
                            <FaAddressBook size={20} className="mb-1" />
                            <div>Users Mgmt</div>
                          </Button>
                        </Col>
                      </>
                    )}

                    {/* ========== ADMIN + OFFICER ========== */}
                    {(userRole === "ADMIN" || userRole === "OFFICER") && (
                      <>
                        <Col md={3} sm={6}>
                          <Button
                            color="danger"
                            className="w-100 py-3 fw-semibold text-white"
                            onClick={() => navigate("/admin/new-updates")}
                          >
                            <FaBullhorn size={20} className="mb-1" />
                            <div>Latest Updates</div>
                          </Button>
                        </Col>
                        <Col md={3} sm={6}>
                          <Button
                            color="primary"
                            className="w-100 py-3 fw-semibold"
                            onClick={() => navigate("/admin/announcements")}
                          >
                            <FaBullhorn size={20} className="mb-1" />
                            <div>Announcements</div>
                          </Button>
                        </Col>

                        {employeeType === "DIRECTORATE" && (
                          <Col md={3} sm={6}>
                            <Button
                              color="warning"
                              className="w-100 py-3 fw-semibold text-white"
                              onClick={() => navigate("/admin/directorate-notices")}
                            >
                              <FaBullhorn size={20} className="mb-1" />
                              <div>Directorate Notices</div>
                            </Button>
                          </Col>
                        )}

                        {employeeType === "DEPARTMATE" && (
                          <Col md={3} sm={6}>
                            <Button
                              color="warning"
                              className="w-100 py-3 fw-semibold text-white"
                              onClick={() => navigate("/admin/department-notices")}
                            >
                              <FaBullhorn size={20} className="mb-1" />
                              <div>Department Notices</div>
                            </Button>
                          </Col>
                        )}

                        <Col md={3} sm={6}>
                          <Button
                            color="info"
                            className="w-100 py-3 fw-semibold text-white"
                            onClick={() => navigate("/admin/gallery")}
                          >
                            <FaNewspaper size={20} className="mb-1" />
                            <div>Photo Galleries</div>
                          </Button>
                        </Col>

                        <Col md={3} sm={6}>
                          <Button
                            color="success"
                            className="w-100 py-3 fw-semibold text-white"
                            onClick={() => navigate("/admin/download-management")}
                          >
                            <FaDownload size={20} className="mb-1" />
                            <div>Downloads</div>
                          </Button>
                        </Col>

                        {/* ✨ NEW BUTTON – Media, Resources & Library ✨ */}
                        <Col md={3} sm={6}>
                          <Button
                            style={{
                              background: "linear-gradient(135deg, #8E2DE2, #4A00E0)",
                              border: "none"
                            }}
                            className="w-100 py-3 fw-semibold text-white shadow-sm"
                            onClick={() => navigate("/admin/media-library-mangments")}
                          >
                            <FaFolderOpen size={20} className="mb-1" />
                            <div>Media & Library</div>
                          </Button>
                        </Col>
                      </>
                    )}

                    {/* ========== NIC ========== */}
                    {userRole === "NIC" && employeeType === "NIC" && (
                      <>
                        <Col md={3} sm={6}>
                          <Button
                            color="dark"
                            className="w-100 py-3 fw-semibold text-white"
                            onClick={() => navigate("/admin/activity-logs")}
                          >
                            <FaListAlt size={20} className="mb-1" />
                            <div>Activity Logs</div>
                          </Button>
                        </Col>
                        <Col md={3} sm={6}>
                          <Button
                            color="secondary"
                            className="w-100 py-3 fw-semibold text-white"
                            onClick={() => navigate("/admin/session-manager")}
                          >
                            <FaAddressBook size={20} className="mb-1" />
                            <div>User Sessions</div>
                          </Button>
                        </Col>
                        <Col md={3} sm={6}>
                          <Button
                            color="info"
                            className="w-100 py-3 fw-semibold text-white"
                            onClick={() => navigate("/admin/help-guidance")}
                          >
                            <FaInfoCircle size={20} className="mb-1" />
                            <div>Help Guidance</div>
                          </Button>
                        </Col>
                      </>
                    )}

                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Container>
  );
};

export default AdminDashboard;