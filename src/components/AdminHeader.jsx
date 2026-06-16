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
  FaUserCircle
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
          >
            <FaBars />
          </button>

          <div className="adm-header-title d-none d-md-block">
            Department of Higher Education
          </div>

        </div>

        {/* RIGHT */}

        <div className="adm-header-right">

          {/* CLOCK */}

          <div className="adm-header-clock d-none d-lg-flex">

            <FaClock className="me-2" />

            <span>
              {dayName}, {formattedDate} | {formattedTime}
            </span>

          </div>

          {/* LANGUAGE */}

          <button
            type="button"
            className="adm-header-chip is-warning"
            onClick={toggleLanguage}
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
          >
            <FaBookOpen />
            <span className="ms-2">Help</span>
          </button>

          {/* PROFILE DROPDOWN */}

          <Dropdown
            isOpen={profileDropdown}
            toggle={() => setProfileDropdown(!profileDropdown)}
            className="adm-profile-dropdown"
          >

            <DropdownToggle
              caret={false}
              className="adm-profile-btn-pill border-0 p-0"
            >

              <div className="adm-profile-pill">
                <img
                  src={
                    profile?.profileImage
                      ? `${API_URL}${profile.profileImage}`
                      : "/default-avatar.svg"
                  }
                  alt="Profile"
                  className="adm-profile-pill-avatar"
                />
                <div className="adm-profile-pill-info">
                  <div className="adm-profile-pill-name">
                    {profile?.name || "NicAdmin"}
                  </div>
                  <div className="adm-profile-pill-subtitle">
                    {profile?.userDeginations || profile?.role || "Administrator"}
                  </div>
                </div>
                <FaChevronDown className="adm-profile-pill-chevron" />
              </div>

            </DropdownToggle>

            <DropdownMenu
              end
              className="adm-profile-menu-simple border-0 shadow-lg mt-2"
            >

              {/* MY PROFILE */}

              <DropdownItem
                className="adm-profile-item text-dark"
                onClick={() => {
                  setProfileModal(true);
                  setProfileDropdown(false);
                }}
              >
                <FaUserCircle className="me-2" />
                My Profile
              </DropdownItem>

              <DropdownItem divider className="my-1" />

              {/* LOGOUT */}

              <DropdownItem
                className="adm-profile-item text-danger"
                onClick={logout}
              >
                <FaSignOutAlt className="me-2" />
                Logout
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
      >

        <ModalHeader toggle={() => setProfileModal(false)}>
          User Profile
        </ModalHeader>

        <ModalBody>

          {profile && (

            <div className="container-fluid">

              {/* PROFILE TOP */}

              <div className="row align-items-center mb-4">

                {/* IMAGE */}

                <div className="col-md-3 text-center mb-3 mb-md-0">

                  <img
                    src={
                      profile?.profileImage
                        ? `${API_URL}${profile.profileImage}`
                        : "/default-avatar.svg"
                    }
                    alt="Profile"
                    className="img-fluid rounded-circle shadow border"
                    style={{
                      width: "140px",
                      height: "140px",
                      objectFit: "cover"
                    }}
                  />

                </div>

                {/* INFO */}

                <div className="col-md-9">

                  <h4 className="fw-bold mb-1">
                    {profile?.name}
                  </h4>

                  <p className="text-muted mb-2">
                    {profile?.userDeginations}
                  </p>

                  <span className="badge bg-primary me-2">
                    {profile?.role}
                  </span>

                  <span
                    className={`badge ${profile?.isActive
                      ? "bg-success"
                      : "bg-secondary"
                      }`}
                  >
                    {profile?.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>

                </div>

              </div>

              {/* CONTACT */}

              <div className="card border-0 shadow-sm mb-3">

                <div className="card-body">

                  <h5 className="fw-bold mb-3">
                    Contact Information
                  </h5>

                  <div className="row">

                    <div className="col-md-6 mb-3">
                      <label className="fw-semibold">
                        Email
                      </label>

                      <div className="text-muted">
                        {profile?.email || "N/A"}
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="fw-semibold">
                        Mobile
                      </label>

                      <div className="text-muted">
                        {profile?.mobile || "N/A"}
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* STATUS */}

              <div className="card border-0 shadow-sm mb-3">

                <div className="card-body">

                  <h5 className="fw-bold mb-3">
                    Account Status
                  </h5>

                  <span
                    className={`badge ${profile?.status === "APPROVED"
                      ? "bg-success"
                      : profile?.status === "REJECTED"
                        ? "bg-danger"
                        : "bg-warning text-dark"
                      }`}
                  >
                    {profile?.status}
                  </span>

                </div>

              </div>

              {/* PERMISSIONS */}

              <div className="card border-0 shadow-sm">

                <div className="card-body">

                  <h5 className="fw-bold mb-3">
                    Permissions
                  </h5>

                  <div className="mb-3">

                    {profile?.permissions?.length ? (
                      profile.permissions.map((item, index) => (
                        <span
                          key={index}
                          className="badge bg-primary me-2 mb-2"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">
                        No Permissions
                      </span>
                    )}

                  </div>

                  <h6 className="fw-bold mb-3">
                    Controls
                  </h6>

                  <div>

                    {profile?.controls?.length ? (
                      profile.controls.map((item, index) => (
                        <span
                          key={index}
                          className="badge bg-dark me-2 mb-2"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">
                        No Controls
                      </span>
                    )}

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