import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Collapse } from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";

import {
  FaTachometerAlt,
  FaLayerGroup,
  FaBars,
  FaFileAlt,
  FaListAlt,
  FaWindowMaximize,
  FaWindowMinimize,
  FaFolderOpen,
  FaFolder,
  FaUpload,
  FaCloudUploadAlt,
  FaDownload,
  FaNewspaper,
  FaBullhorn,
  FaChartBar,
  FaUniversity,
  FaSchool,
  FaDatabase,
  FaTags,
  FaLink,
  FaImages,
  FaPhotoVideo,
  FaImage,
  FaHeadset,
  FaPhoneAlt,
  FaIdCard,
  FaHandsHelping,
  FaCommentDots,
  FaUsers,
  FaHistory,
  FaChevronRight,
  FaClock,
  FaSignOutAlt,
  FaExclamationCircle,
  FaUserShield,
  FaShieldAlt,
  FaBolt,
  FaThLarge,
  FaBuilding,
  FaFileContract
} from "react-icons/fa";

import { useLanguage } from "../contexts/LanguageContext";
import { FaPager } from "react-icons/fa6";

const API_URL = import.meta.env.VITE_API_URL;
const HEWebCMSVersion = import.meta.env.VITE_PORTAL_VERSION;


const adminMenu = [
  {
    id: "dashboard",
    icon: FaTachometerAlt,
    path: "/admin/dashboard",
    label: {
      en: "Main Dashboard Home",
      hi: "मुख्य डैशबोर्ड घर"
    }
  },

  {
    id: "news-notices",
    icon: FaNewspaper,
    label: {
      en: "Add News & Notices",
      hi: "समाचार एवं सूचनाएं जोड़ें "
    },
    submenu: [
      {
        id: "new-updates",
        icon: FaBolt,
        path: "/admin/new-updates",
        label: {
          en: "Latest Updates Ticker",
          hi: "नवीन अपडेट टिकर"
        },
        allowedRoles: ["ADMIN", "OFFICER"],
        allowedEmployeeTypes: ["DIRECTORATE", "DEPARTMENT"]
      },
      {
        id: "announcements",
        icon: FaBullhorn,
        path: "/admin/announcements",
        label: {
          en: "Announcements & Schemes",
          hi: "घोषणाएं एवं योजनाएं"
        },
        allowedRoles: ["ADMIN", "OFFICER"],
        allowedEmployeeTypes: ["DIRECTORATE", "DEPARTMENT"]
      },
      {
        id: "directorate-notices",
        icon: FaBuilding,
        path: "/admin/directorate-notices",
        label: {
          en: "Directorate Notices",
          hi: "संचालनालय सूचनाएं"
        },
        allowedRoles: ["ADMIN", "OFFICER"],
        allowedEmployeeTypes: ["DIRECTORATE"]
      },
      {
        id: "department-notices",
        icon: FaFileContract,
        path: "/admin/department-notices",
        label: {
          en: "Department Notices",
          hi: "विभागीय सूचनाएं"
        },
        allowedRoles: ["ADMIN", "OFFICER"],
        allowedEmployeeTypes: ["DEPARTMENT"]
      }
    ]
  },

  {
    id: "page-management",
    icon: FaPager,
    label: {
      en: "All Page Management",
      hi: " सभी पेज प्रबंधन"
    },
    submenu: [

      {
        id: "multi-section-pages-management",
        icon: FaLayerGroup,
        path: "/admin/multi-section-pages-management",
        label: {
          en: "Multi Section Pages",
          hi: "बहु-खंड पृष्ठ"
        },
        allowedRoles: ["ADMIN", "OFFICER"],
        allowedEmployeeTypes: ["DIRECTORATE", "DEPARTMENT"]
      },

      {
        id: "rich-content-pages",
        icon: FaPager,
        path: "/admin/rich-content-pages",
        label: {
          en: "Rich Content Pages",
          hi: "समृद्ध सामग्री पृष्ठ"
        },
        allowedRoles: ["ADMIN", "OFFICER"],
        allowedEmployeeTypes: ["DIRECTORATE", "DEPARTMENT"]
      },
      {
        id: "important-page-management",
        icon: FaExclamationCircle,
        path: "/admin/important-page-management",
        label: {
          en: "Important Pages",
          hi: "महत्वपूर्ण पृष्ठ"
        },
        allowedRoles: ["ADMIN"],
        allowedEmployeeTypes: ["DIRECTORATE"]
      },
    ]
  },

  {
    id: "media-library",
    icon: FaFolderOpen,
    path: "/admin/media-library-mangments",
    label: {
      en: "Media, Resources & Library",
      hi: "मीडिया, संसाधन एवं लाइब्रेरी"
    },
    allowedRoles: ["ADMIN", "OFFICER"],
    allowedEmployeeTypes: ["DIRECTORATE", "DEPARTMENT"]

  },
  {
    id: "education-management",
    icon: FaUniversity,
    label: {
      en: "Education Management",
      hi: "शिक्षा प्रबंधन"
    },
    submenu: [
      {
        id: "education-stats",
        icon: FaChartBar,
        path: "/admin/admin-education-stats",
        label: {
          en: "Education Statistics",
          hi: "शिक्षा सांख्यिकी"
        },
        allowedRoles: ["ADMIN"],
        allowedEmployeeTypes: ["DIRECTORATE"]
      },

    ]
  },
  {
    id: "media-and-download-management",
    icon: FaPhotoVideo,
    label: {
      en: "Gallery & Download Pages",
      hi: "गैलरी एवं डाउनलोड पृष्ठ"
    },
    submenu: [
      {
        id: "gallery-page",
        icon: FaImages,
        path: "/admin/gallery",
        label: {
          en: "Photo Galleries Page",
          hi: "फोटो गैलरी पेज"
        },
        allowedRoles: ["ADMIN", "OFFICER"],
        allowedEmployeeTypes: ["DIRECTORATE", "DEPARTMENT"]
      },

      {
        id: "downloads-management",
        icon: FaDownload,
        path: "/admin/download-management",
        label: {
          en: "Download Page",
          hi: "डाउनलोड पेज"
        },
        allowedRoles: ["ADMIN", "OFFICER"],
        allowedEmployeeTypes: ["DIRECTORATE", "DEPARTMENT"]
      }
    ]
  },

  {
    id: "master-management",
    icon: FaDatabase,
    label: {
      en: "Master Management",
      hi: "मास्टर प्रबंधन"
    },
    submenu: [
      {
        id: "categories",
        icon: FaListAlt,
        path: "/admin/categories",
        label: {
          en: "Categories",
          hi: "श्रेणियाँ"
        },
        allowedRoles: ["ADMIN", "OFFICER"],
        allowedEmployeeTypes: ["DIRECTORATE", "DEPARTMENT"]
      }
    ]
  },
  {
    id: "website-management",
    icon: FaLayerGroup,
    label: {
      en: "Website Management",
      hi: "वेबसाइट प्रबंधन"
    },
    submenu: [
      {
        id: "header-management",
        icon: FaWindowMaximize,
        path: "/admin/header-management",
        label: {
          en: "Header Management",
          hi: "हेडर प्रबंधन"
        },
        allowedRoles: ["ADMIN", "NIC"],
        allowedEmployeeTypes: ["DIRECTORATE", "NIC"]
      },
      {
        id: "menu-management",
        icon: FaBars,
        path: "/admin/menu",
        label: {
          en: "Menu Management",
          hi: "मेनू प्रबंधन"
        },
        allowedRoles: ["ADMIN", "NIC"],
        allowedEmployeeTypes: ["DIRECTORATE", "NIC"]
      },
      {
        id: "slider",
        icon: FaImages,
        path: "/admin/slider",
        label: {
          en: "Home Slider",
          hi: "होम स्लाइडर"
        },
        allowedRoles: ["ADMIN", "NIC"],
        allowedEmployeeTypes: ["DIRECTORATE", "NIC"]
      },
      {
        id: "about-content",
        icon: FaImage,
        path: "/admin/about-section",
        label: {
          en: "About Section",
          hi: "परिचय अनुभाग"
        },
        allowedRoles: ["ADMIN", "NIC"],
        allowedEmployeeTypes: ["DIRECTORATE", "NIC"]
      },
      {
        id: "important-links",
        icon: FaLink,
        path: "/admin/important-links",
        label: {
          en: "Important Links",
          hi: "महत्वपूर्ण लिंक"
        },
        allowedRoles: ["ADMIN", "NIC"],
        allowedEmployeeTypes: ["DIRECTORATE", "NIC"]
      },
      {
        id: "quick-access",
        icon: FaThLarge,
        path: "/admin/quick-access",
        label: {
          en: "Quick Access",
          hi: "त्वरित पहुंच"
        },
        allowedRoles: ["ADMIN", "NIC",],
        allowedEmployeeTypes: ["DIRECTORATE", "NIC"]
      },
      {
        id: "brands",
        icon: FaTags,
        path: "/admin/brands",
        label: {
          en: "Footer Brands",
          hi: "फुटर ब्रांड्स"
        },
        allowedRoles: ["ADMIN", "NIC"],
        allowedEmployeeTypes: ["DIRECTORATE", "NIC"]
      },
      {
        id: "footer-management",
        icon: FaWindowMinimize,
        path: "/admin/footer-section-manager",
        label: {
          en: "Footer Management",
          hi: "फुटर प्रबंधन"
        },
        allowedRoles: ["ADMIN", "NIC"],
        allowedEmployeeTypes: ["DIRECTORATE", "NIC"]
      }
    ]
  },

  {
    id: "contact-page-management",
    icon: FaPager,
    label: {
      en: "Manage Contact Page ",
      hi: "संपर्क पेज प्रबंधन"
    },
    submenu: [
      {
        id: "contact-info",
        icon: FaPhoneAlt,
        path: "/admin/contact-management",
        label: {
          en: "Contact Information",
          hi: "संपर्क जानकारी"
        },
        allowedRoles: ["ADMIN"],
        allowedEmployeeTypes: ["DIRECTORATE"]
      },
      {
        id: "contact-card",
        icon: FaIdCard,
        path: "/admin/contact-card-management",
        label: {
          en: "Contact Cards",
          hi: "संपर्क कार्ड"
        },
        allowedRoles: ["ADMIN"],
        allowedEmployeeTypes: ["DIRECTORATE"]
      }
    ]
  },
  {
    id: "support",
    icon: FaHeadset,
    label: {
      en: "Support & Assistance",
      hi: "सहायता एवं समर्थन"
    },
    submenu: [
      {
        id: "help-guidance",
        icon: FaHandsHelping,
        path: "/admin/help-guidance",
        label: {
          en: "Help & Guidance",
          hi: "सहायता एवं मार्गदर्शन"
        },
        allowedRoles: ["ADMIN", "NIC"],
        allowedEmployeeTypes: ["DIRECTORATE", "NIC"]
      },

      {
        id: "feedbacks",
        icon: FaCommentDots,
        path: "/admin/feedbacks",
        label: {
          en: "User Feedback",
          hi: "उपयोगकर्ता प्रतिक्रिया"
        },
        allowedRoles: ["ADMIN"],
        allowedEmployeeTypes: ["DIRECTORATE"]
      }
    ]
  },

  {
    id: "users-management",
    icon: FaUsers,
    path: "/admin/users-management",
    label: {
      en: "Users Management",
      hi: "उपयोगकर्ता प्रबंधन"
    },
    allowedRoles: ["ADMIN", "NIC"],
    allowedEmployeeTypes: ["DIRECTORATE", "DEPARTMENT", "NIC"]
  },
  // NIC
  {
    id: "system-logs",
    icon: FaHistory,
    path: "/admin/activity-logs",
    label: {
      en: "Activity Logs",
      hi: "गतिविधि लॉग"
    },
    allowedRoles: ["NIC"],
    allowedEmployeeTypes: ["NIC"]
  },
  {
    id: "session-management",
    icon: FaUserShield,
    path: "/admin/session-manager",
    label: {
      en: "User Sessions",
      hi: "उपयोगकर्ता सत्र"
    },
    allowedRoles: ["NIC"],
    allowedEmployeeTypes: ["NIC"]
  },
  {
    id: "database-backup",
    icon: FaDatabase,
    path: "/admin/database-backup-managments",
    label: {
      en: "Database Backup",
      hi: "डेटाबेस बैकअप"
    },
    allowedRoles: ["NIC"],
    allowedEmployeeTypes: ["NIC"]
  },

];
// ─────────────────────────────────────────────────────────
const isAllowed = (item, userRole, userEmployeeType) => {
  const roleOk =
    !item.allowedRoles?.length ||
    item.allowedRoles.includes(userRole);

  const typeOk =
    !item.allowedEmployeeTypes?.length ||
    item.allowedEmployeeTypes.includes(userEmployeeType);

  return roleOk && typeOk;
};

