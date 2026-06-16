import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Badge,
} from "reactstrap";

// ─── inline styles (no external CSS file needed) ────────────────────────────

const styles = {
  /* ── top utility bar ── */
  topBar: {
    background: "#1a2a5e",
    color: "#fff",
    fontSize: "13px",
    padding: "5px 0",
    borderBottom: "3px solid #f0a500",
  },
  topBarLink: { color: "#fff", textDecoration: "none" },

  /* ── main header ── */
  header: {
    background: "#fff",
    borderBottom: "1px solid #e0e0e0",
    padding: "10px 0",
  },
  deptTitle: {
    color: "#1a2a5e",
    fontWeight: 700,
    fontSize: "22px",
    marginBottom: "2px",
  },
  deptSub: { color: "#555", fontSize: "14px", margin: 0 },

  /* ── navbar ── */
  navbar: {
    background: "#fff",
    borderBottom: "2px solid #e0e0e0",
    padding: "0",
  },
  navInner: {
    display: "flex",
    alignItems: "center",
    gap: "0",
    overflowX: "auto",
  },
  navItem: {
    padding: "10px 16px",
    color: "#1a2a5e",
    fontWeight: 500,
    fontSize: "14px",
    textDecoration: "none",
    whiteSpace: "nowrap",
    borderRight: "1px solid #e0e0e0",
    cursor: "default",
  },
  navItemActive: {
    padding: "10px 16px",
    color: "#1a2a5e",
    fontWeight: 600,
    fontSize: "14px",
    textDecoration: "none",
    whiteSpace: "nowrap",
    border: "2px solid #1a2a5e",
    borderRadius: "4px",
    margin: "4px 6px",
    cursor: "default",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  /* ── page body ── */
  pageBody: {
    background: "#f5f7fa",
    minHeight: "calc(100vh - 260px)",
    padding: "0",
    position: "relative",
    overflow: "hidden",
  },

  /* bg watermark strip */
  bgAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage:
      "linear-gradient(135deg,rgba(26,42,94,0.03) 0%,rgba(240,165,0,0.04) 100%)",
    pointerEvents: "none",
  },

  /* ── about section (left) ── */
  aboutSection: {
    padding: "40px 40px 40px 0",
  },
  aboutHeading: {
    color: "#1a2a5e",
    fontWeight: 700,
    fontSize: "22px",
    marginBottom: "14px",
  },
  aboutText: {
    color: "#444",
    fontSize: "14px",
    lineHeight: "1.8",
    textAlign: "justify",
    marginBottom: "8px",
  },
  readMoreBtn: {
    background: "#f0a500",
    color: "#fff",
    border: "none",
    padding: "8px 22px",
    borderRadius: "20px",
    fontWeight: 600,
    fontSize: "14px",
    marginTop: "10px",
    cursor: "default",
  },

  /* ── dignitary cards (right) ── */
  dignitaryCard: {
    background: "#eef2f7",
    borderRadius: "8px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "14px",
  },
  dignitaryImg: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    border: "3px solid #1a2a5e",
    objectFit: "cover",
    background: "#c8d3e8",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },
  dignitaryName: {
    fontWeight: 700,
    color: "#1a2a5e",
    fontSize: "15px",
    marginBottom: "2px",
  },
  dignitaryRole: { color: "#555", fontSize: "12px" },

  /* ── SERVER DOWN overlay ── */
  serverDownOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(3px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  serverDownCard: {
    background: "#fff",
    borderRadius: "10px",
    maxWidth: "520px",
    width: "92%",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  },
  serverDownHeader: {
    background: "#1a2a5e",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    borderBottom: "4px solid #f0a500",
  },
  serverDownBody: { padding: "28px 28px 24px" },
  serverDownTitle: {
    color: "#fff",
    fontWeight: 700,
    fontSize: "17px",
    margin: 0,
    lineHeight: 1.3,
  },
  serverDownSub: { color: "#b0bdd8", fontSize: "12px", marginTop: "2px" },
  statusBadge: {
    background: "#dc3545",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: "12px",
    display: "inline-block",
    marginBottom: "14px",
    letterSpacing: "0.5px",
  },
  serverDownMsg: {
    color: "#444",
    fontSize: "14px",
    lineHeight: 1.7,
    marginBottom: "20px",
  },
  divider: { border: "none", borderTop: "1px solid #e5e8ef", margin: "0 0 18px" },
  infoRow: { display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" },
  infoIcon: { color: "#1a2a5e", fontSize: "16px", marginTop: "1px", flexShrink: 0 },
  infoText: { color: "#333", fontSize: "13px" },
  retryBtn: {
    background: "#f0a500",
    color: "#fff",
    border: "none",
    padding: "10px 28px",
    borderRadius: "6px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    marginRight: "10px",
  },
  visitLink: {
    color: "#1a2a5e",
    fontWeight: 600,
    fontSize: "13px",
    textDecoration: "underline",
  },

  /* ── footer ── */
  footer: {
    background: "#0d1b4b",
    color: "#cdd5e8",
    padding: "40px 0 20px",
  },
  footerHeading: {
    color: "#fff",
    fontWeight: 700,
    fontSize: "16px",
    marginBottom: "12px",
    paddingBottom: "6px",
    borderBottom: "2px solid #2a4080",
  },
  footerLink: {
    color: "#8fa8d8",
    textDecoration: "none",
    fontSize: "13.5px",
    display: "block",
    marginBottom: "8px",
    cursor: "default",
  },
  footerText: { color: "#aab8d0", fontSize: "13px", lineHeight: 1.7 },
  footerBottom: {
    background: "#070f2b",
    color: "#aab8d0",
    textAlign: "center",
    padding: "10px 0",
    fontSize: "12.5px",
  },
  footerBottomBar: {
    borderTop: "1px solid #1e3060",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px",
    padding: "8px 0 0",
    marginTop: "8px",
    fontSize: "12px",
    color: "#7a90b5",
  },
  socialIcon: {
    color: "#8fa8d8",
    fontSize: "20px",
    marginRight: "12px",
    cursor: "default",
  },
  nicBadge: {
    background: "#1e3369",
    border: "1px solid #2a4a7f",
    borderRadius: "6px",
    padding: "6px 14px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "8px",
    fontSize: "12px",
    color: "#8fa8d8",
    fontWeight: 600,
  },
  visitorBox: {
    background: "#1a2f5e",
    border: "1px solid #2a4080",
    borderRadius: "6px",
    padding: "8px 20px",
    textAlign: "center",
    color: "#5b9bd5",
    fontWeight: 700,
    fontSize: "22px",
    marginTop: "6px",
    letterSpacing: "2px",
  },
};

// ─── Static data ─────────────────────────────────────────────────────────────

const navLinks = [
  { label: "Home", active: true, icon: "🏠" },
  { label: "About Us ▾" },
  { label: "Services ▾" },
  { label: "Notice Board ▾" },
  { label: "Right to Information" },
  { label: "Photo Gallery" },
  { label: "Contact Us" },
  { label: "Voter Service Portal" },
  { label: "National Education Policy-2020 ▾" },
];

const dignitaries = [
  { name: "Shri Ramen Deka", role: "Honourable Governor", emoji: "👤" },
  { name: "Shri Vishnu Deo Sai", role: "Honourable Chief Minister", emoji: "👤" },
  { name: "Shri Tankram Verma", role: "Honourable Minister, Department of Higher Education", emoji: "👤" },
];

const quickLinks = ["About Us", "Universities", "Colleges", "Downloads", "Contact Us", "Gallery"];
const importantLinks = [
  "Copyright Policy", "Disclaimer", "Terms And Conditions",
  "Accessibility Statement", "Site Map", "Help And Support",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TopBar() {
  return (
    <div style={styles.topBar}>
      <Container>
        <Row className="align-items-center">
          <Col xs="auto">
            <span style={{ marginRight: "18px" }}>
              📞 <span style={styles.topBarLink}>91-771-2221234</span>
            </span>
            <span>
              ✉ <span style={styles.topBarLink}>wim.higheredu-cg@gov.in</span>
            </span>
          </Col>
          <Col className="text-end d-none d-md-block">
            <span style={{ marginRight: "8px", fontSize: "12px" }}>A-</span>
            <span style={{ marginRight: "8px", fontSize: "14px", fontWeight: 700 }}>A</span>
            <span style={{ marginRight: "16px", fontSize: "16px", fontWeight: 700 }}>A+</span>
            <span style={{ marginRight: "14px", fontSize: "12px" }}>🌐 हिंदी</span>
            <span style={{ marginRight: "14px", fontSize: "12px" }}>♿ Accessibility</span>
            <span style={{ fontSize: "12px" }}>🗺 Sitemap</span>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function SiteHeader() {
  return (
    <div style={styles.header}>
      <Container>
        <Row className="align-items-center">
          {/* Logo + CG emblem */}
          <Col xs="auto">
            <img
              src="/Chhattisgarh.svg"
              alt="Chhattisgarh Emblem"
              style={{ height: "70px", marginRight: "12px" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </Col>
          {/* Title */}
          <Col>
            <div style={styles.deptTitle}>Department of Higher Education</div>
            <p style={styles.deptSub}>Government of Chhattisgarh</p>
          </Col>
          {/* Right logos */}
          <Col xs="auto" className="d-none d-md-flex align-items-center gap-3">
            <img
              src="/Digital_India_logo.svg"
              alt="Digital India"
              style={{ height: "48px" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <img
              src="/Emblem_of_India.svg"
              alt="Emblem of India"
              style={{ height: "52px" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function SiteNavbar() {
  return (
    <div style={styles.navbar}>
      <Container>
        <div style={styles.navInner}>
          {navLinks.map((item) =>
            item.active ? (
              <span key={item.label} style={styles.navItemActive}>
                {item.icon} {item.label}
              </span>
            ) : (
              <span key={item.label} style={styles.navItem}>
                {item.label}
              </span>
            )
          )}
        </div>
      </Container>
    </div>
  );
}

function AboutSection() {
  return (
    <div style={styles.pageBody}>
      <div style={styles.bgAccent} />
      <Container style={{ position: "relative", zIndex: 1 }}>
        <Row className="py-4">
          {/* About text */}
          <Col lg={7} md={12}>
            <div style={styles.aboutSection}>
              <h2 style={styles.aboutHeading}>About Department</h2>
              <p style={styles.aboutText}>
                The Department of Higher Education of the State of Chhattisgarh, with excellence
                at its core, is continuously expanding universities and colleges.
              </p>
              <p style={styles.aboutText}>
                It is firmly committed to making higher education accessible to a larger number of youth.
              </p>
              <p style={styles.aboutText}>
                To achieve this objective, it is consistently working through 9 government universities,
                15 private universities, 335 government colleges, 12 aided non-government colleges,
                and 256 unaided non-government colleges.
              </p>
              <button style={styles.readMoreBtn}>Read More</button>
            </div>
          </Col>

          {/* Dignitaries */}
          <Col lg={5} md={12} className="py-4">
            {dignitaries.map((d) => (
              <div key={d.name} style={styles.dignitaryCard}>
                <div style={styles.dignitaryImg}>{d.emoji}</div>
                <div>
                  <div style={styles.dignitaryName}>{d.name}</div>
                  <div style={styles.dignitaryRole}>{d.role}</div>
                </div>
              </div>
            ))}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function SiteFooter() {
  return (
    <>
      <div style={styles.footer}>
        <Container>
          <Row>
            {/* Contact */}
            <Col lg={3} md={6} className="mb-4">
              <div style={styles.footerHeading}>Contact Information</div>
              <p style={styles.footerText}>Department of Higher Education Chhattisgarh.</p>
              <p style={styles.footerText}>
                📍 Mantralaya, Mahanadi Bhawan, Naya Raipur, Raipur,<br />
                Chhattisgarh – 492002
              </p>
              <p style={styles.footerText}>📞 7712221234</p>
              <p style={styles.footerText}>✉ higheredu.cg@gov.in</p>
            </Col>

            {/* Quick Links */}
            <Col lg={3} md={6} className="mb-4">
              <div style={styles.footerHeading}>Quick Links</div>
              {quickLinks.map((l) => (
                <span key={l} style={styles.footerLink}>→ {l}</span>
              ))}
            </Col>

            {/* Important Links */}
            <Col lg={3} md={6} className="mb-4">
              <div style={styles.footerHeading}>Important Links</div>
              {importantLinks.map((l) => (
                <span key={l} style={styles.footerLink}>→ {l}</span>
              ))}
            </Col>

            {/* Follow + Visitors */}
            <Col lg={3} md={6} className="mb-4">
              <div style={styles.footerHeading}>Follow Us</div>
              <div style={{ marginBottom: "16px" }}>
                {["▶", "📷", "👍", "in"].map((icon, i) => (
                  <span key={i} style={styles.socialIcon}>{icon}</span>
                ))}
              </div>
              <div style={{ color: "#cdd5e8", fontWeight: 600, marginBottom: "6px" }}>
                Site Visitors
              </div>
              <div style={styles.visitorBox}>714</div>
            </Col>
          </Row>

          {/* NIC credit row */}
          <Row>
            <Col className="text-center py-2">
              <p style={{ color: "#7a90b5", fontSize: "12.5px", marginBottom: "6px" }}>
                © 2017 – All Rights Reserved - Department of Higher Education, Government of Chhattisgarh, India
              </p>
              <p style={{ color: "#7a90b5", fontSize: "12px", marginBottom: "4px" }}>
                Content on this website is published and managed by Directorate of Higher Education, Government of Chhattisgarh
              </p>
              <p style={{ color: "#7a90b5", fontSize: "12px", marginBottom: "8px" }}>
                Web Information Manager: Mr. Anand Charpe
              </p>
              <div style={{ fontWeight: 700, color: "#cdd5e8", marginBottom: "6px" }}>
                Managed By National Informatics Centre
              </div>
              <div style={styles.nicBadge}>
                <span style={{ fontWeight: 900, fontSize: "14px", color: "#5b9bd5" }}>NIC</span>
                <span>एनआईसी | National Informatics Centre</span>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Bottom strip */}
      <div style={styles.footerBottom}>
        <Container>
          <div style={styles.footerBottomBar}>
            <div>
              {[
                "Privacy Policy", "Terms & Conditions", "Disclaimer",
                "Accessibility", "RTI", "Feedback", "Help And Support",
              ].join(" | ")}
            </div>
            <div>Last Updated: 1/4/2026, 2:44:58 pm</div>
          </div>
        </Container>
      </div>
    </>
  );
}

function ServerDownOverlay({ onRetry }) {
  return (
    <div style={styles.serverDownOverlay}>
      <div style={styles.serverDownCard}>

        <div style={styles.serverDownHeader}>
          <img
            src="/Chhattisgarh.svg"
            alt="CG Emblem"
            style={{ height: "46px" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div>
            <p style={styles.serverDownTitle}>
              Department of Higher Education<br />Government of Chhattisgarh
            </p>
            <p style={styles.serverDownSub}>उच्च शिक्षा विभाग, छत्तीसगढ़ शासन</p>
          </div>
        </div>

        {/* Card body */}
        <div style={styles.serverDownBody}>
          <span style={styles.statusBadge}>🔴 SERVER UNAVAILABLE</span>

          <p style={styles.serverDownMsg}>
            Our servers are currently unavailable or undergoing scheduled maintenance.
            We apologise for the inconvenience. The portal will be restored shortly.
          </p>

          <hr style={styles.divider} />

          <div style={styles.infoRow}>
            <span style={styles.infoIcon}>📞</span>
            <span style={styles.infoText}>
              Helpline: <strong>91-771-2221234</strong>
            </span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoIcon}>✉</span>
            <span style={styles.infoText}>
              Email: <strong>wim.higheredu-cg@gov.in</strong>
            </span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoIcon}>🌐</span>
            <span style={styles.infoText}>
              <a
                href="https://highereducation.cg.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.visitLink}
              >
                highereducation.cg.gov.in
              </a>
            </span>
          </div>

          <hr style={styles.divider} />

          <div className="d-flex align-items-center flex-wrap gap-2 mt-2">
            <button style={styles.retryBtn} onClick={onRetry}>
              🔄 Retry Connection
            </button>
            <span style={{ color: "#888", fontSize: "12px" }}>
              Managed by National Informatics Centre
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServerDown({ onRetry }) {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 600);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: "100vh" }}>
      <TopBar />
      <SiteHeader />
      <SiteNavbar />
      <AboutSection />
      <SiteFooter />
      <ServerDownOverlay onRetry={onRetry} dots={dots} />
    </div>
  );
}