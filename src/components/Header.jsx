import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
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
  Input,
  Button,
  ButtonGroup
} from 'reactstrap';
import { FaSearch, FaPhone, FaEnvelope, FaTextHeight, FaLanguage } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { translations } from '../data/translations';
import DataService from '../services/DataService';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { language, toggleLanguage, isHindi } = useLanguage();
  const { increaseFontSize, decreaseFontSize, resetFontSize } = useAccessibility();

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const data = await DataService.getNavigationMenus();
      setMenuItems(data);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const toggle = () => setIsOpen(!isOpen);


  const t = (key) => translations[language][key] || key;

  return (
    <>
      {/* Skip to Main Content */}
      <a href="#main-content" className="skip-link">{t('skipToMain')}</a>

      {/* Top Bar */}
      <div className="top-bar py-2">
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex gap-3 small">
              <span><FaPhone className="me-1" /> +91-771-2221234</span>
              <span><FaEnvelope className="me-1" /> wim.higheredu-cg@gov.in</span>
            </div>
            <div className="d-flex gap-3 align-items-center">
              {/* Font Size Controls */}
              <div className="font-controls d-flex gap-1">
                <Button size="sm" color="link" onClick={decreaseFontSize} title={t('decreaseFont')} className="font-btn">
                  A
                </Button>
                <Button size="sm" color="link" onClick={resetFontSize} title={t('normalFont')} className="font-btn">
                  A
                </Button>
                <Button size="sm" color="link" onClick={increaseFontSize} title={t('increaseFont')} className="font-btn">
                  A+
                </Button>
              </div>
              <span className="text-white">|</span>
              {/* Language Switcher */}
              <Button size="sm" color="link" onClick={toggleLanguage} className="lang-btn" title={t('language')}>
                <FaLanguage className="me-1" />
                {isHindi ? 'English' : 'हिंदी'}
              </Button>
              <span className="text-white">|</span>
              <Link to="/accessibility" className="top-link">{t('accessibility')}</Link>
              <span className="text-white">|</span>
              <Link to="/sitemap" className="top-link">{t('sitemap')}</Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Logo Bar */}
      <div className="logo-bar py-3 border-bottom">
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex align-items-center gap-3">
              <img
                src="/public/logo.png"
                alt={isHindi ? 'छत्तीसगढ़ लोगो' : 'CG Logo'}
                height="70"
              />
              <div>
                <h4 className="mb-0 fw-bold">{t('deptName')}</h4>
                <p className="mb-0">{t('stateName')}</p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/150px-Emblem_of_India.svg.png" 
                alt="India Emblem" 
                height="70"
              />
            </div>
          </div>
        </Container>
      </div>

      {/* Main Navigation */}
      <Navbar color="white" expand="lg" className="shadow-sm main-navbar border-top border-dark border-2 ">
        <Container>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
            <Nav className="me-auto" navbar>
              {menuItems.map((item) => {
                // Handle external links without submenu
                if (item.isExternal && (!item.submenu || item.submenu.length === 0)) {
                  return (
                    <NavItem key={item.id}>
                      <NavLink
                        href={item.path}
                        target={item.openInNewTab ? '_blank' : '_self'}
                        rel={item.openInNewTab ? 'noopener noreferrer' : ''}
                        className="fw-semibold"
                      >
                        {isHindi ? item.titleHi : item.title}
                        {item.openInNewTab && <span className="ms-1">↗</span>}
                      </NavLink>
                    </NavItem>
                  );
                }

                // Handle menu items with submenu
                if (item.submenu && item.submenu.length > 0) {
                  return (
                    <UncontrolledDropdown nav inNavbar key={item.id} className="nav-dropdown-hover">
                      <DropdownToggle nav caret className="fw-semibold">
                        {isHindi ? item.titleHi : item.title}
                      </DropdownToggle>
                      <DropdownMenu>
                        {item.submenu.map((subItem) => {
                          // Handle nested submenu
                          if (subItem.submenu && subItem.submenu.length > 0) {
                            return (
                              <UncontrolledDropdown key={subItem.id} direction="end" className="nested-dropdown-hover">
                                <DropdownToggle tag="div" className="dropdown-item dropdown-toggle-nested" style={{ cursor: 'pointer' }}>
                                  {isHindi ? subItem.titleHi : subItem.title}
                                  <span className="float-end">›</span>
                                </DropdownToggle>
                                <DropdownMenu className="nested-dropdown">
                                  {subItem.submenu.map((nestedItem) => {
                                    if (nestedItem.isExternal) {
                                      return (
                                        <DropdownItem
                                          key={nestedItem.id}
                                          href={nestedItem.path}
                                          target={nestedItem.openInNewTab ? '_blank' : '_self'}
                                          rel={nestedItem.openInNewTab ? 'noopener noreferrer' : ''}
                                        >
                                          {isHindi ? nestedItem.titleHi : nestedItem.title}
                                          {nestedItem.openInNewTab && <span className="ms-1">↗</span>}
                                        </DropdownItem>
                                      );
                                    }
                                    return (
                                      <DropdownItem key={nestedItem.id} tag={Link} to={nestedItem.path}>
                                        {isHindi ? nestedItem.titleHi : nestedItem.title}
                                      </DropdownItem>
                                    );
                                  })}
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            );
                          }

                          // Handle regular submenu item
                          if (subItem.isExternal) {
                            return (
                              <DropdownItem
                                key={subItem.id}
                                href={subItem.path}
                                target={subItem.openInNewTab ? '_blank' : '_self'}
                                rel={subItem.openInNewTab ? 'noopener noreferrer' : ''}
                              >
                                {isHindi ? subItem.titleHi : subItem.title}
                                {subItem.openInNewTab && <span className="ms-1">↗</span>}
                              </DropdownItem>
                            );
                          }
                          return (
                            <DropdownItem key={subItem.id} tag={Link} to={subItem.path}>
                              {isHindi ? subItem.titleHi : subItem.title}
                            </DropdownItem>
                          );
                        })}
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  );
                }

                // Handle regular menu items without submenu
                return (
                  <NavItem key={item.id}>
                    <NavLink tag={Link} to={item.path} className="fw-semibold">
                      {isHindi ? item.titleHi : item.title}
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

