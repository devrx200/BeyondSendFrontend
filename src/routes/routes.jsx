import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";

/* ─── Layouts ─────────────────────────────────────────────────────────────── */
import Header from "../components/Header";
import Footer from "../components/Footer";
import GovtBrandCarousel from "../components/GovtBrandCarousel";
import AdminLayout from "../components/AdminLayout";

/* ─── Middleware ──────────────────────────────────────────────────────────── */
import AuthMiddleware from "../Middlewares/AuthMiddleware";
import PublicAdminRoute from "../Middlewares/PublicAdminRoute";

/* ─── Public Pages ────────────────────────────────────────────────────────── */
import {
  Home, About, Contact, Gallery, Universities, Colleges, Downloads, FeedbackForm, HelpSupport,
  SchemeAnnouncementDetails, SchemeAnnouncementListView, MultiSectionPages, SlugResolver, DepDirectorateNoticesListView,
  AdminLogin, AdminDashboard, AdminUserManagement, AdminEducationStats, AdminFeedbackList, MenuManagement,
  HeaderManagement, SliderManagement, FooterSection, AboutSectionMangement, AnnouncementsManagement, NewUpdatesManagement,
  GalleryManagement, ManageCategories, ManageBrands, ContactManagement, ContactCardCMS, ImportantLinksManagement,
  ImportantPageManagement, PageCreatorManagement, RichContentPageManagements, MediaLibraryMangments, DownloadManagement,
  DepartmentNoticeManagement, DirectorateNoticeManagement, HelpGuidance, HelpTutorials, SessionManager, ActivityLogManagement,
  DbBackupManagement
} from "./LazyLoadingRouter";

/* ─── Constants ───────────────────────────────────────────────────────────── */
const API_URL = import.meta.env.VITE_API_URL;

/* ─── Main Layout ─────────────────────────────────────────────────────────── */
const MainLayout = ({ children }) => (
  <div className="app-wrapper d-flex flex-column min-vh-100">
    <Header />
    <main className="flex-grow-1">{children}</main>
    <GovtBrandCarousel />
    <Footer />
  </div>
);

