import { Row, Col, Card, CardBody, CardTitle } from "reactstrap";
import {
  FaUniversity,
  FaSchool,
  FaNewspaper,
  FaBell
} from "react-icons/fa";

const stats = [
  { title: "Universities", icon: FaUniversity, value: 15, color: "primary" },
  { title: "Colleges", icon: FaSchool, value: 325, color: "success" },
  { title: "News", icon: FaNewspaper, value: 48, color: "warning" },
  { title: "Notifications", icon: FaBell, value: 12, color: "danger" }
];

const AdminDashboard = () => {
  return (
    <>
      <h3 className="mb-4">Dashboard</h3>

      <Row>
        {stats.map((item, i) => {
          const Icon = item.icon;
          return (
            <Col md={3} sm={6} xs={12} key={i} className="mb-3">
              <Card color={item.color} inverse>
                <CardBody className="text-center">
                  <Icon size={30} />
                  <CardTitle className="mt-2">{item.title}</CardTitle>
                  <h2>{item.value}</h2>
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
