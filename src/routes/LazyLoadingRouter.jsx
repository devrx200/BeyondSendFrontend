import { lazy } from 'react';

/* ─── Public Pages ────────────────────────────────────────────────────────── */
export const Home = lazy(() => import("../views/pages/Home"));
export const Contact = lazy(() => import("../views/pages/Contact"));
export const Gallery = lazy(() => import("../views/pages/Gallery"));
export const Universities = lazy(() => import("../views/pages/Universities"));
export const Colleges = lazy(() => import("../views/pages/Colleges"));
export const Downloads = lazy(() => import("../views/pages/Downloads"));
export const FeedbackForm = lazy(() => import("../views/pages/FeedbackForm"));
export const HelpSupport = lazy(() => import("../views/pages/HelpSupport"));
export const SchemeAnnouncementDetails = lazy(() => import("../views/pages/SchemeAnnouncementDetails"));
export const SchemeAnnouncementListView = lazy(() => import("../views/pages/SchemeAnnouncementListView"));
export const MultiSectionPages = lazy(() => import("../views/pages/MultiSectionPages"));
export const SlugResolver = lazy(() => import("../utilities/SlugResolver"));
export const DepDirectorateNoticesListView = lazy(() => import("../views/pages/DepDirectorateNoticesListView"));

/* ─── Admin Pages ─────────────────────────────────────────────────────────── */
export const AdminLogin = lazy(() => import("../views/Admin/AdminLogin"));
export const AdminDashboard = lazy(() => import("../views/Admin/AdminDashboard"));
export const AdminUserManagement = lazy(() => import("../views/Admin/AdminUserManagement"));
export const AdminEducationStats = lazy(() => import("../views/Admin/AdminEducationStats"));
export const AdminFeedbackList = lazy(() => import("../views/Admin/FeedbackList"));
export const MenuManagement = lazy(() => import("../views/Admin/MenuManagement"));
export const HeaderManagement = lazy(() => import("../views/Admin/HeaderManagement"));
export const SliderManagement = lazy(() => import("../views/Admin/SliderManagement"));
export const FooterSection = lazy(() => import("../views/Admin/FooterSectionManager"));
export const AboutSectionMangement = lazy(() => import("../views/Admin/AboutSectionMangement"));
export const AnnouncementsManagement = lazy(() => import("../views/Admin/AnnouncementsManagement"));
export const NewUpdatesManagement = lazy(() => import("../views/Admin/NewUpdatesManagement"));
export const GalleryManagement = lazy(() => import("../views/Admin/GalleryManagement"));
export const ManageCategories = lazy(() => import("../views/Admin/ManageCategories"));
export const ManageBrands = lazy(() => import("../views/Admin/ManageBrands"));
export const ContactManagement = lazy(() => import("../views/Admin/ContactManagement"));
export const ContactCardCMS = lazy(() => import("../views/Admin/ContactCardForm"));
export const ImportantLinksManagement = lazy(() => import("../views/Admin/ImportantLinksManagement"));
export const QuickAccessManagement = lazy(() => import("../views/Admin/QuickAccessManagement"));
export const ImportantPageManagement = lazy(() => import("../views/Admin/ImportantPageManagement"));
export const PageCreatorManagement = lazy(() => import("../views/Admin/MultiSectionPagesMangagement"));
export const RichContentPageManagements = lazy(() => import("../views/Admin/RichContentPageManagements"));
export const MediaLibraryMangments = lazy(() => import("../views/Admin/MediaLibraryMangments"));
export const DownloadManagement = lazy(() => import("../views/Admin/DownloadManagement"));
export const DepartmentNoticeManagement = lazy(() => import("../views/Admin/DepartmentNoticeManagement"));
export const DirectorateNoticeManagement = lazy(() => import("../views/Admin/DirectorateNoticeManagement"));
export const HelpGuidance = lazy(() => import("../views/Admin/HelpGuidance"));
export const HelpTutorials = lazy(() => import("../views/Admin/HelpTutorials"));
export const SessionManager = lazy(() => import("../views/Admin/SessionManager"));
export const ActivityLogManagement = lazy(() => import("../views/Admin/ActivityLogManagement"));
export const DbBackupManagement = lazy(() => import("../views/Admin/DbBackupManagement"));
