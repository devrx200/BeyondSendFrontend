import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import { jwtDecode } from "jwt-decode";
const API_URL = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
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
// import AboutAndHelpView from "../views/pages/AboutAndHelpView";

import Universities from "../views/pages/Universities";
import Colleges from "../views/pages/Colleges";
import Downloads from "../views/pages/Downloads";

import Gallery from "../views/pages/Gallery";
import FeedbackForm from "../views/pages/FeedbackForm";
import AdminFeedbackList from "../views/Admin/FeedbackList";
import AnnouncementDetails from "../views/pages/AnnouncementDetails";
import CreatedDynamicPage from "../views/pages/CreatedDynamicPage";
import DepDirectorateNoticesListView from "../views/pages/DepDirectorateNoticesListView";
import ImportantPageDetail from "../views/pages/ImportantPageDetail";

/* ADMIN */
import AdminLogin from "../views/Admin/AdminLogin";
import AdminDashboard from "../views/Admin/AdminDashboard";
import MenuManagement from "../views/Admin/MenuManagement";
import SliderManagement from "../views/Admin/SliderManagement";
import AnnouncementsManagement from "../views/Admin/AnnouncementsManagement";
import NotificationsManagement from "../views/Admin/NotificationsManagement";
import GalleryManagement from "../views/Admin/GalleryManagement";
import AboutSectionMangement from "../views/Admin/AboutSectionMangement";
import ManageCategories from "../views/Admin/ManageCategories";
import ManageBrands from "../views/Admin/ManageBrands";
import ManageUniversities from "../views/Admin/ManageUniversities";
import NewUpdatesManagement from "../views/Admin/NewUpdatesManagement";
import AdminEducationStats from "../views/Admin/AdminEducationStats";
import AdminUserManagement from "../views/Admin/AdminUserManagement";
import ContactManagement from "../views/Admin/ContactManagement";
import ImportantLinksManagement from "../views/Admin/ImportantLinksManagement";
import SchemesDetails from "../views/pages/SchemesDetails";
import PageCreatorManagement from "../views/Admin/PageCreatorMangagement";
import ImportantPageManagement from "../views/Admin/ImportantPageManagement";
import HelpGuidance from "../views/Admin/HelpGuidance";
import HelpSupport from "../views/pages/HelpSupport";

/* MIDDLEWARE */
import AuthMiddleware from "../Middlewares/AuthMiddleware";
import PublicAdminRoute from "../Middlewares/PublicAdminRoute";
import ContentUploaderForm from "../views/Admin/ContentUploaderForm";
import FileUploader from "../views/Admin/uploaderPage";
import FileManager from "../views/Admin/fileManager";
import DownloadManagement from "../views/Admin/DownloadManagement";
import CollegeManagement from "../views/Admin/CollegeManagement";
import FooterSection from "../views/Admin/footerSectionManager";
import DepartmentNoticeManagement from "../views/Admin/DepartmentNoticeManagement";
import DirectorateNoticeManagement from "../views/Admin/DirectorateNoticeManagement"
import HeaderManagement from "../views/Admin/HeaderManagement";
import ContactCardCMS from "../views/Admin/contactCardForm";
import HelpTutorials from "../views/Admin/HelpTutorials";
import SessionManager from "../views/Admin/SessionManager"
import ActivityLogManagement from "../views/Admin/ActivityLogManagement"
/* MAIN LAYOUT */
const MainLayout = ({ children }) => (
  <div
    className="app-wrapper d-flex flex-column min-vh-100"
  >
    <Header />
    <main className="flex-grow-1">{children}</main>
    <GovtBrandCarousel />
    <Footer />
  </div>
);

