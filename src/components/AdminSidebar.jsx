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
  FaSignOutAlt
} from "react-icons/fa";

import { useLanguage } from "../contexts/LanguageContext";
import { FaPager } from "react-icons/fa6";

const API_URL = import.meta.env.VITE_API_URL;

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
      en: "News & Notices",
      hi: "समाचार एवं सूचनाएं"
    },
    submenu: [
      {
        id: "new-updates",
        icon: FaBullhorn,
        path: "/admin/new-updates",
        label: {
          en: "Latest Updates Tiker",
          hi: "नवीन अपडेट स्लाइडर"
        }
      },
      {
        id: "announcements",
        icon: FaBullhorn,
        path: "/admin/announcements",
        label: {
          en: "Announcements",
          hi: "घोषणाएं"
        }
      },
      {
        id: "directorate-notices",
        icon: FaBullhorn,
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
        icon: FaBullhorn,
        path: "/admin/department-notices",
        label: {
          en: "Department Notices",
          hi: "विभागीय सूचनाएं"
        },
        allowedRoles: ["ADMIN", "OFFICER"],
        allowedEmployeeTypes: ["DEPARTMATE"]
      }
    ]
  },

  {
    id: "page-management",
    icon: FaPager,
    label: {
      en: "Page Management",
      hi: "पेज प्रबंधन"
    },
    submenu: [
      {
        id: "simple-page-creator",
        icon: FaFileAlt,
        path: "/admin/page-creator-management",
        label: {
          en: "Simple Page Creator",
          hi: "पेज निर्माण"
        },
        allowedRoles: ["ADMIN"],
        allowedEmployeeTypes: ["DIRECTORATE"]
      },
      {
        id: "important-page-management",
        icon: FaListAlt,
        path: "/admin/important-page-management",
        label: {
          en: "Important Pages",
          hi: "महत्वपूर्ण पृष्ठ"
        },
        allowedRoles: ["ADMIN"],
        allowedEmployeeTypes: ["DIRECTORATE"]
      }
    ]
  },

  {
    id: "content-management",
    icon: FaFolderOpen,
    label: {
      en: "Content Management",
      hi: "सामग्री प्रबंधन"
    },
    submenu: [
      {
        id: "content-uploader",
        icon: FaUpload,
        path: "/admin/content-uploader",
        label: {
          en: "Page Content",
          hi: "पेज सामग्री"
        },
        allowedRoles: ["ADMIN", "OFFICER"],
        allowedEmployeeTypes: ["DIRECTORATE", "DEPARTMATE"]
      },
      {
        id: "file-manager",
        icon: FaFolder,
        path: "/admin/file-manager",
        label: {
          en: "File Manager",
          hi: "फ़ाइल प्रबंधक"
        },
        allowedRoles: ["ADMIN", "OFFICER"],
        allowedEmployeeTypes: ["DIRECTORATE", "DEPARTMATE"]
      },
      {
        id: "file-uploader",
        icon: FaCloudUploadAlt,
        path: "/admin/file-uploader",
        label: {
          en: "File Uploader",
          hi: "फ़ाइल अपलोडर"
        },
        allowedRoles: ["ADMIN", "OFFICER"],
        allowedEmployeeTypes: ["DIRECTORATE", "DEPARTMATE"]
      },

    ]
  },

  {
    id: "media-and-download-management",
    icon: FaPhotoVideo,
    label: {
      en: "Media & Download Page",
      hi: "मीडिया एवं डाउनलोड प्रबंधन"
    },
    submenu: [
      {
        id: "gallery-page",
        icon: FaPhotoVideo,
        path: "/admin/gallery",
        label: {
          en: "Photo Gallery Page",
          hi: "फोटो गैलरी पेज"
        }
      },
      {
        id: "downloads-management",
        icon: FaDownload,
        path: "/admin/download-management",
        label: {
          en: "Downloads Page",
          hi: "डाउनलोड पेज"
        },
        allowedRoles: ["ADMIN", "OFFICER"],
        allowedEmployeeTypes: ["DIRECTORATE", "DEPARTMATE"]
      }
    ]
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
        }
      },
      {
        id: "universities",
        icon: FaUniversity,
        path: "/admin/universities",
        label: {
          en: "Universities",
          hi: "विश्वविद्यालय"
        },
        allowedRoles: ["ADMIN"],
        allowedEmployeeTypes: ["DIRECTORATE"]
      },
      {
        id: "college-management",
        icon: FaSchool,
        path: "/admin/college-management",
        label: {
          en: "College Management",
          hi: "महाविद्यालय प्रबंधन"
        }
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
        }
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
        allowedRoles: ["ADMIN"],
        allowedEmployeeTypes: ["DIRECTORATE"]
      },
      {
        id: "menu-management",
        icon: FaBars,
        path: "/admin/menu",
        label: {
          en: "Menu Management",
          hi: "मेनू प्रबंधन"
        },
        allowedRoles: ["ADMIN"],
        allowedEmployeeTypes: ["DIRECTORATE"]
      },
      {
        id: "slider",
        icon: FaImages,
        path: "/admin/slider",
        label: {
          en: "Home Slider",
          hi: "होम स्लाइडर"
        }
      },
      {
        id: "about-content",
        icon: FaImage,
        path: "/admin/image-master",
        label: {
          en: "About Section",
          hi: "परिचय अनुभाग"
        },
        allowedRoles: ["ADMIN"],
        allowedEmployeeTypes: ["DIRECTORATE"]
      },
      {
        id: "important-links",
        icon: FaLink,
        path: "/admin/important-links",
        label: {
          en: "Important Links",
          hi: "महत्वपूर्ण लिंक"
        },
        allowedRoles: ["ADMIN"],
        allowedEmployeeTypes: ["DIRECTORATE"]
      },
      {
        id: "brands",
        icon: FaTags,
        path: "/admin/brands",
        label: {
          en: "Footer Brands",
          hi: "फुटर ब्रांड्स"
        },
        allowedRoles: ["ADMIN"],
        allowedEmployeeTypes: ["DIRECTORATE"]
      },
      {
        id: "footer-management",
        icon: FaWindowMinimize,
        path: "/admin/footer-section-manager",
        label: {
          en: "Footer Management",
          hi: "फुटर प्रबंधन"
        },
        allowedRoles: ["ADMIN"],
        allowedEmployeeTypes: ["DIRECTORATE"]
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
      en: "Support",
      hi: "सहायता"
    },
    submenu: [
      {
        id: "help-guidance",
        icon: FaHandsHelping,
        path: "/admin/help-guidance",
        label: {
          en: "Help & Guidance",
          hi: "सहायता एवं मार्गदर्शन"
        }
      },
      {
        id: "feedbacks",
        icon: FaCommentDots,
        path: "/admin/feedbacks",
        label: {
          en: "Feedbacks",
          hi: "प्रतिक्रिया"
        }
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
    allowedEmployeeTypes: ["DIRECTORATE", "NIC"]
  },

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
  }
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
  const [decoded, setDecoded] = useState(null);
  const [expiresIn, setExpiresIn] = useState("");

  // ── Decode JWT ──────────────────────────────────────────
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) return;
    try {
      setDecoded(jwtDecode(token));
    } catch (error) {
      console.error("JWT Decode Error:", error);
      setDecoded(null);
    }
  }, []);

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
        <div className="adm-side-brand d-flex border border-1 border-rounded p-1">
          <img
            src="/hesite/public/Chhattisgarh.svg"
            alt="Chhattisgarh Government"
            className="adm-side-brand-logo"
          />
          <div className="adm-side-dept fw-bold text-white">
            Department of Higher Education,<br />
            Government of Chhattisgarh.
          </div>
        </div>

        <div className="adm-side-avatar-wrap">
          <img
            src={
              decoded?.profileImage
                ? `${API_URL}${decoded.profileImage}`
                : "https://ui-avatars.com/api/?name=Admin&background=0d9488&color=fff"
            }
            alt="Profile"
            className="adm-side-avatar"
          />
          {decoded && (
            <>
              <div className="adm-side-name">
                {decoded?.name || "AdminPanel"}
                {decoded?.role && (
                  <div className="adm-side-role-badge">{decoded.role}</div>
                )}
              </div>
              {decoded?.userDesignations && (
                <div className="adm-side-designation">
                  {decoded.userDesignations}
                </div>
              )}
              {expiresIn && (
                <div className="adm-side-session">
                  <FaClock style={{ marginRight: 6 }} />
                  Session Left : {expiresIn}
                </div>
              )}
            </>
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
                title={collapsed ? label : ""}
                onClick={handleNavClick}
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
                title={collapsed ? label : ""}
                className={`adm-side-item ${isOpen ? "is-active" : ""}`}
                onClick={() => setOpenMenu(isOpen ? null : item.id)}
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
                        title={collapsed ? subLabel : ""}
                        onClick={handleNavClick}
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

      {/* FOOTER */}
      <div className="adm-side-footer">
        <button type="button" className="adm-signout-btn" onClick={logout}>
          <FaSignOutAlt />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;