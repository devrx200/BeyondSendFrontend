import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense } from "react";

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
  QuickAccessManagement, ImportantPageManagement, PageCreatorManagement, RichContentPageManagements, MediaLibraryMangments, DownloadManagement,
  DepartmentNoticeManagement, DirectorateNoticeManagement, HelpGuidance, HelpTutorials, SessionManager, ActivityLogManagement,
  DbBackupManagement
} from "./LazyLoadingRouter";

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
  const location = useLocation();

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
      <Route path="/admin" element={<AuthMiddleware allowedRoles={["ADMIN", "OFFICER", "NIC"]} allowedEmployeeTypes={["DIRECTORATE", "DEPARTMENT", "NIC"]} />}>
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
          <Route element={<AuthMiddleware allowedRoles={["ADMIN"]} allowedEmployeeTypes={["DIRECTORATE"]} />}>
            <Route path="slider" element={<SliderManagement />} />
            <Route path="about-section" element={<AboutSectionMangement />} />
            <Route path="brands" element={<ManageBrands />} />
            <Route path="contact-management" element={<ContactManagement />} />
            <Route path="important-links" element={<ImportantLinksManagement />} />
            <Route path="quick-access" element={<QuickAccessManagement />} />
            <Route path="feedbacks" element={<AdminFeedbackList />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="footer-section-manager" element={<FooterSection />} />
            <Route path="important-page-management" element={<ImportantPageManagement />} />
            <Route path="header-management" element={<HeaderManagement />} />
            <Route path="contact-card-management" element={<ContactCardCMS />} />
          </Route>

          {/* ADMIN + OFFICER */}
          <Route element={<AuthMiddleware allowedRoles={["ADMIN", "OFFICER"]} allowedEmployeeTypes={["DIRECTORATE", "DEPARTMENT"]} />}>
            <Route path="multi-section-pages-management" element={<PageCreatorManagement />} />
            <Route path="rich-content-pages" element={<RichContentPageManagements />} />
            <Route path="media-library-mangments" element={<MediaLibraryMangments />} />
            <Route path="download-management" element={<DownloadManagement />} />
            <Route path="gallery" element={<GalleryManagement />} />
          </Route>

          {/* ADMIN + OFFICER (DIRECTORATE) */}
          <Route element={<AuthMiddleware allowedRoles={["ADMIN", "OFFICER"]} allowedEmployeeTypes={["DIRECTORATE"]} />}>
            <Route path="directorate-notices" element={<DirectorateNoticeManagement />} />
          </Route>

          {/* ADMIN + OFFICER (DEPARTMENT) */}
          <Route element={<AuthMiddleware allowedRoles={["ADMIN", "OFFICER"]} allowedEmployeeTypes={["DEPARTMENT"]} />}>
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