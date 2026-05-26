import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaClock, FaSun, FaCloud } from "react-icons/fa";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const pad = (n) => String(n).padStart(2, "0");

const formatLabel = (segment) =>
  segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const BreadcrumbBar = () => {
  const { pathname } = useLocation();
  const pathnames = pathname.split("/").filter(Boolean);

  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=28.7041&longitude=77.1025&current=temperature_2m,weather_code&timezone=auto"
        );

        const data = await res.json();

        if (data.current) setWeather(data.current);
      } catch (err) {
        console.error("Weather fetch error:", err);
      }
    };

    fetchWeather();

    const id = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => clearInterval(id);
  }, []);

  const dd = pad(now.getDate());
  const mm = pad(now.getMonth() + 1);
  const yyyy = now.getFullYear();
  const day = DAYS[now.getDay()];

  let hours = now.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  const time = `${pad(hours)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${ampm}`;

  const badgeStyle = {
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.2)",
    fontWeight: "500",
  };

  return (
    <div
      className="d-flex flex-wrap align-items-center justify-content-between rounded p-2 m-2"
      style={{
        background: "#2b3a4a",
        borderLeft: "4px solid #f0c040",
        boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        color: "#ffffff",
      }}
    >
      {/* Breadcrumb navigation */}
      <nav aria-label="breadcrumb" className="flex-grow-1 me-2">
        <ol
          className="breadcrumb mb-0 align-items-center"
          style={{
            background: "transparent",
            color: "#ffffff",
          }}
        >
          {pathnames.map((segment, index) => {
            const isLast = index === pathnames.length - 1;
            const routeTo = "/" + pathnames.slice(0, index + 1).join("/");

            if (segment === "admin") {
              return (
                <li key="admin" className="breadcrumb-item">
                  <Link
                    to="/admin/dashboard"
                    style={{
                      color: "#ffffff",
                      textDecoration: "none",
                    }}
                  >
                    <FaHome className="" size={20} /> <b>Admin</b>
                  </Link>
                </li>
              );
            }

            return (
              <li
                key={routeTo}
                className={`breadcrumb-item ${isLast ? "active" : ""}`}
                style={{
                  color: "#ffffff",
                }}
              >
                {isLast ? (
                  <span
                    className="d-inline-flex align-items-center"
                    style={{ color: "#ffffff" }}
                  >
                    <span
                      className="bg-success rounded-circle d-inline-block me-1"
                      style={{
                        width: "8px",
                        height: "8px",
                      }}
                    />
                   <b> {formatLabel(segment)} </b>
                  </span>
                ) : (
                  <Link
                    to={routeTo}
                    style={{
                      color: "#ffffff",
                      textDecoration: "none",
                    }}
                  >
                       <b> {formatLabel(segment)} </b>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Right side */}
      <div className="d-flex flex-wrap gap-2">
        <span className="badge rounded-pill px-3 py-2" style={badgeStyle}>
          <FaCalendarAlt className="me-1" />
          {dd}/{mm}/{yyyy}
        </span>

        <span className="badge rounded-pill px-3 py-2" style={badgeStyle}>
          <FaCalendarAlt className="me-1" />
          {day}
        </span>

        <span className="badge rounded-pill px-3 py-2" style={badgeStyle}>
          <FaClock className="me-1" />
          {time}
        </span>

        {weather && (
          <span className="badge rounded-pill px-3 py-2" style={badgeStyle}>
            {weather.weather_code <= 1 ? (
              <FaSun className="me-1" />
            ) : (
              <FaCloud className="me-1" />
            )}

            {Math.round(weather.temperature_2m)}°C
          </span>
        )}
      </div>

      <style>
        {`
          .breadcrumb-item,
          .breadcrumb-item.active,
          .breadcrumb-item a,
          .breadcrumb-item::before {
            color: #ffffff !important;
          }
        `}
      </style>
    </div>
  );
};

export default BreadcrumbBar;