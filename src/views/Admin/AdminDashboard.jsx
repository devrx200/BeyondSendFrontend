import { Row, Col, Card, CardBody, Button } from "reactstrap";
import {
  FaUniversity,
  FaSchool,
  FaNewspaper,
  FaBell,
  FaCalendarAlt,
  FaPlus,
  FaCog
} from "react-icons/fa";

/* ---------- STATS ---------- */
const stats = [
  {
    title: "Universities",
    icon: FaUniversity,
    value: 15,
    gradient: "linear-gradient(135deg, #667eea, #764ba2)"
  },
  {
    title: "Colleges",
    icon: FaSchool,
    value: 325,
    gradient: "linear-gradient(135deg, #11998e, #38ef7d)"
  },
  {
    title: "News",
    icon: FaNewspaper,
    value: 48,
    gradient: "linear-gradient(135deg, #f7971e, #ffd200)"
  },
  {
    title: "Notifications",
    icon: FaBell,
    value: 12,
    gradient: "linear-gradient(135deg, #ff416c, #ff4b2b)"
  }
];

/* ---------- CALENDAR HELPERS ---------- */
const today = new Date();
const currentMonth = today.toLocaleString("default", { month: "long" });
const currentYear = today.getFullYear();
const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();
const startDay = new Date(currentYear, today.getMonth(), 1).getDay();

const AdminDashboard = () => {
  return (
    <>
      <h4 className="mb-4 fw-bold">Dashboard Overview</h4>

      {/* ---------- STAT CARDS ---------- */}
      <Row>
        {stats.map((item, i) => {
          const Icon = item.icon;
          return (
            <Col xl={3} lg={4} md={6} sm={6} xs={12} key={i} className="mb-4">
              <Card
                className="shadow border-0 text-white h-100"
                style={{
                  background: item.gradient,
                  transition: "transform 0.3s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <CardBody className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-uppercase small opacity-75">
                      {item.title}
                    </div>
                    <h2 className="fw-bold mb-0 text-white">{item.value}</h2>
                  </div>
                  <div className="bg-white bg-opacity-25 rounded-circle p-3">
                    <Icon size={26} />
                  </div>
                </CardBody>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* ---------- SECOND ROW ---------- */}
      <Row>
        {/* CALENDAR */}
        <Col lg={4} md={12} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <CardBody>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0">
                  <FaCalendarAlt className="me-2 text-primary" />
                  {currentMonth} {currentYear}
                </h5>
              </div>

              <div className="d-grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center fw-semibold text-muted small">
                    {d}
                  </div>
                ))}

                {[...Array(startDay)].map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const isToday = day === today.getDate();
                  return (
                    <div
                      key={day}
                      className={`text-center py-2 rounded ${isToday ? "bg-primary text-white fw-bold" : "bg-light"
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

        {/* QUICK TOOLS */}
        <Col lg={6} md={12} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <CardBody>
              <h5 className="fw-bold mb-3">Quick Actions</h5>

              <Row className="g-3">
                <Col md={4} sm={6} xs={12}>
                  <Button color="primary" className="w-100 py-3 fw-semibold">
                    <FaPlus className="mb-1" />
                    <div>Add University</div>
                  </Button>
                </Col>

                <Col md={4} sm={6} xs={12}>
                  <Button color="success" className="w-100 py-3 fw-semibold">
                    <FaPlus className="mb-1" />
                    <div>Add College</div>
                  </Button>
                </Col>

                <Col md={4} sm={12} xs={12}>
                  <Button color="warning" className="w-100 py-3 fw-semibold text-white">
                    <FaPlus className="mb-1" />
                    <div>Publish News</div>
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
