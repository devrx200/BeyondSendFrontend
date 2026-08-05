import { useState, useEffect, useRef } from "react";
import axios from "axios";
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

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = import.meta.env.BASE_URL;


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
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headerData, setHeaderData] = useState(null);

  // NEW: top-3 department leader profiles for the header center gap
  const [leaderProfiles, setLeaderProfiles] = useState([]);

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
      confirmButtonColor: "#0d6efd",
    }).then(result => {
      if (result.isConfirmed)
        newTab ? window.open(url, "_blank", "noopener,noreferrer") : (window.location.href = url);
    });
  };

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/get-active-header`).then(r => setHeaderData(r.data.data)).catch(console.error),
      axios.get(`${API_URL}/api/menu-list`).then(r => setMenuItems(r?.data?.data || [])).catch(console.error),
    ]).finally(() => setLoading(false));
  }, []);

  // NEW: same endpoint AboutSection.jsx uses — top 3 active leader profiles, sorted by order
  useEffect(() => {
    const fetchLeaderProfiles = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/get-about-sections`);
        const filteredAndSorted = (res.data?.departmentLeaderProfiles || [])
          .filter(item => item.isActive === true)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .slice(0, 3);
        setLeaderProfiles(filteredAndSorted);
      } catch (err) {
        console.error("Failed to fetch header leader profiles", err);
      }
    };
    fetchLeaderProfiles();
  }, []);

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Desktop Navigation: Keep 10 visible items so "Other Links" fits on 1 SINGLE ROW on desktop
  const visibleMenus = menuItems.slice(0, 10);
  const extraMenus = menuItems.slice(10);

  if (loading) return null;

  return (
    <>
      <span className="nav-pattern-strip" />
      {/* ── TOP BAR ── */}
      <div className="top-bar fw-bold py-0 text-white border-2 border-warning " role="banner">
        <Container fluid>
          {/* 3-column layout: Phone LEFT · Email CENTER · Language RIGHT */}
          <div
            className="container-inner d-flex align-items-center justify-content-between"
            style={{ minHeight: 34, gap: 8 }}
          >
            {/* LEFT — Phone */}
            <div className="top-item-left d-flex align-items-center">
              {headerData?.phone && (
                <a href={`tel:${headerData.phone}`} className="top-link" aria-label={`Call ${headerData.phone}`}>
                  <FaPhone size={11} aria-hidden="true" />
                  <span>{headerData.phone}</span>
                </a>
              )}
            </div>

            {/* CENTER — Email */}
            <div className="top-item-center d-flex align-items-center justify-content-center text-center">
              {headerData?.email && (
                <a href={`mailto:${headerData.email}`} className="top-link" aria-label={`Email ${headerData.email}`}>
                  <FaEnvelope size={11} aria-hidden="true" />
                  <span>{headerData.email}</span>
                </a>
              )}
            </div>

            {/* RIGHT — Language button & controls */}
            <div className="top-item-right d-flex align-items-center justify-content-end gap-1">
              <div className="d-none d-md-flex gap-1">
                <Badge color="light" className="ctrl-badge text-dark" role="button" onClick={decreaseFontSize} title="Decrease font size">A-</Badge>
                <Badge color="light" className="ctrl-badge text-dark" role="button" onClick={resetFontSize} title="Reset font size">A</Badge>
                <Badge color="light" className="ctrl-badge text-dark" role="button" onClick={increaseFontSize} title="Increase font size">A+</Badge>
              </div>
              <Badge
                color="light"
                className="ctrl-badge text-dark d-flex align-items-center gap-1"
                role="button"
                onClick={toggleLanguage}
                title={isHindi ? "Switch to English" : "हिंदी में बदलें"}
              >
                <FaLanguage aria-hidden="true" />
                {isHindi ? "English" : "हिंदी"}
              </Badge>
              <Link to="/accessibility-statement" className="top-link d-none d-lg-inline-flex">
                <FaUniversalAccess aria-hidden="true" />
                {t("Accessibility", "अभिगम्यता")}
              </Link>
              <Link to="/sitemap" className="top-link d-none d-lg-inline-flex">
                <FaSitemap aria-hidden="true" />
                {t("Sitemap", "साइट मानचित्र")}
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* ── LOGO BAR ── */}
      <div className="logo-bar py-2">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center flex-nowrap gap-2 gap-xl-3">
            {/* Left — logo + title (Desktop only) */}
            <div className="d-none d-lg-flex align-items-center gap-3 flex-shrink-0" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
              <img
                src={headerData?.logo ? `${API_URL}${headerData.logo}` : `${BASE_URL}Chhattisgarh.svg`}
                alt="Chhattisgarh Logo"
                className="main-logo"
                height={60}
                style={{ objectFit: "contain" }}
                onError={e => (e.target.src = `${BASE_URL}Chhattisgarh.svg`)}
              />
              <div>
                <h4 className="mb-0">
                  {isHindi
                    ? (headerData?.titleHin || "उच्च शिक्षा विभाग")
                    : (headerData?.titleEng || "Department of Higher Education")}
                </h4>
                <p className="mb-0">
                  {isHindi
                    ? (headerData?.subtitleHin || "छत्तीसगढ़ सरकार")
                    : (headerData?.subtitleEng || "Government of Chhattisgarh")}
                </p>
              </div>
            </div>

            {/* CENTER — top 3 department leader profiles (1 single horizontal row on all devices) */}
            {leaderProfiles.length > 0 && (
              <div className="d-flex align-items-center justify-content-center justify-content-lg-center w-100 w-lg-auto mx-auto leader-profiles-wrap py-1">
                {leaderProfiles.map(profile => (
                  <div key={profile._id} className="d-flex align-items-center leader-profile-item">
                    <img
                      src={
                        profile.profileUrl
                          ? `${API_URL}${profile.profileUrl}`
                          : "/placeholder.png"
                      }
                      alt={isHindi ? profile.imgNameHin : profile.imgNameEng}
                      className="leader-profile-img me-1 me-md-2"
                      style={{ objectFit: "contain" }}
                    />
                    <div className="leader-profile-text-wrap">
                      <div className="leader-profile-name">
                        {isHindi ? profile.imgNameHin : profile.imgNameEng}
                      </div>
                      <div className="leader-profile-designation">
                        <span className="d-none d-lg-inline">
                          {isHindi ? profile.designationHin : profile.designationEng}
                        </span>
                        <span className="d-inline d-lg-none">
                          {profile.designationHin}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Right — Digital India + Emblem (Desktop only) */}
            <div className="d-none d-lg-flex align-items-center gap-2">
              {/* <img
                src={headerData?.digitalLogo ? `${API_URL}${headerData.digitalLogo}` : `${BASE_URL}Digital_India_logo.svg`}
                className={`right-logo ${!isHindi ? "hide-digital-india-eng" : ""}`}
                height={52}
                alt="Digital India"
                style={{ objectFit: "contain", cursor: "pointer" }}
                onClick={() => navigate("/")}
                onError={e => (e.target.src = `${BASE_URL}Digital_India_logo.svg`)}
              /> */}
              <img
                src={headerData?.emblem ? `${API_URL}${headerData.emblem}` : `${BASE_URL}Emblem_of_India.svg`}
                className="right-logo"
                height={52}
                alt="Emblem of India"
                style={{ objectFit: "contain", cursor: "pointer" }}
                onClick={() => navigate("/")}
                onError={e => (e.target.src = `${BASE_URL}Emblem_of_India.svg`)}
              />
            </div>
          </div>
        </Container>
      </div>

      {/* ── MAIN NAV ── */}
      <nav className="site-navbar shadow-sm " aria-label="Main navigation">
        <Container className="d-flex align-items-center justify-content-between" style={{ flexWrap: "nowrap" }}>
          {/* Mobile Nav Brand (Emblem + Department Title) — Always visible on mobile view */}
          <div className="mobile-nav-brand d-flex align-items-center gap-2 d-lg-none py-1" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            <img
              src={headerData?.logo ? `${API_URL}${headerData.logo}` : `${BASE_URL}Chhattisgarh.svg`}
              alt="Chhattisgarh Logo"
              height={40}
              style={{ objectFit: "contain" }}
              onError={e => (e.target.src = `${BASE_URL}Chhattisgarh.svg`)}
            />
            <div className="lh-1">
              <div className="fw-bold text-white" style={{ fontSize: "0.82rem", lineHeight: "1.1" }}>
                {isHindi ? (headerData?.titleHin || "उच्च शिक्षा विभाग") : (headerData?.titleEng || "Department of Higher Education")}
              </div>
              <small style={{ fontSize: "0.68rem", color: "#ffd54f" }}>
                {isHindi ? (headerData?.subtitleHin || "छत्तीसगढ़ सरकार") : (headerData?.subtitleEng || "Government of Chhattisgarh")}
              </small>
            </div>
          </div>

          {/* Desktop Nav Links — Hidden on mobile */}
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

          {/* Hamburger Menu Button — Positioned on RIGHT SIDE for mobile */}
          <button
            className="ham-btn btn btn-outline-primary btn-sm ms-auto py-1 px-2 flex-shrink-0 d-lg-none"
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
            src="/cg-hiedu-full-logo.jpg"
            alt="Higher Education Department Chhattisgarh"
            className="img-fluid  rounded me-2"
            style={{ height: "clamp(16px,   15px)", width: "150px", objectFit: "contain" }}
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