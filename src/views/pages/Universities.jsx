import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Table,
  Badge
} from "reactstrap";
import {
  FaUniversity,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe
} from "react-icons/fa";
import PageLayout from "../../components/PageLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const DEFAULT_LOGO = "/images/university-placeholder.png";

const Universities = () => {
  const { isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState("STATE");
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);

  const breadcrumb = [
    { label: isHindi ? "मुख्य पृष्ठ" : "Home", path: "/" },
    { label: isHindi ? "विश्वविद्यालय" : "Universities", active: true }
  ];

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/get-universities`);
      setUniversities(res.data.data || []);
    } catch (err) {
      console.error("University fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);


  const filtered = universities.filter(
    (u) =>
      u.universityType === activeTab &&
      u.universityStatus === "ACTIVE" &&
      !u.isDeleted
  );

  const renderTable = (data) => (
    <Table responsive hover className="mt-4 align-middle">
      <thead className="table-light">
        <tr>
          <th>S.No</th>
          <th>{isHindi ? "विश्वविद्यालय" : "University"}</th>
          <th>{isHindi ? "स्थान" : "Location"}</th>
          <th>{isHindi ? "स्थापना" : "Established"}</th>
          <th>{isHindi ? "संपर्क" : "Contact"}</th>
          <th>{isHindi ? "वेबसाइट" : "Website"}</th>
        </tr>
      </thead>
      <tbody>
        {data.map((uni, index) => (
          <tr key={uni._id}>
            <td>{index + 1}</td>

            <td>
              <div className="d-flex align-items-center gap-3">
                <img
                  src={uni.universityLogo || DEFAULT_LOGO}
                  alt={uni.universityNameEng}
                  style={{
                    width: 50,
                    height: 50,
                    objectFit: "contain",
                    borderRadius: 8,
                    background: "#f8f9fa",
                    padding: 5
                  }}
                />
                <div>
                  <div className="fw-bold">
                    {isHindi
                      ? uni.universityNameHindi
                      : uni.universityNameEng}
                  </div>
                  <small className="text-muted">
                    {uni.universityShortName}
                  </small>
                </div>
              </div>
            </td>

            <td>
              <FaMapMarkerAlt className="me-1 text-danger" />
              {uni.universityAddress || "-"}
            </td>

            <td>
              <Badge color="info">
                {uni.establishYear || "-"}
              </Badge>
            </td>

            <td>
              <div className="small">
                <div>
                  <FaPhone className="me-1" />
                  {uni.contactNumber || "-"}
                </div>
                <div>
                  <FaEnvelope className="me-1" />
                  {uni.universityEmail || "-"}
                </div>
              </div>
            </td>

            <td>
              {uni.universityWebsiteUrl ? (
                <a
                  href={uni.universityWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary"
                >
                  <FaGlobe className="me-1" />
                  {isHindi ? "वेबसाइट" : "Visit"}
                </a>
              ) : "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <PageLayout
      title={isHindi ? "विश्वविद्यालय" : "Universities"}
      titleHi="विश्वविद्यालय"
      breadcrumb={breadcrumb}
    >
      <Container >
        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm rounded-4">
              <CardBody className="p-4 m-0">
                {/* HEADER */}
                <div className="d-flex align-items-center mb-4">
                  <FaUniversity size={42} className="text-primary me-3" />
                  <div>
                    <h2 className="mb-1">
                      {isHindi
                        ? "छत्तीसगढ़ के विश्वविद्यालय"
                        : "Universities in Chhattisgarh"}
                    </h2>
                    <p className="text-muted mb-0">
                      {isHindi
                        ? "राज्य में उच्च शिक्षा के प्रमुख केंद्र"
                        : "Leading Centers Of Higher Education In The State."}
                    </p>
                  </div>
                </div>
                <hr/>

                {/* COLOURFUL TABS */}
                <Nav pills className="mb-4 gap-2">
                  <NavItem>
                    <NavLink
                      className={`px-4 py-2 rounded fw-bold ${
                        activeTab === "STATE"
                          ? "bg-primary text-white"
                          : "border border-primary text-primary"
                      }`}
                      onClick={() => setActiveTab("STATE")}
                      style={{ cursor: "pointer" }}
                    >
                      {isHindi ? "राज्य विश्वविद्यालय" : "State Universities"}
                    </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink
                      className={`px-4 py-2 rounded fw-bold ${
                        activeTab === "PRIVATE"
                          ? "bg-success text-white"
                          : "border border-success text-success"
                      }`}
                      onClick={() => setActiveTab("PRIVATE")}
                      style={{ cursor: "pointer" }}
                    >
                      {isHindi ? "निजी विश्वविद्यालय" : "Private Universities"}
                    </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink
                      className={`px-4 py-2 rounded fw-bold ${
                        activeTab === "CENTRAL"
                          ? "bg-warning text-dark"
                          : "border border-warning text-warning"
                      }`}
                      onClick={() => setActiveTab("CENTRAL")}
                      style={{ cursor: "pointer" }}
                    >
                      {isHindi ? "केंद्रीय विश्वविद्यालय" : "Central Universities"}
                    </NavLink>
                  </NavItem>
                </Nav>

                {/* TAB CONTENT */}
                <TabContent activeTab={activeTab}>
                  {["STATE", "PRIVATE", "CENTRAL"].map((tab) => (
                    <TabPane tabId={tab} key={tab}>
                      {loading ? (
                        <p className="text-center mt-4">Loading...</p>
                      ) : filtered.length > 0 ? (
                        renderTable(filtered)
                      ) : (
                        <p className="text-center mt-4 text-muted">
                          {isHindi
                            ? "कोई डेटा उपलब्ध नहीं है"
                            : "No universities found"}
                        </p>
                      )}
                    </TabPane>
                  ))}
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
};

export default Universities;
