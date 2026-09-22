import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaClock, FaSun, FaCloud } from "react-icons/fa";

import { useLanguage } from "../contexts/LanguageContext";

const DAYS_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const DAYS_HI = [
  "रविवार",
  "सोमवार",
  "मंगलवार",
  "बुधवार",
  "गुरुवार",
  "शुक्रवार",
  "शनिवार"
];

const HINDI_SEGMENTS = {
  authorized: "प्रशासित",
  dashboard: "डैशबोर्ड",
  tutorials: "ट्यूटोरियल",
  "help-guidance": "सहायता और मार्गदर्शन",
  "feedback-list": "उपयोगकर्ता प्रतिक्रिया",
  "contact-management": "संपर्क प्रबंधन",
  "new-updates-management": "नवीन सूचनाएं",
  "important-page-management": "महत्वपूर्ण पृष्ठ",
  "media-library": "मीडिया लाइब्रेरी",
  "manage-brands": "ब्रांड प्रबंधन",
  "manage-categories": "श्रेणी प्रबंधन",
  "admin-user-management": "व्यवस्थापक प्रबंधन",
  "activity-log-management": "गतिविधि लॉग",
  "db-backup-management": "डेटाबेस बैकअप",
  "session-manager": "सत्र प्रबंधन",
  "footer-section-manager": "पाद अनुभाग",
  "header-management": "शीर्षलेख प्रबंधन"
};

const pad = (n) => String(n).padStart(2, "0");

const formatLabel = (segment, isHindi) => {
  if (isHindi && HINDI_SEGMENTS[segment.toLowerCase()]) {
    return HINDI_SEGMENTS[segment.toLowerCase()];
  }
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

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
  const day = isHindi ? DAYS_HI[now.getDay()] : DAYS_EN[now.getDay()];

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
            <Link
              to="/authorized/dashboard"
              title={isHindi ? "डैशबोर्ड पर जाएं" : "Go to Dashboard"}
              aria-label="Dashboard Home"
            >
              <FaHome size={18} />
            </Link>
          </li>
          {trail.map((segment, index) => {
            const isLast = index === trail.length - 1;
            const routeTo = `/authorized/${trail.slice(0, index + 1).join("/")}`;
            const label = formatLabel(segment, isHindi);
            return (
              <li
                key={routeTo}
                className={`breadcrumb-item ${isLast ? "active" : ""}`}
                aria-current={isLast ? "page" : undefined}
              >
                {isLast ? (
                  <span>
                    <span className="adm-breadcrumb-dot" />
                    {label}
                  </span>
                ) : (
                  <Link to={routeTo} title={label}>{label}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="adm-breadcrumb-meta">
        <span
          className="adm-breadcrumb-chip"
          title={isHindi ? "वर्तमान तिथि" : "Current Date"}
        >
          <FaCalendarAlt />
          <span>{`${dd}/${mm}/${yyyy}`}</span>
        </span>

        <span
          className="adm-breadcrumb-chip"
          title={isHindi ? "आज का दिन" : "Day of the Week"}
        >
          <FaCalendarAlt />
          <span>{day}</span>
        </span>

        <span
          className="adm-breadcrumb-chip"
          title={isHindi ? "वर्तमान समय" : "Current Time"}
        >
          <FaClock />
          <span>{time}</span>
        </span>

        {weather && (
          <span
            className="adm-weather-widget"
            title={isHindi ? "स्थानीय तापमान" : "Local Temperature"}
          >
            {weather.weather_code <= 1 ? <FaSun /> : <FaCloud />}
            <span>{Math.round(weather.temperature_2m)}&deg;C</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default BreadcrumbBar;
