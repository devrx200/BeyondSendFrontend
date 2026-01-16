import { Row, Col, Card, CardBody, Button, Spinner } from "reactstrap";
import {
  FaUniversity,
  FaSchool,
  FaNewspaper,
  FaCalendarAlt,
  FaPlus,
  FaBullhorn,
  FaUserGraduate,
  FaBook
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/* ---------- CALENDAR HELPERS ---------- */
const today = new Date();
const currentMonth = today.toLocaleString("default", { month: "long" });
const currentYear = today.getFullYear();
const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();
const startDay = new Date(currentYear, today.getMonth(), 1).getDay();

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState(null);
  const [academicYear, setAcademicYear] = useState("");
  const [loading, setLoading] = useState(true);

  /* ---------- FETCH EDUCATION STATS ---------- */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/education-stats/current`
        );

        if (res.data?.success) {
          setStatsData(res.data.data);        // ✅ object
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
      gradient: "linear-gradient(135deg, #667eea, #f74cd2ff)"
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
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Dashboard Overview</h4>
        {academicYear && (
          <span className="badge bg-primary fs-6">
            Academic Year: {academicYear}
          </span>
        )}
      </div>

      {/* ---------- STAT CARDS ---------- */}
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

      {/* ---------- SECOND ROW ---------- */}
      <Row>
        {/* CALENDAR */}
        <Col lg={4} md={12} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <CardBody>
              <h5 className="fw-bold mb-3">
                <FaCalendarAlt className="me-2 text-primary" />
                {currentMonth} {currentYear}
              </h5>

              <div
                className="d-grid"
                style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}
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
                      className={`text-center py-2 rounded ${
                        isToday
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

        {/* QUICK ACTIONS */}
        <Col lg={8} md={12} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <CardBody>
              <h5 className="fw-bold mb-3">Quick Actions</h5>

              <Row className="g-3">
                <Col md={3} sm={6}>
                  <Button
                    color="primary"
                    onClick={() => navigate("/admin/universities")}
                    className="w-100 py-3 fw-semibold"
                  >
                    <FaPlus />
                    <div>Add University</div>
                  </Button>
                </Col>

                <Col md={3} sm={6}>
                  <Button
                    color="success"
                    onClick={() => navigate("/admin/menu")}
                    className="w-100 py-3 fw-semibold"
                  >
                    <FaPlus />
                    <div>Menu Management</div>
                  </Button>
                </Col>

                <Col md={3} sm={6}>
                  <Button
                    color="info"
                    onClick={() => navigate("/admin/gallery")}
                    className="w-100 py-3 fw-semibold text-white"
                  >
                    <FaNewspaper />
                    <div>Add Gallery</div>
                  </Button>
                </Col>

                <Col md={3} sm={6}>
                  <Button
                    color="danger"
                    onClick={() => navigate("/admin/new-updates")}
                    className="w-100 py-3 fw-semibold text-white"
                  >
                    <FaBullhorn />
                    <div>New Updates</div>
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AdminDashboard;
