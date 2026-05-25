import { useEffect, useState } from "react";
import {
  Container, Row, Col, Card, CardBody, Spinner, Badge
} from "reactstrap";
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
  success: { bar: "#2E7D32", bg: "#EAF3DE", icon: "#2E7D32" },
  danger:  { bar: "#C62828", bg: "#FCEBEB", icon: "#C62828" },
  warning: { bar: "#E65100", bg: "#FAEEDA", icon: "#E65100" },
  info:    { bar: "#00838F", bg: "#E1F5EE", icon: "#00838F" },
};

return (
  <Container className="my-3">
    <div className="d-flex align-items-stretch gap-2 flex-wrap">

      {/* Academic Year — left block */}
      {!loading && stats && (
        <div
          className="d-flex flex-column justify-content-center flex-shrink-0 rounded-3 p-3"
          style={{ background: "var(--bs-light)", border: "0.5px solid #8edefd", minWidth: "110px" }}
        >
          <small className="text-muted text-uppercase fw-bold" style={{ fontSize: "9px", letterSpacing: "0.5px" }}>
            {isHindi ? "शैक्षणिक वर्ष" : "Academic Year"}
          </small>
          <span className="fw-500 lh-1 mt-1" style={{ fontSize: "18px" }}>
            {stats.academicYear.split("-")[0]}
          </span>
          <div style={{ width: "20px", height: "2px", background: "#378ADD", borderRadius: "2px", margin: "5px 0" }} />
          <span className="fw-500 lh-1" style={{ fontSize: "18px" }}>
            {stats.academicYear.split("-")[1]}
          </span>
        </div>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div className="text-center py-3 flex-grow-1"><Spinner color="primary" /></div>
      ) : !stats ? (
        <div className="text-center text-muted py-3 flex-grow-1">
          {isHindi ? "डेटा उपलब्ध नहीं है" : "No Data Available"}
        </div>
      ) : (
        <div className="flex-grow-1" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: "10px" }}>
          {statsData.map((item, i) => {
            const c = colorMap[item.color];
            return (
              <div
                key={i}
                className="rounded-3"
                style={{ overflow: "hidden", border: "0.5px solid #dee2e6", background: "#fff" }}
              >
                {/* Color top bar */}
                <div style={{ height: "4px", background: c.bar }} />

                <div className="d-flex flex-column align-items-center gap-1 py-3 px-2">
                  {/* Icon circle */}
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "36px", height: "36px", background: c.bg }}
                  >
                    <i className={`bi ${item.icon}`} style={{ fontSize: "16px", color: c.icon }} />
                  </div>

                  {/* Value */}
                  <span className="fw-500 lh-1" style={{ fontSize: "22px" }}>
                    {item.value?.toLocaleString("en-IN") || 0}
                  </span>

                  {/* Label */}
                  <small className="text-muted text-center lh-sm fw-bold" style={{ fontSize: "15px" }}>
                    {isHindi ? item.labelHi : item.labelEn}
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  </Container>
);
};

export default AfterCarousel;