import { Routes, Route, Navigate, useLocation } from "react-router-dom";

/* ─── Layouts ─────────────────────────────────────────────────────────────── */
import { MainLayout, AuthorizedLayout } from "@/components";

/* ─── Eager Public Pages ─────────────────────────────────────────────────── */
import Home from "../views/pages/Home";

/* ─── Middleware ──────────────────────────────────────────────────────────── */
import AuthMiddleware from "../middlewares/AuthMiddleware";
import PublicAdminRoute from "../middlewares/PublicAdminRoute";

/* ─── Lazy Pages ──────────────────────────────────────────────────────────── */
import {
  Contact, Downloads, FeedbackForm, HelpSupport,
  SlugResolver, MainLogin, Dashboard, UserManagement, FeedbackList,
  MenuManagement, HeaderManagement, FooterSection, AboutSectionManagement,
  NewUpdatesManagement, ManageCategories, ManageBrands, ContactManagement,
  ContactCardCMS, QuickAccessManagement, ImportantPageManagement,
  RichContentPageManagement, MediaLibraryManagement, DownloadManagement,
  HelpGuidance, HelpTutorials, SessionManager, ActivityLogManagement,
  DbBackupManagement, SidebarMenuManagement,
  /* Telecom modules */
  EmailTemplates, SmsTemplates, RcsTemplates, WhatsappTemplates, VoiceTemplates,
  CampaignLists, CampaignSegments, CampaignsManagement, UnsubscribersManagement, BouncesSpamManagement,
  FromIdsConfig, TransactionalDashboard, ApiKeyManagement, MessageLogManagement, WebhookSetup, WebhookLogs,
  ApiDocViewer, WhatsappResponses, RcsResponses,
  CreditTopupManagement, MyCreditWallet, UserChannelsConfig, UserCommunicationConfig, UserSettings, SubscriptionsManagement,
  ChannelRegistry, ProviderRegistry, ChannelMatrix, Onboarding
} from "./LazyLoadingRouter";

/* Legacy "/admin/*" links are forwarded to the current "/authorized/*" tree */
const LegacyAdminRedirect = () => {
  const { pathname } = useLocation();
  const rest = pathname.replace(/^\/admin/, "");
  return <Navigate to={`/authorized${rest}`} replace />;
};



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
        <Route path="/auth/login" element={<MainLayout><MainLogin /></MainLayout>} />
        <Route path="/admin-login" element={<MainLayout><MainLogin /></MainLayout>} />
        <Route path="/login" element={<MainLayout><MainLogin /></MainLayout>} />
      </Route>

      {/* ── Admin: Protected console ──────────────────────────────────────── */}
      <Route
        path="authorized"
        element={
          <AuthMiddleware
            allowedRoles={["DEVOPS", "ADMIN", "RESELLER", "CLIENT", "MANAGER"]}
          />
        }
      >
        <Route element={<AuthorizedLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* ── BeyondSend Core Telecom & Marketing Modules ────────────────── */}
          {/* Templates */}
          <Route path="email/templates" element={<EmailTemplates />} />
          <Route path="sms/templates" element={<SmsTemplates />} />
          <Route path="rcs/templates" element={<RcsTemplates />} />
          <Route path="whatsapp/templates" element={<WhatsappTemplates />} />
          <Route path="voice/templates" element={<VoiceTemplates />} />

          {/* Bulk campaigns */}
          <Route path="campaigns/lists" element={<CampaignLists />} />
          <Route path="campaigns/segments" element={<CampaignSegments />} />
          <Route path="campaigns/all" element={<CampaignsManagement />} />
          <Route path="campaigns/unsubscribers" element={<UnsubscribersManagement />} />
          <Route path="campaigns/bounces-spam" element={<BouncesSpamManagement />} />

          {/* Config */}
          <Route path="config/from-ids" element={<FromIdsConfig />} />
          <Route path="config/communication" element={<UserCommunicationConfig />} />
          <Route path="config/communication/:userId" element={<UserCommunicationConfig />} />
          <Route path="user-config" element={<UserCommunicationConfig />} />
          <Route path="user-config/:userId" element={<UserCommunicationConfig />} />
          {/* Account — per-user configuration */}
          <Route path="account/channels" element={<UserChannelsConfig />} />
          <Route path="account/settings" element={<UserSettings />} />
          <Route path="account/credits-topup-management" element={<CreditTopupManagement />} />
          <Route path="account/my-wallet" element={<MyCreditWallet />} />
          <Route path="account/subscriptions" element={<SubscriptionsManagement />} />

          {/* Onboarding */}
          <Route path="onboarding" element={<Onboarding />} />

          {/* Transactional API */}
          <Route path="transactional/dashboard" element={<TransactionalDashboard />} />
          <Route path="transactional/api-key" element={<ApiKeyManagement />} />
          <Route path="transactional/message-log" element={<MessageLogManagement />} />
          <Route path="transactional/webhook-setup" element={<WebhookSetup />} />
          <Route path="transactional/webhook-logs" element={<WebhookLogs />} />
          <Route path="transactional/api-doc" element={<ApiDocViewer />} />

          {/* User Responses */}
          <Route path="responses/whatsapp" element={<WhatsappResponses />} />
          <Route path="responses/rcs" element={<RcsResponses />} />

          <Route path="new-updates" element={<NewUpdatesManagement />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="help-guidance" element={<HelpGuidance />} />
          <Route path="tutorials" element={<HelpTutorials />} />

          {/* Admin / Content Management (DEVOPS, ADMIN, MANAGER) */}
          <Route
            element={
              <AuthMiddleware
                allowedRoles={["DEVOPS", "ADMIN",]}
              />
            }
          >
            <Route path="about-section" element={<AboutSectionManagement />} />
            <Route path="brands" element={<ManageBrands />} />
            <Route path="contact-management" element={<ContactManagement />} />
            <Route path="contact-card-management" element={<ContactCardCMS />} />
            <Route path="quick-access" element={<QuickAccessManagement />} />
            <Route path="feedbacks" element={<FeedbackList />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="footer-section-manager" element={<FooterSection />} />
            <Route path="important-page-management" element={<ImportantPageManagement />} />
            <Route path="header-management" element={<HeaderManagement />} />
            <Route path="rich-content-pages" element={<RichContentPageManagement />} />
            <Route path="media-library" element={<MediaLibraryManagement />} />
            <Route path="download-management" element={<DownloadManagement />} />
            <Route path="sidebar-menu-management" element={<SidebarMenuManagement />} />
          </Route>

          {/* User Management (DEVOPS, ADMIN, RESELLER, CLIENT, MANAGER) */}
          <Route
            element={
              <AuthMiddleware
                allowedRoles={["DEVOPS", "ADMIN", "RESELLER", "CLIENT", "MANAGER"]}
              />
            }
          >
            <Route path="users-management" element={<UserManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>

          {/* DevOps & System Administration (DEVOPS, ADMIN) */}
          <Route
            element={
              <AuthMiddleware
                allowedRoles={["DEVOPS", "ADMIN"]}
              />
            }
          >
            <Route path="session-manager" element={<SessionManager />} />
            <Route path="sessions" element={<SessionManager />} />
            <Route path="activity-logs" element={<ActivityLogManagement />} />
            <Route path="database-backup" element={<DbBackupManagement />} />

            {/* Dynamic channel & provider registry */}
            <Route path="settings/channels" element={<ChannelRegistry />} />
            <Route path="settings/providers" element={<ProviderRegistry />} />
            <Route path="settings/channel-matrix" element={<ChannelMatrix />} />
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
