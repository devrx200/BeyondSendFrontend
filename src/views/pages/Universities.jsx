import { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, CardBody,
  Nav, NavItem, NavLink, TabContent, TabPane
} from "reactstrap";
import { FaUniversity } from "react-icons/fa";
import PageLayout from "../../components/PageLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import axios from "axios";

const DEFAULT_LOGO = "/images/university-placeholder.png";
const EXTERNAL_API_URL = import.meta.env.VITE_EXTERNAL_API_URL;
console.log("Using API URL:", EXTERNAL_API_URL);
const Universities = () => {
  const { isHindi } = useLanguage();
  const [activeTab, setActiveTab]         = useState("STATE");
  const [universities, setUniversities]   = useState([]);
  const [districts, setDistricts]         = useState([]);
  const [allVidhansabha, setAllVidhansabha] = useState([]);
  const [vidhansabhaList, setVidhansabhaList] = useState([]);
  const [selectedDistrict, setSelectedDistrict]     = useState("");
  const [selectedVidhansabha, setSelectedVidhansabha] = useState("");
  const [loading, setLoading] = useState(false);

  const breadcrumb = [
    { label: isHindi ? "मुख्य पृष्ठ" : "Home", path: "/" },
    { label: isHindi ? "विश्वविद्यालय" : "Universities", active: true },
  ];

  // ── Fetch districts from API ──────────────────────────────────────────────
  useEffect(() => {
    axios
      .get(`${EXTERNAL_API_URL}/api/district/get-all-district`)
      .then((res) => setDistricts(res.data || []))
      .catch((err) => console.error("District fetch error", err));
  }, []);

  // ── Fetch all vidhansabha from API ────────────────────────────────────────
  useEffect(() => {
    axios
      .get(`${EXTERNAL_API_URL}/api/district/get-all-vidhansabha`)
      .then((res) => {
        setAllVidhansabha(res.data || []);
        setVidhansabhaList(res.data || []);
      })
      .catch((err) => console.error("Vidhansabha fetch error", err));
  }, []);


  const clearFilters = () => {
    setSelectedDistrict("");
    setSelectedVidhansabha("");
    setVidhansabhaList(allVidhansabha);
  };

  // ── Fetch universities (with filter params) ───────────────────────────────
  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const params = {};
       if (selectedDistrict) {
      params.district = selectedDistrict;
    }

    if (selectedVidhansabha) {
      params.vidhansabha = selectedVidhansabha;
    }

      const res = await axios.get(
        `${EXTERNAL_API_URL}/api/university/get-all-university-form-main-hrmis`,
        { params }
      );
      setUniversities(res.data.data || []);
    } catch (err) {
      console.error("University fetch error", err);
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, [selectedDistrict, selectedVidhansabha]);

  // ── Tab filter (client-side) ──────────────────────────────────────────────
  const filtered = universities.filter((u) => {
    if (activeTab === "STATE")   return String(u.universityType) === "1";
    if (activeTab === "PRIVATE") return String(u.universityType) === "0";
    if (activeTab === "CENTRAL") return String(u.universityType) === "2";
    return false;
  });

  // ── Shared select style ───────────────────────────────────────────────────
  const selectStyle = {
    padding: "8px 32px 8px 12px",
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    fontSize: 13.5,
    color: "#374151",
    background: "#fff",
    cursor: "pointer",
    minWidth: 170,
    outline: "none",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
  };

 
