import { Routes, Route, Navigate, useLocation } from "react-router-dom";

/* ─── Layouts ─────────────────────────────────────────────────────────────── */
import MainLayout from "../components/MainLayout";
import AdminLayout from "../components/AdminLayout";
import PageLoader from "../components/PageLoader";

/* ─── Eager Public Pages ─────────────────────────────────────────────────── */
import Home from "../views/pages/Home";

/* ─── Middleware ──────────────────────────────────────────────────────────── */
import AuthMiddleware from "../Middlewares/AuthMiddleware";
import PublicAdminRoute from "../Middlewares/PublicAdminRoute";

/* ─── Public Pages (Lazy) ─────────────────────────────────────────────────── */
import {
  Contact, Gallery, Universities, Colleges, Downloads, FeedbackForm, HelpSupport,
  SchemeAnnouncementDetails, SchemeAnnouncementListView, MultiSectionPages, SlugResolver, DepDirectorateNoticesListView,
  AdminLogin, AdminDashboard, AdminUserManagement, AdminEducationStats, AdminFeedbackList, MenuManagement,
  HeaderManagement, SliderManagement, FooterSection, AboutSectionMangement, AnnouncementsManagement, NewUpdatesManagement,
  GalleryManagement, ManageCategories, ManageBrands, ContactManagement, ContactCardCMS, ImportantLinksManagement,
  QuickAccessManagement, ImportantPageManagement, PageCreatorManagement, RichContentPageManagements, MediaLibraryMangments, DownloadManagement,
  DepartmentNoticeManagement, DirectorateNoticeManagement, HelpGuidance, HelpTutorials, SessionManager, ActivityLogManagement,
  DbBackupManagement
} from "./LazyLoadingRouter";

/* ─── App Routes ──────────────────────────────────────────────────────────── */
const AppRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      {/* ── Public Routes with Persistent MainLayout ──────────────────────── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/universities" element={<Universities />} />
        <Route path="/colleges" element={<Colleges />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/help-and-support" element={<HelpSupport />} />

        {/* Announcements & Schemes */}
        <Route path="/announcements" element={<SchemeAnnouncementListView />} />
        <Route path="/announcements/:slug" element={<SchemeAnnouncementDetails />} />
        <Route path="/announcement/:slug" element={<SchemeAnnouncementDetails />} />
        <Route path="/schemes" element={<SchemeAnnouncementListView />} />
        <Route path="/schemes/:slug" element={<SchemeAnnouncementDetails />} />
        <Route path="/scheme/:slug" element={<SchemeAnnouncementDetails />} />

        {/* Notices */}
        <Route path="/directorate-notices" element={<DepDirectorateNoticesListView />} />
        <Route path="/directorate-notice/:slug" element={<DepDirectorateNoticesListView />} />
        <Route path="/departments-notices" element={<DepDirectorateNoticesListView />} />
        <Route path="/department-notice/:slug" element={<DepDirectorateNoticesListView />} />

        {/* Important + Rich Content Pages + Multi-Section Pages */}
        <Route path="*" element={<SlugResolver key={location.pathname} />} />
      </Route>

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
          <Route element={<AuthMiddleware allowedRoles={["ADMIN", "NIC"]} allowedEmployeeTypes={["DIRECTORATE", "DEPARTMENT", "NIC"]} />}>
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
  );
};

export default AppRoutes;