const AppRoutes = () => {
  const [pages, setPages] = useState([]);
  const [staticPages, setStaticPages] = useState([]);
  const [importantPages, setImportantPages] = useState([]);


  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/menu-list`);

      const menuItems = (res.data.data || []).filter(
        (item) => item.isDynamic !== false
      );

      const menuItemsStatic = (res.data.data || []).filter(
        (item) => item.isDynamic === false && item.isImportant === false
      );

      const importantPages = (res.data.data || []).filter(
        (item) => item.isImportant === true
      );

      setPages(extractPagesFromMenu(menuItems));
      setStaticPages(extractPagesFromMenu(menuItemsStatic));
      setImportantPages(extractPagesFromMenu(importantPages));

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
      <Route path="/gallery" element={<MainLayout><Gallery /></MainLayout>} />
      <Route path="/universities" element={<MainLayout><Universities /></MainLayout>} />
      <Route path="/colleges" element={<MainLayout><Colleges /></MainLayout>} />
      <Route path="/downloads" element={<MainLayout><Downloads /></MainLayout>} />
      <Route path="/feedback" element={<MainLayout><FeedbackForm /></MainLayout>} />
      <Route path="/help-and-support" element={<MainLayout><HelpSupport /></MainLayout>} />


      {/* DYNAMIC CMS PAGES From Content Uploader */}
      {pages.filter(p => !p.isExternal).map(p => (<Route key={p._id} path={p.path} element={<MainLayout><DynamicPage /></MainLayout>} />))}

      {/* Extra Page PAGES CREATED FROM ADMIN */}
      {staticPages.filter(p => !p.isExternal).map(p => (<Route key={p._id} path={`${p.path}/:slug?`} element={<MainLayout><CreatedDynamicPage /></MainLayout>} />))}

      {/* Important Pages From Admin STATIC PAGES */}
      <Route path="/:slug" element={<MainLayout><ImportantPageDetail /></MainLayout>} />

      {/* Announcements And Schemes Details */}
      <Route path="/announcement/:slug" element={<MainLayout><AnnouncementDetails /></MainLayout>} />
      <Route path="/scheme/:slug" element={<MainLayout><SchemesDetails /></MainLayout>} />
      {/* Directorate And Department Notices */}
      <Route path="/directorate-notices" element={<MainLayout><DepDirectorateNoticesListView />  </MainLayout>} />
      <Route path="/directorate-notice/:slug" element={<MainLayout> <DepDirectorateNoticesListView /></MainLayout>} />
      <Route path="/departments-notices" element={<MainLayout><DepDirectorateNoticesListView /></MainLayout>} />
      <Route path="/department-notice/:slug" element={<MainLayout> <DepDirectorateNoticesListView /></MainLayout>} />

      {/* ADMIN  All Routes */}
      <Route element={<PublicAdminRoute />}>  <Route path="/admin/login" element={<MainLayout><AdminLogin /></MainLayout>} /> </Route>
      {/* Protected Admin Routes After Login its Work */}
      <Route path="/admin" element={<AuthMiddleware allowedRoles={["ADMIN", "OFFICER", "NIC"]} allowedEmployeeTypes={["DIRECTORATE", "DEPARTMATE", "NIC"]} />}>
        <Route element={<AdminLayout />}>

          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboard />} />

          <Route path="announcements" element={<AnnouncementsManagement />} />

          <Route path="rich-content-pages" element={<AuthMiddleware allowedRoles={["ADMIN", "OFFICER"]} allowedEmployeeTypes={["DIRECTORATE"]} />}>
            <Route index element={<ContentUploaderForm />} />
          </Route>

          <Route path="notifications" element={<NotificationsManagement />} />

          <Route path="gallery" element={<GalleryManagement />} />

          <Route path="about-section" element={<AboutSectionMangement />} />

          <Route path="menu" element={<AuthMiddleware allowedRoles={["ADMIN"]} allowedEmployeeTypes={["DIRECTORATE"]} />}>
            <Route index element={<MenuManagement />} />
          </Route>

          <Route path="slider" element={<SliderManagement />} />

          <Route path="categories" element={<ManageCategories />} />

          <Route path="brands" element={<ManageBrands />} />

          <Route path="universities" element={<AuthMiddleware allowedRoles={["ADMIN"]} allowedEmployeeTypes={["DIRECTORATE"]} />}>
            <Route index element={<ManageUniversities />} />
          </Route>

          <Route path="new-updates" element={<NewUpdatesManagement />} />

          <Route path="admin-education-stats" element={<AdminEducationStats />} />

          <Route path="contact-management" element={<ContactManagement />} />

          <Route path="important-links" element={<ImportantLinksManagement />} />

          <Route path="file-manager" element={<AuthMiddleware allowedRoles={["ADMIN", "OFFICER"]} allowedEmployeeTypes={["DIRECTORATE", "DEPARTMATE"]} />}>
            <Route index element={<FileManager />} />
          </Route>

          <Route path="file-uploader" element={<AuthMiddleware allowedRoles={["ADMIN", "OFFICER"]} allowedEmployeeTypes={["DIRECTORATE", "DEPARTMATE"]} />}>
            <Route index element={<FileUploader />} />
          </Route>

          <Route path="download-management" element={<AuthMiddleware allowedRoles={["ADMIN", "OFFICER"]} allowedEmployeeTypes={["DIRECTORATE", "DEPARTMATE"]} />}>
            <Route index element={<DownloadManagement />} />
          </Route>

          <Route path="college-management" element={<CollegeManagement />} />

          <Route path="feedbacks" element={<AdminFeedbackList />} />

          <Route path="footer-section-manager" element={<AuthMiddleware allowedRoles={["ADMIN"]} allowedEmployeeTypes={["DIRECTORATE"]} />}>
            <Route index element={<FooterSection />} />
          </Route>

          <Route path="multi-section-pages-management" element={<AuthMiddleware allowedRoles={["ADMIN"]} allowedEmployeeTypes={["DIRECTORATE"]} />}>
            <Route index element={<PageCreatorManagement />} />
          </Route>

          <Route path="department-notices" element={<AuthMiddleware allowedRoles={["ADMIN", "OFFICER"]} allowedEmployeeTypes={["DEPARTMATE"]} />}>
            <Route index element={<DepartmentNoticeManagement />} />
          </Route>

          <Route path="directorate-notices" element={<AuthMiddleware allowedRoles={["ADMIN", "OFFICER"]} allowedEmployeeTypes={["DIRECTORATE"]} />}>
            <Route index element={<DirectorateNoticeManagement />} />
          </Route>

          <Route path="important-page-management" element={<AuthMiddleware allowedRoles={["ADMIN"]} allowedEmployeeTypes={["DIRECTORATE"]} />}>
            <Route index element={<ImportantPageManagement />} />
          </Route>

          <Route path="help-guidance" element={<HelpGuidance />} />

          <Route path="header-management" element={<AuthMiddleware allowedRoles={["ADMIN"]} allowedEmployeeTypes={["DIRECTORATE"]} />}>
            <Route index element={<HeaderManagement />} />
          </Route>

          <Route path="contact-card-management" element={<AuthMiddleware allowedRoles={["ADMIN"]} allowedEmployeeTypes={["DIRECTORATE"]} />}>
            <Route index element={<ContactCardCMS />} />
          </Route>

          <Route path="tutorials" element={<HelpTutorials />} />

          <Route path="session-manager" element={<AuthMiddleware allowedRoles={["NIC"]} allowedEmployeeTypes={["NIC"]} />}>
            <Route index element={<SessionManager />} />
          </Route>


          <Route path="users-management" element={<AuthMiddleware allowedRoles={["ADMIN","NIC"]} allowedEmployeeTypes={["DIRECTORATE", "DEPARTMATE","NIC"]} />}>
            <Route index element={<AdminUserManagement />} />
          </Route>

          <Route path="activity-logs" element={<AuthMiddleware allowedRoles={["NIC"]} allowedEmployeeTypes={["NIC"]} />}>
            <Route index element={<ActivityLogManagement />} />
          </Route>

        </Route>
      </Route>
      <Route path="*" element={<MainLayout><Home /></MainLayout>} />
    </Routes>
  );
};

export default AppRoutes;
