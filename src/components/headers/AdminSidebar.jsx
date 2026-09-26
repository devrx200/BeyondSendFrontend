import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Collapse } from "reactstrap";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";

import {
  FaTachometerAlt,
  FaChartPie,
  FaFileAlt,
  FaPaperPlane,
  FaExchangeAlt,
  FaChartLine,
  FaEnvelope,
  FaCommentAlt,
  FaComments,
  FaWhatsapp,
  FaPhoneAlt,
  FaList,
  FaUserSlash,
  FaKey,
  FaListUl,
  FaNetworkWired,
  FaNewspaper,
  FaBolt,
  FaListAlt,
  FaExclamationCircle,
  FaFolderOpen,
  FaDownload,
  FaLayerGroup,
  FaWindowMaximize,
  FaWindowMinimize,
  FaBars,
  FaImage,
  FaThLarge,
  FaTags,
  FaAddressBook,
  FaIdCard,
  FaHeadset,
  FaHandsHelping,
  FaBookOpen,
  FaCommentDots,
  FaUsers,
  FaHistory,
  FaUserShield,
  FaDatabase,
  FaChevronRight,
  FaClock,
  FaSignOutAlt,
  FaShieldAlt
} from "react-icons/fa";

import { FaPager } from "react-icons/fa6";

import { useLanguage } from "@/contexts/LanguageContext";
import apiClient, { BASE_HOST } from "@apiService";
const PORTAL_VERSION = import.meta.env.VITE_PORTAL_VERSION;


