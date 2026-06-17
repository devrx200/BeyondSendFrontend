import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import BreadcrumbBar from "./AdminBreadcrumbBar";
import "../css/AdminTheme.css";

const AdminLayout = () => {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleToggle = () => {
    if (window.innerWidth <= 991) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  };

  return (
    <div className="adm-shell">
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

        <BreadcrumbBar />

        <div className="adm-content-scroll">
          {/* <div className="adm-content-card"> */}
            <Outlet />
          {/* </div> */}
        </div>

        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminLayout;