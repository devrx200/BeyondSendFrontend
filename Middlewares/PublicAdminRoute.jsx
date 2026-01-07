import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

const PublicAdminRoute = ({ redirectTo = "/admin/dashboard" }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const alertShownRef = useRef(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");

    if (!token) {
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await axios.post(
          `${API_URL}/check-auth-token`,
          { token }
        );

        if (res.status === 200 && res.data?.success) {
          setIsAuthenticated(true);
        } else {
          throw new Error("Invalid Token");
        }
      } catch (error) {
        sessionStorage.clear();

        if (!alertShownRef.current) {
          alertShownRef.current = true;
          Swal.fire({
            icon: "warning",
            title: "Session Expired",
            text: "Please login again",
            confirmButtonText: "Login",
            allowOutsideClick: false,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default PublicAdminRoute;
