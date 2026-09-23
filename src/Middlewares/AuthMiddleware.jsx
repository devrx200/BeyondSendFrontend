import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import PageLoader from "../components/PageLoader";

const API_URL = import.meta.env.VITE_API_URL;

let authInFlightPromise = null;
let lastAuthValidationTime = 0;

const AuthMiddleware = ({ allowedRoles = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = sessionStorage.getItem("authToken");

  // If there is NO auth token, immediately redirect to "/" without loader or alert
  if (!token) {
    return <Navigate to="/" replace />;
  }

  const userRole = (sessionStorage.getItem("userRole") || "").toUpperCase();

  const isDevOps = userRole === "DEVOPS";
  const normalizedAllowedRoles = allowedRoles.map((r) => r.toUpperCase());

  const hasRolePermission =
    isDevOps || !normalizedAllowedRoles.length || (userRole && normalizedAllowedRoles.includes(userRole));
  const isPreAuthorized = Boolean(token && hasRolePermission);

  const [loading, setLoading] = useState(!isPreAuthorized);
  const [isAuthorized, setIsAuthorized] = useState(isPreAuthorized);

  const alertShownRef = useRef(false);

  useEffect(() => {
    validateAuth();
  }, [location.pathname]);

  const validateAuth = async () => {
    try {
      const curToken = sessionStorage.getItem("authToken");
      if (!curToken) {
        sessionStorage.clear();
        navigate("/", { replace: true });
        return;
      }

      const now = Date.now();
      if (now - lastAuthValidationTime < 3000 && isPreAuthorized) {
        setIsAuthorized(true);
        setLoading(false);
        return;
      }

      if (!authInFlightPromise) {
        authInFlightPromise = axios
          .post(`${API_URL}/api/check-auth-token`, { token: curToken })
          .finally(() => {
            setTimeout(() => {
              authInFlightPromise = null;
            }, 300);
          });
      }

      const res = await authInFlightPromise;
      if (res.status !== 200 || !res.data?.success) {
        sessionStorage.clear();
        navigate("/", { replace: true });
        return;
      }

      lastAuthValidationTime = Date.now();
      const user = res.data?.user || {};
      const role = (user?.role || "").toUpperCase();
      sessionStorage.setItem("userData", JSON.stringify(user));
      sessionStorage.setItem("userRole", role);

      window.userRole = role;

      const isSuperUser = role === "DEVOPS";

      if (
        !isSuperUser &&
        normalizedAllowedRoles.length > 0 &&
        !normalizedAllowedRoles.includes(role)
      ) {
        unauthorizedAccess("You Don't Have Permission To Access This Page.");
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error(
        "Auth Middleware Error:",
        error?.response?.data || error.message
      );
      sessionStorage.clear();
      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const unauthorizedAccess = async (message) => {
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
    });
    navigate("/authorized/dashboard", { replace: true });
  };

  if (!isAuthorized || loading) {
    return <PageLoader />;
  }

  return <Outlet />;
};

export default AuthMiddleware;