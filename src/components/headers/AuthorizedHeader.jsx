import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

import {
  FaBars,
  FaSignOutAlt,
  FaClock,
  FaLanguage,
  FaBookOpen,
  FaChevronDown,
  FaUserCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaKey,
  FaCogs,
  FaBriefcase,
  FaIdBadge,
  FaWallet
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { jwtDecode } from "jwt-decode";
import apiClient, { BASE_HOST } from "@apiService";

const AuthorizedHeader = ({ toggleSidebar }) => {

  const navigate = useNavigate();
  const { toggleLanguage, isHindi } = useLanguage();

  const [dateTime, setDateTime] = useState(new Date());
  const [profile, setProfile] = useState(null);
  const [profileModal, setProfileModal] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [walletTotal, setWalletTotal] = useState(null);

  /* ================= LIVE CLOCK ================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ================= LIVE WALLET BALANCE ================= */

  const fetchWalletSummary = async () => {
    try {
      const res = await apiClient.get("/credits/summary");
      const data = res?.data?.data || res?.data || res || {};
      const balances = data?.myWallet || data?.balances || data;
      if (balances && typeof balances === "object") {
        const keys = [
          "emailCredits",
          "smsCredits",
          "voiceCredits",
          "whatsappCredits",
          "whatsappPromoCredits",
          "rcsCredits",
          "pushCredits"
        ];
        let sum = 0;
        keys.forEach((k) => {
          const val = balances[k];
          if (typeof val === "number") {
            sum += val;
          } else if (val && typeof val === "object") {
            Object.values(val).forEach((subVal) => {
              if (typeof subVal === "number") sum += subVal;
            });
          }
        });
        if (sum === 0) {
          Object.keys(balances).forEach((k) => {
            if (typeof balances[k] === "number" && k.endsWith("_credits")) {
              sum += balances[k];
            }
          });
        }
        setWalletTotal(sum);
      }
    } catch {
      // Keep existing balance if request fails
    }
  };

  useEffect(() => {
    fetchWalletSummary();

    const onWalletUpdate = () => fetchWalletSummary();
    window.addEventListener("wallet-updated", onWalletUpdate);
    return () => window.removeEventListener("wallet-updated", onWalletUpdate);
  }, []);

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {

    const token = sessionStorage.getItem("authToken");

    if (!token) return;

    let decoded;

    try {
      decoded = jwtDecode(token);
    } catch {
      return;
    }

    const userId =
      decoded.id ||
      decoded._id ||
      decoded.userId;

    const storedUser = sessionStorage.getItem('userData') || localStorage.getItem('userData');
    if (storedUser) {
      try {
        setProfile(JSON.parse(storedUser));
      } catch {}
    }

    const fetchProfile = async () => {
      try {
        const res = await apiClient.post('/auth/verify-token', { token });
        const user = res?.user || res?.data?.user;
        if (user) {
          setProfile(user);
          sessionStorage.setItem('userData', JSON.stringify(user));
        }
      } catch {}
    };
    fetchProfile();
  }, []);

  /* ================= LOGOUT ================= */

  const logout = async () => {
    const isImpersonating = !!(
      sessionStorage.getItem("impersonatorAdminToken") ||
      localStorage.getItem("impersonatorAdminToken")
    );

    let confirmTitle = "Confirm Logout";
    let confirmText = "Are you sure you want to logout?";

    if (isImpersonating) {
      confirmTitle = "Exit or Logout?";
      confirmText = "You are currently in Impersonation Mode. Exit to Admin session or log out completely?";
    }

    const result = await Swal.fire({
      title: confirmTitle,
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      showDenyButton: isImpersonating,
      confirmButtonText: isImpersonating ? "Log Out Completely" : "Yes Logout",
      denyButtonText: "Exit to Admin Session",
      cancelButtonText: "Cancel",
      confirmButtonColor: "var(--pub-danger)",
      denyButtonColor: "#3c0082",
      cancelButtonColor: "var(--pub-accent)",
      reverseButtons: false,
    });

    if (result.isDenied && isImpersonating) {
      exitImpersonation();
      return;
    }

    if (!result.isConfirmed) return;

    try {
      const token = sessionStorage.getItem("authToken");
      if (token) {
        await apiClient.post('/auth/logout', { token });
      }
    } catch (error) {
      console.log(error);
    }

    sessionStorage.clear();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    localStorage.removeItem("impersonatorAdminToken");
    localStorage.removeItem("impersonatorAdminUser");
    localStorage.removeItem("impersonatorAdminRole");

    await Swal.fire({
      icon: "success",
      title: "Logged Out",
      text: "You Have Been Successfully Logged Out",
      timer: 1500,
      showConfirmButton: false
    });

    navigate("/auth/login", {
      replace: true
    });

  };

  /* ================= DATE TIME ================= */

  const formattedDate = dateTime.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata"
  });

  const formattedTime = dateTime.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  const dayName = dateTime.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long"
  });

  const impersonatorToken =
    sessionStorage.getItem("impersonatorAdminToken") ||
    localStorage.getItem("impersonatorAdminToken");

  const exitImpersonation = async () => {
    const currentImpersonateToken = sessionStorage.getItem("authToken");
    const origToken =
      sessionStorage.getItem("impersonatorAdminToken") ||
      localStorage.getItem("impersonatorAdminToken");
    const origUser =
      sessionStorage.getItem("impersonatorAdminUser") ||
      localStorage.getItem("impersonatorAdminUser");
    const origRole =
      sessionStorage.getItem("impersonatorAdminRole") ||
      localStorage.getItem("impersonatorAdminRole");

    // Cleanly terminate shadow session on backend without touching user's password sessions
    if (currentImpersonateToken) {
      try {
        await apiClient.post("/auth/logout", { token: currentImpersonateToken });
      } catch (e) {
        console.warn("Logout impersonation token warning:", e);
      }
    }

    if (origToken) {
      sessionStorage.setItem("authToken", origToken);
      localStorage.setItem("authToken", origToken);
    }
    if (origRole) {
      sessionStorage.setItem("userRole", origRole);
      localStorage.setItem("userRole", origRole);
    }
    if (origUser) {
      sessionStorage.setItem("userData", origUser);
      localStorage.setItem("userData", origUser);
    }

    sessionStorage.removeItem("impersonatorAdminToken");
    sessionStorage.removeItem("impersonatorAdminUser");
    sessionStorage.removeItem("impersonatorAdminRole");
    localStorage.removeItem("impersonatorAdminToken");
    localStorage.removeItem("impersonatorAdminUser");
    localStorage.removeItem("impersonatorAdminRole");

    // If opened as a secondary new tab with window.opener, allow closing tab
    if (window.opener && window.history.length <= 2) {
      const closeRes = await Swal.fire({
        icon: "info",
        title: "Session Terminated",
        text: "Impersonation ended safely. Close this tab and return to your Admin window?",
        showCancelButton: true,
        confirmButtonText: "Close This Tab",
        cancelButtonText: "Keep & Return to Admin Here",
      });
      if (closeRes.isConfirmed) {
        window.close();
        return;
      }
    }

    Swal.fire({
      icon: "info",
      title: "Exited Impersonation",
      text: "Returning to administrator session...",
      timer: 1000,
      showConfirmButton: false,
    });
    setTimeout(() => {
      window.location.href = "/authorized/users-management";
    }, 1000);
  };

  return (
    <>
      {/* ── PERSISTENT IMPERSONATION BANNER ── */}
      {impersonatorToken && (
        <div
          className="bg-warning text-dark py-1.5 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2 shadow-sm border-bottom border-dark border-opacity-25"
          style={{ position: "sticky", top: 0, zIndex: 1050 }}
        >
          <div className="d-flex align-items-center gap-2 small">
            <span className="badge bg-dark text-white px-2 py-1">🕶️ Impersonation Mode</span>
            <span>
              You are currently managing: <strong>{profile?.name || profile?.fullName || "Account"}</strong> ({profile?.role})
            </span>
            <span className="text-muted d-none d-md-inline">• Administrator session is securely preserved</span>
          </div>
          <button
            className="btn btn-sm btn-dark text-white fw-bold py-1 px-3 shadow-sm d-flex align-items-center gap-1"
            onClick={exitImpersonation}
          >
            <span>Exit Impersonation &amp; Return to Admin</span>
          </button>
        </div>
      )}

      {/* ================= HEADER ================= */}

      <header className="adm-header">

        {/* LEFT */}

        <div className="adm-header-left">

          <button
            type="button"
            className="adm-toggle-btn"
            onClick={toggleSidebar}
            title={isHindi ? "साइडबार टॉगल करें" : "Toggle Sidebar Navigation"}
            aria-label="Toggle Sidebar Navigation"
          >
            <FaBars />
          </button>

          <div className="adm-header-title d-none d-md-block">
            BeyondSend
          </div>

        </div>

        {/* RIGHT */}

        <div className="adm-header-right">

          {/* CLOCK */}

          <div className="adm-header-clock d-none d-lg-flex" title={isHindi ? "वर्तमान समय (IST)" : "Current Time (IST)"}>

            <FaClock className="me-2" />

            <span>
              {dayName}, {formattedDate} | {formattedTime}
            </span>

          </div>

          {/* LANGUAGE */}

          <button
            type="button"
            className="adm-header-chip is-primary"
            onClick={toggleLanguage}
            title={isHindi ? "Switch to English" : "हिंदी भाषा में बदलें"}
            aria-label="Change Language"
          >
            <FaLanguage />
            <span className="ms-2">
              {isHindi ? "English" : "हिंदी"}
            </span>
          </button>

          {/* HELP */}

          <button
            type="button"
            className="adm-header-chip"
            onClick={() => navigate("/admin/tutorials")}
            title={isHindi ? "सहायता और ट्यूटोरियल" : "Help Documentation & Tutorials"}
            aria-label="Help Documentation & Tutorials"
          >
            <FaBookOpen />
            <span className="ms-2">{isHindi ? "सहायता" : "Help"}</span>
          </button>

          {/* WALLET (SMART ROUTE FOR ADMIN VS CLIENT) */}
          <button
            type="button"
            className="adm-header-chip is-wallet d-inline-flex align-items-center gap-1.5"
            onClick={() => {
              const isAdmin = ["ADMIN", "DEVOPS"].includes((profile?.role || "").toUpperCase());
              navigate(isAdmin ? "/authorized/account/credits-topup-management" : "/authorized/account/my-wallet");
            }}
            title={
              ["ADMIN", "DEVOPS"].includes((profile?.role || "").toUpperCase())
                ? (isHindi ? "कुल क्रेडिट और टॉपअप प्रबंधन" : "Total Credits & Topup Management")
                : (isHindi ? "कुल वॉलेट क्रेडिट" : "Total Wallet Credits")
            }
            aria-label="Credit Wallet"
          >
            <FaWallet />
            <span className="fw-bold">
              {walletTotal !== null ? Number(walletTotal).toLocaleString() : "0"}
            </span>
          </button>

          {/* PROFILE DROPDOWN */}

          <Dropdown
            isOpen={profileDropdown}
            toggle={() => setProfileDropdown(!profileDropdown)}
            className="adm-profile-dropdown"
          >
            <DropdownToggle
              tag="button"
              type="button"
              className="adm-profile-toggle-btn border-0 bg-transparent p-0 shadow-none outline-none"
              title={isHindi ? "उपयोगकर्ता सेटिंग्स" : "User Profile & Settings"}
              aria-label="User Profile & Settings"
            >
              <div className="adm-profile-pill">
                <img
                  src={
                    profile?.profileImage
                      ? `${BASE_HOST}${profile.profileImage}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "Admin")}&background=0d9488&color=fff&bold=true`
                  }
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "Admin")}&background=0d9488&color=fff&bold=true`;
                  }}
                  alt={profile?.name || "Profile"}
                  className="adm-profile-pill-avatar"
                />
                <div className="adm-profile-pill-info">
                  <div className="adm-profile-pill-name">
                    {profile?.name || "Administrator"}
                  </div>
                  <div className="adm-profile-pill-subtitle">
                    {profile?.userDeginations || profile?.role || "Administrator"}
                  </div>
                </div>
                <FaChevronDown
                  className={`adm-profile-pill-chevron ${profileDropdown ? "rotate-180" : ""}`}
                />
              </div>
            </DropdownToggle>

            <DropdownMenu
              end
              className="adm-profile-menu-simple border-0 shadow-lg mt-2"
            >
              <div className="adm-profile-menu-header">
                <div className="adm-profile-menu-user-name">
                  {profile?.name || "Administrator"}
                </div>
                <div className="adm-profile-menu-user-role">
                  {profile?.userDeginations || profile?.role || "Admin"}
                </div>
              </div>

              <DropdownItem
                className="adm-profile-item is-primary"
                onClick={() => {
                  navigate("/authorized/account/profile-settings");
                  setProfileDropdown(false);
                }}
              >
                <FaUserCircle className="adm-item-icon" />
                <span>{isHindi ? "मेरी प्रोफ़ाइल" : "My Profile"}</span>
              </DropdownItem>

              {/* CREDITS / WALLET (SMART ROUTE FOR ADMIN VS CLIENT) */}
              <DropdownItem
                className="adm-profile-item is-wallet"
                onClick={() => {
                  const isAdmin = ["ADMIN", "DEVOPS"].includes((profile?.role || "").toUpperCase());
                  navigate(isAdmin ? "/authorized/account/credits-topup-management" : "/authorized/account/my-wallet");
                  setProfileDropdown(false);
                }}
              >
                <FaWallet className="adm-item-icon" />
                <span>
                  {["ADMIN", "DEVOPS"].includes((profile?.role || "").toUpperCase())
                    ? (isHindi ? "क्रेडिट और टॉपअप प्रबंधन" : "Credit & Topup Management")
                    : (isHindi ? "मेरा क्रेडिट वॉलेट" : "My Credit Wallet")}
                </span>
              </DropdownItem>

              <DropdownItem divider />

              {/* LOGOUT */}
              <DropdownItem
                className="adm-profile-item is-danger"
                onClick={logout}
              >
                <FaSignOutAlt className="adm-item-icon" />
                <span>Logout</span>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

        </div>

      </header>

    </>
  );
};

export default AuthorizedHeader;