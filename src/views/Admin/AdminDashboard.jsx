import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  FaHome, FaBullhorn, FaImages, FaFileAlt, FaSignOutAlt,
  FaNewspaper, FaUser, FaBars, FaTachometerAlt, FaBars as FaMenu
} from 'react-icons/fa';
import NewsManagement from './NewsManagement';
import MinisterMessageManagement from './MinisterMessageManagement';
import MenuManagement from './MenuManagement';
import SliderManagement from './SliderManagement';
import AnnouncementsManagement from './AnnouncementsManagement';
import NotificationsManagement from './NotificationsManagement';
import TendersManagement from './TendersManagement';
import RecruitmentManagement from './RecruitmentManagement';
import GalleryManagement from './GalleryManagement';
import PagesManagement from './PagesManagement';
import AboutAndHelp from './aboutAndHelp'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const { isHindi } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const menuItems = [
    { id: 'dashboard', icon: FaTachometerAlt, label: { en: 'Dashboard', hi: 'डैशबोर्ड' } },
    { id: 'slider', icon: FaImages, label: { en: 'Home Slider', hi: 'होम स्लाइडर' } },
    { id: 'news', icon: FaNewspaper, label: { en: 'News Management', hi: 'समाचार प्रबंधन' } },
    { id: 'aboutAndHelp', icon: FaNewspaper, label: { en: 'About and Help', hi: 'बारे में और अन्य' } },
    { id: 'minister', icon: FaUser, label: { en: 'Minister Message', hi: 'मंत्री संदेश' } },
    { id: 'announcements', icon: FaBullhorn, label: { en: 'Announcements', hi: 'घोषणाएं' } },
    { id: 'notifications', icon: FaBullhorn, label: { en: 'Notifications', hi: 'सूचनाएं' } },
    { id: 'tenders', icon: FaFileAlt, label: { en: 'Tenders', hi: 'निविदाएं' } },
    { id: 'recruitment', icon: FaUser, label: { en: 'Recruitment', hi: 'भर्ती' } },
    { id: 'gallery', icon: FaImages, label: { en: 'Photo Gallery', hi: 'चित्र प्रदर्शनी' } },
    { id: 'pages', icon: FaFileAlt, label: { en: 'Pages Content', hi: 'पृष्ठ सामग्री' } },
    { id: 'universities', icon: FaHome, label: { en: 'Universities', hi: 'विश्वविद्यालय' } },
    { id: 'colleges', icon: FaHome, label: { en: 'Colleges', hi: 'महाविद्यालय' } },
    { id: 'schemes', icon: FaFileAlt, label: { en: 'Schemes', hi: 'योजनाएं' } },
    { id: 'downloads', icon: FaFileAlt, label: { en: 'Downloads', hi: 'डाउनलोड' } },
    { id: 'menu', icon: FaMenu, label: { en: 'Menu Management', hi: 'मेनू प्रबंधन' } },
  ];

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
          <Nav vertical className="sidebar-nav">
            {menuItems.map((item) => (
              <NavItem key={item.id}>
                <NavLink
                  active={activeTab === item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                >
                  <item.icon className="sidebar-icon" />
                  {!sidebarCollapsed && <span>{isHindi ? item.label.hi : item.label.en}</span>}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main-content">
            <TabContent activeTab={activeTab}>
              {/* Dashboard Overview */}
              <TabPane tabId="dashboard">
                <h4 className="mb-4">{isHindi ? 'डैशबोर्ड अवलोकन' : 'Dashboard Overview'}</h4>
                <div className="row g-4">
                  {/* Universities Card */}
                  <div className="col-lg-3 col-md-6">
                    <Card className="stat-card-modern border-0 shadow-sm h-100">
                      <CardBody className="p-4">
                        <div className="stat-icon-wrapper mb-3" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                          <FaHome size={24} className="text-white" />
                        </div>
                        <h2 className="stat-number mb-2">15</h2>
                        <p className="stat-label text-muted mb-0">
                          {isHindi ? 'विश्वविद्यालय' : 'Universities'}
                        </p>
                      </CardBody>
                    </Card>
                  </div>

                  {/* Government Colleges Card */}
                  <div className="col-lg-3 col-md-6">
                    <Card className="stat-card-modern border-0 shadow-sm h-100">
                      <CardBody className="p-4">
                        <div className="stat-icon-wrapper mb-3" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                          <FaHome size={24} className="text-white" />
                        </div>
                        <h2 className="stat-number mb-2">135</h2>
                        <p className="stat-label text-muted mb-0">
                          {isHindi ? 'सरकारी महाविद्यालय' : 'Government Colleges'}
                        </p>
                      </CardBody>
                    </Card>
                  </div>

                  {/* Private Colleges Card */}
                  <div className="col-lg-3 col-md-6">
                    <Card className="stat-card-modern border-0 shadow-sm h-100">
                      <CardBody className="p-4">
                        <div className="stat-icon-wrapper mb-3" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                          <FaHome size={24} className="text-white" />
                        </div>
                        <h2 className="stat-number mb-2">296</h2>
                        <p className="stat-label text-muted mb-0">
                          {isHindi ? 'निजी महाविद्यालय' : 'Private Colleges'}
                        </p>
                      </CardBody>
                    </Card>
                  </div>

                  {/* Total Students Card */}
                  <div className="col-lg-3 col-md-6">
                    <Card className="stat-card-modern border-0 shadow-sm h-100">
                      <CardBody className="p-4">
                        <div className="stat-icon-wrapper mb-3" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
                          <FaUser size={24} className="text-white" />
                        </div>
                        <h2 className="stat-number mb-2">3,25,000</h2>
                        <p className="stat-label text-muted mb-0">
                          {isHindi ? 'कुल छात्र' : 'Total Students'}
                        </p>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              </TabPane>

              {/* Home Slider */}
              <TabPane tabId="slider">
                <SliderManagement />
              </TabPane>

              {/* News Management */}
              <TabPane tabId="news">
                <NewsManagement />
              </TabPane>

               <TabPane tabId="aboutAndHelp">
                <AboutAndHelp />
              </TabPane>


              {/* Minister Message */}
              <TabPane tabId="minister">
                <MinisterMessageManagement />
              </TabPane>

              {/* Announcements */}
              <TabPane tabId="announcements">
                <AnnouncementsManagement />
              </TabPane>

              {/* Notifications */}
              <TabPane tabId="notifications">
                <NotificationsManagement />
              </TabPane>

              {/* Tenders */}
              <TabPane tabId="tenders">
                <TendersManagement />
              </TabPane>

              {/* Recruitment */}
              <TabPane tabId="recruitment">
                <RecruitmentManagement />
              </TabPane>

              {/* Gallery */}
              <TabPane tabId="gallery">
                <GalleryManagement />
              </TabPane>

              {/* Pages Content */}
              <TabPane tabId="pages">
                <PagesManagement />
              </TabPane>

              {/* Universities */}
              <TabPane tabId="universities">
                <Card className="border-0 shadow-sm">
                  <CardBody className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h4 className="mb-1">{isHindi ? 'विश्वविद्यालय प्रबंधन' : 'Universities Management'}</h4>
                        <p className="text-muted small mb-0">
                          {isHindi ? 'विश्वविद्यालयों की जानकारी जोड़ें और अपडेट करें' : 'Add and update universities information'}
                        </p>
                      </div>
                      <Button color="primary" className="shadow-sm">
                        <FaHome className="me-2" />
                        {isHindi ? 'नया विश्वविद्यालय' : 'New University'}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </TabPane>

              {/* Colleges */}
              <TabPane tabId="colleges">
                <Card className="border-0 shadow-sm">
                  <CardBody className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h4 className="mb-1">{isHindi ? 'महाविद्यालय प्रबंधन' : 'Colleges Management'}</h4>
                        <p className="text-muted small mb-0">
                          {isHindi ? 'महाविद्यालयों की जानकारी जोड़ें और अपडेट करें' : 'Add and update colleges information'}
                        </p>
                      </div>
                      <Button color="primary" className="shadow-sm">
                        <FaHome className="me-2" />
                        {isHindi ? 'नया महाविद्यालय' : 'New College'}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </TabPane>

              {/* Schemes */}
              <TabPane tabId="schemes">
                <Card className="border-0 shadow-sm">
                  <CardBody className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h4 className="mb-1">{isHindi ? 'योजनाएं प्रबंधन' : 'Schemes Management'}</h4>
                        <p className="text-muted small mb-0">
                          {isHindi ? 'सभी योजनाओं की जानकारी प्रबंधित करें' : 'Manage all schemes information'}
                        </p>
                      </div>
                      <Button color="primary" className="shadow-sm">
                        <FaFileAlt className="me-2" />
                        {isHindi ? 'नई योजना' : 'New Scheme'}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </TabPane>

              {/* Downloads */}
              <TabPane tabId="downloads">
                <Card className="border-0 shadow-sm">
                  <CardBody className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h4 className="mb-1">{isHindi ? 'डाउनलोड प्रबंधन' : 'Downloads Management'}</h4>
                        <p className="text-muted small mb-0">
                          {isHindi ? 'डाउनलोड करने योग्य फाइलें और दस्तावेज़ प्रबंधित करें' : 'Manage downloadable files and documents'}
                        </p>
                      </div>
                      <Button color="primary" className="shadow-sm">
                        <FaFileAlt className="me-2" />
                        {isHindi ? 'फाइल अपलोड करें' : 'Upload File'}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </TabPane>

              {/* Menu Management */}
              <TabPane tabId="menu">
                <MenuManagement />
              </TabPane>
            </TabContent>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

