import { useState, useEffect } from "react";
import axios from "axios";
import PageLayout from "../../components/PageLayout";
import { useLanguage } from "../../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_EXTERNAL_API_URL;

const AV_COLORS = [
  { bg: "#E6F1FB", color: "#1a56db" },
  { bg: "#E1F5EE", color: "#085041" },
  { bg: "#EEEDFE", color: "#3C3489" },
  { bg: "#FAEEDA", color: "#633806" },
  { bg: "#FAECE7", color: "#712B13" },
  { bg: "#FBEAF0", color: "#72243E" },
];

const TABS = [
  { key: "all",      en: "All Colleges",  hi: "सभी" },
  { key: "active",   en: "Active",        hi: "सक्रिय" },
  { key: "inactive", en: "Inactive",      hi: "निष्क्रिय" },
  { key: "tribal",   en: "Tribal",        hi: "जनजातीय" },
  { key: "lead",     en: "Lead",          hi: "अग्रणी" },
];

function initials(name) {
  if (!name) return "??";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function naacBadgeStyle(grade) {
  if (!grade) return null;
  if (grade.startsWith("A")) return { background: "#d1fae5", color: "#065f46" };
  if (grade.startsWith("B")) return { background: "#fef9c3", color: "#854d0e" };
  return { background: "#fee2e2", color: "#991b1b" };
}

/* ─── Skeleton ─── */
function SkeletonCard() {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "110px 1fr 1fr",
      gap: 0, padding: "20px 24px",
      borderBottom: "1px solid #e9ecef",
      alignItems: "center",
    }}>
      <div style={{ paddingRight: 20, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#e2e8f0", animation: "pulse 1.5s infinite" }} />
      </div>
      <div style={{ paddingRight: 32, borderRight: "1px solid #e9ecef" }}>
        <div style={{ height: 15, background: "#e2e8f0", borderRadius: 8, marginBottom: 10, width: "70%", animation: "pulse 1.5s infinite" }} />
        {[80, 60, 40, 50].map((w, i) => (
          <div key={i} style={{ height: 12, background: "#e2e8f0", borderRadius: 6, marginBottom: 7, width: `${w}%`, animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
      <div style={{ paddingLeft: 32 }}>
        {[60, 80, 70, 55].map((w, i) => (
          <div key={i} style={{ height: 12, background: "#e2e8f0", borderRadius: 6, marginBottom: 8, width: `${w}%`, animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
    </div>
  );
}

/* ─── College Row Card ─── */
function CollegeCard({ college, index, isHindi }) {
  const [hovered, setHovered] = useState(false);
  const av      = AV_COLORS[index % AV_COLORS.length];
  const isActive = college.status === true || college.status === "true";
  const isTribal = college.isTribal === true;
  const isLead   = college.isLead === 1 || college.isLead === true;
  const naacStyle = naacBadgeStyle(college.naacGrade);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "110px 1fr 1fr",
        gap: 0,
        alignItems: "center",
        padding: "20px 24px",
        borderBottom: "1px solid #e9ecef",
        position: "relative",
        background: hovered ? "#fafbff" : "#fff",
        transition: "background 0.18s",
      }}
    >
      {/* ── Status pill ── */}
      <div style={{ position: "absolute", top: 16, right: 18, display: "flex", gap: 7, alignItems: "center" }}>
        <span style={{
          fontSize: 10.5, fontWeight: 700, padding: "3px 11px",
          borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.05em",
          background: isActive ? "#d1fae5" : "#fee2e2",
          color: isActive ? "#065f46" : "#991b1b",
        }}>
          {isActive
            ? (isHindi ? "● सक्रिय" : "● Active")
            : (isHindi ? "● निष्क्रिय" : "● Inactive")}
        </span>
      </div>

      {/* ── Logo ── */}
      <div style={{ paddingRight: 20, display: "flex", justifyContent: "center" }}>
        <div style={{
          width: 82, height: 82, borderRadius: "50%",
          border: "1.5px solid #dee2e6",
          background: av.bg, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {college.universityLogo
            ? <img src={college.universityLogo} alt={college.name}
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: 7 }} />
            : <span style={{ fontSize: 20, fontWeight: 800, color: av.color }}>
                {initials(college.name)}
              </span>
          }
        </div>
      </div>

      {/* ── Left info ── */}
      <div style={{ paddingRight: 32, borderRight: "1px solid #e9ecef" }}>
        {/* Name */}
        <p style={{
          fontSize: 15, fontWeight: 700, color: "#1a56db",
          margin: "0 0 10px", lineHeight: 1.35, paddingRight: 110,
        }}>
          {college.name || "—"}
        </p>

        {/* Education Mode */}
        <div style={{ display: "flex", gap: 5, fontSize: 13, marginBottom: 6 }}>
          <b style={{ color: "#1a202c", whiteSpace: "nowrap" }}>
            {isHindi ? "शिक्षा मोड:" : "Education Mode:"}
          </b>
          <span style={{ color: "#4a5568" }}>{college.educationMode || "—"}</span>
        </div>

        {/* Location */}
        <div style={{ display: "flex", gap: 5, fontSize: 13, marginBottom: 6 }}>
          <b style={{ color: "#1a202c", whiteSpace: "nowrap" }}>
            {isHindi ? "स्थान:" : "Location:"}
          </b>
          <span style={{ color: "#4a5568" }}>{college.address || "—"}</span>
        </div>

        {/* Establishment Year */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, marginBottom: 6 }}>
          <b style={{ color: "#1a202c", whiteSpace: "nowrap" }}>
            {isHindi ? "स्थापना वर्ष:" : "Establishment Year:"}
          </b>
          <span style={{
            background: "#dbeafe", color: "#1d4ed8",
            fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: 20,
          }}>
            {college.establishYear || "—"}
          </span>
        </div>

        {/* NAAC Grade */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, marginBottom: 8 }}>
          <b style={{ color: "#1a202c", whiteSpace: "nowrap" }}>
            {isHindi ? "NAAC ग्रेड:" : "NAAC Grade:"}
          </b>
          {naacStyle
            ? <span style={{ ...naacStyle, fontSize: 12, fontWeight: 700, padding: "2px 9px", borderRadius: 20 }}>
                {college.naacGrade}
              </span>
            : <span style={{ color: "#9ca3af" }}>—</span>
          }
        </div>

        {/* Tags */}
        {(isTribal || isLead) && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {isTribal && (
              <span style={{ fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "#fef3c7", color: "#d97706" }}>
                🏔️ {isHindi ? "जनजातीय" : "Tribal"}
              </span>
            )}
            {isLead && (
              <span style={{ fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "#ede9fe", color: "#7c3aed" }}>
                ⭐ {isHindi ? "अग्रणी" : "Lead"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Right info ── */}
      <div style={{ paddingLeft: 32 }}>
        <p style={{
          fontSize: 10.5, fontWeight: 700, color: "#b0b7c3",
          letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px",
        }}>
          {isHindi ? "संबद्धता और संपर्क" : "Affiliation & Contact"}
        </p>

        {/* Affiliated University */}
        <div style={{ display: "flex", gap: 5, fontSize: 13, marginBottom: 6, alignItems: "baseline" }}>
          <b style={{ color: "#1a202c", whiteSpace: "nowrap" }}>
            {isHindi ? "संबद्ध विश्वविद्यालय:" : "Affiliated University:"}
          </b>
          <span style={{ color: "#4a5568" }}>{college.university || "—"}</span>
        </div>

        {/* Website */}
        <div style={{ display: "flex", gap: 5, fontSize: 13, marginBottom: 6, alignItems: "baseline" }}>
          <b style={{ color: "#1a202c", whiteSpace: "nowrap" }}>
            {isHindi ? "वेबसाइट:" : "Website:"}
          </b>
          {college.collegeUrl
            ? <a href={college.collegeUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: "#1a56db", textDecoration: "none", fontSize: 13 }}
                onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.target.style.textDecoration = "none"}>
                {college.collegeUrl}
              </a>
            : <span style={{ color: "#9ca3af" }}>—</span>
          }
        </div>

        {/* Email */}
        <div style={{ display: "flex", gap: 5, fontSize: 13, marginBottom: 6, alignItems: "baseline" }}>
          <b style={{ color: "#1a202c", whiteSpace: "nowrap" }}>
            {isHindi ? "ईमेल:" : "Email:"}
          </b>
          {college.collegeEmail
            ? <a href={`mailto:${college.collegeEmail}`}
                style={{ color: "#e53e3e", textDecoration: "none", fontSize: 13 }}>
                {college.collegeEmail}
              </a>
            : <span style={{ color: "#9ca3af" }}>—</span>
          }
        </div>

        {/* Address */}
        <div style={{ display: "flex", gap: 5, fontSize: 13, alignItems: "baseline" }}>
          <b style={{ color: "#1a202c", whiteSpace: "nowrap" }}>
            {isHindi ? "पता:" : "Address:"}
          </b>
          <span style={{ color: "#4a5568" }}>{college.address || "—"}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ label, value, loading, color }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "16px 20px",
      border: "1px solid #e9ecef",
      boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 70, height: 70,
        background: color,
        opacity: 0.1, borderRadius: "0 0 0 70px",
      }} />
      <div style={{ fontSize: "1.9rem", fontWeight: 700, color: "#1a202c" }}>
        {loading ? "—" : value}
      </div>
      <div style={{ fontSize: "0.7rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>
        {label}
      </div>
    </div>
  );
}

/* ─── Main ─── */
const Colleges = () => {
  const { isHindi } = useLanguage();
  const [colleges, setColleges] = useState([]);
  const [tab, setTab]           = useState("all");
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);

  const breadcrumb = [
    { label: isHindi ? "मुख्य पृष्ठ" : "Home", path: "/" },
    { label: isHindi ? "महाविद्यालय" : "Colleges", active: true },
  ];

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/api/college/get-all-college-for-HRMIS`);
        const d = res.data;
        setColleges(Array.isArray(d) ? d : d?.data || d?.colleges || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isActive = (c) => c.status === true || c.status === "true";

  const stats = [
    { label: isHindi ? "कुल"       : "Total",    value: colleges.length,                                                   color: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
    { label: isHindi ? "सक्रिय"   : "Active",   value: colleges.filter(isActive).length,                                  color: "linear-gradient(135deg,#10b981,#059669)" },
    { label: isHindi ? "निष्क्रिय" : "Inactive", value: colleges.filter((c) => !isActive(c)).length,                       color: "linear-gradient(135deg,#ef4444,#dc2626)" },
    { label: isHindi ? "जनजातीय"  : "Tribal",   value: colleges.filter((c) => c.isTribal === true).length,                color: "linear-gradient(135deg,#f59e0b,#d97706)" },
    { label: isHindi ? "अग्रणी"   : "Lead",     value: colleges.filter((c) => c.isLead === 1 || c.isLead === true).length, color: "linear-gradient(135deg,#8b5cf6,#7c3aed)" },
  ];

  const visible = colleges
    .filter((c) => {
      if (tab === "active")   return isActive(c);
      if (tab === "inactive") return !isActive(c);
      if (tab === "tribal")   return c.isTribal === true;
      if (tab === "lead")     return c.isLead === 1 || c.isLead === true;
      return true;
    })
    .filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return [c.name, c.districtName, c.aisheCode, c.collegeEmail, c.contactPerson]
        .some((f) => (f || "").toLowerCase().includes(q));
    });

  return (
    <PageLayout
      title={isHindi ? "महाविद्यालय" : "Colleges"}
      titleHi="महाविद्यालय"
      breadcrumb={breadcrumb}
    >
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .college-card { animation: slideIn 0.3s ease-out; }
      `}</style>

      <div style={{ padding: "1.5rem 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }}>

          {/* ── Header ── */}
          <div style={{
            background: "#fff", borderRadius: 16, padding: "18px 24px",
            marginBottom: 18, border: "1px solid #e9ecef",
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: "2.4rem" }}>🎓</span>
              <div>
                <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a202c", margin: 0 }}>
                  {isHindi ? "छत्तीसगढ़ के महाविद्यालय" : "Chhattisgarh Colleges"}
                </h1>
                <p style={{ fontSize: "0.83rem", color: "#9ca3af", margin: "3px 0 0" }}>
                  {isHindi ? "सभी पंजीकृत महाविद्यालय" : "All Registered Institutions"}
                </p>
              </div>
            </div>
            {/* Search */}
            <div style={{
              display: "flex", alignItems: "center",
              background: "#f7fafc", borderRadius: 50,
              padding: "8px 16px", minWidth: 280,
              border: "1.5px solid #e2e8f0", gap: 8,
            }}>
              <span style={{ color: "#a0aec0" }}>🔍</span>
              <input
                type="text"
                placeholder={isHindi ? "खोजें..." : "Search colleges..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: "none", background: "transparent", outline: "none", flex: 1, fontSize: 13.5 }}
              />
              {search && (
                <button onClick={() => setSearch("")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#a0aec0" }}>
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* ── Stats ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 10, marginBottom: 18,
          }}>
            {stats.map((s, i) => <StatCard key={i} {...s} loading={loading} />)}
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "7px 18px", borderRadius: 50,
                  border: "none", cursor: "pointer",
                  fontWeight: 600, fontSize: 13,
                  transition: "all 0.18s",
                  background: tab === t.key
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "#fff",
                  color: tab === t.key ? "#fff" : "#4a5568",
                  boxShadow: tab === t.key
                    ? "0 4px 12px rgba(99,102,241,0.3)"
                    : "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                {isHindi ? t.hi : t.en}
              </button>
            ))}
          </div>

          {/* ── Count ── */}
          {!loading && (
            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 10 }}>
              {visible.length} {isHindi ? "महाविद्यालय मिले" : `college${visible.length === 1 ? "" : "s"} found`}
            </p>
          )}

          {/* ── Card list ── */}
          <div style={{
            border: "1px solid #e9ecef", borderRadius: 14,
            overflow: "hidden", background: "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            ) : visible.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af", fontSize: 15 }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🔍</div>
                {isHindi ? "कोई महाविद्यालय नहीं मिला" : "No colleges found"}
              </div>
            ) : (
              visible.map((college, idx) => (
                <div key={college._id || idx} className="college-card">
                  <CollegeCard college={college} index={idx} isHindi={isHindi} />
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </PageLayout>
  );
};

export default Colleges;