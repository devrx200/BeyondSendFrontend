import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Container, Row, Col, Card, CardBody, CardHeader, Badge,
  Button, ButtonGroup, Input, InputGroup, InputGroupText,
  Spinner, Pagination, PaginationItem, PaginationLink,
} from "reactstrap";
import PageLayout from "../../components/PageLayout";
import { useLanguage } from "../../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_EXTERNAL_API_URL;
const PAGE_SIZE = 10;

/* ── College type config  (0=Private, 1=Govt, 2=Aided/Central) ─── */
const COLLEGE_TYPES = [
  { key: "all", en: "All",          hi: "सभी",              color: "dark",    icon: "🏛️" },
  { key: "1",   en: "Govt",         hi: "सरकारी",            color: "primary", icon: "🏢" },
  { key: "0",   en: "Private",      hi: "निजी",              color: "success", icon: "🏫" },
  { key: "2",   en: "Aided/Central",hi: "अनुदानित/केंद्रीय", color: "warning", icon: "🏦" },
];

/* colour palette for type-filter buttons (avoids bootstrap "light" outline hover bug) */
const TYPE_BTN_COLORS = {
  all:     { active: "#1e293b", hover: "#334155", text: "#fff" },
  "1":     { active: "#1e3a8a", hover: "#2d4fad", text: "#fff" },
  "0":     { active: "#166534", hover: "#15803d", text: "#fff" },
  "2":     { active: "#92400e", hover: "#b45309", text: "#fff" },
};

/* ── NAAC badge colour ───────────────────────────────────────────── */
function naacColor(g) {
  if (!g || g === "N/A" || g === "Not Available") return "secondary";
  if (g.startsWith("A++")) return "success";
  if (g.startsWith("A"))   return "success";
  if (g.startsWith("B++")) return "primary";
  if (g.startsWith("B"))   return "warning";
  return "danger";
}

/* ── Confirm before opening external URL ────────────────────────── */
const openExternalUrl = (url, name, isHindi) => {
  Swal.fire({
    title: isHindi ? "बाहरी वेबसाइट" : "External Website",
    html: isHindi
      ? `आप <b>${name}</b> की आधिकारिक वेबसाइट पर जा रहे हैं।<br/><small class="text-muted">${url}</small>`
      : `You are about to visit the official website of<br/><b>${name}</b><br/><small class="text-muted">${url}</small>`,
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#1e3a8a",
    cancelButtonColor: "#6c757d",
    confirmButtonText: isHindi ? "🌐 जाएं" : "🌐 Proceed",
    cancelButtonText: isHindi ? "रद्द करें" : "Cancel",
    customClass: { popup: "rounded-4" },
  }).then((result) => {
    if (result.isConfirmed) window.open(url, "_blank", "noopener,noreferrer");
  });
};

/* ── Stat Badge ──────────────────────────────────────────────────── */
const STAT_BADGE_STYLES = {
  primary: { bg: "#e8edff", color: "#1e3a8a" },
  success: { bg: "#dcfce7", color: "#166534" },
  warning: { bg: "#fef9c3", color: "#92400e" },
  dark:    { bg: "#f1f5f9", color: "#1e293b" },
};

function StatBadge({ icon, label, value, color = "primary" }) {
  const s = STAT_BADGE_STYLES[color] || STAT_BADGE_STYLES.primary;
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center p-2 rounded-3"
      style={{ background: s.bg, minWidth: 72 }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span className="fw-bold" style={{ fontSize: 13, color: s.color }}>{value}</span>
      <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: s.color, opacity: 0.7 }}>
        {label}
      </span>
    </div>
  );
}

