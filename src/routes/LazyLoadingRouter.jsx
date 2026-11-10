import { lazy } from 'react';

/* ─── Public Pages ────────────────────────────────────────────────────────── */
export const MainLogin = lazy(() => import("../views/pages/MainLogin"));
export const AdminLogin = MainLogin;
export const Contact = lazy(() => import("../views/pages/Contact"));
export const Downloads = lazy(() => import("../views/pages/Downloads"));
export const FeedbackForm = lazy(() => import("../views/pages/FeedbackForm"));
export const HelpSupport = lazy(() => import("../views/pages/HelpSupport"));
export const SlugResolver = lazy(() => import("../utilities/SlugResolver"));

/* ─── Authorized Admin & Client Pages ─────────────────────────────────────── */
export const Dashboard = lazy(() => import("../views/authorized/Dashboard"));
export const AdminDashboard = Dashboard;
export const UserManagement = lazy(() => import("../views/authorized/UserManagement"));
export const AdminUserManagement = UserManagement;
export const ManageCategories = lazy(() => import("../views/authorized/ManageCategories"));
export const SidebarMenuManagement = lazy(() => import("../views/authorized/SidebarMenuManagement"));

/* ─── Help & Supports ─────────────────────────────────────────────────────── */
export const FeedbackList = lazy(() => import("../views/authorized/help-supports/FeedbackList"));
export const AdminFeedbackList = FeedbackList;
export const HelpGuidance = lazy(() => import("../views/authorized/help-supports/HelpGuidance"));
export const HelpTutorials = lazy(() => import("../views/authorized/help-supports/HelpTutorials"));

/* ─── System & Security ───────────────────────────────────────────────────── */
export const SessionManager = lazy(() => import("../views/authorized/system-security/SessionManager"));
export const ActivityLogManagement = lazy(() => import("../views/authorized/system-security/ActivityLogManagement"));
export const DbBackupManagement = lazy(() => import("../views/authorized/system-security/DbBackupManagement"));

/* ─── CMS Modules ─────────────────────────────────────────────────────────── */
export const MenuManagement = lazy(() => import("../views/authorized/cms-modules/MenuManagement"));
export const HeaderManagement = lazy(() => import("../views/authorized/cms-modules/HeaderManagement"));
export const FooterSection = lazy(() => import("../views/authorized/cms-modules/FooterSectionManager"));
export const NewUpdatesManagement = lazy(() => import("../views/authorized/cms-modules/NewUpdatesManagement"));
export const ManageBrands = lazy(() => import("../views/authorized/cms-modules/ManageBrands"));
export const ContactManagement = lazy(() => import("../views/authorized/cms-modules/ContactManagement"));
export const ContactCardCMS = lazy(() => import("../views/authorized/cms-modules/ContactCardForm"));
export const QuickAccessManagement = lazy(() => import("../views/authorized/cms-modules/QuickAccessManagement"));
export const ImportantPageManagement = lazy(() => import("../views/authorized/cms-modules/ImportantPageManagement"));
export const RichContentPageManagement = lazy(() => import("../views/authorized/cms-modules/RichContentPageManagement"));
export const MediaLibraryManagement = lazy(() => import("../views/authorized/cms-modules/MediaLibraryManagement"));
export const DownloadManagement = lazy(() => import("../views/authorized/cms-modules/DownloadManagement"));
export const AboutSectionManagement = lazy(() => import("../views/authorized/cms-modules/AboutSectionManagement"));

/* ─── 1. WhatsApp Modules (whatsapp-modules) ──────────────────────────────── */
export const WhatsappTemplates = lazy(() => import("../views/authorized/whatsapp-modules/WhatsappTemplates"));
export const WhatsappResponses = lazy(() => import("../views/authorized/whatsapp-modules/WhatsappResponses"));
export const WhatsappCampaigns = lazy(() => import("../views/authorized/whatsapp-modules/WhatsappCampaigns"));
export const WhatsappDashboard = lazy(() => import("../views/authorized/whatsapp-modules/WhatsappDashboard"));
export const WhatsappAssistant = lazy(() => import("../views/authorized/whatsapp-modules/WhatsappAssistant"));
export const WhatsappAutomations = lazy(() => import("../views/authorized/whatsapp-modules/WhatsappAutomations"));
export const WhatsappWidgets = lazy(() => import("../views/authorized/whatsapp-modules/WhatsappWidgets"));

