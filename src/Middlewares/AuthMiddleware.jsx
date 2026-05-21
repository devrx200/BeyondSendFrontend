import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
const API_URL = import.meta.env.VITE_API_URL;
const AuthMiddleware = ({ allowedRoles = [],
  allowedEmployeeTypes = []
}) => {
  const navigate = useNavigate();

  const location = useLocation();

  const [loading, setLoading] =
    useState(true);

  const [isAuthorized, setIsAuthorized] =
    useState(false);

  const alertShownRef = useRef(false);

  useEffect(() => {
    validateAuth();
  }, [location.pathname]);

  const validateAuth = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        redirectToLogin("Session Expired. Please Login Again.");
        return;
      }
      const res = await axios.post(`${API_URL}/api/check-auth-token`, { token });
      if (
        res.status !== 200 ||
        !res.data?.success
      ) {
        redirectToLogin("Authentication Failed.");
        return;
      }
      const user = res.data?.user || {};
      const role = user?.role?.toUpperCase();
      const employeeType = user?.employeeType?.toUpperCase();
      sessionStorage.setItem("userData", JSON.stringify(user));
      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(role)
      ) {
        unauthorizedAccess(
          "You Don't Have Permission To Access This Page."
        );
        return;
      }

      if (
        allowedEmployeeTypes.length > 0 &&
        !allowedEmployeeTypes.includes(
          employeeType
        )
      ) {
        unauthorizedAccess(
          "Employee Access Denied."
        );
        return;
      }
      setIsAuthorized(true);
    } catch (error) {
      console.error(
        "Auth Middleware Error:",
        error?.response?.data ||
        error.message
      );

      redirectToLogin(
        error?.response?.data?.message ||
        "Session Expired. Please Login Again."
      );
    } finally {
      setLoading(false);
    }
  };

  const redirectToLogin = async (
    message
  ) => {
    if (alertShownRef.current) return;

    alertShownRef.current = true;

    setIsAuthorized(false);

    await Swal.fire({
      icon: "error",
      title: "Authentication Failed",
      text: message,
      confirmButtonText: "Login Again",
      allowOutsideClick: false,
      allowEscapeKey: false
    });
    sessionStorage.clear();
    navigate("/admin/login", { replace: true });
  };

  const unauthorizedAccess = async (
    message
  ) => {
    if (alertShownRef.current) return;

    alertShownRef.current = true;

    setIsAuthorized(false);

    await Swal.fire({
      icon: "warning",
      title: "Access Denied",
      text: message,
      confirmButtonText: "Go To Dashboard",
      allowOutsideClick: false,
      allowEscapeKey: false
    }); navigate("/admin/dashboard", { replace: true });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }} >
        <div className="spinner-border text-primary" role="status" >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <Outlet />;
};

export default AuthMiddleware;