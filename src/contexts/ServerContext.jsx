import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import ServerDown from "../views/pages/ServerDown";

const ServerContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;
const POLL_INTERVAL = 10000;

export const ServerProvider = ({ children }) => {
  const [serverOnline, setServerOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const intervalRef = useRef(null);
  const checkServer = async (isManualRetry = false) => {
    if (isManualRetry) setRetrying(true);

    try {
      const { data } = await axios.get(`${API_URL}/api/health-check`);
      if (data.success) setServerOnline(true);
      else setServerOnline(false);
    } catch {
      setServerOnline(false);
    } finally {
      setLoading(false);
      if (isManualRetry) setRetrying(false);
    }
  };

  useEffect(() => {
    checkServer();
  }, []);

  useEffect(() => {
    if (!serverOnline) {
      intervalRef.current = setInterval(() => {
        checkServer();
      }, POLL_INTERVAL);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [serverOnline]);

  if (loading) return null;

  if (!serverOnline) {
    return <ServerDown onRetry={() => checkServer(true)} retrying={retrying} />;
  }

  return (
    <ServerContext.Provider value={{ serverOnline }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServer = () => useContext(ServerContext);