/* ─── App Routes ──────────────────────────────────────────────────────────── */
const AppRoutes = () => {
  const [pages, setPages] = useState([]);
  const [staticPages, setStaticPages] = useState([]);
  const location = useLocation();
  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/menu-list`);
      const allItems = res.data.data || [];

      const menuItems = allItems;
      const menuItemsStatic = allItems.filter((item) => item.isDynamic === false && item.isImportant === false);
      setPages(extractPagesFromMenu(menuItems));
      setStaticPages(extractPagesFromMenu(menuItemsStatic));
    } catch (err) {
      console.error("Page Fetch Error", err);
    }
  };

  const extractPagesFromMenu = (menus, pages = [], parentId = null) => {
    menus.forEach((item) => {
      pages.push({ _id: item._id, path: item.path, isExternal: item.isExternal, parentId });
      if (item.submenu?.length) extractPagesFromMenu(item.submenu, pages, item._id);
    });
    return pages;
  };

  return (
    <Suspense fallback={<div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>}>
      <Routes>

      {/* ── Public Routes ─────────────────────────────────────────────────── */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/about" element={<MainLayout><About /></MainLayout>} />
      <Route path="/about-us" element={<MainLayout><About /></MainLayout>} />
      <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
      <Route path="/contact-us" element={<MainLayout><Contact /></MainLayout>} />
      <Route path="/gallery" element={<MainLayout><Gallery /></MainLayout>} />
      <Route path="/universities" element={<MainLayout><Universities /></MainLayout>} />
      <Route path="/colleges" element={<MainLayout><Colleges /></MainLayout>} />
      <Route path="/downloads" element={<MainLayout><Downloads /></MainLayout>} />
      <Route path="/feedback" element={<MainLayout><FeedbackForm /></MainLayout>} />
      <Route path="/help-and-support" element={<MainLayout><HelpSupport /></MainLayout>} />

      {/* Announcements & Schemes */}
      <Route path="/announcements" element={<MainLayout><SchemeAnnouncementListView /></MainLayout>} />
      <Route path="/announcements/:slug" element={<MainLayout><SchemeAnnouncementDetails /></MainLayout>} />
      <Route path="/announcement/:slug" element={<MainLayout><SchemeAnnouncementDetails /></MainLayout>} />
      <Route path="/schemes" element={<MainLayout><SchemeAnnouncementListView /></MainLayout>} />
      <Route path="/schemes/:slug" element={<MainLayout><SchemeAnnouncementDetails /></MainLayout>} />
      <Route path="/scheme/:slug" element={<MainLayout><SchemeAnnouncementDetails /></MainLayout>} />

      {/* Notices */}
      <Route path="/directorate-notices" element={<MainLayout><DepDirectorateNoticesListView /></MainLayout>} />
      <Route path="/directorate-notice/:slug" element={<MainLayout><DepDirectorateNoticesListView /></MainLayout>} />
      <Route path="/departments-notices" element={<MainLayout><DepDirectorateNoticesListView /></MainLayout>} />
      <Route path="/department-notice/:slug" element={<MainLayout><DepDirectorateNoticesListView /></MainLayout>} />

      {/* Important + Rich Content Pages +  Multi-Section Pages  – supports any nested path */}
      <Route path="*" element={<MainLayout> <SlugResolver key={location.pathname} /></MainLayout>} />

      {/* ── Admin: Login (Public) ──────────────────────────────────────────── */}
      <Route element={<PublicAdminRoute />}>
        <Route path="/auth/login" element={<MainLayout><AdminLogin /></MainLayout>} />
      </Route>

      {/* ── Admin Protected Routes ───────────────────────── */}
      <Route path="/admin" element={<AuthMiddleware allowedRoles={["ADMIN", "OFFICER", "NIC"]} allowedEmployeeTypes={["DIRECTORATE", "DEPARTMATE", "NIC"]} />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="announcements" element={<AnnouncementsManagement />} />
          <Route path="new-updates" element={<NewUpdatesManagement />} />
          <Route path="admin-education-stats" element={<AdminEducationStats />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="help-guidance" element={<HelpGuidance />} />
          <Route path="tutorials" element={<HelpTutorials />} />

          {/* ADMIN */}
          <Route element={<AuthMiddleware allowedRoles={["ADMIN",]} allowedEmployeeTypes={["DIRECTORATE"]} />}>
            <Route path="slider" element={<SliderManagement />} />
            <Route path="about-section" element={<AboutSectionMangement />} />
            <Route path="brands" element={<ManageBrands />} />
            <Route path="contact-management" element={<ContactManagement />} />
            <Route path="important-links" element={<ImportantLinksManagement />} />
            <Route path="feedbacks" element={<AdminFeedbackList />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="gallery" element={<GalleryManagement />} />
            <Route path="footer-section-manager" element={<FooterSection />} />
            <Route path="multi-section-pages-management" element={<PageCreatorManagement />} />
            <Route path="important-page-management" element={<ImportantPageManagement />} />
            <Route path="header-management" element={<HeaderManagement />} />
            <Route path="contact-card-management" element={<ContactCardCMS />} />
          </Route>

          {/* ADMIN + OFFICER */}
          <Route element={<AuthMiddleware allowedRoles={["ADMIN", "OFFICER"]} allowedEmployeeTypes={["DIRECTORATE", "DEPARTMATE"]} />}>
            <Route path="media-library-mangments" element={<MediaLibraryMangments />} />
            <Route path="download-management" element={<DownloadManagement />} />
          </Route>

          {/* ADMIN + OFFICER (DIRECTORATE) */}
          <Route element={<AuthMiddleware allowedRoles={["ADMIN", "OFFICER"]} allowedEmployeeTypes={["DIRECTORATE"]} />}>
            <Route path="rich-content-pages" element={<RichContentPageManagements />} />
            <Route path="directorate-notices" element={<DirectorateNoticeManagement />} />
          </Route>

          {/* ADMIN + OFFICER (DEPARTMATE) */}
          <Route element={<AuthMiddleware allowedRoles={["ADMIN", "OFFICER"]} allowedEmployeeTypes={["DEPARTMATE"]} />}>
            <Route path="department-notices" element={<DepartmentNoticeManagement />} />
          </Route>

          {/* ADMIN + NIC */}
          <Route element={<AuthMiddleware allowedRoles={["ADMIN", "NIC"]} allowedEmployeeTypes={["DIRECTORATE", "NIC"]} />}>
            <Route path="users-management" element={<AdminUserManagement />} />
          </Route>

          {/* NIC */}
          <Route element={<AuthMiddleware allowedRoles={["NIC"]} allowedEmployeeTypes={["NIC"]} />}>
            <Route path="session-manager" element={<SessionManager />} />
            <Route path="activity-logs" element={<ActivityLogManagement />} />
            <Route path="database-backup-managments" element={<DbBackupManagement />} />
          </Route>

        </Route>
      </Route>

    </Routes>
    </Suspense>
  );
};

export default AppRoutes;