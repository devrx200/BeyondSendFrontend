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
      const res = await axios.get(`http://localhost:3001/lmsbackend/api/university/get-all-university-form-main-hrmis`);
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


const filtered = universities.filter((u) => {
  if (activeTab === "STATE") {
    return String(u.universityType) === "1";
  }

  if (activeTab === "PRIVATE") {
    return String(u.universityType) === "0";
  }

  if (activeTab === "CENTRAL") {
    return String(u.universityType) === "2";
  }

  return false;
});

  const renderTable = (data) => (

<div style={{
  display: "flex", flexDirection: "column", gap: 16,
  padding: 20, borderRadius: 16,
  background: "linear-gradient(135deg, #e8f4fd 0%, #f0e8ff 50%, #e8fff4 100%)"
}}>
  {data.map((university) => (
    <div
      key={university._id}
      style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr 1fr",
        gap: 20, alignItems: "start",
        background: "#fff",
        borderRadius: 16, padding: "20px 24px",
        boxShadow: "0 2px 12px rgba(99,102,241,0.08), 0 1px 3px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
    >
      {/* Logo */}
      <div style={{
        width: 80, height: 80, borderRadius: 14, flexShrink: 0,
        background: "linear-gradient(135deg, #f0e8ff, #e8f4fd)",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
      }}>
        <img src={university.universityLogo || DEFAULT_LOGO} alt={university.name}
          style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }} />
      </div>

      {/* Left Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#1e1b4b", margin: "0 0 10px", lineHeight: 1.4 }}>
          {university.name}
        </p>
        {/* rows */}
        {[
          { icon: "🎓", label: "Education Mode", value: university.educationMode },
          { icon: "📍", label: "Location", value: university.address },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5 }}>
            <span style={{ color: "#6b7280", minWidth: 80, fontSize: 13 }}>{icon} {label}</span>
            <span style={{ color: "#1f2937", fontWeight: 500 }}>{value || "—"}</span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: "#6b7280", minWidth: 80, fontSize: 13 }}>📅 Establishment Year</span>
          <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
            {university.establishYear || "—"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: "#6b7280", minWidth: 80, fontSize: 13 }}>⭐ NAAC</span>
          <span style={{ background: "#dcfce7", color: "#15803d", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
            {university.naacGrade || "N/A"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {university.googleLocation && (
            <a href={university.googleLocation} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12.5, padding: "6px 14px", borderRadius: 20, border: "1.5px solid #e5e7eb", background: "#f9fafb", color: "#374151", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
              📍 View Map
            </a>
          )}
          {university.universityUrl && (
            <a href={university.universityUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12.5, padding: "6px 14px", borderRadius: 20, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
              🌐 Visit Website
            </a>
          )}
        </div>
      </div>

      {/* Right Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7, paddingLeft: 16, borderLeft: "2px solid #f3f4f6" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" }}>
          Contact & Affiliation
        </p>
        {[
          { icon: "✉️", label: "Email", value: university.universityEmail },
          { icon: "📞", label: "Contact", value: university.contactNumber },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5 }}>
            <span style={{ color: "#6b7280", minWidth: 80, fontSize: 13 }}>{icon} {label}</span>
            <span style={{ color: "#1f2937", fontWeight: 500 }}>{value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
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
