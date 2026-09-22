import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaClock, FaSun, FaCloud } from "react-icons/fa";

import { useLanguage } from "../contexts/LanguageContext";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const pad = (n) => String(n).padStart(2, "0");

const formatLabel = (segment) =>
  segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Context strip shown under the admin header.
 * All visual styling lives in css/BeyondSendTheme.scss.
 */
const BreadcrumbBar = () => {
  const { pathname } = useLocation();
  const { isHindi } = useLanguage();

  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState(null);

  const trail = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => segment !== "admin");

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=21.2514&longitude=81.6296&current=temperature_2m,weather_code&timezone=auto"
        );

        const data = await res.json();

        if (isActive && data.current) setWeather(data.current);
      } catch {
        // Offline / blocked network — widget simply stays hidden.
      }
    };

    fetchWeather();

    const id = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => {
      isActive = false;
      clearInterval(id);
    };
  }, []);

  const dd = pad(now.getDate());
  const mm = pad(now.getMonth() + 1);
  const yyyy = now.getFullYear();
  const day = DAYS[now.getDay()];

  let hours = now.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const time = `${pad(hours)}:${pad(now.getMinutes())}:${pad(
    now.getSeconds()
  )} ${ampm}`;

  return (
    <div className="adm-breadcrumb-bar">
      <nav aria-label="breadcrumb" className="flex-grow-1">
        <ol className="breadcrumb adm-breadcrumb mb-0">
  <li className="breadcrumb-item">        
<FaHome size={21} />
</li>
          {trail.map((segment, index) => {
            const isLast = index === trail.length - 1;
            const routeTo = `/authorized/${trail.slice(0, index + 1).join("/")}`;
            return (
              <li
                key={routeTo}
                className={`breadcrumb-item ${isLast ? "active" : ""}`}
                aria-current={isLast ? "page" : undefined}
              >
                {isLast ? (
                  <span>
                    <span className="adm-breadcrumb-dot" />
                    {formatLabel(segment)}
                  </span>
                ) : (
                  <Link to={routeTo}>{formatLabel(segment)}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="adm-breadcrumb-meta">
        <span className="adm-breadcrumb-chip">
          <FaCalendarAlt />
          <span>{`${dd}/${mm}/${yyyy}`}</span>
        </span>

        <span className="adm-breadcrumb-chip">
          <FaCalendarAlt />
          <span>{day}</span>
        </span>

        <span className="adm-breadcrumb-chip">
          <FaClock />
          <span>{time}</span>
        </span>

        {weather && (
          <span className="adm-weather-widget" title="Local temperature">
            {weather.weather_code <= 1 ? <FaSun /> : <FaCloud />}
            <span>{Math.round(weather.temperature_2m)}&deg;C</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default BreadcrumbBar;
