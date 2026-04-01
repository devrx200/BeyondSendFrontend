import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Container,
  Button,
  Badge,
} from "reactstrap";
import {
  FaPhone,
  FaEnvelope,
  FaLanguage,
  FaUniversalAccess,
  FaSitemap,
  FaEllipsisH,
} from "react-icons/fa";
import { FaHouse } from "react-icons/fa6";
import { useLanguage } from "../contexts/LanguageContext";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { translations } from "../data/translations";
import { handleMenuClick } from "../utilies/handleMenuClick";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { language, toggleLanguage, isHindi } = useLanguage();
  const { increaseFontSize, decreaseFontSize, resetFontSize } =
    useAccessibility();

  const t = (key) => translations[language][key] || key;
  const [headerData, setHeaderData] = useState(null);

  const fetchHeader = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/get-active-header`);
      setHeaderData(res.data.data);
    } catch (err) {
      console.error("Header fetch error", err);
    }
  };



  const openExternalLink = (url, newTab = true) => {
    Swal.fire({
      title: "External Website",
      html: `<b>You are about to leave this website and visit an external site.</b>`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Continue",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0d6efd",
    }).then((result) => {
      if (result.isConfirmed) {
        if (newTab) {
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = url;
        }
      }
    });
  };

  /* ================= FETCH MENU ================= */
  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/menu-list`);
      setMenuItems(res?.data?.data || []);
    } catch (err) {
      console.error("Menu fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchHeader();
  }, []);




  // Menus 

  const visibleMenus = menuItems.slice(0, 8);
  const extraMenus = menuItems.slice(8);


  if (loading) return null;

  return (
    <>

      {/* ================= TOP BAR ================= */}
      <div className="top-bar py-1 text-white">
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap">

            {/* LEFT CONTACT */}
            <div className="d-flex align-items-center gap-4 small fw-semibold">
              <span className="d-flex align-items-center">
                <FaPhone className="me-2" />

                <a href={`tel:${headerData?.phone}`} className="text-white text-decoration-none">
                  {headerData?.phone}
                </a>
              </span>

              <span className="d-flex align-items-center">
                <FaEnvelope className="me-2" />

                <a href={`mailto:${headerData?.email}`} className="text-white text-decoration-none">
                  {headerData?.email}
                </a>
              </span>
            </div>

            {/* RIGHT CONTROLS */}
            <div className="d-none d-lg-flex align-items-center gap-3">


              <div className="d-flex gap-1">
                <Badge color="light" className="p-1 text-dark fw-bold" onClick={decreaseFontSize}>
                  A-
                </Badge>
                <Badge color="light" className="p-1 text-dark fw-bold" onClick={resetFontSize}>
                  A
                </Badge>
                <Badge color="light" className="p-1 text-dark fw-bold" onClick={increaseFontSize}>
                  A+
                </Badge>
              </div>

              {/* LANGUAGE */}
              <Badge
                color="light"
                className="p-1 text-dark fw-bold d-flex align-items-center gap-1"
                onClick={toggleLanguage}
              >
                <FaLanguage />
                {isHindi ? "English" : "हिंदी"}
              </Badge>

              {/* ACCESSIBILITY */}
              <Link to="/accessibility-statement" className="top-link text-white">
                <FaUniversalAccess className="me-1" />
                {t("accessibility")}
              </Link>

              {/* SITEMAP */}
              <Link to="/sitemap" className="top-link text-white">
                <FaSitemap className="me-1" />
                {t("sitemap")}
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* ================= LOGO BAR ================= */}
      <div className="logo-bar py-2 border-bottom bg-light">
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap">

            {/* <div className="d-flex align-items-center gap-3">
        <img src="/Chhattisgarh.svg" alt="CG Logo" height="70" />
        <div>
          <h4 className="mb-0 fw-bold">{t("deptName")}</h4>
          <p className="mb-0">{t("stateName")}</p>
        </div>
      </div> */}

            <div className="d-flex align-items-center gap-3">
              <img
                src={
                  headerData?.logo
                    ? `${API_URL}${headerData.logo}`
                    : "/Chhattisgarh.svg"   // fallback
                }
                alt="logo"
                className="main-logo"
                height="70"
                onError={(e) => (e.target.src = "/Chhattisgarh.svg")}
              />

              <div>
                <h4 className="mb-0 fw-bold">
                  {isHindi
                    ? (headerData?.titleHin || "उच्च शिक्षा विभाग")
                    : (headerData?.titleEng || "Department of Higher Education")}
                </h4>
                <p className="mb-0">
                  {isHindi
                    ? (headerData?.subtitleHin || "छत्तीसगढ़")
                    : (headerData?.subtitleEng || "Chhattisgarh")}
                </p>
              </div>
            </div>

            {/* <div className="d-flex gap-3">
        <img src="/Digital_India_logo.svg" alt="Digital India" height="60" />
        <img src="/Emblem_of_India.svg" alt="India Emblem" height="60" />
      </div> */}

            <div className="d-flex gap-3">
              <img
                src={
                  headerData?.digitalLogo
                    ? `${API_URL}${headerData.digitalLogo}`
                    : "/Digital_India_logo.svg"
                }
                className="right-logo"
                height="60"
                onError={(e) => (e.target.src = "/Digital_India_logo.svg")}
              />

              <img
                src={
                  headerData?.emblem
                    ? `${API_URL}${headerData.emblem}`
                    : "/Emblem_of_India.svg"
                }
                className="right-logo"
                height="60"
                onError={(e) => (e.target.src = "/Emblem_of_India.svg")}
              />
            </div>

          </div>
        </Container>
      </div>

      {/* ================= NAVBAR ================= */}
      <Navbar expand="lg" light className="shadow-sm bg-white sticky-top py-1">
        <Container>
          <NavbarToggler onClick={() => setIsOpen(!isOpen)} className="border-0" />

          <Collapse isOpen={isOpen} navbar>
            <Nav className="me-auto" navbar>

              {/* HOME */}
              <NavItem>
                <NavLink tag={Link} to="/" className="fw-semibold">
                  <FaHouse className="me-1" />
                  {t("home")}
                </NavLink>
              </NavItem>

              {/* DYNAMIC MENUS */}
              {visibleMenus.map((menu) =>
                menu.submenu?.length ? (
                  <UncontrolledDropdown nav inNavbar key={menu._id}>
                    <DropdownToggle nav caret className="fw-semibold">
                      {isHindi ? menu.titleHi : menu.titleEng}
                    </DropdownToggle>

                    <DropdownMenu>
                      {menu.submenu.map((sub) =>
                        sub.submenu?.length ? (
                          <UncontrolledDropdown key={sub._id} direction="end">
                            <DropdownToggle
                              tag="div"
                              className="dropdown-item"
                              style={{ cursor: "pointer" }}
                            >
                              {isHindi ? sub.titleHi : sub.titleEng}
                              <span className="float-end">›</span>
                            </DropdownToggle>

                            <DropdownMenu>
                              {sub.submenu.map((child) => (
                                <DropdownItem
                                  key={child._id}
                                  onClick={() =>
                                    handleMenuClick({ menu: child, navigate })
                                  }
                                >
                                  {isHindi ? child.titleHi : child.titleEng}
                                </DropdownItem>
                              ))}
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        ) : (
                          <DropdownItem
                            key={sub._id}
                            onClick={() => handleMenuClick({ menu: sub, navigate })}
                          >
                            {isHindi ? sub.titleHi : sub.titleEng}
                          </DropdownItem>
                        )
                      )}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                ) : menu.isExternal ? (
                  <NavItem key={menu._id}>
                    <NavLink
                      href="#"
                      className="fw-semibold"
                      onClick={(e) => {
                        e.preventDefault();
                        openExternalLink(menu.path, menu.openInNewTab);
                      }}
                    >
                      {isHindi ? menu.titleHi : menu.titleEng}
                    </NavLink>
                  </NavItem>
                ) : (
                  <NavItem key={menu._id}>
                    <NavLink tag={Link} to={menu.path} className="fw-semibold">
                      {isHindi ? menu.titleHi : menu.titleEng}
                    </NavLink>
                  </NavItem>
                )
              )}
              {/* <Extra></Extra> */}

              {extraMenus.length > 0 && (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret className="fw-semibold">
                    <b className="text-primary"> {isHindi ? "अन्य लिंक" : "Other Links"}<FaEllipsisH /></b>
                  </DropdownToggle>

                  <DropdownMenu>

                    {extraMenus.map((menu) =>
                      menu.isExternal ? (
                        <DropdownItem
                          key={menu._id}
                          onClick={() => openExternalLink(menu.path, menu.openInNewTab)}
                        >
                          {isHindi ? menu.titleHi : menu.titleEng}
                        </DropdownItem>
                      ) : (
                        <DropdownItem
                          key={menu._id}
                          onClick={() => navigate(menu.path)}
                        >
                          {isHindi ? menu.titleHi : menu.titleEng}
                        </DropdownItem>
                      )
                    )}

                  </DropdownMenu>
                </UncontrolledDropdown>
              )}
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;