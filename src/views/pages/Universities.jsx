import { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, CardBody,
  Nav, NavItem, NavLink, TabContent, TabPane,
  Badge, Spinner,
} from "reactstrap";
import { FaUniversity } from "react-icons/fa";
import PageLayout from "../../components/PageLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import axios from "axios";
import { FaMapLocation } from "react-icons/fa6";

const EXTERNAL_API_URL = import.meta.env.VITE_EXTERNAL_API_URL;

/* ─── Logo with fallback ──────────────────────────────────────── */
const UniversityLogo = ({ src, alt }) => {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div
        className="d-flex align-items-center justify-content-center rounded-3 bg-white border"
        style={{ width: 48, height: 48 }}
      >
        <FaUniversity size={20} color="#6366f1" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="rounded-3 border bg-white object-fit-contain"
      style={{ width: 48, height: 48 }}
      onError={() => setErrored(true)}
    />
  );
};

/* ─── Single info row ─────────────────────────────────────────── */
const InfoRow = ({ icon, label, value, badge, badgeColor }) => (
  <div className="d-flex align-items-start gap-1">
    <span style={{ fontSize: 12, lineHeight: "20px", flexShrink: 0 }}>{icon}</span>
    <span
      className="text-muted"
      style={{ fontSize: 11, minWidth: 54, lineHeight: "20px", flexShrink: 0 }}
    >
      {label}
    </span>
    {badge ? (
      <Badge color={badgeColor || "secondary"} pill style={{ fontSize: 10.5 }}>
        {value || "—"}
      </Badge>
    ) : (
      <span
        className="fw-medium text-dark"
        style={{ fontSize: 12, lineHeight: "20px", wordBreak: "break-word" }}
      >
        {value || "—"}
      </span>
    )}
  </div>
);

