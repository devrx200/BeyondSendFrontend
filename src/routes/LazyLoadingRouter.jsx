import { lazy } from 'react';

/* ─── Public Pages ────────────────────────────────────────────────────────── */
export const AdminLogin = lazy(() => import("../views/pages/AdminLogin"));
export const Contact = lazy(() => import("../views/pages/Contact"));
export const Downloads = lazy(() => import("../views/pages/Downloads"));
export const FeedbackForm = lazy(() => import("../views/pages/FeedbackForm"));
export const HelpSupport = lazy(() => import("../views/pages/HelpSupport"));
export const SlugResolver = lazy(() => import("../utilities/SlugResolver"));

/* ─── Admin Pages ─────────────────────────────────────────────────────────── */
export const AdminDashboard = lazy(() => import("../views/authorized/AdminDashboard"));
export const AdminUserManagement = lazy(() => import("../views/authorized/AdminUserManagement"));
export const AdminFeedbackList = lazy(() => import("../views/authorized/FeedbackList"));
export const MenuManagement = lazy(() => import("../views/authorized/MenuManagement"));
export const HeaderManagement = lazy(() => import("../views/authorized/HeaderManagement"));
export const FooterSection = lazy(() => import("../views/authorized/FooterSectionManager"));

export const NewUpdatesManagement = lazy(() => import("../views/authorized/NewUpdatesManagement"));
export const ManageCategories = lazy(() => import("../views/authorized/ManageCategories"));
export const ManageBrands = lazy(() => import("../views/authorized/ManageBrands"));
export const ContactManagement = lazy(() => import("../views/authorized/ContactManagement"));
export const ContactCardCMS = lazy(() => import("../views/authorized/ContactCardForm"));
export const QuickAccessManagement = lazy(() => import("../views/authorized/QuickAccessManagement"));
export const ImportantPageManagement = lazy(() => import("../views/authorized/ImportantPageManagement"));
export const RichContentPageManagements = lazy(() => import("../views/authorized/RichContentPageManagements"));
export const MediaLibraryMangments = lazy(() => import("../views/authorized/MediaLibraryMangments"));
export const DownloadManagement = lazy(() => import("../views/authorized/DownloadManagement"));
export const HelpGuidance = lazy(() => import("../views/authorized/HelpGuidance"));
export const HelpTutorials = lazy(() => import("../views/authorized/HelpTutorials"));
export const SessionManager = lazy(() => import("../views/authorized/SessionManager"));
export const ActivityLogManagement = lazy(() => import("../views/authorized/ActivityLogManagement"));
export const DbBackupManagement = lazy(() => import("../views/authorized/DbBackupManagement"));
export const AboutSectionMangement = lazy(() => import("../views/authorized/AboutSectionMangement"));