// ─────────────────────────────────────────────────────────
// Filter the menu tree for the current user.
// A parent with a submenu is kept only when at least one
// child survives filtering.
// ─────────────────────────────────────────────────────────
const filterMenu = (menu, userRole, userEmployeeType) =>
  menu.reduce((acc, item) => {
    if (!isAllowed(item, userRole, userEmployeeType)) return acc;

    if (item.submenu) {
      const visibleSubs = item.submenu.filter((sub) =>
        isAllowed(sub, userRole, userEmployeeType)
      );
      if (!visibleSubs.length) return acc; // hide parent if no children visible
      acc.push({ ...item, submenu: visibleSubs });
    } else {
      acc.push(item);
    }

    return acc;
  }, []);

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────
const AdminSidebar = ({ collapsed, mobileOpen = false, onCloseMobile }) => {
  const { isHindi } = useLanguage();
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(null);
  const [decoded] = useState(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error("JWT Decode Error:", error);
      return null;
    }
  });
  const [expiresIn, setExpiresIn] = useState("");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && mobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  // ── Session countdown ───────────────────────────────────
  useEffect(() => {
    if (!decoded?.exp) return;

    const interval = setInterval(() => {
      const remaining = decoded.exp * 1000 - Date.now();

      if (remaining <= 0) {
        clearInterval(interval);
        setExpiresIn("Expired");
        return;
      }

      const hours = Math.floor(remaining / 3_600_000);
      const minutes = Math.floor((remaining % 3_600_000) / 60_000);
      const seconds = Math.floor((remaining % 60_000) / 1_000);

      setExpiresIn(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [decoded]);

  // ── Logout ──────────────────────────────────────────────
  const logout = async () => {
    const result = await Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
      focusCancel: true
    });

    if (!result.isConfirmed) return;

    try {
      const token = sessionStorage.getItem("authToken");
      await axios.post(`${API_URL}/api/logout-user`, { token });
    } catch (error) {
      console.error("Logout API Error:", error?.response?.data || error.message);
    }

    sessionStorage.clear();

    await Swal.fire({
      icon: "success",
      title: "Logged Out",
      text: "You Have Been Successfully Logged Out",
      timer: 1500,
      showConfirmButton: false
    });

    navigate("/admin/login", { replace: true });
  };

  const handleNavClick = () => {
    if (onCloseMobile && window.innerWidth <= 991) onCloseMobile();
  };

  // ── Derive user role & type ─────────────────────────────
  // Prefer sessionStorage userData (set by AuthMiddleware),
  // fall back to decoded JWT fields.
  const storedUser = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  })();

  const userRole = (storedUser?.role || decoded?.role || "").toUpperCase();
  const userEmployeeType = (storedUser?.employeeType || decoded?.employeeType || "").toUpperCase();

  const userProfile = {
    name: storedUser?.name || decoded?.name || "Administrator",
    role: userRole || "ADMIN",
    employeeType: userEmployeeType || "DEPARTMENT",
    userDesignations:
      storedUser?.userDesignations ||
      storedUser?.userDeginations ||
      decoded?.userDesignations ||
      decoded?.userDeginations ||
      "",
    profileImage: storedUser?.profileImage || decoded?.profileImage || "",
    email: storedUser?.email || decoded?.email || "",
  };

  // ── Floating Tooltip State for Pro Hover Info ──────────
  const [hoveredTooltip, setHoveredTooltip] = useState({ visible: false, text: "", top: 0, left: 0 });

  const handleMouseEnter = (e, text) => {
    if (!text) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredTooltip({
      visible: true,
      text,
      top: rect.top + rect.height / 2,
      left: rect.right + 10
    });
  };

  const handleMouseLeave = () => {
    setHoveredTooltip((prev) => ({ ...prev, visible: false }));
  };

  // ── Build filtered menu ─────────────────────────────────
  const visibleMenu = filterMenu(adminMenu, userRole, userEmployeeType);

  // ── Render ──────────────────────────────────────────────
  const sidebarClasses = [
    "adm-sidebar",
    collapsed ? "is-collapsed" : "",
    mobileOpen ? "is-open" : ""
  ].join(" ").trim();

  return (
    <aside className={sidebarClasses}>
      {/* PROFILE SECTION */}
      <div className="adm-side-profile">
        <div className="adm-side-brand">
          <img
            src={`${import.meta.env.BASE_URL || "/"}Chhattisgarh.svg`}
            alt="Chhattisgarh Government"
            className="adm-side-brand-logo"
            onError={(e) => (e.target.src = "/Chhattisgarh.svg")}
          />
          <div className="adm-side-brand-text lh-sm">
            <div className="fw-bold text-white" style={{ fontSize: "0.55rem" }}>
              Department of Higher Education,
            </div>
            <div className="text-white-50" style={{ fontSize: "0.65rem", marginTop: "2px" }}>
              Government of Chhattisgarh.
            </div>
          </div>
        </div>

        <div className="adm-side-avatar-wrap">
          <img
            src={
              userProfile?.profileImage
                ? `${API_URL}${userProfile.profileImage}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.name || "Admin")}&background=0d9488&color=fff&bold=true`
            }
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.name || "Admin")}&background=0d9488&color=fff&bold=true`;
            }}
            alt="Profile"
            className="adm-side-avatar"
          />
          <div className="adm-side-name" title={userProfile?.name}>
            <span>{userProfile?.name || "Admin"}</span>
            {userProfile?.role && (
              <span className="adm-side-role-badge">{userProfile.role}</span>
            )}
          </div>
          {userProfile?.userDesignations && (
            <div className="adm-side-designation" title={userProfile.userDesignations}>
              {userProfile.userDesignations}
            </div>
          )}
          {expiresIn && (
            <div className="adm-side-session">
              <FaClock style={{ marginRight: 6 }} />
              Session Left : {expiresIn}
            </div>
          )}
        </div>
      </div>

      {/* MENU SECTION */}
      <div className="adm-side-nav">
        {visibleMenu.map((item) => {
          const Icon = item.icon;
          const label = isHindi ? item.label.hi : item.label.en;

          // ── Flat link (no submenu) ──────────────────────
          if (!item.submenu) {
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={handleNavClick}
                onMouseEnter={(e) => handleMouseEnter(e, label)}
                onMouseLeave={handleMouseLeave}
                className={({ isActive }) =>
                  `adm-side-item ${isActive ? "is-active" : ""}`
                }
              >
                <Icon />
                <span className="adm-side-item-label">{label}</span>
              </NavLink>
            );
          }

          // ── Collapsible parent ──────────────────────────
          const isOpen = openMenu === item.id;

          return (
            <div key={item.id}>
              <button
                type="button"
                className={`adm-side-item ${isOpen ? "is-active" : ""}`}
                onClick={() => setOpenMenu(isOpen ? null : item.id)}
                onMouseEnter={(e) => handleMouseEnter(e, label)}
                onMouseLeave={handleMouseLeave}
              >
                <Icon />
                <span className="adm-side-item-label">{label}</span>
                <FaChevronRight
                  className={`adm-side-caret ${isOpen ? "open" : ""}`}
                />
              </button>

              <Collapse isOpen={!collapsed && isOpen}>
                <div className="adm-side-submenu">
                  {item.submenu.map((sub) => {
                    const SubIcon = sub.icon;
                    const subLabel = isHindi ? sub.label.hi : sub.label.en;

                    return (
                      <NavLink
                        key={sub.id}
                        to={sub.path}
                        onClick={handleNavClick}
                        onMouseEnter={(e) => handleMouseEnter(e, subLabel)}
                        onMouseLeave={handleMouseLeave}
                        className={({ isActive }) =>
                          `adm-side-item ${isActive ? "is-active" : ""}`
                        }
                      >
                        <SubIcon />
                        <span className="adm-side-item-label">{subLabel}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </Collapse>
            </div>
          );
        })}
      </div>

      {/* PRO SOFTWARE FOOTER WITH INLINE USER CARD & LOGOUT */}
      <div className="adm-side-footer">
        <div className="adm-side-user-card" title={collapsed ? userProfile.name : ""}>
          <div className="adm-side-user-avatar-wrap">
            <img
              src={
                userProfile.profileImage
                  ? `${API_URL}${userProfile.profileImage}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name || "Admin")}&background=0d9488&color=fff&bold=true`
              }
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name || "Admin")}&background=0d9488&color=fff&bold=true`;
              }}
              alt={userProfile.name}
              className="adm-side-user-avatar"
            />
            <span className="adm-user-status-dot" title="Active" />
          </div>

          {!collapsed && (
            <div className="adm-side-user-meta">
              <div className="adm-side-user-name" title={userProfile.name}>
                {userProfile.name}
              </div>
              <div className="adm-side-user-sub">
                <span className="adm-side-user-role-badge">
                  {userProfile.userDesignations || userProfile.role}
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            className="adm-side-inline-logout"
            onClick={logout}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <FaSignOutAlt />
          </button>
        </div>

        {!collapsed && (
          <div className="adm-side-version-bar">
            <span className="adm-side-version-chip">
              <FaShieldAlt className="adm-version-icon" />
              <span>HEWebCMS</span>
              <span className="adm-version-num">v{HEWebCMSVersion || "0.1"}</span>
            </span>
          </div>
        )}
      </div>

      {/* PRO FLOATING HOVER TOOLTIP */}
      {hoveredTooltip.visible && (
        <div
          className="adm-floating-tooltip"
          style={{
            position: "fixed",
            top: `${hoveredTooltip.top}px`,
            left: `${hoveredTooltip.left}px`,
            transform: "translateY(-50%)"
          }}
        >
          {hoveredTooltip.text}
        </div>
      )}

    </aside>
  );
};

export default AdminSidebar;