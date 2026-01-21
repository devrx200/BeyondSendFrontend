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
  Badge,
  Input, Button
} from "reactstrap";
import { FaSchool, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import axios from "axios";
import PageLayout from "../../components/PageLayout";
import { useLanguage } from "../../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

const Colleges = () => {
  const { isHindi } = useLanguage();

  const [colleges, setColleges] = useState([]);
  const [activeTab, setActiveTab] = useState("Government");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const breadcrumb = [
    { label: isHindi ? "मुख्य पृष्ठ" : "Home", path: "/" },
    { label: isHindi ? "महाविद्यालय" : "Colleges", active: true },
  ];

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/get-all-college`);
        setColleges(res.data || []);
      } catch (err) {
        console.error("Failed to load colleges");
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  const filteredColleges = colleges
    .filter((c) => c.type === activeTab)
    .filter(
      (c) =>
        (isHindi ? c.nameHi : c.nameEn)
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const renderTable = () => (
    <Table responsive hover striped className="mt-3 align-middle">
      <thead className="table-primary">
        <tr>
          <th>#</th>
          <th>{isHindi ? "नाम" : "Name"}</th>
          <th>{isHindi ? "स्थान" : "Location"}</th>
          <th>{isHindi ? "स्तर" : "Level"}</th>
          <th>{isHindi ? "पाठ्यक्रम" : "Courses"}</th>
        </tr>
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td colSpan="5" className="text-center py-4">
              {isHindi ? "लोड हो रहा है..." : "Loading..."}
            </td>
          </tr>
        ) : filteredColleges.length === 0 ? (
          <tr>
            <td colSpan="5" className="text-center text-muted py-4">
              {isHindi
                ? "कोई महाविद्यालय नहीं मिला"
                : "No colleges found"}
            </td>
          </tr>
        ) : (
          filteredColleges.map((college, index) => (
            <tr key={college._id}>
              <td>{index + 1}</td>

              <td>
                <strong>
                  {isHindi ? college.nameHi : college.nameEn}
                </strong>
              </td>

              <td>
                <FaMapMarkerAlt className="text-danger me-1" />
                {college.location}
              </td>

              <td>
                <Badge color="warning">
                  {college.collegeLevel}
                </Badge>
              </td>

              <td>
                {college.courses?.map((course, idx) => (
                  <Badge
                    key={idx}
                    color="secondary"
                    className="me-1 mb-1"
                  >
                    {course}
                  </Badge>
                ))}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );

  return (
    <PageLayout
      title={isHindi ? "महाविद्यालय" : "Colleges"}
      titleHi="महाविद्यालय"
      breadcrumb={breadcrumb}
    >
      <Container className="py-5">
        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm rounded-4">
              <CardBody className="p-4">

                {/* HEADER */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                  <div className="d-flex align-items-center mb-3 mb-md-0">
                    <FaSchool size={40} className="text-primary me-3" />
                    <div>
                      <h3 className="mb-1 fw-bold">
                        {isHindi
                          ? "छत्तीसगढ़ के महाविद्यालय"
                          : "Colleges in Chhattisgarh"}
                      </h3>
                      <small className="text-muted">
                        {isHindi
                          ? "राज्य के सभी शासकीय, निजी एवं अनुदानित महाविद्यालय"
                          : "Government, Private and Aided colleges"}
                      </small>
                    </div>
                  </div>


                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3">

                  <Nav pills className="gap-2">
                    {["Government", "Private", "Aided"].map((type) => (
                      <NavItem key={type}>
                        <NavLink
                          active={activeTab === type}
                          onClick={() => setActiveTab(type)}
                          style={{ cursor: "pointer" }}
                          className="px-3 py-2 fw-semibold"
                        >
                          {isHindi
                            ? type === "Government"
                              ? "शासकीय"
                              : type === "Private"
                                ? "निजी"
                                : "अनुदानित"
                            : type}
                        </NavLink>
                      </NavItem>
                    ))}
                  </Nav>

                  <div
                    className="d-flex align-items-center border rounded-pill px-2 bg-white shadow-sm"
                    style={{ maxWidth: 320, width: "100%" }}
                  >
                    <Input
                      type="text"
                      placeholder={isHindi ? "खोजें..." : "Search colleges..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-0 shadow-none px-3"
                      style={{ flex: 1 }}
                    />

                    <Button
                      color="primary"
                      size="sm"
                      className="rounded-circle d-flex align-items-center justify-content-center p-0"
                      style={{
                        width: 50,
                        height: 50,
                        minWidth: 50,
                      }}
                    >
                      <FaSearch size={20} className="text-white" />
                    </Button>

                  </div>
                </div>


                <TabContent activeTab={activeTab}>
                  <TabPane tabId={activeTab}>
                    {renderTable()}
                  </TabPane>
                </TabContent>

              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
};

export default Colleges;
