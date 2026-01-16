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
  FaPlus,
  FaTrash,
  FaNewspaper,
  FaChevronDown,
  FaChevronRight,
  FaBullhorn,
  FaBars,
  FaChartBar,
  FaUniversity,
  FaListAlt,
  FaTags,
  FaBell,
  FaPhotoVideo,
  FaInfoCircle,
  FaFileImage,
  FaPhone,
  FaLink
} from "react-icons/fa";

import { useLanguage } from "../contexts/LanguageContext";
import { jwtDecode } from "jwt-decode";


const adminMenu = [
  {
    id: "dashboard",
    icon: FaTachometerAlt,
    path: "/admin/dashboard",
    label: { en: "Dashboard", hi: "डैशबोर्ड" }
  },
  {
    id: "menu",
    icon: FaBars,
    path: "/admin/menu",
    label: { en: "Menu Management", hi: "मेनू प्रबंधन" }
  },
  {
    id: "important-links",
    icon: FaLink,
    path: "/admin/important-links",
    label: { en: "Important Links", hi: "महत्वपूर्ण लिंक्स" }
  },
  {
    id: "contact",
    icon: FaPhone,
    path: "/admin/contact-management",
    label: { en: "Contact Management", hi: "संपर्क प्रबंधन" }
  },
  {
    id: "education-stats",
    icon: FaChartBar,
    path: "/admin/admin-education-stats",
    label: { en: "Education Stats", hi: "शिक्षा सांख्यिकी" }
  },
  {
    id: "universities",
    icon: FaUniversity,
    path: "/admin/universities",
    label: { en: "Manage Universities", hi: "विश्वविद्यालय प्रबंधन" }
  },
  {
    id: "categories",
    icon: FaListAlt,
    path: "/admin/categories",
    label: { en: "Manage Categories", hi: "श्रेणियाँ प्रबंधन" }
  },
  {
    id: "brands",
    icon: FaTags,
    path: "/admin/brands",
    label: { en: "Manage Brands", hi: "ब्रांड्स प्रबंधन" }
  },
  {
    id: "slider",
    icon: FaImages,
    path: "/admin/slider",
    label: { en: "Home Slider", hi: "होम स्लाइडर" }
  },
  {
    id: "About and Help",
    icon: FaImages,
    path: "/admin/about-and-help",
    label: { en: "About and Help", hi: "बारे में एवं सहायता" }
  },
  {
    id: "news",
    icon: FaNewspaper,
    label: { en: "News & Updates", hi: "समाचार एवं अपडेट" },
    submenu: [
      {
        id: "news-updates",
        icon: FaBullhorn,
        path: "/admin/new-updates",
        label: { en: "New Updates", hi: "नवीन सूचना" }
      },
      {
        id: "news-list",
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
        icon: FaBell,
        path: "/admin/notifications",
        label: { en: "Notifications", hi: "सूचनाएं" }
      }
    ]
  },
  {
    id: "gallery",
    icon: FaPhotoVideo,
    path: "/admin/gallery",
    label: { en: "Photo Gallery", hi: "चित्र प्रदर्शनी" }
  },
  {
    id: "about",
    icon: FaInfoCircle,
    label: { en: "About", hi: "परिचय" },
    submenu: [
      {
        id: "about-content",
        icon: FaFileImage,
        path: "/admin/image-master",
        label: { en: "About Content", hi: "परिचय सामग्री" }
      }
    ]
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
      setDecoded(jwtDecode(token));
    } catch {
      setDecoded(null);
    }
  }, []);


  useEffect(() => {
    if (!decoded?.exp) return;

    const timer = setInterval(() => {
      const remaining = decoded.exp * 1000 - Date.now();
      if (remaining <= 0) return clearInterval(timer);

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


  const hoverIn = (e) => {
    e.currentTarget.style.background = "rgba(0, 0, 0, 0.55)";
    e.currentTarget.style.color = "white";
    e.currentTarget.style.cursor = "pointer";
    e.currentTarget.style.transform = "scale(1.02)";
    e.currentTarget.style.borderRadius = "5px";
  };

  const hoverOut = (e) => {
    e.currentTarget.style.background = "transparent";
  };

  return (
    <div
      className="d-flex flex-column text-white"
      style={{
        width: collapsed ? "80px" : "260px",
        height: "100vh",
        background: "linear-gradient(180deg,#6d91fd,#1cc88a)"
      }}
    >

      <div className="text-center p-3 border-bottom border-light">
        <img
          src={
            decoded?.profileImage ||
            "https://ui-avatars.com/api/?name=Admin&background=6610f2&color=fff"
          }
          className="rounded mb-2 border border-2 border-white"
          width="45"
          height="45"
          alt="Admin"
        />

        {!collapsed && decoded && (
          <>
            <h6 className="fw-bold mb-0">{decoded.name}</h6>
            <small className="opacity-75">{decoded.userDesignations}</small>
            <Badge color="dark" className="mt-1">{decoded.role}</Badge>

            {expiresIn && (
              <div className="mt-2 text-warning fw-bold">
                Session Expires In {expiresIn}
              </div>
            )}
            <hr className="m-0 p-0" />
            <div className="mt-2">
              <small className="fw-bold">Department of Higher Education, Government of Chhattisgarh</small>
            </div>

          </>
        )}
      </div>

      <div className="flex-grow-1 overflow-auto">
        <ListGroup flush className="mt-2">
          {adminMenu.map((item) => {
            const Icon = item.icon;
            const label = isHindi ? item.label.hi : item.label.en;

            if (!item.submenu) {
              return (
                <ListGroupItem
                  key={item.id}
                  tag={NavLink}
                  to={item.path}
                  title={collapsed ? label : ""}
                  onMouseEnter={hoverIn}
                  onMouseLeave={hoverOut}
                  className="border-0 fw-semibold text-white d-flex align-items-center gap-3"
                  style={{ background: "transparent" }}
                >
                  <Icon />
                  {!collapsed && label}
                </ListGroupItem>
              );
            }

            return (
              <div key={item.id}>
                <ListGroupItem
                  title={collapsed ? label : ""}
                  onClick={() =>
                    setOpenMenu(openMenu === item.id ? null : item.id)
                  }
                  onMouseEnter={hoverIn}
                  onMouseLeave={hoverOut}
                  className="border-0 fw-bold text-white d-flex justify-content-between"
                  style={{ background: "rgba(0, 0, 0, 0.2)" }}
                >
                  <span className="d-flex align-items-center gap-2">
                    <Icon />
                    {!collapsed && label}
                  </span>

                  {!collapsed &&
                    (openMenu === item.id ? <FaChevronDown /> : <FaChevronRight />)}
                </ListGroupItem>

                <Collapse isOpen={!collapsed && openMenu === item.id}>
                  {item.submenu.map((sub) => {
                    const SubIcon = sub.icon;
                    const subLabel = isHindi ? sub.label.hi : sub.label.en;

                    return (
                      <ListGroupItem
                        key={sub.id}
                        tag={NavLink}
                        to={sub.path}
                        title={collapsed ? subLabel : ""}
                        onMouseEnter={hoverIn}
                        onMouseLeave={hoverOut}
                        className="border-0 fw-bold text-white d-flex align-items-center gap-2 ps-5"
                        style={{ background: "rgba(0, 0, 0, 0.35)" }}
                      >
                        <SubIcon />
                        {!collapsed && subLabel}
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
