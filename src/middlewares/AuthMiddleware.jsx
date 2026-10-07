import { useState, useEffect, useRef, useCallback } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { PageLoader } from "@/components";
import apiClient from "@apiService";

/**
 * Guards the authorized console.
 *
 * The role is never trusted from storage alone: the token is verified against
 * the server on entry and on every route change, and the verified role is
 * what gets persisted. An absent role is treated as "no access" rather than
 * defaulting to a privileged one.
 */

let authInFlightPromise = null;
let lastAuthValidationTime = 0;

const VALIDATION_TTL_MS = 3000;

const SUPER_ROLES = ["DEVOPS", "ADMIN"];

const clearAuth = () => {
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("userRole");
  sessionStorage.removeItem("userData");
  localStorage.removeItem("authToken");
  window.userRole = "";
};

const persistAuth = (user) => {
  const role = (user?.role || "").toUpperCase();
  sessionStorage.setItem("userData", JSON.stringify(user || {}));
  sessionStorage.setItem("userRole", role);
  window.userRole = role;
  return role;
};

const AuthMiddleware = ({ allowedRoles = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const normalizedAllowedRoles = allowedRoles.map((r) => r.toUpperCase());

  // Always start unauthorised so the role can never be trusted from a stale
  // sessionStorage value written by a previous (possibly privileged) session.
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const alertShownRef = useRef(false);

  const unauthorizedAccess = useCallback(
    async (message) => {
      if (alertShownRef.current) return;
      alertShownRef.current = true;
      setIsAuthorized(false);

      await Swal.fire({
        icon: "warning",
        title: "Access Denied",
        text: message,
        confirmButtonText: "Go To Dashboard",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      navigate("/authorized/dashboard", { replace: true });
    },
    [navigate]
  );

  useEffect(() => {
    let cancelled = false;

    const validateAuth = async () => {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        if (!cancelled) {
          clearAuth();
          setIsAuthorized(false);
          setLoading(false);
          navigate("/", { replace: true });
        }
        return;
      }

      // Re-use a very recent successful validation to avoid hammering the API
      // on every in-app navigation.
      if (Date.now() - lastAuthValidationTime < VALIDATION_TTL_MS) {
        const known = (sessionStorage.getItem("userRole") || "").toUpperCase();
        if (known) {
          if (
            !SUPER_ROLES.includes(known) &&
            normalizedAllowedRoles.length > 0 &&
            !normalizedAllowedRoles.includes(known)
          ) {
            if (!cancelled) {
              await unauthorizedAccess("You Don't Have Permission To Access This Page.");
            }
            return;
          }
          if (!cancelled) {
            setIsAuthorized(true);
            setLoading(false);
          }
          return;
        }
      }

      try {
        if (!authInFlightPromise) {
          authInFlightPromise = apiClient
            .post("/auth/verify-token", { token })
            .finally(() => {
              setTimeout(() => {
                authInFlightPromise = null;
              }, 300);
            });
        }

        const res = await authInFlightPromise;
        if (cancelled) return;

        if (!res?.success) {
          clearAuth();
          navigate("/", { replace: true });
          return;
        }

        lastAuthValidationTime = Date.now();

        const user = res.user || res.data?.user || {};
        const role = persistAuth(user);

        if (
          !SUPER_ROLES.includes(role) &&
          normalizedAllowedRoles.length > 0 &&
          !normalizedAllowedRoles.includes(role)
        ) {
          await unauthorizedAccess("You Don't Have Permission To Access This Page.");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        if (cancelled) return;
        console.error("Auth Middleware Error:", error?.response?.data || error?.message);
        clearAuth();
        navigate("/", { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    validateAuth();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, normalizedAllowedRoles.join(","), unauthorizedAccess]);

  // A role change (e.g. impersonation or an upgrade) must re-run validation.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "authToken") {
        lastAuthValidationTime = 0;
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (loading) return <PageLoader />;

  if (!isAuthorized) {
    return sessionStorage.getItem("authToken") ? (
      <PageLoader />
    ) : (
      <Navigate to="/" replace />
    );
  }

  return <Outlet />;
};

export default AuthMiddleware;
