import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import Header from '../components/Header';
import Footer from '../components/Footer';
import GovtBrandCarousel from '../components/GovtBrandCarousel';
// Pages
import Home from '../views/pages/Home';
import About from '../views/pages/About';
import Contact from '../views/pages/Contact';
import PrivacyPolicy from '../views/pages/PrivacyPolicy';
import TermsConditions from '../views/pages/TermsConditions';
import Disclaimer from '../views/pages/Disclaimer';
import Sitemap from '../views/pages/Sitemap';
import Accessibility from '../views/pages/Accessibility';
import Universities from '../views/pages/Universities';
import Colleges from '../views/pages/Colleges';
import Downloads from '../views/pages/Downloads';
import NoticeBoard from '../views/pages/NoticeBoard';
import RTI from '../views/pages/RTI';
import Gallery from '../views/pages/Gallery';
import GenericPage from '../views/pages/GenericPage';
import AdminLogin from '../views/Admin/AdminLogin';
import AdminDashboard from '../views/Admin/AdminDashboard';
import AboutAndHelpView from '../views/pages/AboutAndHelpView';
import DynamicPage from '../views/pages/DynamicPage';

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

// Layout with Header and Footer
export const MainLayout = ({ children }) => (
  <div className="app-wrapper d-flex flex-column min-vh-100">
    <Header />
    <main className="flex-grow-1" id="main-content">
      {children}
    </main>
    <GovtBrandCarousel />
    <Footer />
  </div>
);

let allPages ;

const Pages = () => {
  
}
 

// Admin Layout (no header/footer)
const AdminLayout = ({ children }) => (
  <div className="admin-wrapper">
    {children}
  </div>
);

