import { useEffect, useState } from "react";
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
import { jwtDecode } from "jwt-decode";

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
  const { isHindi } = useLanguage();

  const [openMenu, setOpenMenu] = useState(null);
  const [decoded, setDecoded] = useState(null);
  const [expiresIn, setExpiresIn] = useState(null);


  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) return;

    try {
      const payload = jwtDecode(token);
      setDecoded(payload);
      console.log(payload);
    } catch {
      setDecoded(null);
    }
  }, []);


  useEffect(() => {
    if (!decoded?.exp) return;

    const timer = setInterval(() => {
      const remaining = decoded.exp * 1000 - Date.now();

      if (remaining <= 0) {
        clearInterval(timer);
        setExpiresIn(null);
        return;
      }

      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);

      setExpiresIn(
        `${h.toString().padStart(2, "0")}:${m
          .toString()
          .padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [decoded]);

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

      <div className="text-center p-3 border-bottom border-light">
        <img
          src={
            decoded?.profileImage ||
            "https://ui-avatars.com/api/?name=Admin&background=6610f2&color=fff"
          }
          alt="Admin"
          className="rounded mb-2 border border-2 border-white"
          width="45"
          height="45"
        />

        {!collapsed && decoded && (
          <>
            <h6 className="mb-0 fw-bold">{decoded.name }</h6>
            <small className="d-block opacity-75">
              {decoded.userDesignations}
            </small>

            <Badge color="dark" className="mt-1">
              {decoded.role}
            </Badge>

            {expiresIn && (
              <div className="mt-2 text-warning fw-bold">
                Session Expires In {""}
            
                {expiresIn}
              </div>
            )}
          </>
        )}
      </div>

      <div className="text-center p-3 border-bottom border-light">
        <small className="d-block opacity-75">
          Department of Higher Education, Government of Chhattisgarh
        </small>
      </div>

      <div className="flex-grow-1" style={{ overflowY: "auto" }}>
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
                  className="border-0 text-white d-flex justify-content-between"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <span className="d-flex align-items-center gap-2">
                    <Icon />
                    {!collapsed && (isHindi ? item.label.hi : item.label.en)}
                  </span>

                  {!collapsed &&
                    (openMenu === item.id ? (
                      <FaChevronDown />
                    ) : (
                      <FaChevronRight />
                    ))}
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
