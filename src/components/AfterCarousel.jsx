import { useEffect, useState } from "react";
import { Container, Spinner } from "reactstrap";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

const AfterCarousel = () => {
  const { isHindi } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/education-stats/current`)
      .then((res) => setStats(res.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const statsData = stats
    ? [
        { value: stats.totalGovernmentUniversities, labelEn: "Govt Universities", labelHi: "शासकीय विश्वविद्यालय", icon: "bi-bank", color: "primary" },
        { value: stats.totalPrivateUniversities, labelEn: "Private Universities", labelHi: "निजी विश्वविद्यालय", icon: "bi-bank2", color: "danger" },
        { value: stats.governmentColleges, labelEn: "Govt Colleges", labelHi: "शासकीय महाविद्यालय", icon: "bi-building", color: "success" },
        { value: stats.privateColleges, labelEn: "Private Colleges", labelHi: "निजी महाविद्यालय", icon: "bi-buildings", color: "warning" },
        { value: stats.aidedColleges, labelEn: "Aided Colleges", labelHi: "अनुदान प्राप्त महाविद्यालय", icon: "bi-journal-bookmark", color: "info" },
      ]
    : [];

  const colorMap = {
    primary: { bar: "#1565C0", bg: "#E6F1FB", icon: "#1565C0" },
    danger:  { bar: "#C62828", bg: "#FCEBEB", icon: "#C62828" },
    success: { bar: "#2E7D32", bg: "#EAF3DE", icon: "#2E7D32" },
    warning: { bar: "#E65100", bg: "#FAEEDA", icon: "#E65100" },
    info:    { bar: "#00838F", bg: "#E1F5EE", icon: "#00838F" },
  };

  return (
    <Container className="my-2 my-md-3">
      {loading ? (
        <div className="text-center py-2"><Spinner color="primary" size="sm" /></div>
      ) : !stats ? (
        <div className="text-center text-muted py-2 small">
          {isHindi ? "डेटा उपलब्ध नहीं है" : "No Data Available"}
        </div>
      ) : (
        <div className="stats-banner-container d-flex flex-column flex-lg-row align-items-stretch gap-2">
          {/* Academic Year Tile */}
          <div className="academic-year-tile d-flex flex-row flex-lg-column justify-content-center align-items-center rounded-3 p-2 px-3 flex-shrink-0">
            <div className="text-center">
              <small className="academic-year-label text-uppercase fw-bold d-block">
                {isHindi ? "शैक्षणिक वर्ष" : "Academic Year"}
              </small>
              <div className="d-flex align-items-center justify-content-center gap-1 mt-1">
                <span className="academic-year-value fw-bold">
                  {stats.academicYear.split("-")[0]}
                </span>
                <span className="text-muted fw-bold">-</span>
                <span className="academic-year-value fw-bold">
                  {stats.academicYear.split("-")[1]}
                </span>
              </div>
            </div>
          </div>

          {/* Responsive Stat Cards Grid */}
          <div className="stat-cards-grid flex-grow-1">
            {statsData.map((item, i) => {
              const c = colorMap[item.color];
              return (
                <div
                  key={i}
                  className={`stat-card-item rounded-3 d-flex flex-column ${i === 4 ? "stat-card-last" : ""}`}
                >
                  {/* Top Accent Line */}
                  <div style={{ height: "3px", background: c.bar }} />

                  <div className="d-flex flex-column align-items-center justify-content-center gap-1 py-2 px-2 flex-grow-1">
                    {/* Compact Icon Circle */}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center stat-icon-wrap"
                      style={{ background: c.bg }}
                    >
                      <i className={`bi ${item.icon}`} style={{ color: c.icon }} />
                    </div>

                    {/* Value */}
                    <span className="stat-value fw-bold text-dark lh-1">
                      {item.value?.toLocaleString("en-IN") || 0}
                    </span>

                    {/* Label */}
                    <small className="stat-label text-secondary text-center fw-semibold lh-sm">
                      {isHindi ? item.labelHi : item.labelEn}
                    </small>
                  </div>
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