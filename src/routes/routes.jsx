import { Routes, Route, Navigate, useLocation } from "react-router-dom";

/* ─── Layouts ─────────────────────────────────────────────────────────────── */
import MainLayout from "../components/MainLayout";
import AdminLayout from "../components/AdminLayout";

/* ─── Eager Public Pages ─────────────────────────────────────────────────── */
import Home from "../views/pages/Home";

/* ─── Middleware ──────────────────────────────────────────────────────────── */
import AuthMiddleware from "../Middlewares/AuthMiddleware";
import PublicAdminRoute from "../Middlewares/PublicAdminRoute";

/* ─── Lazy Pages ──────────────────────────────────────────────────────────── */
import {
  Contact, Downloads, FeedbackForm, HelpSupport,
  SlugResolver, AdminLogin, AdminDashboard, AdminUserManagement, AdminFeedbackList,
  MenuManagement, HeaderManagement, FooterSection, AboutSectionMangement,
  NewUpdatesManagement, ManageCategories, ManageBrands, ContactManagement,
  ContactCardCMS, QuickAccessManagement, ImportantPageManagement,
  RichContentPageManagements, MediaLibraryMangments, DownloadManagement,
  HelpGuidance, HelpTutorials, SessionManager, ActivityLogManagement,
  DbBackupManagement
} from "./LazyLoadingRouter";

/* Legacy "/admin/*" links are forwarded to the current "/authorized/*" tree */
const LegacyAdminRedirect = () => {
  const { pathname } = useLocation();
  const rest = pathname.replace(/^\/admin/, "");
  return <Navigate to={`/authorized${rest}`} replace />;
};

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
        <Route path="/about" element={<SlugResolver key="about" />} />
        <Route path="/about-us" element={<SlugResolver key="about-us" />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/help-and-support" element={<HelpSupport />} />

        {/* Rich content pages, important pages & multi-section pages */}
        <Route path="*" element={<SlugResolver key={location.pathname} />} />
      </Route>

      {/* ── Admin: Login (public) ─────────────────────────────────────────── */}
      <Route element={<PublicAdminRoute />}>
        <Route path="/auth/login" element={<MainLayout><AdminLogin /></MainLayout>} />
      </Route>

      {/* ── Admin: Protected console ──────────────────────────────────────── */}
      <Route element={<AdminLayout />}>
        <Route
          path="authorized"
          element={
            <AuthMiddleware
              allowedRoles={["ADMIN", "OFFICER", "NIC"]}
              allowedEmployeeTypes={["DIRECTORATE", "DEPARTMENT", "NIC"]}
            />
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="new-updates" element={<NewUpdatesManagement />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="help-guidance" element={<HelpGuidance />} />
          <Route path="tutorials" element={<HelpTutorials />} />

          {/* Admin / Directorate only */}
          <Route
            element={
              <AuthMiddleware
                allowedRoles={["ADMIN"]}
                allowedEmployeeTypes={["DIRECTORATE"]}
              />
            }
          >
            <Route path="about-section" element={<AboutSectionMangement />} />
            <Route path="brands" element={<ManageBrands />} />
            <Route path="contact-management" element={<ContactManagement />} />
            <Route path="contact-card-management" element={<ContactCardCMS />} />
            <Route path="quick-access" element={<QuickAccessManagement />} />
            <Route path="feedbacks" element={<AdminFeedbackList />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="footer-section-manager" element={<FooterSection />} />
            <Route path="important-page-management" element={<ImportantPageManagement />} />
            <Route path="header-management" element={<HeaderManagement />} />
          </Route>

          {/* Admin + Officer */}
          <Route
            element={
              <AuthMiddleware
                allowedRoles={["ADMIN", "OFFICER"]}
                allowedEmployeeTypes={["DIRECTORATE", "DEPARTMENT"]}
              />
            }
          >
            <Route path="rich-content-pages" element={<RichContentPageManagements />} />
            <Route path="media-library-mangments" element={<MediaLibraryMangments />} />
            <Route path="download-management" element={<DownloadManagement />} />
          </Route>

          {/* Admin + System administrator */}
          <Route
            element={
              <AuthMiddleware
                allowedRoles={["ADMIN", "NIC"]}
                allowedEmployeeTypes={["DIRECTORATE", "DEPARTMENT", "NIC"]}
              />
            }
          >
            <Route path="users-management" element={<AdminUserManagement />} />
          </Route>

          {/* System administrator only */}
          <Route
            element={
              <AuthMiddleware
                allowedRoles={["NIC"]}
                allowedEmployeeTypes={["NIC"]}
              />
            }
          >
            <Route path="session-manager" element={<SessionManager />} />
            <Route path="activity-logs" element={<ActivityLogManagement />} />
            <Route path="database-backup-managments" element={<DbBackupManagement />} />
          </Route>

          {/* Unknown console path → dashboard */}
          <Route path="*" element={<Navigate to="/authorized/dashboard" replace />} />
        </Route>
      </Route>

      {/* ── Legacy admin prefix ───────────────────────────────────────────── */}
      <Route path="/admin/*" element={<LegacyAdminRedirect />} />
      <Route path="/admin" element={<Navigate to="/authorized/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
