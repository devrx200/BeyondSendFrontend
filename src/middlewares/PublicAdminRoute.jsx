import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Swal from "sweetalert2";
import apiClient from "@apiService";

const PublicAdminRoute = ({ redirectTo = "/authorized/dashboard" }) => {
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
        const res = await apiClient.post('/auth/verify-token', { token });
        if (res?.success) {
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
