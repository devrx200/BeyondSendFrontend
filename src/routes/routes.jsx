import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import Header from '../components/Header';
import Footer from '../components/Footer';
import GovtBrandCarousel from '../components/GovtBrandCarousel';
// Pages

import GenericPage from '../views/pages/GenericPage';
import AdminLogin from '../views/Admin/AdminLogin';
import AdminDashboard from '../views/Admin/AdminDashboard';
import AboutAndHelpView from '../views/pages/AboutAndHelpView';
import DynamicPage from '../views/pages/DynamicPage';

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

import Home from "../views/pages/Home";
import About from "../views/pages/About";
import Contact from "../views/pages/Contact";
import PrivacyPolicy from "../views/pages/PrivacyPolicy";
import TermsConditions from "../views/pages/TermsConditions";
import Disclaimer from "../views/pages/Disclaimer";
import Sitemap from "../views/pages/Sitemap";
import Accessibility from "../views/pages/Accessibility";
import Universities from "../views/pages/Universities";
import Colleges from "../views/pages/Colleges";
import Downloads from "../views/pages/Downloads";
import NoticeBoard from "../views/pages/NoticeBoard";
import RTI from "../views/pages/RTI";
import Gallery from "../views/pages/Gallery";

import AdminLogin from "../views/Admin/AdminLogin";
import AdminLayout from "../components/AdminLayout";
import AdminDashboard from "../views/Admin/AdminDashboard";
import MenuManagement from "../views/Admin/MenuManagement";
import SliderManagement from "../views/Admin/SliderManagement";
import NewsManagement from "../views/Admin/NewsManagement";
import AnnouncementsManagement from "../views/Admin/AnnouncementsManagement";
import NotificationsManagement from "../views/Admin/NotificationsManagement";
import GalleryManagement from "../views/Admin/GalleryManagement";
import ImageMaster from "../views/Admin/ImageMaster"; 

/* AUTH MIDDLEWARE */
import AuthMiddleware from "../Middlewares/AuthMiddleware";
import PublicAdminRoute from "../Middlewares/PublicAdminRoute";


/* ADMIN */

/* MAIN LAYOUT */
const MainLayout = ({ children }) => (
  <div className="app-wrapper d-flex flex-column min-vh-100">
    <Header />
    <main className="flex-grow-1">{children}</main>
    <GovtBrandCarousel />
    <Footer />
  </div>
);

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
      {/* ===== PUBLIC ROUTES ===== */}
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
      <Route path="/universities" element={<MainLayout><Universities /></MainLayout>} />
      <Route path="/colleges" element={<MainLayout><Colleges /></MainLayout>} />
      <Route path="/downloads" element={<MainLayout><Downloads /></MainLayout>} />
      <Route path="/notice-board" element={<MainLayout><NoticeBoard /></MainLayout>} />
      <Route path="/rti" element={<MainLayout><RTI /></MainLayout>} />
      <Route path="/gallery" element={<MainLayout><Gallery /></MainLayout>} />

      {/* ===== ADMIN LOGIN ===== */}
      <Route element={<PublicAdminRoute />}>
        <Route path="/admin/login" element={<AdminLogin />} />
      </Route>

      <Route path="/admin" element={<AuthMiddleware allowedRoles={["OFFICER", "ADMIN"]} />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="news" element={<NewsManagement />} />
          <Route path="announcements" element={<AnnouncementsManagement />} />
          <Route path="notifications" element={<NotificationsManagement />} />
          <Route path="gallery" element={<GalleryManagement />} />
          <Route path="image-master" element={<ImageMaster />} />
          <Route path="menu" element={<AuthMiddleware allowedRoles={["ADMIN"]} />}>
            <Route index element={<MenuManagement />} />
          </Route>

          <Route path="slider" element={<AuthMiddleware allowedRoles={["ADMIN"]} />}>
            <Route index element={<SliderManagement />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<MainLayout><Home /></MainLayout>} />
    </Routes>
  );
};

export default AppRoutes;
