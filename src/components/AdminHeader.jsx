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

const AdminHeader = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState(new Date());
  const { toggleLanguage, isHindi } = useLanguage();


  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const logout = () => {
    sessionStorage.removeItem("authToken");
    navigate("/admin/login", { replace: true });
  };

  const formattedDate = dateTime.toLocaleDateString("en-GB"); // DD-MM-YYYY
  const formattedTime = dateTime.toLocaleTimeString("en-GB");
  const dayName = dateTime.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <Navbar
      color="primary"
      dark
      className="px-3 d-flex justify-content-between align-items-center"
    >

      <div className="d-flex align-items-center gap-2">
        <Button color="primary" onClick={toggleSidebar}>
          <FaBars />
        </Button>

        <strong className="fw-bold text-white d-flex align-items-center gap-1">
          <FaDashcube />
          HE-Admin
        </strong>
      </div>




      <div className="d-flex align-items-center gap-2">
        <div className="d-none d-md-flex align-items-center text-danger  fw-bold">
          <FaClock className="me-2" />
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