const renderCards = (data) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 16,
      padding: 20,
      borderRadius: 16,
     background: "linear-gradient(135deg, #e8f4fd 0%, #f0e8ff 50%, #e8fff4 100%)",
            boxShadow: "0 2px 10px rgba(99,102,241,0.08), 0 1px 3px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
    }}
  >
    {data.map((university) => (
      <div
        key={university._id}
        style={{
          display: "grid",
          gridTemplateColumns: "80px 1fr 1fr",
          gap: 20,
          alignItems: "start",
          background: "#fff",
          borderRadius: 16,
          padding: "20px 24px",
          position: "relative",
          boxShadow:
            "0 2px 12px rgba(99,102,241,0.08), 0 1px 3px rgba(0,0,0,0.06)",
          transition: "box-shadow 0.2s, transform 0.2s",
        }}
      >
        {/* ───────────────── Buttons ───────────────── */}
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 18,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {university.googleLocation && (
            <a
              href={university.googleLocation}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                padding: "5px 13px",
                borderRadius: 20,
                border: "1.5px solid #e5e7eb",
                background: "#f9fafb",
                color: "#374151",
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              📍 Map
            </a>
          )}

          {university.universityUrl && (
            <a
              href={university.universityUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                padding: "5px 13px",
                borderRadius: 20,
                background:
                  "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                border: "none",
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              🌐 Website
            </a>
          )}
        </div>

        {/* ───────────────── Logo ───────────────── */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 14,
            flexShrink: 0,
            background:
              "linear-gradient(135deg, #f0e8ff, #e8f4fd)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={university.universityLogo || DEFAULT_LOGO}
            alt={university.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: 8,
            }}
          />
        </div>

        {/* ───────────────── Left Info ───────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#1e1b4b",
              margin: "0 0 10px",
              lineHeight: 1.4,
              paddingRight: 180,
            }}
          >
            {university.name}
          </p>

          {/* Education Mode */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              fontSize: 13.5,
            }}
          >
            <span
              style={{
                color: "#6b7280",
                minWidth: 120,
                fontSize: 13,
              }}
            >
              🎓 Education Mode
            </span>

            <span
              style={{
                color: "#1f2937",
                fontWeight: 500,
              }}
            >
              {university.educationMode || "—"}
            </span>
          </div>

          {/* Address */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              fontSize: 13.5,
            }}
          >
            <span
              style={{
                color: "#6b7280",
                minWidth: 120,
                fontSize: 13,
              }}
            >
              📍 Address
            </span>

            <span
              style={{
                color: "#1f2937",
                fontWeight: 500,
                lineHeight: 1.6,
              }}
            >
              {university.address || "—"}
            </span>
          </div>

          {/* Establish Year */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#6b7280",
                minWidth: 120,
                fontSize: 13,
              }}
            >
              📅 Establishment
            </span>

            <span
              style={{
                background: "#dbeafe",
                color: "#1d4ed8",
                fontSize: 12,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 20,
              }}
            >
              {university.establishYear ?? "—"}
            </span>
          </div>

          {/* NAAC */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#6b7280",
                minWidth: 120,
                fontSize: 13,
              }}
            >
              ⭐ NAAC Grade
            </span>

            <span
              style={{
                background: "#dcfce7",
                color: "#15803d",
                fontSize: 12,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 20,
              }}
            >
              {university.naacGrade || "N/A"}
            </span>
          </div>
        </div>

        {/* ───────────────── Right Info ───────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 7,
            paddingLeft: 16,
            borderLeft: "2px solid #f3f4f6",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#9ca3af",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: "0 0 4px",
            }}
          >
            Contact & Affiliation
          </p>

          {/* Email */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              fontSize: 13.5,
            }}
          >
            <span
              style={{
                color: "#6b7280",
                minWidth: 80,
                fontSize: 13,
              }}
            >
              ✉️ Email
            </span>

            <span
              style={{
                color: "#1f2937",
                fontWeight: 500,
              }}
            >
              {university.universityEmail || "—"}
            </span>
          </div>

          {/* Contact */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              fontSize: 13.5,
            }}
          >
            <span
              style={{
                color: "#6b7280",
                minWidth: 80,
                fontSize: 13,
              }}
            >
              📞 Contact
            </span>

            <span
              style={{
                color: "#1f2937",
                fontWeight: 500,
              }}
            >
              {university.contactNumber || "—"}
            </span>
          </div>

          {/* District */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              fontSize: 13.5,
            }}
          >
            <span
              style={{
                color: "#6b7280",
                minWidth: 80,
                fontSize: 13,
              }}
            >
              🏙 District
            </span>

            <span
              style={{
                color: "#1f2937",
                fontWeight: 500,
              }}
            >
              {university.districtName || "—"}
            </span>
          </div>

          {/* Vidhan Sabha */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              fontSize: 13.5,
            }}
          >
            <span
              style={{
                color: "#6b7280",
                minWidth: 80,
                fontSize: 13,
              }}
            >
              🏛 Assembly
            </span>

            <span
              style={{
                color: "#1f2937",
                fontWeight: 500,
              }}
            >
              {university.vidhansabhaName || "—"}
            </span>
          </div>
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
      <Container>
        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm rounded-4">
              <CardBody className="p-4">

                {/* ── Header ── */}
                <div className="d-flex align-items-center mb-4">
                  <FaUniversity size={42} className="text-primary me-3" />
                  <div>
                    <h2 className="mb-1">
                      {isHindi ? "छत्तीसगढ़ के विश्वविद्यालय" : "Universities in Chhattisgarh"}
                    </h2>
                    <p className="text-muted mb-0">
                      {isHindi
                        ? "राज्य में उच्च शिक्षा के प्रमुख केंद्र"
                        : "Leading Centers of Higher Education in the State"}
                    </p>
                  </div>
                </div>
                <hr />

                {/* ── District & Vidhansabha Filters ── */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>

                  {/* District */}
                  <select
                    style={selectStyle}
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  >
                    <option value="">{isHindi ? "सभी जिले" : "All Districts"}</option>
                    {districts.map((d) => (
                      <option key={d._id} value={d.LGDCode}>
                        {d.districtNameEng || d.name}
                      </option>
                    ))}
                  </select>

                  {/* Vidhansabha — narrows when district selected */}
                  <select
                    style={selectStyle}
                    value={selectedVidhansabha}
                    onChange={(e) => setSelectedVidhansabha(e.target.value)}
                  >
                    <option value="">{isHindi ? "सभी विधानसभा" : "All Vidhansabha"}</option>
                    {vidhansabhaList.map((v) => (
                      <option key={v._id} value={v.ConstituencyNumber}>
                        {v.ConstituencyName  }
                      </option>
                    ))}
                  </select>

                  {/* Clear button — only shown when a filter is active */}
                  {(selectedDistrict || selectedVidhansabha) && (
                    <button
                      onClick={clearFilters}
                      style={{
                        padding: "8px 15px", borderRadius: 10,
                        border: "1.5px solid #e5e7eb", background: "#fff",
                        fontSize: 13, color: "#6b7280", cursor: "pointer", fontWeight: 600,
                      }}
                    >
                      ✕ {isHindi ? "साफ करें" : "Clear"}
                    </button>
                  )}

                  {/* Result count */}
                  <span style={{ marginLeft: "auto", fontSize: 12.5, color: "#9ca3af" }}>
                    {filtered.length} {isHindi
                      ? "विश्वविद्यालय"
                      : `universit${filtered.length === 1 ? "y" : "ies"} found`}
                  </span>
                </div>

                {/* ── Tabs ── */}
                <Nav pills className="mb-4 gap-2">
                  {[
                    { id: "STATE",   en: "State Universities",   hi: "राज्य विश्वविद्यालय",   cls: "primary" },
                    { id: "PRIVATE", en: "Private Universities",  hi: "निजी विश्वविद्यालय",    cls: "success" },
                    { id: "CENTRAL", en: "Central Universities",  hi: "केंद्रीय विश्वविद्यालय", cls: "warning" },
                  ].map(({ id, en, hi, cls }) => (
                    <NavItem key={id}>
                      <NavLink
                        className={`px-4 py-2 rounded fw-bold ${
                          activeTab === id
                            ? `bg-${cls} ${cls === "warning" ? "text-dark" : "text-white"}`
                            : `border border-${cls} text-${cls}`
                        }`}
                        onClick={() => setActiveTab(id)}
                        style={{ cursor: "pointer" }}
                      >
                        {isHindi ? hi : en}
                      </NavLink>
                    </NavItem>
                  ))}
                </Nav>

                {/* ── Tab Content ── */}
                <TabContent activeTab={activeTab}>
                  {["STATE", "PRIVATE", "CENTRAL"].map((tab) => (
                    <TabPane tabId={tab} key={tab}>
                      {loading ? (
                        <p className="text-center mt-4 text-muted">
                          {isHindi ? "लोड हो रहा है..." : "Loading..."}
                        </p>
                      ) : filtered.length > 0 ? (
                        renderCards(filtered)
                      ) : (
                        <p className="text-center mt-4 text-muted">
                          {isHindi ? "कोई डेटा उपलब्ध नहीं है" : "No universities found"}
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