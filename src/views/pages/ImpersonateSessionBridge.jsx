import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLoader } from "@/components";

const ImpersonateSessionBridge = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.substring(1)
        : window.location.hash;

      const params = new URLSearchParams(hash);
      const token = params.get("token");
      const role = params.get("role");
      const userStr = params.get("user");
      const adminToken = params.get("adminToken");
      const adminRole = params.get("adminRole");
      const adminUser = params.get("adminUser");

      if (!token) {
        setError("No impersonation session credentials provided.");
        return;
      }

      // Isolate to this tab's sessionStorage
      sessionStorage.setItem("authToken", token);
      if (role) {
        sessionStorage.setItem("userRole", role);
        window.userRole = role;
      }
      if (userStr) {
        sessionStorage.setItem("userData", userStr);
      }

      if (adminToken) sessionStorage.setItem("impersonatorAdminToken", adminToken);
      if (adminRole) sessionStorage.setItem("impersonatorAdminRole", adminRole);
      if (adminUser) sessionStorage.setItem("impersonatorAdminUser", adminUser);

      // Clean up sensitive tokens from address bar without page reload
      window.history.replaceState(null, "", "/authorized/dashboard");

      // Navigate to authorized dashboard
      navigate("/authorized/dashboard", { replace: true });
    } catch (err) {
      console.error("Bridge Error:", err);
      setError("Failed to initialize session in new tab.");
    }
  }, [navigate]);

  if (error) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light p-3">
        <div className="card shadow-sm p-4 text-center border-0" style={{ maxWidth: 440 }}>
          <div className="text-danger mb-2 fs-1">⚠️</div>
          <h5 className="fw-bold text-dark">Session Launch Failed</h5>
          <p className="text-muted small mb-3">{error}</p>
          <button className="btn btn-primary btn-sm px-4" onClick={() => window.close()}>
            Close Tab
          </button>
        </div>
      </div>
    );
  }

  return <PageLoader />;
};

export default ImpersonateSessionBridge;
