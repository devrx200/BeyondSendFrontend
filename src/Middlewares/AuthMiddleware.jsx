import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import PageLoader from "../components/PageLoader";

const API_URL = import.meta.env.VITE_API_URL;

let authInFlightPromise = null;
let lastAuthValidationTime = 0;

const AuthMiddleware = ({ allowedRoles = [],
  allowedEmployeeTypes = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = sessionStorage.getItem("userRole");
  const employeeType = sessionStorage.getItem("employeeType");
  const token = sessionStorage.getItem("authToken");

  const hasRolePermission = !allowedRoles.length || (userRole && allowedRoles.includes(userRole));
  const hasEmpPermission = !allowedEmployeeTypes.length || (employeeType && allowedEmployeeTypes.includes(employeeType));
  const isPreAuthorized = Boolean(token && userRole && hasRolePermission && hasEmpPermission);

  const [loading, setLoading] = useState(!isPreAuthorized);
  const [isAuthorized, setIsAuthorized] = useState(isPreAuthorized);

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

      const now = Date.now();
      if (now - lastAuthValidationTime < 3000 && isPreAuthorized) {
        setIsAuthorized(true);
        setLoading(false);
        return;
      }

      if (!authInFlightPromise) {
        authInFlightPromise = axios.post(`${API_URL}/api/check-auth-token`, { token })
          .finally(() => {
            setTimeout(() => {
              authInFlightPromise = null;
            }, 300);
          });
      }

      const res = await authInFlightPromise;
      if (
        res.status !== 200 ||
        !res.data?.success
      ) {
        redirectToLogin("Authentication Failed.");
        return;
      }
      lastAuthValidationTime = Date.now();
      const user = res.data?.user || {};
      const role = user?.role?.toUpperCase();
      const employeeType = user?.employeeType?.toUpperCase();
      sessionStorage.setItem("userData", JSON.stringify(user));
      sessionStorage.setItem("userRole", role || "");
      sessionStorage.setItem("employeeType", employeeType || "");

      window.userRole = role;
      window.employeeType = employeeType;

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
    navigate("/", { replace: true });
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

  if (!isAuthorized) {
    return <PageLoader />;
  }

  return <Outlet />;
};

export default AuthMiddleware;