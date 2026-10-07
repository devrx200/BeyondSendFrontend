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
        const sum = keys.reduce((acc, k) => acc + (Number(balances[k]) || 0), 0);
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

    const result = await Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#0d6efd",
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      const token = sessionStorage.getItem("authToken");
      await apiClient.post('/auth/logout', { token });
    } catch (error) {
      console.log(error);
    }

    sessionStorage.clear();

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

  return (
    <>

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
                  setProfileModal(true);
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

      {/* ================= PROFILE MODAL ================= */}
      <Modal
        isOpen={profileModal}
        toggle={() => setProfileModal(false)}
        size="lg"
        centered
        className="adm-pro-profile-modal"
      >
        <ModalHeader
          toggle={() => setProfileModal(false)}
          className="adm-card-header border-0 text-white p-3"
        >
          <div className="d-flex align-items-center gap-2">
            <FaIdBadge size={18} />
            <span className="fw-bold fs-5">
              {isHindi ? "उपयोगकर्ता प्रोफ़ाइल विवरण" : "User Profile Details"}
            </span>
          </div>
        </ModalHeader>

        <ModalBody className="p-4 bg-light">
          {profile && (
            <div className="d-flex flex-column gap-3">
              {/* HERO PROFILE CARD */}
              <div className="card border shadow-sm rounded-4 overflow-hidden position-relative bg-white">
                <div className="bg-primary" style={{ height: "4px" }} />
                <div className="card-body p-4">
                  <div className="d-flex align-items-center flex-column flex-sm-row gap-4">
                    {/* AVATAR WITH ACTIVE GLOW */}
                    <div className="position-relative flex-shrink-0">
                      <img
                        src={
                          profile?.profileImage
                            ? `${BASE_HOST}${profile.profileImage}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "Admin")}&background=0d9488&color=fff&bold=true&size=160`
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "Admin")}&background=0d9488&color=fff&bold=true&size=160`;
                        }}
                        alt={profile?.name || "Profile"}
                        className="rounded-circle shadow-sm border border-3 border-white object-fit-cover"
                        width="96"
                        height="96"
                      />
                      <span
                        className={`position-absolute bottom-0 end-0 rounded-circle border border-2 border-white p-1.5 ${profile?.isActive ? "bg-success" : "bg-secondary"}`}
                        title={profile?.isActive ? "Active Now" : "Inactive"}
                      />
                    </div>

                    {/* NAME & META INFO */}
                    <div className="flex-grow-1 text-center text-sm-start">
                      <h4 className="fw-bold text-dark mb-1">
                        {profile?.name}
                      </h4>
                      <p className="text-secondary fw-semibold mb-2 d-flex align-items-center justify-content-center justify-content-sm-start gap-1.5 small">
                        <FaBriefcase size={13} className="text-primary" />
                        <span>{profile?.userDeginations || profile?.role || "Administrator"}</span>
                      </p>

                      <div className="d-flex align-items-center justify-content-center justify-content-sm-start flex-wrap gap-2">
                        {/* ROLE PILL */}
                        <span className="badge bg-primary rounded-pill px-3 py-1.5 fw-bold shadow-sm d-inline-flex align-items-center gap-1">
                          <FaShieldAlt size={11} />
                          <span>{profile?.role || "ADMIN"}</span>
                        </span>

                        {/* ACTIVE STATUS PILL */}
                        <span className={`badge ${profile?.isActive ? "bg-success-subtle text-success border border-success-subtle" : "bg-secondary-subtle text-secondary border border-secondary-subtle"} rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1 shadow-sm`}>
                          <span
                            className={`rounded-circle d-inline-block ${profile?.isActive ? "bg-success" : "bg-secondary"}`}
                            style={{ width: "7px", height: "7px" }}
                          />
                          <span>{profile?.isActive ? "Active" : "Inactive"}</span>
                        </span>

                        {/* APPROVAL STATUS */}
                        {profile?.status && (
                          <span className={`badge ${profile?.status === "APPROVED" ? "bg-success-subtle text-success border border-success-subtle" : profile?.status === "REJECTED" ? "bg-danger-subtle text-danger border border-danger-subtle" : "bg-warning-subtle text-warning border border-warning-subtle"} rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1 shadow-sm`}>
                            <FaCheckCircle size={10} />
                            <span>{profile?.status}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div className="row g-3">
                {/* CONTACT INFORMATION */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                        <div className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary p-2">
                          <FaEnvelope size={14} />
                        </div>
                        <h6 className="fw-bold text-dark mb-0 fs-6">
                          {isHindi ? "संपर्क विवरण" : "Contact Details"}
                        </h6>
                      </div>

                      <div className="d-flex flex-column gap-3">
                        {/* EMAIL */}
                        <div className="p-3 rounded-3 bg-light border">
                          <small className="text-muted d-block fw-bold text-uppercase small">
                            {isHindi ? "ईमेल आईडी" : "Email Address"}
                          </small>
                          <div className="fw-semibold text-dark text-truncate mt-1 d-flex align-items-center gap-2 small">
                            <FaEnvelope size={12} className="text-primary" />
                            <span>{profile?.email || "N/A"}</span>
                          </div>
                        </div>

                        {/* MOBILE */}
                        <div className="p-3 rounded-3 bg-light border">
                          <small className="text-muted d-block fw-bold text-uppercase small">
                            {isHindi ? "मोबाइल नंबर" : "Mobile Number"}
                          </small>
                          <div className="fw-semibold text-dark mt-1 d-flex align-items-center gap-2 small">
                            <FaPhoneAlt size={12} className="text-primary" />
                            <span>{profile?.mobile || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECURITY & PERMISSIONS */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                        <div className="rounded-3 d-flex align-items-center justify-content-center bg-info bg-opacity-10 text-info p-2">
                          <FaKey size={14} />
                        </div>
                        <h6 className="fw-bold text-dark mb-0 fs-6">
                          {isHindi ? "अनुमतियाँ एवं नियंत्रण" : "Permissions & Controls"}
                        </h6>
                      </div>

                      {/* PERMISSIONS */}
                      <div className="mb-4">
                        <small className="text-muted d-block fw-bold text-uppercase mb-2 small">
                          {isHindi ? "अनुमतियाँ (Permissions)" : "Assigned Permissions"}
                        </small>
                        <div className="d-flex flex-wrap gap-2">
                          {profile?.permissions?.length ? (
                            profile.permissions.map((item, index) => (
                              <span
                                key={index}
                                className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1 text-nowrap"
                              >
                                <span>🔒</span>
                                <span>{item}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-muted small fst-italic">
                              {isHindi ? "कोई अनुमति असाइन नहीं" : "No specific permissions assigned"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CONTROLS */}
                      <div>
                        <small className="text-muted d-block fw-bold text-uppercase mb-2 small">
                          <FaCogs className="me-1.5" />
                          {isHindi ? "सिस्टम नियंत्रण (Controls)" : "System Controls"}
                        </small>
                        <div className="d-flex flex-wrap gap-2">
                          {profile?.controls?.length ? (
                            profile.controls.map((item, index) => (
                              <span
                                key={index}
                                className="badge bg-dark text-white rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1 text-nowrap"
                              >
                                <span>⚙️</span>
                                <span>{item}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-muted small fst-italic">
                              {isHindi ? "कोई नियंत्रण नहीं" : "Standard access"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>

    </>
  );
};

export default AuthorizedHeader;