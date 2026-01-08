import { Row, Col, Card, CardBody } from "reactstrap";
import {
  FaUniversity,
  FaSchool,
  FaNewspaper,
  FaBell
} from "react-icons/fa";

const stats = [
  {
    title: "Universities",
    icon: FaUniversity,
    value: 15,
    bg: "primary"
  },
  {
    title: "Colleges",
    icon: FaSchool,
    value: 325,
    bg: "success"
  },
  {
    title: "News",
    icon: FaNewspaper,
    value: 48,
    bg: "warning"
  },
  {
    title: "Notifications",
    icon: FaBell,
    value: 12,
    bg: "danger"
  }
];

const AdminDashboard = () => {
  return (
    <>
      <h4 className="mb-4 fw-bold">Dashboard Overview</h4>

      <Row>
        {stats.map((item, i) => {
          const Icon = item.icon;

          return (
            <Col
              key={i}
              xl={3}
              lg={4}
              md={6}
              sm={6}
              xs={12}
              className="mb-4"
            >
              <Card
                className={`bg-${item.bg} text-white shadow rounded-3`}
              >
                <CardBody>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-uppercase small opacity-75">
                        {item.title}
                      </div>
                      <h2 className="fw-bold mb-0">
                        {item.value}
                      </h2>
                    </div>

                    <div className="bg-white bg-opacity-25 rounded-circle p-3">
                      <Icon size={26} />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );
};

export default AdminDashboard;