/* ── College Card — LIST VIEW ────────────────────────────────────── */
function CollegeCardList({ college, isHindi }) {
  const isTribal = college.isTribal === true;
  const isLead   = college.isLead === 1 || college.isLead === true;
  const nc       = naacColor(college.naacGrade);
  const uni      = college.universityDetails || {};
  const imgBase  = API_URL?.replace("/lmsbackend", "").replace(/\/$/, "");

  return (
    <Card
      className="mb-3 border-0 shadow-sm overflow-hidden p-0"
      style={{ borderRadius: 14, transition: "box-shadow 0.2s", borderLeft: "4px solid #1e3a8a" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 24px rgba(30,58,138,.15)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
    >
      <CardBody className="p-0">
        <Row className="g-0 align-items-stretch">

          {/* Logo */}
          <Col
            xs="auto"
            className="d-flex align-items-center justify-content-center p-3 border-end"
            style={{ minWidth: 88, background: "linear-gradient(145deg,#eef2ff,#dbe4ff)" }}
          >
            {college.profileImgUrl ? (
              <img
                src={`${imgBase}/${college.profileImgUrl.replace("../", "").replace(/^\/+/, "")}`}
                alt={college.name}
                style={{ width: 52, height: 52, objectFit: "contain", borderRadius: 8 }}
              />
            ) : (
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{ width: 52, height: 52, background: "#c5d3ff", fontSize: 26 }}
              >
                🏛️
              </div>
            )}
          </Col>

          {/* Main Info */}
          <Col className="p-3 border-end" style={{ minWidth: 0 }}>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <span className="fw-bold text-dark" style={{ fontSize: 14.5, lineHeight: 1.3 }}>
                {college.name}
              </span>
              <Badge color={nc} pill style={{ fontSize: 10 }}>
                ⭐ NAAC {college.naacGrade || "N/A"}
              </Badge>
              {isTribal && (
                <Badge color="warning" pill style={{ fontSize: 10, background: "#fd7e14" }}>
                  🏔️ {isHindi ? "जनजातीय" : "Tribal"}
                </Badge>
              )}
              {isLead && (
                <Badge color="info" pill style={{ fontSize: 10 }}>
                  ✅ {isHindi ? "अग्रणी" : "Lead"}
                </Badge>
              )}
            </div>
            <div className="d-flex flex-column gap-1">
              {college.educationMode && (
                <span className="text-muted small">
                  🎓 <strong>{isHindi ? "शिक्षा मोड:" : "Mode:"}</strong>{" "}
                  <span className="text-dark">{college.educationMode}</span>
                </span>
              )}
              {college.address && (
                <span className="text-muted small">
                  📍 <strong>{isHindi ? "पता:" : "Addr:"}</strong>{" "}
                  <span className="text-dark">{college.address}</span>
                </span>
              )}
              {college.districtName && (
                <span className="text-muted small">
                  🏙️ <strong>{isHindi ? "जिला:" : "Dist:"}</strong>{" "}
                  <span className="text-dark">{college.districtName}</span>
                </span>
              )}
              {college.establishYear && (
                <span className="text-muted small">
                  📅 <strong>{isHindi ? "स्थापना:" : "Est:"}</strong>{" "}
                  <Badge color="primary" pill style={{ fontSize: 10, marginLeft: 4 }}>
                    {college.establishYear}
                  </Badge>
                </span>
              )}
            </div>
          </Col>

          {/* University Info */}
          {uni.universityName && (
            <Col xs={12} md={3} className="p-3 border-end" style={{ background: "#fafbff", minWidth: 0 }}>
              <p className="text-uppercase fw-bold mb-2" style={{ fontSize: 9.5, letterSpacing: "0.09em", color: "#6c757d" }}>
                🏫 {isHindi ? "संबद्ध विश्वविद्यालय" : "Affiliated University"}
              </p>
              <p className="fw-semibold mb-1 text-dark" style={{ fontSize: 12, lineHeight: 1.3 }}>
                {uni.universityName}
              </p>
              {uni.universityType && (
                <Badge color="light" className="text-dark border mb-1" style={{ fontSize: 10 }}>
                  {uni.universityType}
                </Badge>
              )}
              {uni.contactNumber && (
                <div>
                  <a href={`tel:${uni.contactNumber}`} className="text-muted small d-block text-decoration-none">
                    📞 {uni.contactNumber}
                  </a>
                </div>
              )}
              {uni.universityUrl && (
                <button
                  onClick={() => openExternalUrl(uni.universityUrl, uni.universityName, isHindi)}
                  className="btn btn-link p-0 text-primary small text-decoration-none mt-1"
                  style={{ fontSize: 11 }}
                >
                  🌐 {isHindi ? "वेबसाइट" : "Website"}
                </button>
              )}
            </Col>
          )}

          {/* Contact + Actions */}
          <Col xs={12} md="auto" className="p-3 d-flex flex-column justify-content-between" style={{ minWidth: 160 }}>
            <div>
              <p className="text-uppercase fw-bold mb-2" style={{ fontSize: 9.5, letterSpacing: "0.09em", color: "#6c757d" }}>
                {isHindi ? "संपर्क" : "Contact"}
              </p>
              {college.collegeEmail && (
                <a href={`mailto:${college.collegeEmail}`} className="d-block text-truncate text-dark text-decoration-none small mb-1" style={{ maxWidth: 155 }}>
                  ✉️ {college.collegeEmail}
                </a>
              )}
              {college.contactNumber && (
                <a href={`tel:${college.contactNumber}`} className="d-block text-dark text-decoration-none small mb-2">
                  📞 {college.contactNumber}
                </a>
              )}
            </div>
            {college.collegeUrl && (
              <Button
                color="primary"
                size="sm"
                onClick={() => openExternalUrl(college.collegeUrl, college.name, isHindi)}
                style={{ borderRadius: 20, fontSize: 12, whiteSpace: "nowrap", background: "linear-gradient(135deg,#1e3a8a,#3b5bdb)", border: "none" }}
              >
                🌐 {isHindi ? "वेबसाइट" : "Website"}
              </Button>
            )}
          </Col>

        </Row>
      </CardBody>
    </Card>
  );
}

/* ── College Card — GRID VIEW ────────────────────────────────────── */
function CollegeCardGrid({ college, isHindi }) {
  const isTribal = college.isTribal === true;
  const isLead   = college.isLead === 1 || college.isLead === true;
  const nc       = naacColor(college.naacGrade);
  const uni      = college.universityDetails || {};
  const imgBase  = API_URL?.replace("/lmsbackend", "").replace(/\/$/, "");

  return (
    <Card
      className="h-100 border-0 shadow-sm overflow-hidden"
      style={{ borderRadius: 14, transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 28px rgba(30,58,138,.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div style={{ height: 5, background: "linear-gradient(90deg,#1e3a8a,#3b5bdb)" }} />
      <div
        className="d-flex align-items-center justify-content-center p-3"
        style={{ background: "linear-gradient(145deg,#eef2ff,#dbe4ff)", borderBottom: "1px solid #e9ecef", minHeight: 80 }}
      >
        {college.profileImgUrl ? (
          <img
            src={`${imgBase}/${college.profileImgUrl.replace("../", "").replace(/^\/+/, "")}`}
            alt={college.name}
            style={{ width: 54, height: 54, objectFit: "contain", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: 54, height: 54, background: "#c5d3ff", fontSize: 28 }}>
            🏛️
          </div>
        )}
      </div>

      <CardBody className="p-3 d-flex flex-column">
        <h6 className="fw-bold text-dark mb-2" style={{ fontSize: 13, lineHeight: 1.35 }}>
          {college.name}
        </h6>
        <div className="d-flex flex-wrap gap-1 mb-2">
          <Badge color={nc} pill style={{ fontSize: 10 }}>⭐ {college.naacGrade || "N/A"}</Badge>
          {isTribal && <Badge color="warning" pill style={{ fontSize: 10 }}>🏔️ {isHindi ? "जनजातीय" : "Tribal"}</Badge>}
          {isLead   && <Badge color="info"    pill style={{ fontSize: 10 }}>✅ {isHindi ? "अग्रणी"   : "Lead"}</Badge>}
        </div>
        <div className="flex-grow-1">
          {college.districtName  && <div className="text-muted small mb-1">🏙️ {college.districtName}</div>}
          {college.educationMode && <div className="text-muted small mb-1">🎓 {college.educationMode}</div>}
          {college.establishYear && (
            <div className="text-muted small mb-2">
              📅 <Badge color="primary" pill style={{ fontSize: 10 }}>{college.establishYear}</Badge>
            </div>
          )}
          {uni.universityName && (
            <div className="p-2 rounded-2 mb-2" style={{ background: "#f0f4ff", borderLeft: "3px solid #3b5bdb" }}>
              <div className="text-uppercase fw-bold mb-1" style={{ fontSize: 9, letterSpacing: "0.07em", color: "#6c757d" }}>
                {isHindi ? "विश्वविद्यालय" : "University"}
              </div>
              <div className="text-dark fw-semibold" style={{ fontSize: 11, lineHeight: 1.3 }}>
                {uni.universityName}
              </div>
              {uni.universityType && (
                <Badge color="light" className="text-dark border mt-1" style={{ fontSize: 9 }}>
                  {uni.universityType}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="border-top pt-2 mt-1">
          {college.collegeEmail && (
            <a href={`mailto:${college.collegeEmail}`} className="d-block text-truncate text-muted text-decoration-none" style={{ fontSize: 11, maxWidth: "100%" }}>
              ✉️ {college.collegeEmail}
            </a>
          )}
          {college.contactNumber && (
            <a href={`tel:${college.contactNumber}`} className="d-block text-muted text-decoration-none" style={{ fontSize: 11 }}>
              📞 {college.contactNumber}
            </a>
          )}
        </div>
        {college.collegeUrl ? (
          <Button
            color="primary"
            size="sm"
            onClick={() => openExternalUrl(college.collegeUrl, college.name, isHindi)}
            className="mt-2 w-100"
            style={{ borderRadius: 20, fontSize: 12, background: "linear-gradient(135deg,#1e3a8a,#3b5bdb)", border: "none" }}
          >
            🌐 {isHindi ? "वेबसाइट देखें" : "Visit Website"}
          </Button>
        ) : (
          <div className="mt-2 text-center text-muted small">—</div>
        )}
      </CardBody>
    </Card>
  );
}

/* ── Pagination ──────────────────────────────────────────────────── */
function PaginationBar({ current, total, onChange }) {
  if (total <= 1) return null;
  const delta = 2;
  const range = [];
  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) range.push(i);
  return (
    <Pagination size="sm" className="mb-0 flex-wrap">
      <PaginationItem disabled={current === 1}><PaginationLink first    onClick={() => onChange(1)} /></PaginationItem>
      <PaginationItem disabled={current === 1}><PaginationLink previous onClick={() => onChange(current - 1)} /></PaginationItem>
      {range[0] > 1 && (
        <>
          <PaginationItem><PaginationLink onClick={() => onChange(1)}>1</PaginationLink></PaginationItem>
          {range[0] > 2 && <PaginationItem disabled><PaginationLink>…</PaginationLink></PaginationItem>}
        </>
      )}
      {range.map((p) => (
        <PaginationItem key={p} active={p === current}>
          <PaginationLink onClick={() => onChange(p)}>{p}</PaginationLink>
        </PaginationItem>
      ))}
      {range[range.length - 1] < total && (
        <>
          {range[range.length - 1] < total - 1 && <PaginationItem disabled><PaginationLink>…</PaginationLink></PaginationItem>}
          <PaginationItem><PaginationLink onClick={() => onChange(total)}>{total}</PaginationLink></PaginationItem>
        </>
      )}
      <PaginationItem disabled={current === total}><PaginationLink next onClick={() => onChange(current + 1)} /></PaginationItem>
      <PaginationItem disabled={current === total}><PaginationLink last onClick={() => onChange(total)} /></PaginationItem>
    </Pagination>
  );
}

/* ── Type Filter Button ──────────────────────────────────────────── */
function TypeButton({ t, active, isHindi, onClick }) {
  const c = TYPE_BTN_COLORS[t.key];
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px",
        fontSize: 12,
        border: `1.5px solid ${c.active}`,
        borderRadius: 0,
        cursor: "pointer",
        fontWeight: active ? 700 : 500,
        background: active ? c.active : "#fff",
        color:      active ? "#fff"    : c.active,
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = c.active;
          e.currentTarget.style.color = "#fff";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.color = c.active;
        }
      }}
    >
      {t.icon} {isHindi ? t.hi : t.en}
    </button>
  );
}

/* ── Main Page ───────────────────────────────────────────────────── */
const Colleges = () => {
  const { isHindi } = useLanguage();

  const [colleges,      setColleges]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [viewMode,      setViewMode]      = useState("list");
  const [typeFilter,    setTypeFilter]    = useState("all");
  const [search,        setSearch]        = useState("");
  const [districtFilter,setDistrictFilter]= useState("all");
  const [page,          setPage]          = useState(1);

  const breadcrumb = [
    { label: isHindi ? "मुख्य पृष्ठ" : "Home", path: "/" },
    { label: isHindi ? "महाविद्यालय" : "Colleges", active: true },
  ];

  /* Fetch */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/college/get-all-college-for-hesite`);
        const d = res.data;
        setColleges(Array.isArray(d) ? d : d?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const districts = useMemo(() => {
    const set = new Set(colleges.map((c) => c.districtName).filter(Boolean));
    return Array.from(set).sort();
  }, [colleges]);

  const filtered = useMemo(() => {
    return colleges.filter((c) => {
      if (typeFilter !== "all" && String(c.collegeType) !== typeFilter) return false;
      if (districtFilter !== "all" && c.districtName !== districtFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return [c.name, c.districtName, c.aisheCode, c.collegeEmail]
          .some((f) => (f || "").toLowerCase().includes(q));
      }
      return true;
    });
  }, [colleges, typeFilter, districtFilter, search]);

  useEffect(() => { setPage(1); }, [typeFilter, districtFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSlice  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Counts — corrected: 1=Govt, 0=Private, 2=Aided/Central */
  const countGovt    = colleges.filter((c) => String(c.collegeType) === "1").length;
  const countPrivate = colleges.filter((c) => String(c.collegeType) === "0").length;
  const countCentral = colleges.filter((c) => String(c.collegeType) === "2").length;

  return (
    <PageLayout
      title={isHindi ? "महाविद्यालय" : "Colleges"}
      titleHi="महाविद्यालय"
      breadcrumb={breadcrumb}
    >
      <Container fluid className="bg-white rounded">

        {/* ── GRADIENT HEADER ─────────────────────────────────── */}
        <Card className="border-0 shadow-lg mb-4 overflow-hidden" style={{ borderRadius: 16 }}>
          <CardHeader
            className="text-white border-0 p-4"
            style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)" }}
          >
            <Row className="align-items-center g-3">
              <Col xs="auto">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ width: 60, height: 60, background: "rgba(255,255,255,0.15)", fontSize: 32, backdropFilter: "blur(4px)" }}
                >
                  🏛️
                </div>
              </Col>
              <Col>
                <h4 className="fw-bold mb-1 text-white" style={{ letterSpacing: "-0.01em" }}>
                  {isHindi ? "छत्तीसगढ़ के महाविद्यालय" : "Colleges of Chhattisgarh"}
                </h4>
                <p className="mb-0 small" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {isHindi
                    ? "उच्च शिक्षा विभाग, छत्तीसगढ़ शासन द्वारा पंजीकृत महाविद्यालय"
                    : "Registered institutions under Department of Higher Education, Govt. of Chhattisgarh"}
                </p>
              </Col>
              {!loading && (
                <Col xs={12} md="auto">
                  <Row className="g-2 justify-content-end">
                    <Col xs="auto">
                      <StatBadge icon="🏢" label={isHindi ? "सरकारी"  : "Govt"}    value={countGovt}       color="primary" />
                    </Col>
                    <Col xs="auto">
                      <StatBadge icon="🏫" label={isHindi ? "निजी"    : "Private"} value={countPrivate}    color="success" />
                    </Col>
                    <Col xs="auto">
                      <StatBadge icon="🏦" label={isHindi ? "अनुदानित": "Aided"}   value={countCentral}    color="warning" />
                    </Col>
                    <Col xs="auto">
                      <StatBadge icon="🏛️" label={isHindi ? "कुल"     : "Total"}   value={colleges.length} color="dark"    />
                    </Col>
                  </Row>
                </Col>
              )}
            </Row>
          </CardHeader>

          {/* ── Filter Bar ─────────────────────────────────────── */}
          <CardBody className="p-3 bg-white">
            <Row className="align-items-center g-2">

              {/* Type buttons — custom to avoid Bootstrap light-outline hover bug */}
              <Col xs={12} sm="auto">
                <div style={{ display: "flex", border: "1.5px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
                  {COLLEGE_TYPES.map((t, i) => (
                    <TypeButton
                      key={t.key}
                      t={t}
                      active={typeFilter === t.key}
                      isHindi={isHindi}
                      onClick={() => setTypeFilter(t.key)}
                      style={i === 0 ? { borderLeft: "none" } : {}}
                    />
                  ))}
                </div>
              </Col>

              {/* District */}
              <Col xs={12} sm="auto">
                <Input
                  type="select" bsSize="sm" value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  style={{ minWidth: 160, fontSize: 13, borderRadius: 8 }}
                >
                  <option value="all">{isHindi ? "📍 सभी जिले" : "📍 All Districts"}</option>
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </Input>
              </Col>

              {/* Search */}
              <Col xs={12} sm>
                <InputGroup size="sm">
                  <InputGroupText style={{ background: "#fff", borderRight: 0 }}>🔍</InputGroupText>
                  <Input
                    type="text"
                    placeholder={isHindi ? "नाम, कोड, ईमेल से खोजें..." : "Search by name, code, email..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ borderLeft: 0, fontSize: 13 }}
                  />
                  {search && (
                    <Button color="secondary" outline size="sm" onClick={() => setSearch("")}>✕</Button>
                  )}
                </InputGroup>
              </Col>

              {/* View toggle + count */}
              <Col xs="auto" className="d-flex align-items-center gap-2 ms-auto">
                <Badge color="dark" style={{ fontSize: 12, padding: "6px 14px", borderRadius: 20 }}>
                  {loading ? "…" : filtered.length} {isHindi ? "महाविद्यालय" : "Colleges"}
                </Badge>
                {/* View mode buttons — explicit styles to avoid white-on-white hover */}
                <div style={{ display: "flex", border: "1.5px solid #dee2e6", borderRadius: 8, overflow: "hidden" }}>
                  {[{ mode: "list", icon: "☰" }, { mode: "grid", icon: "⊞" }].map(({ mode, icon }) => {
                    const isActive = viewMode === mode;
                    return (
                      <button
                        key={mode}
                        title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} View`}
                        onClick={() => setViewMode(mode)}
                        style={{
                          padding: "5px 12px",
                          fontSize: 14,
                          border: "none",
                          cursor: "pointer",
                          background: isActive ? "#1e3a8a" : "#fff",
                          color:      isActive ? "#fff"    : "#1e3a8a",
                          transition: "background 0.15s, color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = "#eef2ff";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = "#fff";
                          }
                        }}
                      >
                        {icon}
                      </button>
                    );
                  })}
                </div>
              </Col>

            </Row>
          </CardBody>
        </Card>

        {/* ── Top Pagination ───────────────────────────────────── */}
        {!loading && filtered.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <small className="text-muted">
              {isHindi
                ? `पृष्ठ ${page} / ${totalPages} — ${filtered.length} परिणाम`
                : `Page ${page} of ${totalPages} — ${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
            </small>
            <PaginationBar current={page} total={totalPages} onChange={handlePage} />
          </div>
        )}

        {/* ── Content ──────────────────────────────────────────── */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" style={{ width: 40, height: 40 }} />
            <div className="text-muted mt-3 small">
              {isHindi ? "महाविद्यालय की जानकारी लोड हो रही है..." : "Loading college data..."}
            </div>
          </div>
        ) : pageSlice.length === 0 ? (
          <Card className="border-0 shadow-sm text-center" style={{ borderRadius: 14 }}>
            <CardBody className="py-5">
              <div style={{ fontSize: 48 }}>🔍</div>
              <h6 className="text-muted mt-3 mb-1">
                {isHindi ? "कोई महाविद्यालय नहीं मिला" : "No colleges found"}
              </h6>
              <small className="text-muted">
                {isHindi ? "कृपया अपना खोज फ़िल्टर बदलें" : "Try adjusting your search or filters"}
              </small>
            </CardBody>
          </Card>
        ) : viewMode === "list" ? (
          pageSlice.map((college, idx) => (
            <CollegeCardList key={college._id || idx} college={college} isHindi={isHindi} />
          ))
        ) : (
          <Row className="g-3">
            {pageSlice.map((college, idx) => (
              <Col key={college._id || idx} xs={12} sm={6} md={4} lg={3}>
                <CollegeCardGrid college={college} isHindi={isHindi} />
              </Col>
            ))}
          </Row>
        )}

        {/* ── Bottom Pagination ─────────────────────────────────── */}
        {!loading && filtered.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
            <small className="text-muted">
              {isHindi
                ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} / ${filtered.length}`
                : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
            </small>
            <PaginationBar current={page} total={totalPages} onChange={handlePage} />
          </div>
        )}

      </Container>
    </PageLayout>
  );
};

export default Colleges;