const adminMenu = [
  {
    id: "dashboard",
    icon: FaChartPie,
    path: "/authorized/dashboard",
    label: {
      en: "Dashboard",
      hi: "डैशबोर्ड"
    }
  },

  /* ── 1. Templates ────────────────────────────────────── */
  {
    id: "templates",
    icon: FaFileAlt,
    label: {
      en: "Templates",
      hi: "टेम्पलेट्स"
    },
    submenu: [
      {
        id: "tpl-email",
        icon: FaEnvelope,
        path: "/authorized/templates/email",
        label: { en: "Email", hi: "ईमेल" }
      },
      {
        id: "tpl-sms",
        icon: FaCommentAlt,
        path: "/authorized/templates/sms",
        label: { en: "SMS", hi: "एसएमएस" }
      },
      {
        id: "tpl-rcs",
        icon: FaComments,
        path: "/authorized/templates/rcs",
        label: { en: "RCS", hi: "आरसीएस" }
      },
      {
        id: "tpl-whatsapp",
        icon: FaWhatsapp,
        path: "/authorized/templates/whatsapp",
        label: { en: "Whatsapp", hi: "व्हाट्सएप" }
      },
      {
        id: "tpl-voice",
        icon: FaPhoneAlt,
        path: "/authorized/templates/voice",
        label: { en: "Voice", hi: "वॉइस" }
      }
    ]
  },

  /* ── 2. Bulk campaigns ───────────────────────────────── */
  {
    id: "bulk-campaigns",
    icon: FaPaperPlane,
    label: {
      en: "Bulk campaigns",
      hi: "बल्क अभियान"
    },
    submenu: [
      {
        id: "cmp-lists",
        icon: FaList,
        path: "/authorized/campaigns/lists",
        label: { en: "Lists", hi: "सूचियां" }
      },
      {
        id: "cmp-segments",
        icon: FaLayerGroup,
        path: "/authorized/campaigns/segments",
        label: { en: "Segments", hi: "सेगमेंट" }
      },
      {
        id: "cmp-campaigns",
        icon: FaPaperPlane,
        path: "/authorized/campaigns/all",
        label: { en: "Campaigns", hi: "अभियान" }
      },
      {
        id: "cmp-unsubscribers",
        icon: FaUserSlash,
        path: "/authorized/campaigns/unsubscribers",
        label: { en: "Unsubscribers", hi: "अनसब्सक्राइबर्स" }
      },
      {
        id: "cmp-bounces",
        icon: FaExclamationCircle,
        path: "/authorized/campaigns/bounces-spam",
        label: { en: "Bounces & SPAM", hi: "बाउंस एवं स्पैम" }
      }
    ]
  },

  /* ── 3. Config ───────────────────────────────────────── */
  {
    id: "config",
    icon: FaUsers,
    label: {
      en: "Config",
      hi: "कॉन्फ़िग"
    },
    submenu: [
      {
        id: "cfg-from-ids",
        icon: FaIdCard,
        path: "/authorized/config/from-ids",
        label: { en: "From Ids", hi: "सेंडर आईडी" }
      }
    ]
  },

  /* ── 4. Transactional API ────────────────────────────── */
  {
    id: "transactional-api",
    icon: FaExchangeAlt,
    label: {
      en: "Transactional API",
      hi: "ट्रांजैक्शनल एपीआई"
    },
    submenu: [
      {
        id: "trx-dashboard",
        icon: FaChartPie,
        path: "/authorized/transactional/dashboard",
        label: { en: "Dashboard", hi: "डैशबोर्ड" }
      },
      {
        id: "trx-api-key",
        icon: FaKey,
        path: "/authorized/transactional/api-key",
        label: { en: "Api Key", hi: "एपीआई कुंजी" }
      },
      {
        id: "trx-message-log",
        icon: FaListUl,
        path: "/authorized/transactional/message-log",
        label: { en: "Message Log", hi: "संदेश लॉग" }
      },
      {
        id: "trx-webhook-setup",
        icon: FaNetworkWired,
        path: "/authorized/transactional/webhook-setup",
        label: { en: "Webhook Setup", hi: "वेबहुक सेटअप" }
      },
      {
        id: "trx-webhook-logs",
        icon: FaHistory,
        path: "/authorized/transactional/webhook-logs",
        label: { en: "Webhook Logs", hi: "वेबहुक लॉग" }
      },
      {
        id: "trx-api-doc",
        icon: FaBookOpen,
        path: "/authorized/transactional/api-doc",
        label: { en: "Api Doc", hi: "एपीआई दस्तावेज़" }
      }
    ]
  },

  /* ── 5. User Responses ───────────────────────────────── */
  {
    id: "user-responses",
    icon: FaChartLine,
    label: {
      en: "User Responses",
      hi: "उपयोगकर्ता प्रतिक्रियाएं"
    },
    submenu: [
      {
        id: "resp-whatsapp",
        icon: FaWhatsapp,
        path: "/authorized/responses/whatsapp",
        label: { en: "Whatsapp", hi: "व्हाट्सएप" }
      },
      {
        id: "resp-rcs",
        icon: FaComments,
        path: "/authorized/responses/rcs",
        label: { en: "RCS", hi: "आरसीएस" }
      }
    ]
  },

  /* ── 6. Users Management ─────────────────────────────── */
  {
    id: "users-management",
    icon: FaUsers,
    path: "/authorized/users-management",
    label: {
      en: "Users Management",
      hi: "उपयोगकर्ता प्रबंधन"
    },
    allowedRoles: ["DEVOPS", "ADMIN", "RESELLER", "CLIENT"]
  },

  /* ── 7. System & Security ────────────────────────────── */
  {
    id: "system-security",
    icon: FaUserShield,
    label: {
      en: "System & Security",
      hi: "सिस्टम एवं सुरक्षा"
    },
    submenu: [
      {
        id: "system-logs",
        icon: FaHistory,
        path: "/authorized/activity-logs",
        label: {
          en: "Activity Logs",
          hi: "गतिविधि लॉग"
        },
        allowedRoles: ["DEVOPS", "ADMIN"]
      },
      {
        id: "session-management",
        icon: FaUserShield,
        path: "/authorized/session-manager",
        label: {
          en: "User Sessions",
          hi: "उपयोगकर्ता सत्र"
        },
        allowedRoles: ["DEVOPS", "ADMIN"]
      },
      {
        id: "database-backup",
        icon: FaDatabase,
        path: "/authorized/database-backup",
        label: {
          en: "Database Backup",
          hi: "डेटाबेस बैकअप"
        },
        allowedRoles: ["DEVOPS", "ADMIN"]
      }
    ]
  },

  /* ── 8. Website & Portal Setup (Admin & DevOps) ──────── */
  {
    id: "content-management",
    icon: FaNewspaper,
    label: {
      en: "Website Setup",
      hi: "वेबसाइट सेटअप"
    },
    allowedRoles: ["DEVOPS", "ADMIN"],
    submenu: [
      {
        id: "new-updates",
        icon: FaBolt,
        path: "/authorized/new-updates",
        label: { en: "Latest Updates", hi: "नवीन अपडेट" }
      },
      {
        id: "quick-access",
        icon: FaBolt,
        path: "/authorized/quick-access",
        label: { en: "Quick Access", hi: "त्वरित पहुंच" },
        color: "#4f6ef7"
      },
      {
        id: "categories",
        icon: FaListAlt,
        path: "/authorized/categories",
        label: { en: "Categories", hi: "श्रेणियाँ" }
      },
      {
        id: "rich-content-pages",
        icon: FaPager,
        path: "/authorized/rich-content-pages",
        label: { en: "Rich Content Pages", hi: "सामग्री पृष्ठ" }
      },
      {
        id: "important-page-management",
        icon: FaExclamationCircle,
        path: "/authorized/important-page-management",
        label: { en: "Important Pages", hi: "महत्वपूर्ण पृष्ठ" }
      },
      {
        id: "media-library",
        icon: FaFolderOpen,
        path: "/authorized/media-library",
        label: { en: "Media Library", hi: "मीडिया लाइब्रेरी" }
      },
      {
        id: "download-management",
        icon: FaDownload,
        path: "/authorized/download-management",
        label: { en: "Downloads", hi: "डाउनलोड" }
      },
      {
        id: "menu-management",
        icon: FaBars,
        path: "/authorized/menu",
        label: { en: "Menu Management", hi: "मेनू प्रबंधन" }
      },
      {
        id: "header-management",
        icon: FaWindowMaximize,
        path: "/authorized/header-management",
        label: { en: "Header Management", hi: "हेडर प्रबंधन" }
      },
      {
        id: "footer-management",
        icon: FaWindowMinimize,
        path: "/authorized/footer-section-manager",
        label: { en: "Footer Management", hi: "फुटर प्रबंधन" }
      },
      {
        id: "feedbacks",
        icon: FaCommentDots,
        path: "/authorized/feedbacks",
        label: { en: "Feedback Inbox", hi: "प्रतिक्रिया इनबॉक्स" }
      }
    ]
  }
];

