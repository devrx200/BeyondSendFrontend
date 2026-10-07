import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Collapse } from "reactstrap";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import {
  FaChevronRight,
  FaClock,
  FaSignOutAlt,
  FaShieldAlt,
  FaBullhorn,
} from "react-icons/fa";

import { useLanguage } from "@/contexts/LanguageContext";
import apiClient, { BASE_HOST } from "@apiService";
import { ICONS } from "@/utilities/icons";
import {
  defaultSidebarMenus,
  mergeMenuOverrides,
  filterMenu,
  ICON_MAP,
} from "@/config/menu/authorizedMenu";

const PORTAL_VERSION = import.meta.env.VITE_PORTAL_VERSION;

const resolveIcon = (icon) => {
  if (typeof icon === "function") return icon;
  if (typeof icon === "string") {
    if (ICONS && ICONS[icon]) return ICONS[icon];
    if (ICON_MAP && ICON_MAP[icon]) return ICON_MAP[icon];
  }
  return FaBullhorn;
};

const isPathActive = (targetPath, pathname, search) => {
  if (!targetPath) return false;
  const [targetPathname, targetSearch = ""] = targetPath.split("?");

  if (targetSearch) {
    if (pathname !== targetPathname) return false;
    const targetParams = new URLSearchParams(targetSearch);
    const currentParams = new URLSearchParams(search);
    for (const [key, value] of targetParams.entries()) {
      if (currentParams.get(key) !== value) return false;
    }
    return true;
  }

  if (pathname === targetPathname) {
    const currentParams = new URLSearchParams(search);
    if (currentParams.has("channel")) return false;
    return true;
  }

  return false;
};

const avatarFallback = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Admin"
  )}&background=0d9488&color=fff&bold=true`;

const AuthorizedSidebar = ({ collapsed, mobileOpen = false, onCloseMobile }) => {
  const { isHindi } = useLanguage();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

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

  // Menu overrides from the database, keyed by the canonical item id.
  const [menuOverrides, setMenuOverrides] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadMenuOverrides = async () => {
      try {
        const res = await apiClient.get("/sidebar-menus/my");
        const list = res?.data?.data || res?.data || [];
        if (!isMounted || !Array.isArray(list) || list.length === 0) return;

        // The backend already filtered by role and active state, but we keep the
        // shape stable here so `mergeMenuOverrides` is the single place that
        // decides what the tree looks like.
        const normalized = list.map((item) => ({
          id: item.id || item._id,
          icon: item.icon,
          path: item.path,
          order: item.order,
          isActive: item.isActive !== false,
          requiredPerm: item.requiredPerm,
          allowedRoles: Array.isArray(item.allowedRoles) ? item.allowedRoles : undefined,
          label: {
            en: item.labelEn || item.label?.en || "",
            hi: item.labelHi || item.label?.hi || item.labelEn || "",
          },
          submenu: Array.isArray(item.submenu)
            ? item.submenu.map((sub) => ({
                id: sub.id || sub._id,
                icon: sub.icon,
                path: sub.path,
                order: sub.order,
                isActive: sub.isActive !== false,
                requiredPerm: sub.requiredPerm,
                allowedRoles: Array.isArray(sub.allowedRoles) ? sub.allowedRoles : undefined,
                labelEn: sub.labelEn,
                labelHi: sub.labelHi,
              }))
            : [],
        }));

        setMenuOverrides(normalized);
      } catch {
        // Network or permission failure must not blank the console; the
        // canonical tree is a complete, working navigation on its own.
      }
    };

    loadMenuOverrides();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && mobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  // ── Derive user role & permissions ──────────────────────
  // The role is only ever read from server-verified data (userData, written
  // by AuthMiddleware after /auth/verify-token) with the token claims as a
  // fallback. An unknown role resolves to "" so `isAllowed` denies by default
  // — never to a privileged role, which would expose the whole admin console.
  const storedUser = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  })();

  const userRole = String(storedUser?.role || decoded?.role || "")
    .trim()
    .toUpperCase();
  const userPerms = storedUser?.permissions || decoded?.permissions || [];

  // DB rows are overrides, never a replacement tree, so an empty or failing
  // response leaves the canonical navigation intact.
  const resolvedMenu = useMemo(
    () =>
      menuOverrides?.length
        ? mergeMenuOverrides(defaultSidebarMenus, menuOverrides)
        : defaultSidebarMenus,
    [menuOverrides]
  );

  const visibleMenu = filterMenu(resolvedMenu, userRole, userPerms);

  // ── Menu expand / active state ──────────────────────────
  const activeGroupId =
    visibleMenu.find((item) =>
      item.submenu?.some((sub) => isPathActive(sub.path, pathname, search))
    )?.id ?? null;

  // Manual expand/collapse is per-visit, so navigating away must clear it.
  // Storing the route key alongside the toggle and comparing during render
  // resets it without the extra render an effect would cause.
  const routeKey = `${pathname}?${search}`;
  const [menuState, setMenuState] = useState({ routeKey, toggledId: null });

  if (menuState.routeKey !== routeKey) {
    setMenuState({ routeKey, toggledId: null });
  }

  const manualToggledId = menuState.toggledId;

  const openMenu = manualToggledId !== null ? manualToggledId : activeGroupId;

  const toggleMenu = (id) => {
    setMenuState({ routeKey, toggledId: openMenu === id ? "" : id });
  };

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
      await apiClient.post("/auth/logout", { token });
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

  const userTooltip = `${userProfile.name}${
    userProfile.role ? ` (${userProfile.role})` : ""
  }${userProfile.userDesignations ? ` - ${userProfile.userDesignations}` : ""}`;

  // ── Floating tooltip state ───────────────────────────────
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
            className="adm-side-brand-logo bg-white rounded shadow"
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
          const Icon = resolveIcon(item.icon);
          const label = isHindi ? item.label.hi : item.label.en;

          // ── Flat link (no submenu) ──────────────────────
          if (!item.submenu || item.submenu.length === 0) {
            const isActive = isPathActive(item.path, pathname, search);
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={handleItemClick}
                onMouseEnter={(e) => handleMouseEnter(e, label)}
                onMouseLeave={handleMouseLeave}
                className={`adm-side-item ${isActive ? "is-active" : ""}`}
                aria-label={label}
              >
                <Icon />
                <span className="adm-side-item-label">{label}</span>
              </NavLink>
            );
          }

          // ── Collapsible parent ──────────────────────────
          const isOpen = openMenu === item.id;
          const hasActiveChild = item.submenu.some((sub) =>
            isPathActive(sub.path, pathname, search)
          );

          return (
            <div key={item.id}>
              <button
                type="button"
                className={`adm-side-item adm-side-parent ${
                  hasActiveChild ? "is-active" : ""
                } ${isOpen ? "is-expanded" : ""}`}
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
                    const SubIcon = resolveIcon(sub.icon);
                    const subLabel = isHindi ? sub.label.hi : sub.label.en;
                    const isSubActive = isPathActive(sub.path, pathname, search);

                    return (
                      <NavLink
                        key={sub.id}
                        to={sub.path}
                        onClick={handleItemClick}
                        onMouseEnter={(e) => handleMouseEnter(e, subLabel)}
                        onMouseLeave={handleMouseLeave}
                        className={`adm-side-item ${isSubActive ? "is-active" : ""}`}
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

export default AuthorizedSidebar;