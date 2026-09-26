import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Container } from "reactstrap";
import {
  FaPhone, FaEnvelope, FaLanguage, FaUniversalAccess,
  FaSitemap, FaChevronDown, FaChevronRight, FaBars, FaTimes,
} from "react-icons/fa";
import { FaHouse } from "react-icons/fa6";
import { useLanguage } from "../contexts/LanguageContext";
import { useAccessibility } from "../contexts/AccessibilityContext";
import Swal from "sweetalert2";
import apiClient, { BASE_HOST } from "../services/api.service";

const BASE_URL = import.meta.env.BASE_URL || "/";

const getImageUrl = (path) => {
  if (!path) return `${BASE_URL}beyondsend-logo.svg`;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const clean = path.replace(/\\/g, "/");
  return `${BASE_HOST}/${clean.replace(/^\/+/, '')}`;
};

/* ── Desktop Dropdown ── */
const DesktopDropdown = ({ menu, isHindi, navigate, openExternalLink, depth = 0 }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const label = isHindi ? menu.titleHi : menu.titleEng;
  const hasChildren = menu.submenu?.length > 0;

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!hasChildren) {
    return (
      <button className="dd-item" onClick={() => {
        menu.isExternal ? openExternalLink(menu.path, menu.openInNewTab) : navigate(menu.path);
      }}>
        {label}
      </button>
    );
  }

  return (
    <div ref={ref} className="dd-wrap" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className={depth === 0 ? "nav-link-btn" : "dd-item d-flex justify-content-between w-100"}
        onClick={() => setOpen(v => !v)} aria-expanded={open}
      >
        {label}
        {depth === 0
          ? <FaChevronDown style={{ fontSize: ".65rem" }} className="ms-1" />
          : <FaChevronRight style={{ fontSize: ".65rem" }} />}
      </button>
      {open && (
        <div className={`dd-menu${depth > 0 ? " sub-right" : ""}`}>
          {menu.submenu.map(sub => (
            <DesktopDropdown
              key={sub._id} menu={sub} isHindi={isHindi}
              navigate={navigate} openExternalLink={openExternalLink}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Mobile Menu Item ── */
const MobileMenuItem = ({ menu, isHindi, navigate, openExternalLink, onClose }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = menu.submenu?.length > 0;
  const label = isHindi ? menu.titleHi : menu.titleEng;

  const handleClick = () => {
    if (hasChildren) setOpen(v => !v);
    else if (menu.isExternal) { onClose(); openExternalLink(menu.path, menu.openInNewTab); }
    else { onClose(); navigate(menu.path); }
  };

  return (
    <div className="mob-item">
      <button className="mob-btn" onClick={handleClick} aria-expanded={hasChildren ? open : undefined}>
        <span>{label}</span>
        {hasChildren && <span className={`chevron${open ? " open" : ""}`}><FaChevronDown /></span>}
      </button>
      {hasChildren && open && (
        <div className="mob-sub">
          {menu.submenu.map(sub => (
            <MobileMenuItem
              key={sub._id} menu={sub} isHindi={isHindi}
              navigate={navigate} openExternalLink={openExternalLink}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ══ Main Header ══ */
const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuItems, setMenuItems]   = useState([]);
  const [loading,   setLoading]     = useState(true);
  const [headerData, setHeaderData] = useState(null);

  const navigate = useNavigate();
  const { t, toggleLanguage, isHindi } = useLanguage();
  const { increaseFontSize, decreaseFontSize, resetFontSize } = useAccessibility();

  const openExternalLink = (url, newTab = true) => {
    Swal.fire({
      title: isHindi ? "बाहरी वेबसाइट" : "External Website",
      html: `<b>${isHindi ? "आप इस वेबसाइट को छोड़ने वाले हैं।" : "You are about to leave this website."}</b>`,
      icon: "info", showCancelButton: true,
      confirmButtonText: isHindi ? "जारी रखें" : "Continue",
      cancelButtonText: isHindi ? "रद्द करें" : "Cancel",
    }).then(result => {
      if (result.isConfirmed)
        newTab ? window.open(url, "_blank", "noopener,noreferrer") : (window.location.href = url);
    });
  };

  useEffect(() => {
    Promise.all([
      apiClient.get('/header/active').then(r => setHeaderData(r?.data || r || null)).catch(console.error),
      apiClient.get('/menu/list').then(r => setMenuItems(r?.data || r || [])).catch(console.error),
    ]).finally(() => setLoading(false));
  }, []);

  const visibleMenus = menuItems.slice(0, 10);
  const extraMenus   = menuItems.slice(10);

  if (loading) return null;

  return (
    <>
      {/* ── TOP BAR: slim contact + tools strip ── */}
      <div className="corp-top-bar" role="banner">
        <Container fluid className="px-3 px-lg-4">
          <div className="corp-top-inner">
            {/* Left: contact */}
            <div className="corp-top-left">
              {headerData?.phone && (
                <a href={`tel:${headerData.phone}`} className="corp-top-link" aria-label={`Call ${headerData.phone}`}>
                  <FaPhone size={10} aria-hidden="true" />
                  <span>{headerData.phone}</span>
                </a>
              )}
              {headerData?.phone && headerData?.email && (
                <span className="corp-top-sep" aria-hidden="true">|</span>
              )}
              {headerData?.email && (
                <a href={`mailto:${headerData.email}`} className="corp-top-link" aria-label={`Email ${headerData.email}`}>
                  <FaEnvelope size={10} aria-hidden="true" />
                  <span>{headerData.email}</span>
                </a>
              )}
            </div>

            {/* Right: tools */}
            <div className="corp-top-right">
              <div className="d-none d-md-flex align-items-center gap-1">
                <button className="corp-font-btn" onClick={decreaseFontSize} title="Decrease font size" aria-label="Decrease font size">A-</button>
                <button className="corp-font-btn" onClick={resetFontSize}    title="Reset font size"    aria-label="Reset font size">A</button>
                <button className="corp-font-btn" onClick={increaseFontSize} title="Increase font size" aria-label="Increase font size">A+</button>
              </div>
              <button
                className="corp-lang-btn"
                onClick={toggleLanguage}
                title={isHindi ? "Switch to English" : "हिंदी में बदलें"}
              >
                <FaLanguage aria-hidden="true" />
                {isHindi ? "English" : "हिंदी"}
              </button>
              <Link to="/accessibility-statement" className="corp-top-link d-none d-lg-inline-flex">
                <FaUniversalAccess aria-hidden="true" />
                {t("Accessibility", "अभिगम्यता")}
              </Link>
              <Link to="/sitemap" className="corp-top-link d-none d-lg-inline-flex">
                <FaSitemap aria-hidden="true" />
                {t("Sitemap", "साइट मानचित्र")}
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* ── LOGO BAR: clean corporate brand strip ── */}
      <div className="corp-logo-bar">
        <Container fluid className="px-3 px-lg-4">
          <div
            className="corp-brand"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
            role="link"
            aria-label="Go to home"
          >
            <img
              src={getImageUrl(headerData?.logo)}
              alt="BeyondSend Logo"
              className="corp-brand-logo"
              onError={e => (e.target.src = `${BASE_URL}beyondsend-logo.svg`)}
            />
            <div className="corp-brand-text">
              <div className="corp-brand-name">
                {isHindi
                  ? (headerData?.titleHin || "बियॉन्डसेंड")
                  : (headerData?.titleEng || "BeyondSend")}
              </div>
              <div className="corp-brand-tagline">
                {isHindi
                  ? (headerData?.subtitleHin || "कस्टमर कम्युनिकेशन प्लेटफॉर्म")
                  : (headerData?.subtitleEng || "Customer Communication Platform")}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* ── MAIN NAV ── */}
      <nav className="site-navbar shadow-sm" aria-label="Main navigation">
        <Container fluid className="d-flex align-items-center justify-content-between px-3 px-lg-4" style={{ flexWrap: "nowrap" }}>
          {/* Mobile brand */}
          <div
            className="corp-mob-brand d-flex align-items-center gap-2 d-lg-none py-1"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <img
              src={getImageUrl(headerData?.logo)}
              alt="BeyondSend Logo"
              height={36}
              style={{ objectFit: "contain" }}
              onError={e => (e.target.src = `${BASE_URL}beyondsend-logo.svg`)}
            />
            <div className="lh-1">
              <div className="fw-bold text-white" style={{ fontSize: "0.82rem" }}>
                {isHindi ? (headerData?.titleHin || "बियॉन्डसेंड") : (headerData?.titleEng || "BeyondSend")}
              </div>
              <small style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.65)" }}>
                {isHindi ? (headerData?.subtitleHin || "कस्टमर कम्युनिकेशन प्लेटफॉर्म") : (headerData?.subtitleEng || "Customer Communication Platform")}
              </small>
            </div>
          </div>

          {/* Desktop nav links */}
          <div className="desk-nav d-none d-lg-flex align-items-center">
            <Link to="/" className="nav-link-plain">
              <FaHouse className="me-1" aria-hidden="true" />{t("Home", "मुख्य पृष्ठ")}
            </Link>
            {visibleMenus.map(menu => {
              if (menu.submenu?.length)
                return <DesktopDropdown key={menu._id} menu={menu} isHindi={isHindi} navigate={navigate} openExternalLink={openExternalLink} />;
              if (menu.isExternal)
                return (
                  <button key={menu._id} className="nav-link-btn" onClick={() => openExternalLink(menu.path, menu.openInNewTab)}>
                    {isHindi ? menu.titleHi : menu.titleEng}
                  </button>
                );
              return (
                <Link key={menu._id} to={menu.path} className="nav-link-plain">
                  {isHindi ? menu.titleHi : menu.titleEng}
                </Link>
              );
            })}
            {extraMenus.length > 0 && (
              <DesktopDropdown
                menu={{ _id: "__extra__", titleHi: "अन्य लिंक", titleEng: "Other Links", submenu: extraMenus }}
                isHindi={isHindi} navigate={navigate} openExternalLink={openExternalLink}
              />
            )}
          </div>

          {/* Hamburger */}
          <button
            className="ham-btn btn btn-sm ms-auto py-1 px-2 flex-shrink-0 d-lg-none"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
          >
            <FaBars />
          </button>
        </Container>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      <div
        className={`mob-overlay${mobileOpen ? " open" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <div className={`mob-drawer${mobileOpen ? " open" : ""}`} role="dialog" aria-label="Mobile navigation">
        <div className="mob-drawer-hdr">
          <img
            src="/beyondsend-logo.svg"
            alt="BeyondSend"
            style={{ height: 32, width: "auto", objectFit: "contain" }}
          />
          <button className="mob-close-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>
        <div className="mob-item">
          <button className="mob-btn" onClick={() => { setMobileOpen(false); navigate("/"); }}>
            <span><FaHouse className="me-2" aria-hidden="true" />{t("Home", "मुख्य पृष्ठ")}</span>
          </button>
        </div>
        {menuItems.map(menu => (
          <MobileMenuItem
            key={menu._id} menu={menu} isHindi={isHindi}
            navigate={navigate} openExternalLink={openExternalLink}
            onClose={() => setMobileOpen(false)}
          />
        ))}
      </div>
    </>
  );
};

export default Header;