/* ─── 1b. Telegram Modules (telegram-modules) ────────────────────────────── */
export const TelegramTemplates = lazy(() => import("../views/authorized/telegram-modules/TelegramTemplates"));
export const TelegramBroadcasts = lazy(() => import("../views/authorized/telegram-modules/TelegramBroadcasts"));
export const TelegramGatewayOtp = lazy(() => import("../views/authorized/telegram-modules/TelegramGatewayOtp"));
export const TelegramBotConfig = lazy(() => import("../views/authorized/telegram-modules/TelegramBotConfig"));
export const TelegramDocs = lazy(() => import("../views/authorized/telegram-modules/TelegramDocs"));

/* ─── 2. Email Modules (email-modules) ────────────────────────────────────── */
export const EmailTemplates = lazy(() => import("../views/authorized/email-modules/EmailTemplates"));
export const EmailCampaigns = lazy(() => import("../views/authorized/email-modules/EmailCampaigns"));

/* ─── 3. APIs Modules (apis-modules) ──────────────────────────────────────── */
export const ApiKeyManagement = lazy(() => import("../views/authorized/apis-modules/ApiKeyManagement"));
export const ApiDocViewer = lazy(() => import("../views/authorized/apis-modules/ApiDocViewer"));
export const WebhookSetup = lazy(() => import("../views/authorized/apis-modules/WebhookSetup"));
export const WebhookLogs = lazy(() => import("../views/authorized/apis-modules/WebhookLogs"));
export const TransactionalDashboard = lazy(() => import("../views/authorized/apis-modules/TransactionalDashboard"));
export const MessageLogManagement = lazy(() => import("../views/authorized/apis-modules/MessageLogManagement"));

/* ─── 4. Account (per-user configuration) ─────────────────────────────────── */
export const UserCommunicationConfig = lazy(() => import("../views/authorized/account-configs/UserCommunicationConfig"));
export const UserSettings = lazy(() => import("../views/authorized/account-configs/UserSettings"));
export const CreditTopupManagement = lazy(() => import("../views/authorized/account-configs/CreditTopupManagement"));
export const MyCreditWallet = lazy(() => import("../views/authorized/account-configs/MyCreditWallet"));
export const SubscriptionsManagement = lazy(() => import("../views/authorized/account-configs/SubscriptionsManagement"));

/* ─── 5. Platform Settings (DEVOPS / ADMIN) ──────────────────────────────── */
export const ChannelRegistry = lazy(() => import("../views/authorized/settings/ChannelRegistry"));
export const ProviderRegistry = lazy(() => import("../views/authorized/settings/ProviderRegistry"));
export const ChannelMatrix = lazy(() => import("../views/authorized/settings/ChannelMatrix"));
export const ChannelCategoryMaster = lazy(() => import("../views/authorized/settings/ChannelCategoryMaster"));
export const ProviderApiCatalogManagement = lazy(() => import("../views/authorized/settings/ProviderApiCatalogManagement"));
export const CreditPlanChartManagement = lazy(() => import("../views/authorized/settings/CreditPlanChartManagement"));

/* ─── 6. Onboarding ──────────────────────────────────────────────────────── */
export const Onboarding = lazy(() => import("../views/authorized/onboarding/Onboarding"));

/* ─── 7. Telecom Modules (telecom) ───────────────────────────────────────── */
export const FromIdsConfig = lazy(() => import("../views/authorized/telecom/FromIdsConfig"));
export const SmsTemplates = lazy(() => import("../views/authorized/telecom/SmsTemplates"));
export const SmsCampaigns = lazy(() => import("../views/authorized/telecom/SmsCampaigns"));
export const RcsTemplates = lazy(() => import("../views/authorized/telecom/RcsTemplates"));
export const RcsResponses = lazy(() => import("../views/authorized/telecom/RcsResponses"));
export const RcsCampaigns = lazy(() => import("../views/authorized/telecom/RcsCampaigns"));
export const VoiceTemplates = lazy(() => import("../views/authorized/telecom/VoiceTemplates"));
export const VoiceCampaigns = lazy(() => import("../views/authorized/telecom/VoiceCampaigns"));
export const CampaignLists = lazy(() => import("../views/authorized/telecom/CampaignLists"));
export const CampaignSegments = lazy(() => import("../views/authorized/telecom/CampaignSegments"));
export const CampaignsManagement = lazy(() => import("../views/authorized/telecom/CampaignsManagement"));
export const UnsubscribersManagement = lazy(() => import("../views/authorized/telecom/UnsubscribersManagement"));
export const BouncesSpamManagement = lazy(() => import("../views/authorized/telecom/BouncesSpamManagement"));