/* ─── University Card ─────────────────────────────────────────── */
const UniversityCard = ({ university }) => (
  <div className="border rounded-3 bg-white overflow-hidden"
    style={{ transition: "box-shadow .2s", cursor: "default" }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,.13)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
  >
    <Row className="g-0 align-items-stretch">
      {/* Logo */}
      <Col
        xs={3} sm={2} md="auto"
        className="d-flex align-items-center justify-content-center border-end"
        style={{ minWidth: 72, background: "linear-gradient(135deg,#f0e8ff,#e8f4fd)" }}
      >
        <UniversityLogo
          src={university.profileImgUrl || university.universityLogo}
          alt={university.name}
        />
      </Col>

      {/* Main info */}
      <Col xs={9} sm={10} md className="border-end px-3 py-2" style={{ minWidth: 0 }}>
        <p
          className="fw-bold mb-2 d-flex align-items-center flex-wrap gap-1"
          style={{
            fontSize: "13px",
            color: "#1e1b4b",
            lineHeight: 1.5,
          }}
        >
          <span>{university.name}</span>

          <span
            className="px-2 py-1 rounded-pill"
            style={{
              background: "#c7f1fe",
              color: "#793004",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            ⭐ NAAC: {university.naacGrade || "N/A"}
          </span>
        </p>
        <div className="d-flex flex-column gap-1 ">
          <InfoRow icon="🎓" label="Mode" value={university.educationMode} />
          <InfoRow icon="📍" label="Address" value={university.address} />
          <InfoRow icon="📅" label="Est." value={university.establishYear} badge badgeColor="primary" />
          {/* <InfoRow icon="⭐" label="NAAC"    value={university.naacGrade || "N/A"} badge badgeColor="success" /> */}
        </div>
      </Col>

      {/* Contact & Location */}
      <Col xs={12} md={4} lg={4} xl={3}
        className="border-end px-3 py-2"
        style={{ maxWidth: 350 }}
      >
        <p
          className="text-uppercase text-muted fw-bold mb-2"
          style={{ fontSize: 9.5, letterSpacing: ".07em" }}
        >
          Contact &amp; Location
        </p>
        <div className="d-flex flex-column gap-1">
          <InfoRow icon="✉️" label="Email" value={university.universityEmail} />
          <InfoRow icon="📞" label="Phone" value={university.contactNumber} />
          <InfoRow icon="🏙" label="District" value={university.districtName} />
          <InfoRow icon="🏛" label="Assembly" value={university.vidhansabhaName} />
        </div>
      </Col>

      {/* Actions */}
      <Col xs={12} md="auto"
        className="d-flex flex-row flex-md-column align-items-center justify-content-center gap-2 px-3 py-2"
        style={{ minWidth: 150 }}
      >
        {university.googleLocation && (
          <a
            href={university.googleLocation}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-warning px-3 fw-semibold text-danger border border-dark"
            style={{ fontSize: 11.5, borderRadius: 20 }}
          >
            <FaMapLocation /> Map
          </a>
        )}
        {university.universityUrl && (
          <a
            href={university.universityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-primary px-3 fw-semibold"
            style={{ fontSize: 11.5, borderRadius: 20 }}
          >
            🌐 Website
          </a>
        )}
      </Col>
    </Row>
  </div>
);

/* ─── Tab config ──────────────────────────────────────────────── */
const TABS = [
  { id: "STATE", typeVal: "1", en: "State", hi: "राज्य", color: "primary" },
  { id: "PRIVATE", typeVal: "0", en: "Private", hi: "निजी", color: "success" },
  { id: "CENTRAL", typeVal: "2", en: "Central", hi: "केंद्रीय", color: "warning" },
];

/* ─── Main Component ──────────────────────────────────────────── */
const Universities = () => {
  const { isHindi } = useLanguage();

  const [activeTab, setActiveTab] = useState("STATE");
  const [universities, setUniversities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [allVidhansabha, setAllVidhansabha] = useState([]);
  const [vidhansabhaList, setVidhansabhaList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVidhansabha, setSelectedVidhansabha] = useState("");
  const [loading, setLoading] = useState(false);

  const breadcrumb = [
    { label: isHindi ? "मुख्य पृष्ठ" : "Home", path: "/" },
    { label: isHindi ? "विश्वविद्यालय" : "Universities", active: true },
  ];

  useEffect(() => {
    axios.get(`${EXTERNAL_API_URL}/api/district/get-all-district`)
      .then((res) => setDistricts(res.data || []))
      .catch((err) => console.error("District fetch error", err));
  }, []);

  useEffect(() => {
    axios.get(`${EXTERNAL_API_URL}/api/district/get-all-vidhansabha`)
      .then((res) => { setAllVidhansabha(res.data || []); setVidhansabhaList(res.data || []); })
      .catch((err) => console.error("Vidhansabha fetch error", err));
  }, []);

  useEffect(() => {
    if (!selectedDistrict) {
      setVidhansabhaList(allVidhansabha);
    } else {
      setVidhansabhaList(
        allVidhansabha.filter((v) => String(v.districtLGDCode) === String(selectedDistrict))
      );
    }
    setSelectedVidhansabha("");
  }, [selectedDistrict, allVidhansabha]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDistrict) params.district = selectedDistrict;
      if (selectedVidhansabha) params.vidhansabha = selectedVidhansabha;
      const res = await axios.get(
        `${EXTERNAL_API_URL}/api/university/get-all-university-form-main-hesite`,
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

  useEffect(() => { fetchUniversities(); }, [selectedDistrict, selectedVidhansabha]);

  const filtered = universities.filter((u) => {
    const tab = TABS.find((t) => t.id === activeTab);
    return tab ? String(u.universityType) === tab.typeVal : false;
  });

  const clearFilters = () => {
    setSelectedDistrict("");
    setSelectedVidhansabha("");
    setVidhansabhaList(allVidhansabha);
  };

  return (
    <PageLayout
      title={isHindi ? "विश्वविद्यालय" : "Universities"}
      titleHi="विश्वविद्यालय"
      breadcrumb={breadcrumb}
    >
      <Container>
        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm rounded-4 m-0 p-2">
              <CardBody className="p-1">

                {/* ── Header ── */}
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="rounded-3 p-2 me-3 flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#ede9fe,#e0f2fe)" }}
                  >
                    <FaUniversity size={26} color="#6366f1" />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">
                      {isHindi ? "छत्तीसगढ़ के विश्वविद्यालय" : "Universities in Chhattisgarh"}
                    </h5>
                    <p className="text-muted mb-0" style={{ fontSize: 12.5 }}>
                      {isHindi
                        ? "राज्य में उच्च शिक्षा के प्रमुख केंद्र"
                        : "Leading Centers of Higher Education in the State"}
                    </p>
                  </div>
                </div>

                <hr className="my-3" />

                {/* ── Single toolbar row: tabs | filters | count ── */}
                <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">

                  {/* Type Tabs */}
                  <Nav pills className="gap-1 flex-shrink-0">
                    {TABS.map(({ id, en, hi, color }) => (
                      <NavItem key={id}>
                        <NavLink
                          className={[
                            "fw-semibold py-1 px-3",
                            activeTab === id
                              ? `bg-${color} ${color === "warning" ? "text-dark" : "text-white"}`
                              : `border border-${color} text-${color} bg-white`,
                          ].join(" ")}
                          style={{ fontSize: 12.5, borderRadius: 20, cursor: "pointer" }}
                          onClick={() => setActiveTab(id)}
                        >
                          {isHindi ? hi : en}
                        </NavLink>
                      </NavItem>
                    ))}
                  </Nav>

                  {/* Vertical divider */}
                  <div
                    className="border-start flex-shrink-0"
                    style={{ height: 28 }}
                  />

                  {/* District */}
                  <select
                    className="form-select form-select-sm flex-shrink-0 py-2"
                    style={{ width: 160, fontSize: 12.5 }}
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

                  {/* Vidhansabha */}
                  <select
                    className="form-select form-select-sm flex-shrink-0 py-2  "
                    style={{ width: 175, fontSize: 12.5 }}
                    value={selectedVidhansabha}
                    onChange={(e) => setSelectedVidhansabha(e.target.value)}
                  >
                    <option value="">{isHindi ? "सभी विधानसभा" : "All Vidhansabha"}</option>
                    {vidhansabhaList.map((v) => (
                      <option key={v._id} value={v.ConstituencyNumber}>
                        {v.ConstituencyName}
                      </option>
                    ))}
                  </select>

                  {/* Clear */}
                  {(selectedDistrict || selectedVidhansabha) && (
                    <button
                      className="btn btn-sm bg-danger text-white border-dark flex-shrink-0"
                      style={{ fontSize: 12, borderRadius: 8 }}
                      onClick={clearFilters}
                    >
                      ✕ {isHindi ? "साफ करें" : "Clear"}
                    </button>
                  )}

                  {/* Result count */}
                  <Badge
                    color="dark"
                    className="ms-auto flex-shrink-0"
                    style={{ fontSize: 11.5 }}
                  >
                    {loading ? "…" : `${filtered.length} ${isHindi ? "विश्वविद्यालय" : `Universit${filtered.length === 1 ? "y" : "ies"}`}`}
                  </Badge>

                </div>

                {/* ── Tab Content ── */}
                <TabContent activeTab={activeTab}>
                  {TABS.map(({ id }) => (
                    <TabPane tabId={id} key={id}>
                      {loading ? (
                        <div className="text-center py-5">
                          <Spinner color="primary" size="sm" className="me-2" />
                          <span className="text-muted" style={{ fontSize: 13 }}>
                            {isHindi ? "लोड हो रहा है..." : "Loading..."}
                          </span>
                        </div>
                      ) : filtered.length > 0 ? (
                        <div className="d-flex flex-column gap-2 fw-bold">
                          {filtered.map((university) => (
                            <UniversityCard key={university._id} university={university} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-5 text-muted">
                          <FaUniversity size={30} style={{ opacity: .2, display: "block", margin: "0 auto 8px" }} />
                          <p className="mb-0" style={{ fontSize: 13 }}>
                            {isHindi ? "कोई डेटा उपलब्ध नहीं है" : "No universities found"}
                          </p>
                        </div>
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