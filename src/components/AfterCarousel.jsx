import { useEffect, useState } from "react";
import { Container, Spinner } from "reactstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import {
  FaUniversity,
  FaBuilding,
  FaGraduationCap,
  FaLandmark,
  FaBookReader,
  FaCalendarAlt,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const DEFAULT_STATS = {
  academicYear: "2026-2027",
  totalGovernmentUniversities: 9,
  totalPrivateUniversities: 21,
  governmentColleges: 343,
  privateColleges: 314,
  aidedColleges: 15,
};

const AfterCarousel = () => {
  const { isHindi } = useLanguage();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/education-stats/current`)
      .then((res) => {
        if (res.data?.data) {
          setStats(res.data.data);
        }
      })
      .catch(() => {
        // Keep default fallback stats
      })
      .finally(() => setLoading(false));
  }, []);

  const statsData = [
    {
      value: stats?.academicYear || "2026-2027",
      isYear: true,
      labelEn: "Academic Year",
      labelHi: "शैक्षणिक वर्ष",
      Icon: FaCalendarAlt,
      color: "navy",
      link: null,
    },
    {
      value: stats?.totalGovernmentUniversities ?? 9,
      labelEn: "Govt Universities",
      labelHi: "शासकीय विश्वविद्यालय",
      Icon: FaUniversity,
      color: "primary",
      link: "/universities",
    },
    {
      value: stats?.totalPrivateUniversities ?? 21,
      labelEn: "Private Universities",
      labelHi: "निजी विश्वविद्यालय",
      Icon: FaLandmark,
      color: "danger",
      link: "/universities",
    },
    {
      value: stats?.governmentColleges ?? 343,
      labelEn: "Govt Colleges",
      labelHi: "शासकीय महाविद्यालय",
      Icon: FaBuilding,
      color: "success",
      link: "/colleges",
    },
    {
      value: stats?.privateColleges ?? 314,
      labelEn: "Private Colleges",
      labelHi: "निजी महाविद्यालय",
      Icon: FaGraduationCap,
      color: "warning",
      link: "/colleges",
    },
    {
      value: stats?.aidedColleges ?? 15,
      labelEn: "Aided Colleges",
      labelHi: "अनुदान प्राप्त महाविद्यालय",
      Icon: FaBookReader,
      color: "info",
      link: "/colleges",
    },
  ];

  const colorMap = {
    navy: { bar: "#1e40af", bg: "#eff6ff", icon: "#1e40af" },
    primary: { bar: "#1565C0", bg: "#E6F1FB", icon: "#1565C0" },
    danger: { bar: "#C62828", bg: "#FCEBEB", icon: "#C62828" },
    success: { bar: "#2E7D32", bg: "#EAF3DE", icon: "#2E7D32" },
    warning: { bar: "#E65100", bg: "#FAEEDA", icon: "#E65100" },
    info: { bar: "#00838F", bg: "#E1F5EE", icon: "#00838F" },
  };

  return (
    <Container className="my-2">
      {loading && !stats ? (
        <div className="text-center py-3">
          <Spinner color="primary" size="sm" />
        </div>
      ) : (
        <div className="stats-banner-container">
          {/* Responsive 6-Card Grid: 6 cols on Desktop, 3 on Tablet, 2 on Mobile */}
          <div className="stat-cards-grid">
            {statsData.map((item, i) => {
              const c = colorMap[item.color] || colorMap.primary;
              const IconComp = item.Icon;
              
              const CardContent = (
                <div
                  className="stat-card-item rounded-3 d-flex flex-column align-items-center justify-content-center h-100"
                  style={{ borderTop: `4px solid ${c.bar}`, cursor: item.link ? "pointer" : "default" }}
                >
                  <div className="d-flex flex-column align-items-center justify-content-center py-2.5 px-2 w-100 text-center">
                    {/* Compact Icon Circle */}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center stat-icon-wrap mb-1.5"
                      style={{ background: c.bg, color: c.icon }}
                    >
                      <IconComp />
                    </div>

                    {/* Value / Academic Year */}
                    <span
                      className={`stat-value fw-bold text-dark lh-1 ${
                        item.isYear ? "stat-year-value" : ""
                      }`}
                    >
                      {item.isYear
                        ? item.value
                        : item.value?.toLocaleString("en-IN") || 0}
                    </span>

                    {/* Label with minor padding */}
                    <small className="stat-label text-secondary text-center fw-semibold lh-sm mt-1.5 pt-1">
                      {isHindi ? item.labelHi : item.labelEn}
                    </small>
                  </div>
                </div>
              );

              return item.link ? (
                <Link
                  key={i}
                  to={item.link}
                  className="text-decoration-none d-block h-100 stat-card-link"
                  title={`View ${item.labelEn}`}
                >
                  {CardContent}
                </Link>
              ) : (
                <div key={i} className="h-100">
                  {CardContent}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Container>
  );
};

export default AfterCarousel;