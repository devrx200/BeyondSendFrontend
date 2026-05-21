import { useEffect, useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem } from "reactstrap";
import { FaHome, FaCalendarAlt } from "react-icons/fa";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import "../css/AdminTheme.css";

const formatLabel = (segment) => {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  /* Close the mobile drawer whenever the route changes */
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

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  });

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

        <div className="adm-breadcrumb-bar">
          <Breadcrumb className="adm-breadcrumb">
            {pathnames.map((segment, index) => {
              const isLast = index === pathnames.length - 1;
              const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
              if (segment === "admin") {
                return (
                  <BreadcrumbItem key="admin">
                    <Link to="/admin/dashboard">
                      <FaHome /> Admin
                    </Link>
                  </BreadcrumbItem>
                );
              }
              return (
                <BreadcrumbItem key={routeTo} active={isLast}>
                  {isLast ? (
                    <span>{formatLabel(segment)}</span>
                  ) : (
                    <Link to={routeTo}>{formatLabel(segment)}</Link>
                  )}
                </BreadcrumbItem>
              );
            })}
          </Breadcrumb>

          <div className="adm-breadcrumb-meta">
            <span className="adm-meta-chip">
              <FaCalendarAlt /> {todayLabel}
            </span>
          </div>
        </div>

        <div className="adm-content-scroll">
          <div className="adm-content-card">
            <Outlet />
          </div>
        </div>

        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminLayout;
