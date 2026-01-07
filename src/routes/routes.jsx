import { Routes, Route, Navigate } from "react-router-dom";

/* PUBLIC */
import Header from "../components/Header";
import Footer from "../components/Footer";
import GovtBrandCarousel from "../components/GovtBrandCarousel";

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

/* ADMIN */
import AdminLogin from "../views/Admin/AdminLogin";
import AdminLayout from "../components/AdminLayout";
import AdminDashboard from "../views/Admin/AdminDashboard";
import MenuManagement from "../views/Admin/MenuManagement";
import SliderManagement from "../views/Admin/SliderManagement";
import NewsManagement from "../views/Admin/NewsManagement";
import AnnouncementsManagement from "../views/Admin/AnnouncementsManagement";
import NotificationsManagement from "../views/Admin/NotificationsManagement";
import GalleryManagement from "../views/Admin/GalleryManagement";

/* AUTH MIDDLEWARE */
import AuthMiddleware from "../../Middlewares/AuthMiddleware";
import PublicAdminRoute from "../../Middlewares/PublicAdminRoute";
/* MAIN LAYOUT */
const MainLayout = ({ children }) => (
  <div className="app-wrapper d-flex flex-column min-vh-100">
    <Header />
    <main className="flex-grow-1">{children}</main>
    <GovtBrandCarousel />
    <Footer />
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* ===== PUBLIC ROUTES ===== */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/about" element={<MainLayout><About /></MainLayout>} />
      <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
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