const AppRoutes = () => {

  const [pages, setPages] = useState([]);

  useEffect(() => {
    fetchPages();
  }, []);

  

  const fetchPages = async () => {
    try {
      const res = await axios.get(`${API_URL}/menu-list`);
      const menuItems = res.data.data || [];

      const extractedPages = extractPagesFromMenu(menuItems);
      setPages(extractedPages);
      allPages = extractedPages ;

    } catch (err) {
      console.error("Page fetch error", err);
    }
  };

  const extractPagesFromMenu = (menus, pages = [], parentId = null) => {
    menus.forEach((item) => {
      pages.push({
        _id: item._id,              // ✅ menu or submenu ObjectId
        titleEn: item.titleEng,
        titleHi: item.titleHi,
        path: item.path,
        isExternal: item.isExternal,
        parentId,                   // ✅ hierarchy tracking
        level: parentId ? "SUB" : "MAIN",
      });

      // 🔁 recursive call for submenu
      if (Array.isArray(item.submenu) && item.submenu.length > 0) {
        extractPagesFromMenu(item.submenu, pages, item._id);
      }
    });

    return pages;
  };



  return (
    <Routes>
      {/* Main Routes with Header/Footer */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/about" element={<MainLayout><About /></MainLayout>} />
      <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
          {pages.map((page) => (
            <Route path={page.path} element={<MainLayout><DynamicPage /></MainLayout>} />
          ))}
       


        <Route path="/aboutUs" element={<MainLayout><AboutAndHelpView /></MainLayout>} />

      {/* Static Pages */}
      <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
      <Route path="/terms-conditions" element={<MainLayout><TermsConditions /></MainLayout>} />
      <Route path="/disclaimer" element={<MainLayout><Disclaimer /></MainLayout>} />
      <Route path="/sitemap" element={<MainLayout><Sitemap /></MainLayout>} />
      <Route path="/accessibility" element={<MainLayout><Accessibility /></MainLayout>} />

      {/* Main Feature Routes */}
      <Route path="/universities" element={<MainLayout><Universities /></MainLayout>} />
      <Route path="/universities/:type" element={<MainLayout><Universities /></MainLayout>} />
      <Route path="/colleges" element={<MainLayout><Colleges /></MainLayout>} />
      <Route path="/colleges/:type" element={<MainLayout><Colleges /></MainLayout>} />
      <Route path="/downloads" element={<MainLayout><Downloads /></MainLayout>} />
      <Route path="/downloads/:category" element={<MainLayout><Downloads /></MainLayout>} />
      <Route path="/notice-board" element={<MainLayout><NoticeBoard /></MainLayout>} />
      <Route path="/notice-board/:category" element={<MainLayout><NoticeBoard /></MainLayout>} />
      <Route path="/rti" element={<MainLayout><RTI /></MainLayout>} />
      <Route path="/rti/:section" element={<MainLayout><RTI /></MainLayout>} />
      <Route path="/gallery" element={<MainLayout><Gallery /></MainLayout>} />

      {/* About Section Routes */}
      <Route path="/about/college-development" element={<MainLayout><GenericPage title="College Development" titleHi="कॉलेजों का विकास" content={<p>Information about college development initiatives...</p>} contentHi={<p>महाविद्यालय विकास पहल के बारे में जानकारी...</p>} /></MainLayout>} />
      <Route path="/about/college-locations" element={<MainLayout><GenericPage title="College Locations" titleHi="कॉलेजों के स्थान" content={<p>Information about college locations...</p>} contentHi={<p>महाविद्यालय स्थानों के बारे में जानकारी...</p>} /></MainLayout>} />
      <Route path="/about/academic-calendar" element={<MainLayout><GenericPage title="Academic Calendar" titleHi="शैक्षणिक कैलेंडर" content={<p>Academic calendar information...</p>} contentHi={<p>शैक्षणिक कैलेंडर जानकारी...</p>} /></MainLayout>} />
      <Route path="/about/budget" element={<MainLayout><GenericPage title="Departmental Budget" titleHi="विभागीय बजट" content={<p>Budget information...</p>} contentHi={<p>बजट जानकारी...</p>} /></MainLayout>} />
      <Route path="/about/annual-report" element={<MainLayout><GenericPage title="Annual Report" titleHi="वार्षिक प्रतिवेदन" content={<p>Annual report...</p>} contentHi={<p>वार्षिक रिपोर्ट...</p>} /></MainLayout>} />
      <Route path="/about/rules-acts" element={<MainLayout><GenericPage title="Important Rules & Acts" titleHi="महत्वपूर्ण नियम एवं अधिनियम" content={<p>Rules and acts...</p>} contentHi={<p>नियम और अधिनियम...</p>} /></MainLayout>} />
      <Route path="/about/who-is-who" element={<MainLayout><GenericPage title="Who is Who" titleHi="कौन क्या है" content={<p>Directory...</p>} contentHi={<p>निर्देशिका...</p>} /></MainLayout>} />
      <Route path="/about/organization-chart" element={<MainLayout><GenericPage title="Organization Chart" titleHi="संगठन चार्ट" content={<p>Organization structure...</p>} contentHi={<p>संगठन संरचना...</p>} /></MainLayout>} />

      {/* Services Routes */}
      <Route path="/services" element={<MainLayout><GenericPage title="Services" titleHi="सेवाएं" content={<p>Services information...</p>} contentHi={<p>सेवाओं की जानकारी...</p>} /></MainLayout>} />
      <Route path="/services/compassionate-appointment" element={<MainLayout><GenericPage title="Compassionate Appointment" titleHi="अनुकम्पा नियुक्ति" content={<p>Compassionate appointment details...</p>} contentHi={<p>अनुकम्पा नियुक्ति विवरण...</p>} /></MainLayout>} />
      <Route path="/services/non-govt-colleges" element={<MainLayout><GenericPage title="Non-Government Colleges" titleHi="अशासकीय महाविद्यालय" content={<p>Non-government colleges information...</p>} contentHi={<p>अशासकीय महाविद्यालय जानकारी...</p>} /></MainLayout>} />
      <Route path="/services/web-portal" element={<MainLayout><GenericPage title="Web Application Portal" titleHi="वेब एप्लीकेशन पोर्टल" content={<p>Web portal information...</p>} contentHi={<p>वेब पोर्टल जानकारी...</p>} /></MainLayout>} />

      {/* Notice Board Sub-routes */}
      <Route path="/notice-board/news" element={<MainLayout><NoticeBoard /></MainLayout>} />
      <Route path="/notice-board/tenders" element={<MainLayout><NoticeBoard /></MainLayout>} />
      <Route path="/notice-board/recruitment" element={<MainLayout><NoticeBoard /></MainLayout>} />
      <Route path="/notice-board/seniority" element={<MainLayout><NoticeBoard /></MainLayout>} />
      <Route path="/notice-board/seniority/:office" element={<MainLayout><NoticeBoard /></MainLayout>} />
      <Route path="/notice-board/circulars" element={<MainLayout><NoticeBoard /></MainLayout>} />
      <Route path="/notice-board/orders" element={<MainLayout><NoticeBoard /></MainLayout>} />
      <Route path="/notice-board/orders/:type" element={<MainLayout><NoticeBoard /></MainLayout>} />
      <Route path="/notice-board/minutes" element={<MainLayout><NoticeBoard /></MainLayout>} />
      <Route path="/notice-board/advertisements" element={<MainLayout><NoticeBoard /></MainLayout>} />

      {/* Placeholder Routes */}
      <Route path="/schemes" element={<MainLayout><GenericPage title="Schemes" titleHi="योजनाएं" content={<p>Scholarship and welfare schemes...</p>} contentHi={<p>छात्रवृत्ति और कल्याण योजनाएं...</p>} /></MainLayout>} />
      <Route path="/help" element={<MainLayout><Accessibility /></MainLayout>} />
      <Route path="/copyright-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
      <Route path="/hyperlink-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLayout><AdminLogin /></AdminLayout>} />
      <Route path="/admin/dashboard"  element={ <ProtectedRoute> <AdminLayout><AdminDashboard /></AdminLayout> </ProtectedRoute>}/>

      {/* 404 */}
      <Route path="*" element={<MainLayout><Home /></MainLayout>} />
    </Routes>
  );
};

export default AppRoutes;

