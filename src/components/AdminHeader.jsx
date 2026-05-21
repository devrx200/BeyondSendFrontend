import { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody
} from "reactstrap";
import {
  FaBars,
  FaSignOutAlt,
  FaClock,
  FaLanguage,
  FaBookOpen,
  FaUserShield
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

  /* ================= LIVE CLOCK ================= */
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
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

    const userId = decoded.id || decoded._id || decoded.userId;
    if (!userId) return;

    axios
      .get(`${API_URL}/api/get-user-profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.data?.success) setProfile(res.data.data);
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
      //  Axios API Call
      await axios.post(`${API_URL}/api/logout-user`, { token });
    } catch (error) {
      console.error("Logout API error:", error?.response?.data || error.message);
    }
    //  Always clear session
    sessionStorage.clear();
    //  Success Alert
    await Swal.fire({
      icon: "success",
      title: "Logged Out",
      text: "You Have Been Successfully Logged Out",
      timer: 1500,
      showConfirmButton: false
    });
    //  Redirect
    navigate("/admin/login", { replace: true });
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
      <header className="adm-header">
        {/* LEFT */}
        <div className="adm-header-left">
          <button
            type="button"
            className="adm-toggle-btn"
            onClick={toggleSidebar}
            title="Toggle Sidebar"
            aria-label="Toggle Sidebar"
          >
            <FaBars />
          </button>

          <div className="adm-header-title d-none d-sm-block">
            Department of Higher Education
          </div>
        </div>

        {/* RIGHT */}
        <div className="adm-header-right">
          <div className="adm-header-clock d-none d-lg-inline-flex">
            <FaClock />
            <span>{dayName}, {formattedDate} | {formattedTime}</span>
          </div>

          <button
            type="button"
            className="adm-header-chip is-warning"
            title="Translate"
            onClick={toggleLanguage}
          >
            <FaLanguage />
            <span>{isHindi ? "English" : "हिंदी"}</span>
          </button>

          <button
            type="button"
            className="adm-header-chip"
            title="Session Manager"
            onClick={() => navigate("/admin/session-manager")}
          >
            <FaUserShield />
            <span>Sessions</span>
          </button>

          <button
            type="button"
            className="adm-header-chip"
            title="Tutorials"
            onClick={() => navigate("/admin/tutorials")}
          >
            <FaBookOpen />
            <span>Help</span>
          </button>

          <button
            type="button"
            className="adm-header-chip is-danger"
            title="Logout"
            onClick={logout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>

          {/* PROFILE IMAGE */}
          <img
            src={
              profile?.profileImage
                ? `${API_URL}${profile.profileImage}`
                : "/default-avatar.png"
            }
            alt="Profile"
            title="Profile"
            className="adm-header-avatar"
            onClick={() => setProfileModal(true)}
          />
        </div>
      </header>
      {/* ================= PROFILE MODAL (VIEW ONLY) ================= */}
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
            <div className="container-fluid p-0">

              {/* PROFILE HEADER */}
              <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">

                {/* LEFT : IMAGE + BASIC INFO */}
                <div className="d-flex align-items-center">
                  <img
                    src={
                      profile.profileImage
                        ? `${API_URL}${profile.profileImage}`
                        : "/default-avatar.png"
                    }
                    alt="Profile"
                    className="rounded border border-3 shadow-sm"
                    width="110"
                    height="110"
                    style={{ objectFit: "cover" }}
                  />

                  <div className="ms-4">
                    <h5 className="fw-bold mb-1">{profile.name}</h5>
                    <small className="text-muted d-block mb-2">
                      {profile.userDeginations}
                    </small>

                    <span className="badge bg-info me-2">{profile.role}</span>
                    <span
                      className={`badge ${profile.isActive ? "bg-success" : "bg-secondary"
                        }`}
                    >
                      {profile.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* RIGHT : META INFO */}
                <div className="text-muted small text-end mt-3 mt-md-0">
                  <div>
                    <strong>Created:</strong>{" "}
                    {new Date(profile.createdAt).toLocaleString("en-IN")}
                  </div>
                  <div>
                    <strong>Updated:</strong>{" "}
                    {new Date(profile.updatedAt).toLocaleString("en-IN")}
                  </div>
                </div>

              </div>


              {/* BASIC INFO */}
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body py-3">
                  <h6 className="fw-bold mb-3">Contact Information</h6>

                  <p className="mb-1">
                    <strong>Email:</strong> {profile.email}
                  </p>
                  <p className="mb-0">
                    <strong>Mobile:</strong> {profile.mobile}
                  </p>
                </div>
              </div>

              {/* STATUS */}
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body py-3">
                  <h6 className="fw-bold mb-3">Account Status</h6>

                  <span
                    className={`badge ${profile.status === "APPROVED"
                      ? "bg-success"
                      : profile.status === "REJECTED"
                        ? "bg-danger"
                        : "bg-warning text-dark"
                      }`}
                  >
                    {profile.status}
                  </span>
                </div>
              </div>

              {/* PERMISSIONS */}
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body py-3">
                  <h6 className="fw-bold mb-3">Access</h6>

                  <div className="mb-2">
                    <small className="text-muted">Permissions</small>
                    <div className="mt-1">
                      {profile.permissions?.length
                        ? profile.permissions.map((p, i) => (
                          <span key={i} className="badge bg-primary me-1 mb-1">
                            {p}
                          </span>
                        ))
                        : <span className="text-muted">N/A</span>}
                    </div>
                  </div>

                  <div>
                    <small className="text-muted">Controls</small>
                    <div className="mt-1">
                      {profile.controls?.length
                        ? profile.controls.map((c, i) => (
                          <span key={i} className="badge bg-dark me-1 mb-1">
                            {c}
                          </span>
                        ))
                        : <span className="text-muted">N/A</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* META */}


            </div>
          )}
        </ModalBody>


      </Modal>


    </>
  );
};

export default AdminHeader;
