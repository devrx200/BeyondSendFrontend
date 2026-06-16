import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import ServerDown from "../views/pages/ServerDown";   // ← your new component

const ServerContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export const ServerProvider = ({ children }) => {
  const [serverOnline, setServerOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  const checkServer = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/health-check`);
      if (data.success) setServerOnline(true);
    } catch {
      setServerOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkServer(); }, []);

  // ── Loading: show nothing (or a spinner) ──
  if (loading) return null;

  // ── Server offline: full-page portal shell + modal overlay ──
  if (!serverOnline) {
    return <ServerDown onRetry={checkServer} />;
  }

  // ── Normal operation ──
  return (
    <ServerContext.Provider value={{ serverOnline }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServer = () => useContext(ServerContext);