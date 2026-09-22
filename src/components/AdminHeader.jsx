import { useEffect, useState } from "react";
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
  FaIdBadge
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import Swal from "sweetalert2";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL;

const AdminHeader = ({ toggleSidebar }) => {

  const navigate = useNavigate();
  const { toggleLanguage, isHindi } = useLanguage();

  const [dateTime, setDateTime] = useState(new Date());
  const [profile, setProfile] = useState(null);
  const [profileModal, setProfileModal] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  /* ================= LIVE CLOCK ================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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

    if (!userId) return;

    axios
      .get(`${API_URL}/api/get-user-profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        if (res.data?.success) {
          setProfile(res.data.data);
        }
      })
      .catch(() => { });

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

      await axios.post(`${API_URL}/api/logout-user`, {
        token
      });

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
                      ? `${API_URL}${profile.profileImage}`
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

              {/* MY PROFILE */}
              <DropdownItem
                className="adm-profile-item is-primary"
                onClick={() => {
                  setProfileModal(true);
                  setProfileDropdown(false);
                }}
              >
                <FaUserCircle className="adm-item-icon" />
                <span>My Profile</span>
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
          className="border-0 text-white"
          style={{
            background: "linear-gradient(135deg, #0d9488 0%, #065f46 100%)",
            padding: "16px 24px"
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <FaIdBadge size={18} />
            <span className="fw-bold" style={{ fontSize: "1.1rem", letterSpacing: "0.3px" }}>
              {isHindi ? "उपयोगकर्ता प्रोफ़ाइल विवरण" : "User Profile Details"}
            </span>
          </div>
        </ModalHeader>

        <ModalBody className="p-4" style={{ background: "#f8fafc" }}>
          {profile && (
            <div className="d-flex flex-column gap-3">
              {/* HERO PROFILE CARD */}
              <div
                className="card border-0 shadow-sm rounded-4 overflow-hidden position-relative"
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                  border: "1px solid rgba(13, 148, 136, 0.2) !important"
                }}
              >
                <div
                  style={{
                    height: "6px",
                    background: "linear-gradient(90deg, #0d9488, #10b981, #059669)"
                  }}
                />
                <div className="card-body p-4">
                  <div className="d-flex align-items-center flex-column flex-sm-row gap-4">
                    {/* AVATAR WITH ACTIVE GLOW */}
                    <div className="position-relative flex-shrink-0">
                      <img
                        src={
                          profile?.profileImage
                            ? `${API_URL}${profile.profileImage}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "Admin")}&background=0d9488&color=fff&bold=true&size=160`
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "Admin")}&background=0d9488&color=fff&bold=true&size=160`;
                        }}
                        alt={profile?.name || "Profile"}
                        className="rounded-circle shadow-sm"
                        style={{
                          width: "105px",
                          height: "105px",
                          objectFit: "cover",
                          border: "3.5px solid #ffffff",
                          boxShadow: "0 8px 20px rgba(13, 148, 136, 0.25)"
                        }}
                      />
                      <span
                        className="position-absolute bottom-0 end-0 rounded-circle border border-white"
                        style={{
                          width: "18px",
                          height: "18px",
                          background: profile?.isActive ? "#10b981" : "#94a3b8",
                          borderWidth: "3px"
                        }}
                        title={profile?.isActive ? "Active Now" : "Inactive"}
                      />
                    </div>

                    {/* NAME & META INFO */}
                    <div className="flex-grow-1 text-center text-sm-start">
                      <h4 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.2px" }}>
                        {profile?.name}
                      </h4>
                      <p className="text-secondary fw-semibold mb-2.5 d-flex align-items-center justify-content-center justify-content-sm-start gap-1.5 small">
                        <FaBriefcase size={13} style={{ color: "#0d9488" }} />
                        <span>{profile?.userDeginations || profile?.role || "Administrator"}</span>
                      </p>

                      <div className="d-flex align-items-center justify-content-center justify-content-sm-start flex-wrap gap-2">
                        {/* ROLE PILL */}
                        <span
                          className="px-3 py-1 rounded-pill fw-bold text-white shadow-sm d-inline-flex align-items-center gap-1.5"
                          style={{
                            fontSize: "11.5px",
                            background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
                            letterSpacing: "0.5px"
                          }}
                        >
                          <FaShieldAlt size={11} />
                          <span>{profile?.role || "ADMIN"}</span>
                        </span>

                        {/* ACTIVE STATUS PILL */}
                        <span
                          className="px-3 py-1 rounded-pill fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
                          style={{
                            fontSize: "11.5px",
                            background: profile?.isActive ? "#ecfdf5" : "#f1f5f9",
                            color: profile?.isActive ? "#065f46" : "#64748b",
                            border: `1px solid ${profile?.isActive ? "#a7f3d0" : "#cbd5e1"}`
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: profile?.isActive ? "#10b981" : "#94a3b8"
                            }}
                          />
                          <span>{profile?.isActive ? "Active" : "Inactive"}</span>
                        </span>

                        {/* APPROVAL STATUS */}
                        {profile?.status && (
                          <span
                            className="px-3 py-1 rounded-pill fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
                            style={{
                              fontSize: "11.5px",
                              background: profile?.status === "APPROVED" ? "#f0fdf4" : profile?.status === "REJECTED" ? "#fef2f2" : "#fffbeb",
                              color: profile?.status === "APPROVED" ? "#15803d" : profile?.status === "REJECTED" ? "#b91c1c" : "#b45309",
                              border: `1px solid ${profile?.status === "APPROVED" ? "#bbf7d0" : profile?.status === "REJECTED" ? "#fecaca" : "#fde68a"}`
                            }}
                          >
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
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center"
                          style={{ width: 32, height: 32, background: "#f0fdfa", color: "#0d9488" }}
                        >
                          <FaEnvelope size={14} />
                        </div>
                        <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem" }}>
                          {isHindi ? "संपर्क विवरण" : "Contact Details"}
                        </h6>
                      </div>

                      <div className="d-flex flex-column gap-3">
                        {/* EMAIL */}
                        <div className="p-3 rounded-3 bg-light border" style={{ borderColor: "#e2e8f0" }}>
                          <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}>
                            {isHindi ? "ईमेल आईडी" : "Email Address"}
                          </small>
                          <div className="fw-semibold text-dark text-truncate mt-1 d-flex align-items-center gap-2" style={{ fontSize: "0.92rem" }}>
                            <FaEnvelope size={12} style={{ color: "#0d9488" }} />
                            <span>{profile?.email || "N/A"}</span>
                          </div>
                        </div>

                        {/* MOBILE */}
                        <div className="p-3 rounded-3 bg-light border" style={{ borderColor: "#e2e8f0" }}>
                          <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}>
                            {isHindi ? "मोबाइल नंबर" : "Mobile Number"}
                          </small>
                          <div className="fw-semibold text-dark mt-1 d-flex align-items-center gap-2" style={{ fontSize: "0.92rem" }}>
                            <FaPhoneAlt size={12} style={{ color: "#0d9488" }} />
                            <span>{profile?.mobile || "N/A"}</span>
                          </div>
                        </div>

                        {/* EMPLOYEE TYPE / DEPT */}
                        {profile?.employeeType && (
                          <div className="p-3 rounded-3 bg-light border" style={{ borderColor: "#e2e8f0" }}>
                            <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}>
                              {isHindi ? "संस्थान / विभाग प्रकार" : "Office / Employee Type"}
                            </small>
                            <div className="fw-semibold text-dark mt-1 d-flex align-items-center gap-2" style={{ fontSize: "0.92rem" }}>
                              <span>🏛️</span>
                              <span>{profile?.employeeType}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECURITY & PERMISSIONS */}
                <div className="col-12 col-md-6">
                  <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center"
                          style={{ width: 32, height: 32, background: "#eff6ff", color: "#2563eb" }}
                        >
                          <FaKey size={14} />
                        </div>
                        <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "0.95rem" }}>
                          {isHindi ? "अनुमतियाँ एवं नियंत्रण" : "Permissions & Controls"}
                        </h6>
                      </div>

                      {/* PERMISSIONS */}
                      <div className="mb-4">
                        <small className="text-muted d-block fw-bold text-uppercase mb-2" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                          {isHindi ? "अनुमतियाँ (Permissions)" : "Assigned Permissions"}
                        </small>
                        <div className="d-flex flex-wrap gap-2">
                          {profile?.permissions?.length ? (
                            profile.permissions.map((item, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 rounded-pill fw-bold shadow-sm d-inline-flex align-items-center gap-1.5"
                                style={{
                                  fontSize: "11.5px",
                                  background: "#eff6ff",
                                  color: "#1d4ed8",
                                  border: "1px solid #bfdbfe",
                                  whiteSpace: "nowrap"
                                }}
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
                        <small className="text-muted d-block fw-bold text-uppercase mb-2" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                          <FaCogs className="me-1.5" />
                          {isHindi ? "सिस्टम नियंत्रण (Controls)" : "System Controls"}
                        </small>
                        <div className="d-flex flex-wrap gap-2">
                          {profile?.controls?.length ? (
                            profile.controls.map((item, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 rounded-pill fw-bold text-white shadow-sm d-inline-flex align-items-center gap-1.5"
                                style={{
                                  fontSize: "11.5px",
                                  background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                                  border: "1px solid #334155",
                                  whiteSpace: "nowrap"
                                }}
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

export default AdminHeader;