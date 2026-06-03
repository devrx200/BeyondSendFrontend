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

const styles = `
  .top-bar { background-color: #1a3a6b; }
  .top-link { color:#fff; text-decoration:none; font-size:.82rem; display:inline-flex; align-items:center; }
  .top-link:hover { text-decoration:underline; }
  .ctrl-badge { cursor:pointer; user-select:none; padding:3px 7px !important; }

  .site-navbar { border-bottom:3px solid #1a3a6b; position:sticky; top:0; z-index:1030; }
  .nav-link-btn { background:none; border:none; padding:8px 10px; font-size:.88rem; font-weight:600; color:#1a3a6b; cursor:pointer; display:inline-flex; align-items:center; gap:3px; border-radius:4px; white-space:nowrap; }
  .nav-link-btn:hover, .nav-link-plain:hover { background:#eef2fa; }
  .nav-link-plain { padding:8px 10px; font-size:.88rem; font-weight:600; color:#1a3a6b; text-decoration:none; display:inline-flex; align-items:center; gap:4px; border-radius:4px; white-space:nowrap; }

  .dd-wrap { position:relative; }
  .dd-menu { position:absolute; top:100%; left:0; min-width:210px; background:#fff; border:1px solid #dce3f0; border-radius:6px; box-shadow:0 6px 20px rgba(0,0,0,.12); z-index:2000; padding:4px 0; animation:fadeSlide .15s ease; }
  .dd-menu.sub-right { top:0; left:100%; }
  .dd-item { display:flex; width:100%; padding:8px 16px; font-size:.85rem; color:#1a3a6b; background:none; border:none; cursor:pointer; text-align:left; gap:6px; }
  .dd-item:hover { background:#eef2fa; }
  @keyframes fadeSlide { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

  .mob-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:1040; }
  .mob-overlay.open { display:block; }
  .mob-drawer { position:fixed; top:0; left:-100%; width:min(300px,85vw); height:100%; background:#fff; z-index:1050; overflow-y:auto; transition:left .25s ease; display:flex; flex-direction:column; }
  .mob-drawer.open { left:0; }
  .mob-drawer-hdr { background:#1a3a6b; color:#fff; padding:14px 16px; display:flex; justify-content:space-between; align-items:center; font-weight:700; flex-shrink:0; }
  .mob-close-btn { background:none; border:none; color:#fff; font-size:1.2rem; cursor:pointer; }
  .mob-item { border-bottom:1px solid #eaeef7; }
  .mob-btn { background:none; border:none; width:100%; text-align:left; padding:12px 16px; font-size:.9rem; font-weight:600; color:#1a3a6b; display:flex; justify-content:space-between; align-items:center; cursor:pointer; }
  .mob-btn:hover { background:#eef2fa; }
  .mob-sub { background:#f7f9ff; border-top:1px solid #dce3f0; }
  .mob-sub .mob-btn { padding-left:28px; font-size:.86rem; font-weight:500; }
  .mob-sub .mob-sub .mob-btn { padding-left:44px; }
  .chevron { transition:transform .2s; display:inline-flex; font-size:.72rem; }
  .chevron.open { transform:rotate(180deg); }

  @media (max-width:991.98px) {
    .desk-nav { display:none !important; }
    .ham-btn { display:inline-flex !important; }
    .main-logo { height:48px !important; }
    .right-logo { height:40px !important; }
  }
  @media (min-width:992px) { .ham-btn { display:none !important; } }
  @media (max-width:575.98px) {
    .main-logo { height:38px !important; }
    .right-logo { height:32px !important; }
    .logo-bar h4 { font-size:.88rem; }
  }
`;

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
        if (menu.isExternal) {
          openExternalLink(menu.path, menu.openInNewTab);
        } else {
          navigate(menu.path);
        }
      }}>
        {label}
      </button>
    );
  }

  return (
    <div ref={ref} className="dd-wrap" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className={depth === 0 ? "nav-link-btn" : "dd-item d-flex justify-content-between w-100"}
        onClick={() => setOpen(v => !v)} aria-expanded={open}>
        {label}
        {depth === 0
          ? <FaChevronDown style={{ fontSize: ".65rem" }} className="ms-1" />
          : <FaChevronRight style={{ fontSize: ".65rem" }} />}
      </button>
      {open && (
        <div className={`dd-menu${depth > 0 ? " sub-right" : ""}`}>
          {menu.submenu.map(sub => (
            <DesktopDropdown key={sub._id} menu={sub} isHindi={isHindi} navigate={navigate} openExternalLink={openExternalLink} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

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
            <MobileMenuItem key={sub._id} menu={sub} isHindi={isHindi} navigate={navigate} openExternalLink={openExternalLink} onClose={onClose} />
          ))}
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [headerData, setHeaderData] = useState(null);

  const navigate = useNavigate();
  const { t, toggleLanguage, isHindi } = useLanguage();
  const { increaseFontSize, decreaseFontSize, resetFontSize } = useAccessibility();

  const fetchHeader = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/get-active-header`);
      setHeaderData(res.data.data);
    } catch (err) { console.error("Header fetch error", err); }
  };

  const openExternalLink = (url, newTab = true) => {
    Swal.fire({
      title: "External Website",
      html: `<b>You are about to leave this website and visit an external site.</b>`,
      icon: "info", showCancelButton: true,
      confirmButtonText: "Continue", cancelButtonText: "Cancel",
      confirmButtonColor: "#0d6efd",
    }).then(result => {
      if (result.isConfirmed)
        newTab ? window.open(url, "_blank", "noopener,noreferrer") : (window.location.href = url);
    });
  };

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/menu-list`);
      setMenuItems(res?.data?.data || []);
    } catch (err) { console.error("Menu fetch error", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMenus(); fetchHeader(); }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 992) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const visibleMenus = menuItems.slice(0, 8);
  const extraMenus = menuItems.slice(8);

  if (loading) return null;

  return (
    <>
      <style>{styles}</style>

      <div className="top-bar py-1 text-white">
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-1">
            <div className="d-flex align-items-center gap-3 small fw-semibold">
              <a href={`tel:${headerData?.phone}`} className="top-link">
                <FaPhone className="me-1 flex-shrink-0" />{headerData?.phone}
              </a>
              <a href={`mailto:${headerData?.email}`} className="top-link">
                <FaEnvelope className="me-1 flex-shrink-0" />{headerData?.email}
              </a>
            </div>
            <div className="d-none d-lg-flex align-items-center gap-3">
              <div className="d-flex gap-1">
                <Badge color="light" className="ctrl-badge text-dark fw-bold" onClick={decreaseFontSize}>A-</Badge>
                <Badge color="light" className="ctrl-badge text-dark fw-bold" onClick={resetFontSize}>A</Badge>
                <Badge color="light" className="ctrl-badge text-dark fw-bold" onClick={increaseFontSize}>A+</Badge>
              </div>
              <Badge color="light" className="ctrl-badge text-dark fw-bold d-flex align-items-center gap-1" onClick={toggleLanguage}>
                <FaLanguage />{isHindi ? "English" : "हिंदी"}
              </Badge>
              <Link to="/accessibility-statement" className="top-link">
                <FaUniversalAccess className="me-1" />{t("Accessibility", "अभिगम्यता")}
              </Link>
              <Link to="/sitemap" className="top-link">
                <FaSitemap className="me-1" />{t("Sitemap", "साइट मानचित्र")}
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <div className="logo-bar py-2 border-bottom bg-light">
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <img src={headerData?.logo ? `${API_URL}${headerData.logo}` : "/Chhattisgarh.svg"} alt="logo" className="main-logo" height="70" style={{ cursor: "pointer" }} onClick={() => navigate("/")} onError={e => (e.target.src = "/Chhattisgarh.svg")} />
              <div>
                <h4 className="mb-0 fw-bold">
                  {isHindi ? (headerData?.titleHin || "उच्च शिक्षा विभाग") : (headerData?.titleEng || "Department of Higher Education")}
                </h4>
                <p className="mb-0 text-muted small">
                  {isHindi ? (headerData?.subtitleHin || "छत्तीसगढ़") : (headerData?.subtitleEng || "Chhattisgarh")}
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <img src={headerData?.digitalLogo ? `${API_URL}${headerData.digitalLogo}` : "/Digital_India_logo.svg"} className="right-logo" height="60" alt="Digital India" style={{ cursor: "pointer" }} onClick={() => navigate("/")} onError={e => (e.target.src = "/Digital_India_logo.svg")} />
              <img src={headerData?.emblem ? `${API_URL}${headerData.emblem}` : "/Emblem_of_India.svg"} className="right-logo" height="60" alt="Emblem" style={{ cursor: "pointer" }} onClick={() => navigate("/")} onError={e => (e.target.src = "/Emblem_of_India.svg")} />
            </div>
          </div>
        </Container>
      </div>

      <nav className="site-navbar bg-white shadow-sm py-1">
        <Container className="d-flex align-items-center">
          <button className="ham-btn btn btn-outline-primary btn-sm me-2 py-1 px-2" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <FaBars />
          </button>
          <div className="desk-nav d-flex align-items-center flex-wrap">
            <Link to="/" className="nav-link-plain">
              <FaHouse className="me-1" />{t("Home", "मुख्य पृष्ठ")}
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
              <DesktopDropdown menu={{ _id: "__extra__", titleHi: "अन्य लिंक", titleEng: "Other Links", submenu: extraMenus }} isHindi={isHindi} navigate={navigate} openExternalLink={openExternalLink} />
            )}
          </div>
        </Container>
      </nav>

      <div className={`mob-overlay${mobileOpen ? " open" : ""}`} onClick={() => setMobileOpen(false)} />
      <div className={`mob-drawer${mobileOpen ? " open" : ""}`}>
        <div className="mob-drawer-hdr">
          <span>Menu</span>
          <button className="mob-close-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>
        <div className="mob-item">
          <button className="mob-btn" onClick={() => { setMobileOpen(false); navigate("/"); }}>
            <span><FaHouse className="me-2" />{t("Home", "मुख्य पृष्ठ")}</span>
          </button>
        </div>
        {menuItems.map(menu => (
          <MobileMenuItem key={menu._id} menu={menu} isHindi={isHindi} navigate={navigate} openExternalLink={openExternalLink} onClose={() => setMobileOpen(false)} />
        ))}
      </div>
    </>
  );
};

export default Header;