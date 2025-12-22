import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  FaHome, FaBullhorn, FaImages, FaFileAlt, FaSignOutAlt,
  FaNewspaper, FaUser, FaBars, FaTachometerAlt, FaBars as FaMenu,
  FaUniversity, FaSchool, FaGift, FaDownload, FaBell
} from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const { isHindi } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const menuItems = [
    { id: 'dashboard', path: '/admin/dashboard', icon: FaTachometerAlt, label: { en: 'Dashboard', hi: 'डैशबोर्ड' } },
    { id: 'slider', path: '/admin/slider', icon: FaImages, label: { en: 'Home Slider', hi: 'होम स्लाइडर' } },
    { id: 'news', path: '/admin/news', icon: FaNewspaper, label: { en: 'News', hi: 'समाचार' } },
    { id: 'minister', path: '/admin/minister-message', icon: FaUser, label: { en: 'Minister Message', hi: 'मंत्री संदेश' } },
    { id: 'announcements', path: '/admin/announcements', icon: FaBullhorn, label: { en: 'Announcements', hi: 'घोषणाएं' } },
    { id: 'notifications', path: '/admin/notifications', icon: FaBell, label: { en: 'Notifications', hi: 'सूचनाएं' } },
    { id: 'tenders', path: '/admin/tenders', icon: FaFileAlt, label: { en: 'Tenders', hi: 'निविदाएं' } },
    { id: 'recruitment', path: '/admin/recruitment', icon: FaUser, label: { en: 'Recruitment', hi: 'भर्ती' } },
    { id: 'gallery', path: '/admin/gallery', icon: FaImages, label: { en: 'Photo Gallery', hi: 'चित्र प्रदर्शनी' } },
    { id: 'pages', path: '/admin/pages', icon: FaFileAlt, label: { en: 'Pages', hi: 'पृष्ठ' } },
    { id: 'menu', path: '/admin/menu', icon: FaMenu, label: { en: 'Menu', hi: 'मेनू' } },
    { id: 'universities', path: '/admin/universities', icon: FaUniversity, label: { en: 'Universities', hi: 'विश्वविद्यालय' } },
    { id: 'colleges', path: '/admin/colleges', icon: FaSchool, label: { en: 'Colleges', hi: 'महाविद्यालय' } },
    { id: 'schemes', path: '/admin/schemes', icon: FaGift, label: { en: 'Schemes', hi: 'योजनाएं' } },
    { id: 'downloads', path: '/admin/downloads', icon: FaDownload, label: { en: 'Downloads', hi: 'डाउनलोड' } },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-wrapper">
      {/* Top Navbar */}
      <nav className="admin-navbar">
        <div className="admin-navbar-content">
          <div className="admin-navbar-left">
            <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
              <FaBars />
            </button>
            <h4 className="admin-navbar-title mb-0">
              <FaTachometerAlt className="me-2" />
              {isHindi ? 'व्यवस्थापक पैनल' : 'Admin Panel'}
            </h4>
          </div>
          <div className="admin-navbar-right">
            <div className="admin-user-info">
              <FaUser className="me-2" />
              <span className="admin-username">{user?.username || 'Admin'}</span>
            </div>
            <Button color="light" size="sm" className="me-2" onClick={() => navigate('/')}>
              <FaHome className="me-1" />
              {isHindi ? 'साइट' : 'Site'}
            </Button>
            <Button color="danger" size="sm" onClick={handleLogout}>
              <FaSignOutAlt className="me-1" />
              {isHindi ? 'लॉग आउट' : 'Logout'}
            </Button>
          </div>
        </div>
      </nav>

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <h5 className="sidebar-title">
              {!sidebarCollapsed && (isHindi ? 'मेनू' : 'Menu')}
            </h5>
          </div>
          <nav className="sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                  title={isHindi ? item.label.hi : item.label.en}
                >
                  <Icon className="sidebar-icon" />
                  {!sidebarCollapsed && (
                    <span className="sidebar-label">
                      {isHindi ? item.label.hi : item.label.en}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-content">
          <div className="admin-content-inner">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

