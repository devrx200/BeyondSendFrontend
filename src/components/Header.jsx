import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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
} from "reactstrap";
import {  FaPhone, FaEnvelope,  FaLanguage, FaUniversalAccess, FaSitemap } from "react-icons/fa";
import { FaHouse } from "react-icons/fa6";
import { useLanguage } from "../contexts/LanguageContext";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { translations } from "../data/translations";
import { handleMenuClick } from "../utilies/handleMenuClick";
import DynamicPage from "../views/pages/DynamicPage";
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



  

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/menu-list`);
      setMenuItems(res.data.data || []);
    } catch (err) {
      console.error("Menu fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [API_URL]);

  if (loading) return null;

  return (
    <>
      {/* Skip to Main Content */}
      <a href="#main-content" className="skip-link">
        {t("skipToMain")}
      </a>

      {/* Top Bar */}
      <div className="top-bar border-bottom"> 
       
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            {/* LEFT INFO */}
            <div className="d-flex align-items-center gap-4 small text-dark">
              <span className="d-flex align-items-center text-white fw-bold">
                <FaPhone className="me-1 text-white" />
                +91-771-2221234
              </span>
              <span className="d-flex align-items-center text-white fw-bold">
                <FaEnvelope className="me-1 text-white" />
                wim.higheredu-cg@gov.in
              </span>
            </div>

            {/* RIGHT CONTROLS */}
            <div className="d-flex align-items-center gap-3 flex-wrap">

              {/* FONT SIZE CONTROLS */}
              <div className="font-controls d-flex align-items-center gap-1">
                <Button size="sm" className="px-2 fw-bold" color="light" onClick={decreaseFontSize} title="Decrease Font Size">
                  A-
                </Button>
                <Button size="sm" className="px-2 fw-bold" color="light" onClick={resetFontSize} title="Reset Font Size">
                  A
                </Button>
                <Button size="sm" className="px-2 fw-bold" color="light" onClick={increaseFontSize} title="Increase Font Size">
                  A+
                </Button>
              </div>

              <span className="divider">|</span>

              {/* LANGUAGE SWITCH */}
              <Button
                size="sm"
                color="light"
                onClick={toggleLanguage}
                className="d-flex align-items-center gap-1 px-2"
                title="Change language"
              >
                <FaLanguage />
                <span>{isHindi ? "English" : "हिंदी"}</span>
              </Button>

              <span className="divider">|</span>

              {/* ACCESSIBILITY */}
              <Link
                to="/accessibility"
                className="top-link d-flex align-items-center gap-1 fw-bold"
              >
                <FaUniversalAccess />
                <span>{t("accessibility")}</span>
              </Link>

              <span className="divider">|</span>

              {/* SITEMAP */}
              <Link
                to="/sitemap"
                className="top-link d-flex align-items-center gap-1 fw-bold"
              >
                <FaSitemap />
                <span>{t("sitemap")}</span>
              </Link>

            </div>


          </div>
        </Container>
      </div>

      {/* Logo Bar */}
      <div className="logo-bar py-1 border-bottom bg-light">
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex align-items-center gap-3">
              <img src="/public/Chhattisgarh.svg" alt="CG Logo" height="70" />
              <div>
                <h4 className="mb-0 fw-bold">{t("deptName")}</h4>
                <p className="mb-0">{t("stateName")}</p>
              </div>
            </div>

            <img
              src="/public/Emblem_of_India.svg"
              alt="India Emblem"
              height="70"
            />
          </div>
        </Container>
      </div>

      {/* Main Navigation */}
      <Navbar expand="lg" className="shadow-sm border-top border-dark">
        <Container>
          <NavbarToggler onClick={() => setIsOpen(!isOpen)} />

          <Collapse isOpen={isOpen} navbar>
            <Nav className="me-auto" navbar>
              <NavItem>
                <NavLink tag={Link} to="/" className="fw-semibold">
                  <FaHouse className="me-1 fs-5 mb-2 " />
                  {t("home")}
                </NavLink>
              </NavItem>

              {menuItems.map((menu) => {
                if (menu.submenu?.length) {
                  return (
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
                                      handleMenuClick({
                                        menu: child, // ✅ key name MUST be "menu"
                                        navigate, // ✅ key name MUST be "navigate"
                                      })
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
                              onClick={() =>
                                handleMenuClick({
                                  menu: sub, // ✅ key name MUST be "menu"
                                  navigate, // ✅ key name MUST be "navigate"
                                })
                              }
                            >
                              {isHindi ? sub.titleHi : sub.titleEng}
                            </DropdownItem>
                          )
                        )}
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  );
                }

                return menu.isExternal ? (
                  <NavItem key={menu._id}>
                    <NavLink
                      href={menu.path}
                      target={menu.openInNewTab ? "_blank" : "_self"}
                      className="fw-semibold"
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
                );
              })}
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
