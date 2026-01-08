import { useEffect, useState } from "react";
import { Navbar, Button } from "reactstrap";
import {
  FaBars,
  FaSignOutAlt,
  FaClock,
  FaLanguage
} from "react-icons/fa";
import { FaDashcube } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const AdminHeader = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { toggleLanguage, isHindi } = useLanguage();
  const [dateTime, setDateTime] = useState(new Date());

  /* ---------- LIVE CLOCK ---------- */
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ---------- LOGOUT ---------- */
  const logout = async () => {
    const token = sessionStorage.getItem("authToken");

    const result = await Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to logout from this session?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      allowOutsideClick: false
    });

    if (!result.isConfirmed) return;

    try {
      if (token) {
        await axios.post(`${API_URL}/api/logout-user`, { token });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      sessionStorage.clear();

      Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have been logged out successfully",
        timer: 1200,
        showConfirmButton: false
      });

      navigate("/admin/login", { replace: true });
    }
  };

  /* ---------- INDIA TIME FORMAT ---------- */
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
    <Navbar
      color="primary"
      dark
      className="px-3 d-flex justify-content-between align-items-center"
    >
      {/* LEFT */}
      <div className="d-flex align-items-center gap-2">
        <Button color="primary" onClick={toggleSidebar}>
          <FaBars />
        </Button>

        <strong className="fw-bold text-white d-flex align-items-center gap-1">
          <FaDashcube />
          H!.. 
        </strong>
      </div>

      {/* RIGHT */}
      <div className="d-flex align-items-center gap-2 bg-black rounded border border-white px-2 py-1">
        <div className="d-none d-md-flex align-items-center text-white fw-bold">
          <FaClock className="me-2 text-warning" />
          {dayName}, {formattedDate} | {formattedTime}
        </div>

        <Button
          size="sm"
          color={isHindi ? "warning" : "primary"}
          onClick={toggleLanguage}
        >
          <FaLanguage className="me-1" />
          {isHindi ? "English" : "हिंदी"}
        </Button>

        <Button color="danger" size="sm" onClick={logout}>
          <FaSignOutAlt className="me-1" />
          Logout
        </Button>
      </div>
    </Navbar>
  );
};

export default AdminHeader;
