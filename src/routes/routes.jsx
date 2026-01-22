import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import bgImg from "../assets/page-bg.svg";

/* LAYOUTS */
import Header from "../components/Header";
import Footer from "../components/Footer";
import GovtBrandCarousel from "../components/GovtBrandCarousel";
import AdminLayout from "../components/AdminLayout";

/* PAGES */
import Home from "../views/pages/Home";
import About from "../views/pages/About";
import Contact from "../views/pages/Contact";
import DynamicPage from "../views/pages/DynamicPage";
import AboutAndHelpView from "../views/pages/AboutAndHelpView";
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
import FeedbackForm from "../views/pages/FeedbackForm";  
import AdminFeedbackList from "../views/Admin/FeedbackList";

/* ADMIN */
import AdminLogin from "../views/Admin/AdminLogin";
import AdminDashboard from "../views/Admin/AdminDashboard";
import MenuManagement from "../views/Admin/MenuManagement";
import SliderManagement from "../views/Admin/SliderManagement";
import NewsManagement from "../views/Admin/NewsManagement";
import AnnouncementsManagement from "../views/Admin/AnnouncementsManagement";
import NotificationsManagement from "../views/Admin/NotificationsManagement";
import GalleryManagement from "../views/Admin/GalleryManagement";
import AboutSectionMangement from "../views/Admin/AboutSectionMangement";
import ManageCategories from "../views/Admin/ManageCategories";
import ManageBrands from "../views/Admin/ManageBrands";
import ManageUniversities from "../views/Admin/ManageUniversities";
import NewUpdatesManagement from "../views/Admin/NewUpdatesManagement";
import AdminEducationStats from "../views/Admin/AdminEducationStats";


import ContactManagement from "../views/Admin/ContactManagement";
import ImportantLinksManagement from "../views/Admin/ImportantLinksManagement";
/* MIDDLEWARE */
import AuthMiddleware from "../Middlewares/AuthMiddleware";
import PublicAdminRoute from "../Middlewares/PublicAdminRoute";
import ContentUploaderForm from "../views/Admin/ContentUploaderForm";
import FileUploader from "../views/Admin/uploaderPage";
import FileManager from "../views/Admin/fileManager";
import DownloadManagement from "../views/Admin/DownloadManagement";
import CollegeManagement from "../views/Admin/CollegeManagement";
const API_URL = import.meta.env.VITE_API_URL;

/* MAIN LAYOUT */
const MainLayout = ({ children }) => (
  <div
    className="app-wrapper d-flex flex-column min-vh-100"
    style={{
      backgroundColor: "#f4f6f9",
      backgroundImage: `url(${bgImg})`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "top center",
      backgroundSize: "cover"
    }}
  >
    <Header />
    <main className="flex-grow-1">{children}</main>
    <GovtBrandCarousel />
    <Footer />
  </div>
);

const AppRoutes = () => {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/menu-list`);
      const menuItems = res.data.data || [];
      setPages(extractPagesFromMenu(menuItems));
    } catch (err) {
      console.error("Page Fetch Error", err);
    }
  };

  const extractPagesFromMenu = (menus, pages = [], parentId = null) => {
    menus.forEach(item => {
      pages.push({
        _id: item._id,
        path: item.path,
        isExternal: item.isExternal,
        parentId
      });

      if (item.submenu?.length) {
        extractPagesFromMenu(item.submenu, pages, item._id);
      }
    });
    return pages;
  };

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/about" element={<MainLayout><About /></MainLayout>} />
      <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />

      {/* DYNAMIC CMS PAGES */}
      {pages
        .filter(p => !p.isExternal)
        .map(p => (
          <Route
            key={p._id}
            path={p.path}
            element={<MainLayout><DynamicPage /></MainLayout>}
          />
        ))}

      <Route path="/aboutUs" element={<MainLayout><AboutAndHelpView /></MainLayout>} />

      {/* STATIC */}
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
      <Route path="/gallery-page" element={<MainLayout><Gallery /></MainLayout>} />
      <Route path="/feedback-page" element={<MainLayout><FeedbackForm /></MainLayout>} />
      <Route path="/feedback-list" element={<MainLayout><AdminFeedbackList /></MainLayout>} />

      {/* ADMIN */}
      <Route element={<PublicAdminRoute />}>
        <Route path="/admin/login" element={<AdminLogin />} />
      </Route>

      <Route path="/admin" element={<AuthMiddleware allowedRoles={["OFFICER", "ADMIN"]} />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="news" element={<NewsManagement />} />
          <Route path="announcements" element={<AnnouncementsManagement />} />
          <Route path="content-uploader" element={<ContentUploaderForm />} />
          <Route path="notifications" element={<NotificationsManagement />} />
          <Route path="gallery" element={<GalleryManagement />} />
          <Route path="image-master" element={<AboutSectionMangement />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="slider" element={<SliderManagement />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="brands" element={<ManageBrands />} />
          <Route path="universities" element={<ManageUniversities />} />
          <Route path="new-updates" element={<NewUpdatesManagement />} />
          <Route path="admin-education-stats" element={<AdminEducationStats />} />
          <Route path="contact-management" element={<ContactManagement />} />
          <Route path="important-links" element={<ImportantLinksManagement />} />
          <Route path="file-manager" element={<FileManager />} />
          <Route path="file-uploader" element={<FileUploader />} />
          <Route path="download-management" element={<DownloadManagement />} />
          <Route path="college-management" element={<CollegeManagement />} />
        </Route>
      </Route>


      <Route path="*" element={<MainLayout><Home /></MainLayout>} />
    </Routes>
  );
};

export default AppRoutes;
