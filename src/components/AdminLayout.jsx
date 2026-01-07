import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem } from "reactstrap";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";

const formatLabel = (segment) => {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);
  return (

    <div
      className="d-flex"
      style={{
        height: "100vh",
        overflow: "hidden"
      }}
    >
      <AdminSidebar collapsed={collapsed} />
      <div
        className="flex-grow-1 d-flex flex-column bg-light"
        style={{ overflow: "hidden" }}
      >

        <AdminHeader toggleSidebar={() => setCollapsed(!collapsed)} />

        <div
          className="px-4 py-2 flex-shrink-0"
          style={{
            background: "linear-gradient(90deg, #4e73df, #1cc88a)"
          }}
        >
          <Breadcrumb className="mb-0 bg-transparent">
            {pathnames.map((segment, index) => {
              const isLast = index === pathnames.length - 1;
              const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
              if (segment === "admin") {
                return (
                  <BreadcrumbItem key="admin">
                    <Link
                      to="/admin/dashboard"
                      className="text-white fw-bold text-decoration-none"
                    >
                      Admin
                    </Link>
                  </BreadcrumbItem>
                );
              }
              return (
                <BreadcrumbItem key={routeTo} active={isLast}>
                  {isLast ? (
                    <span className="fw-bold text-white">
                      {formatLabel(segment)}
                    </span>
                  ) : (
                    <Link
                      to={routeTo}
                      className="text-white text-decoration-none"
                    >
                      {formatLabel(segment)}
                    </Link>
                  )}
                </BreadcrumbItem>
              );
            })}
          </Breadcrumb>
        </div>

        <div
          className="flex-grow-1"
          style={{
            overflowY: "auto",
            padding: "1.5rem"
          }}
        >
          <div className="bg-white p-4 rounded shadow-sm">
            <Outlet />
          </div>
        </div>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminLayout;
