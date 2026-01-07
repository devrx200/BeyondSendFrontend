import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ListGroup,
  ListGroupItem,
  Collapse,
  Badge
} from "reactstrap";
import {
  FaTachometerAlt,
  FaImages,
  FaNewspaper,
  FaChevronDown,
  FaChevronRight,
  FaBullhorn,
  FaFileAlt,
  FaBars as FaMenu
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";

/* ===== ADMIN PROFILE ===== */
const adminProfile = {
  name: "Department Admin",
  designation: "System Administrator",
  role: "HE-Admin",
  avatar:
    "https://ui-avatars.com/api/?name=HE+Admin&background=6610f2&color=fff"
};

/* ===== ADMIN MENU ===== */
const adminMenu = [
  {
    id: "dashboard",
    icon: FaTachometerAlt,
    path: "/admin/dashboard",
    label: { en: "Dashboard", hi: "डैशबोर्ड" }
  },
  {
    id: "menuManagement",
    icon: FaMenu,
    path: "/admin/menu",
    label: { en: "Menu Management", hi: "मेनू प्रबंधन" }
  },
  {
    id: "slider",
    icon: FaImages,
    path: "/admin/slider",
    label: { en: "Home Slider", hi: "होम स्लाइडर" }
  },
  {
    id: "newsManagement",
    icon: FaNewspaper,
    label: { en: "News & Updates", hi: "समाचार एवं अपडेट" },
    submenu: [
      {
        id: "news",
        icon: FaNewspaper,
        path: "/admin/news",
        label: { en: "News", hi: "समाचार" }
      },
      {
        id: "announcements",
        icon: FaBullhorn,
        path: "/admin/announcements",
        label: { en: "Announcements", hi: "घोषणाएं" }
      },
      {
        id: "notifications",
        icon: FaBullhorn,
        path: "/admin/notifications",
        label: { en: "Notifications", hi: "सूचनाएं" }
      }
    ]
  },
  {
    id: "gallery",
    icon: FaImages,
    path: "/admin/gallery",
    label: { en: "Photo Gallery", hi: "चित्र प्रदर्शनी" }
  },
  {
    id: "downloads",
    icon: FaFileAlt,
    path: "/admin/downloads",
    label: { en: "Downloads", hi: "डाउनलोड" }
  }
];

const AdminSidebar = ({ collapsed }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const { isHindi } = useLanguage();

  return (
    <div
      className="d-flex flex-column text-white"
      style={{
        width: collapsed ? "80px" : "260px",
        height: "100vh",
        background: "linear-gradient(180deg, #6d91fd, #1cc88a)",
        overflow: "hidden" 
      }}
    >
      {/* ===== PROFILE (FIXED) ===== */}
      <div className="text-center p-3 border-bottom border-light flex-shrink-0">
        <img
          src={adminProfile.avatar}
          alt="Admin"
          className="rounded mb-2 border border-2 border-white"
          width="45"
          height="45"
        />

        {!collapsed && (
          <>
            <h6 className="mb-0 fw-bold">{adminProfile.name}</h6>
            <small className="d-block opacity-75">
              {adminProfile.designation}
            </small>
            <Badge color="dark" className="mt-1">
              {adminProfile.role}
            </Badge>
          </>
        )}
      </div>

      {/* ===== MENU SCROLL AREA ONLY ===== */}
      <div
        className="flex-grow-1"
        style={{
          overflowY: "auto",   // ✅ SCROLL ONLY MENU
          overflowX: "hidden"
        }}
      >
        <ListGroup flush className="mt-2">
          {adminMenu.map((item) => {
            const Icon = item.icon;

            if (!item.submenu) {
              return (
                <ListGroupItem
                  key={item.id}
                  tag={NavLink}
                  to={item.path}
                  className="border-0 text-white d-flex align-items-center"
                  style={{ background: "transparent", gap: "12px" }}
                >
                  <Icon />
                  {!collapsed && (isHindi ? item.label.hi : item.label.en)}
                </ListGroupItem>
              );
            }

            return (
              <div key={item.id}>
                <ListGroupItem
                  onClick={() =>
                    setOpenMenu(openMenu === item.id ? null : item.id)
                  }
                  className="border-0 text-white d-flex justify-content-between align-items-center"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    cursor: "pointer"
                  }}
                >
                  <span className="d-flex align-items-center gap-2">
                    <Icon />
                    {!collapsed && (isHindi ? item.label.hi : item.label.en)}
                  </span>

                  {!collapsed &&
                    (openMenu === item.id ? <FaChevronDown /> : <FaChevronRight />)}
                </ListGroupItem>

                <Collapse isOpen={!collapsed && openMenu === item.id}>
                  {item.submenu.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <ListGroupItem
                        key={sub.id}
                        tag={NavLink}
                        to={sub.path}
                        className="border-0 text-white ps-5 d-flex align-items-center"
                        style={{
                          background: "rgba(0,0,0,0.15)",
                          gap: "10px"
                        }}
                      >
                        <SubIcon />
                        {isHindi ? sub.label.hi : sub.label.en}
                      </ListGroupItem>
                    );
                  })}
                </Collapse>
              </div>
            );
          })}
        </ListGroup>
      </div>
    </div>
  );
};

export default AdminSidebar;
