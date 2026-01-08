import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const AuthMiddleware = ({ allowedRoles = [] }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const alertShownRef = useRef(false); 

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      denyAccess("Session Expired. Please Login Again.");
      return;
    }

    const validateToken = async () => {
      try {
        const res = await axios.post(
          `${API_URL}/api/check-auth-token`,
          {token}, 
        );

        if (res.status === 200 && res.data?.success) {
          const userRole = res.data.user?.role;

          if (allowedRoles.length > 0) {
            if (!allowedRoles.includes(userRole)) {
              denyAccess("You Don’t Have Permission To Access This Page.");
              return;
            }
          }

          setIsAuthorized(true);
        } else {
          denyAccess("Authentication Failed. Please Login Again.");
        }
      } catch (error) {
        const message =
          error.response?.data?.message ||
          "Session Expired. Please Login Again.";

        denyAccess(message);
      }
    };

    validateToken();

  }, []); 


  const denyAccess = (message) => {
    if (alertShownRef.current) return;
    alertShownRef.current = true;

    setIsAuthorized(false);

    Swal.fire({
      icon: "error",
      title: "Unauthorized Access",
      text: message,
      confirmButtonText: "Login Again",
      allowOutsideClick: false,
    }).then(() => {
      sessionStorage.clear();
      navigate("/admin/login", { replace: true });
    });
  };
  
  if (isAuthorized === null) return null; 

  if (!isAuthorized) return null;

  return <Outlet />;
};

export default AuthMiddleware;
