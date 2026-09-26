import { useEffect, useState, Suspense } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import BreadcrumbBar from "./AdminBreadcrumbBar";
import NoticeTiker from "./NoticeTicker";
import PageLoader from "./PageLoader";
import { useToast, ToastContainer } from "../utilities/WPToast";
import apiClient from "../services/api.service";
import "../css/WPStyleTheme.scss";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toasts, toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const syncLayoutState = () => {
      if (window.innerWidth > 991) {
        setMobileOpen(false);
      }
    };

    syncLayoutState();
    window.addEventListener("resize", syncLayoutState);

    return () => window.removeEventListener("resize", syncLayoutState);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleToggle = () => {
    if (window.innerWidth <= 991) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  };

  return (
    <div className="adm-shell">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={`adm-backdrop ${mobileOpen ? "is-visible" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      <div className="adm-main">
        <AdminHeader toggleSidebar={handleToggle} />
        <NoticeTiker />
        <BreadcrumbBar />
        <div className="adm-content-scroll">
          <Suspense fallback={<PageLoader />}>
            <Outlet context={{ apiClient }} />
          </Suspense>
        </div>

        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminLayout;