// ─────────────────────────────────────────────────────────
// Role guard
// ─────────────────────────────────────────────────────────
const isAllowed = (item, userRole) => {
  const isDevOps = userRole === "DEVOPS";
  if (isDevOps) return true;

  return !item.allowedRoles?.length || item.allowedRoles.includes(userRole);
};

// ─────────────────────────────────────────────────────────
// Filter the menu tree for the current user.
// A parent with a submenu is kept only when at least one
// child survives filtering.
// ─────────────────────────────────────────────────────────
const filterMenu = (menu, userRole) =>
  menu.reduce((acc, item) => {
    if (!isAllowed(item, userRole)) return acc;

    if (item.submenu) {
      const visibleSubs = item.submenu.filter((sub) =>
        isAllowed(sub, userRole)
      );
      if (!visibleSubs.length) return acc; // hide parent if no children visible
      acc.push({ ...item, submenu: visibleSubs });
    } else {
      acc.push(item);
    }

    return acc;
  }, []);

const avatarFallback = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Admin"
  )}&background=0d9488&color=fff&bold=true`;

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────
const AdminSidebar = ({ collapsed, mobileOpen = false, onCloseMobile }) => {
  const { isHindi } = useLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();

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

  // ── Menu expand state ───────────────────────────────────
  // The group that owns the active route opens automatically
  // (derived, no effect) and a manual toggle overrides it for
  // as long as the user stays on that same route.
  const [menuOverride, setMenuOverride] = useState({ path: null, id: undefined });

  const activeGroupId =
    adminMenu.find((item) =>
      item.submenu?.some((sub) => sub.path === pathname)
    )?.id ?? null;

  const openMenu =
    menuOverride.path === pathname ? menuOverride.id : activeGroupId;

  const toggleMenu = (id) =>
    setMenuOverride({ path: pathname, id: openMenu === id ? null : id });

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
      await apiClient.post('/auth/logout', { token });
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

    navigate("/auth/login", { replace: true });
  };

  const handleNavClick = () => {
    if (onCloseMobile && window.innerWidth <= 991) onCloseMobile();
  };

  // ── Derive user role ───────────────────────────────────
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

  const userProfile = {
    name: storedUser?.name || decoded?.name || "Administrator",
    role: userRole || "ADMIN",
    userDesignations:
      storedUser?.userDesignations ||
      storedUser?.userDeginations ||
      decoded?.userDesignations ||
      decoded?.userDeginations ||
      "",
    profileImage: storedUser?.profileImage || decoded?.profileImage || "",
    email: storedUser?.email || decoded?.email || ""
  };

  const userTooltip = `${userProfile.name}${userProfile.role ? ` (${userProfile.role})` : ""
    }${userProfile.userDesignations ? ` - ${userProfile.userDesignations}` : ""}`;

  // ── Floating tooltip state (collapsed / hover info) ─────
  const [hoveredTooltip, setHoveredTooltip] = useState({
    visible: false,
    text: "",
    top: 0,
    left: 0
  });

  const handleMouseEnter = (e, text) => {
    if (!text) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipY = Math.max(16, Math.min(window.innerHeight - 24, rect.top + rect.height / 2));
    setHoveredTooltip({
      visible: true,
      text,
      top: tooltipY,
      left: rect.right + 10
    });
  };

  const handleMouseLeave = () => {
    setHoveredTooltip((prev) => ({ ...prev, visible: false }));
  };

  const handleItemClick = () => {
    handleMouseLeave();
    handleNavClick();
  };

  const visibleMenu = filterMenu(adminMenu, userRole);

  const sidebarClasses = [
    "adm-sidebar",
    collapsed ? "is-collapsed" : "",
    mobileOpen ? "is-open" : ""
  ]
    .join(" ")
    .trim();

  return (
    <aside className={sidebarClasses} onMouseLeave={handleMouseLeave}>
      <div className="adm-side-profile">
        <div
          className="adm-side-brand"
          onMouseEnter={(e) => handleMouseEnter(e, isHindi ? "बियॉन्डसेंड डेस्क" : "BeyondSend Desk")}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={`${import.meta.env.BASE_URL || "/"}beyondsend-logo.svg`}
            alt="BeyondSend"
            className="adm-side-brand-logo bg-white rounded shadow "
            onError={(e) => {
              e.target.src = "/beyondsend-logo.svg";
            }}
          />
          <div className="adm-side-brand-text">
            <span className="adm-side-brand-title">BeyondSend Desk</span>
            <span className="adm-side-brand-sub">
              {isHindi ? "" : "Omnichannel Solutions"}
            </span>
          </div>
        </div>

        {expiresIn && (
          <div
            className="adm-side-session"
            onMouseEnter={(e) =>
              handleMouseEnter(e, `${isHindi ? "सत्र शेष" : "Session Left"} : ${expiresIn}`)
            }
            onMouseLeave={handleMouseLeave}
          >
            <FaClock />
            {!collapsed ? (
              <span>Session Left : {expiresIn}</span>
            ) : (
              <span className="adm-side-session-time-compact">{expiresIn}</span>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation menu ─────────────────────────────── */}
      <nav
        className="adm-side-nav"
        aria-label="Admin navigation"
        onScroll={handleMouseLeave}
      >
        {visibleMenu.map((item) => {
          const Icon = item.icon;
          const label = isHindi ? item.label.hi : item.label.en;

          // ── Flat link (no submenu) ──────────────────────
          if (!item.submenu) {
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={handleItemClick}
                onMouseEnter={(e) => handleMouseEnter(e, label)}
                onMouseLeave={handleMouseLeave}
                className={({ isActive }) =>
                  `adm-side-item ${isActive ? "is-active" : ""}`
                }
                aria-label={label}
              >
                <Icon />
                <span className="adm-side-item-label">{label}</span>
              </NavLink>
            );
          }

          // ── Collapsible parent ──────────────────────────
          const isOpen = openMenu === item.id;
          const hasActiveChild = item.submenu.some(
            (sub) => sub.path === pathname
          );

          return (
            <div key={item.id}>
              <button
                type="button"
                className={`adm-side-item ${isOpen || hasActiveChild ? "is-active" : ""
                  }`}
                onClick={() => {
                  toggleMenu(item.id);
                  handleMouseLeave();
                }}
                onMouseEnter={(e) => handleMouseEnter(e, label)}
                onMouseLeave={handleMouseLeave}
                aria-expanded={isOpen}
                aria-label={label}
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
                        onClick={handleItemClick}
                        onMouseEnter={(e) => handleMouseEnter(e, subLabel)}
                        onMouseLeave={handleMouseLeave}
                        className={({ isActive }) =>
                          `adm-side-item ${isActive ? "is-active" : ""}`
                        }
                        aria-label={subLabel}
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
      </nav>

      {/* ── Footer: signed-in user card + build info ────── */}
      <div className="adm-side-footer">
        <div className="adm-side-user-card">
          <div
            className="adm-side-user-avatar-wrap"
            onMouseEnter={(e) => handleMouseEnter(e, userTooltip)}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={
                userProfile.profileImage
                  ? `${BASE_HOST}${userProfile.profileImage}`
                  : avatarFallback(userProfile.name)
              }
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = avatarFallback(userProfile.name);
              }}
              alt={userProfile.name}
              className="adm-side-user-avatar"
            />
            <span className="adm-user-status-dot" />
          </div>

          {!collapsed && (
            <div className="adm-side-user-meta">
              <div className="adm-side-user-name">
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
            onMouseEnter={(e) => handleMouseEnter(e, isHindi ? "लॉगआउट करें" : "Sign Out")}
            onMouseLeave={handleMouseLeave}
            aria-label="Sign Out"
          >
            <FaSignOutAlt />
          </button>
        </div>

        {!collapsed && (
          <div
            className="adm-side-version-bar"
            onMouseEnter={(e) =>
              handleMouseEnter(e, `BeyondSend Platform v${PORTAL_VERSION || "1.0"}`)
            }
            onMouseLeave={handleMouseLeave}
          >
            <span className="adm-side-version-chip">
              <FaShieldAlt className="adm-version-icon" />
              <span>BeyondSend</span>
              <span className="adm-version-num">v{PORTAL_VERSION || "1.0"}</span>
            </span>
          </div>
        )}
      </div>

      {/* ── Floating hover tooltip mounted via portal to body ── */}
      {hoveredTooltip.visible &&
        createPortal(
          <div
            className="adm-floating-tooltip"
            style={{
              top: `${hoveredTooltip.top}px`,
              left: `${hoveredTooltip.left}px`
            }}
          >
            {hoveredTooltip.text}
          </div>,
          document.body
        )}
    </aside>
  );
};

export default AdminSidebar;


