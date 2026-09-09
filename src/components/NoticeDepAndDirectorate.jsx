import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardBody,
  Badge,
  Container,
  Row,
  Col,
  Spinner,
  Input,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import axios from "axios";
import {
  FaCalendarAlt,
  FaBuilding,
  FaArchive,
  FaMapMarkerAlt,
  FaChevronRight,
  FaBell,
  FaBullhorn,
  FaSearch,
  FaLayerGroup,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import PageLoader from "./PageLoader";

const API = import.meta.env.VITE_API_URL;

const NoticeDepAndDirectorate = () => {
  const { isHindi } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("directorate");
  const [directorateList, setDirectorateList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [directorateRes, departmentRes] = await Promise.all([
          axios.get(`${API}/api/get-directorate-notice-for-user`),
          axios.get(`${API}/api/get-department-notice-for-user`),
        ]);

        if (isMounted) {
          if (directorateRes?.data?.success) {
            setDirectorateList(directorateRes.data.data || []);
          }
          if (departmentRes?.data?.success) {
            setDepartmentList(departmentRes.data.data || []);
          }
        }
      } catch (error) {
        console.error("Error fetching notices:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(isHindi ? "hi-IN" : "en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isRecentNotice = (date) => {
    if (!date) return false;
    const diffDays = (new Date() - new Date(date)) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  const combinedNotices = useMemo(() => {
    const dList = directorateList.map((item) => ({ ...item, sourceType: "directorate" }));
    const mList = departmentList.map((item) => ({ ...item, sourceType: "department" }));

    let current = [];
    if (activeTab === "directorate") {
      current = dList;
    } else if (activeTab === "department") {
      current = mList;
    } else {
      current = [...dList, ...mList].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    if (!searchQuery.trim()) return current.slice(0, 6);

    const q = searchQuery.toLowerCase().trim();
    return current
      .filter((item) => {
        const titleH = (item.titleHi || "").toLowerCase();
        const titleE = (item.titleEn || "").toLowerCase();
        const catH = (item.categoryId?.categoryNameHi || "").toLowerCase();
        const catE = (item.categoryId?.categoryNameEn || "").toLowerCase();
        return (
          titleH.includes(q) ||
          titleE.includes(q) ||
          catH.includes(q) ||
          catE.includes(q)
        );
      })
      .slice(0, 8);
  }, [activeTab, directorateList, departmentList, searchQuery]);

  const handleNoticeClick = (item) => {
    const route =
      item.sourceType === "directorate"
        ? `/directorate-notice/${item.slug}`
        : `/department-notice/${item.slug}`;
    navigate(route);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  const handleViewAllClick = () => {
    if (activeTab === "department") {
      navigate("/departments-notices");
    } else {
      navigate("/directorate-notices");
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  if (loading) {
    return (
      <section aria-labelledby="official-notices-heading" className="py-2.5 py-md-3">
        <Container>
          <Card className="pro-notice-section-card border-0">
            <div className="pro-notice-header">
              <div className="d-flex align-items-center gap-3">
                <div className="pro-notice-header-icon">
                  <FaBullhorn size={18} color="#fff" />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-white" style={{ fontSize: "1.05rem", letterSpacing: "-0.2px" }}>
                    {isHindi ? "आधिकारिक सूचनाएं एवं परिपत्र" : "Official Notices & Circulars"}
                  </h5>
                  <p className="text-white-50 mb-0 mt-0.5" style={{ fontSize: "12px" }}>
                    {isHindi
                      ? "उच्च शिक्षा संचालनालय (इंद्रावती भवन) एवं मंत्रालय (महानदी भवन)"
                      : "Directorate of Higher Education (Indravati) & Ministry (Mahanadi)"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <PageLoader inline={true} text={isHindi ? "सूचनाएं लोड हो रही हैं..." : "Loading official notices..."} />
            </div>
          </Card>
        </Container>
      </section>
    );
  }

  return (
    <section aria-labelledby="official-notices-heading" className="py-2.5 py-md-3">
      <Container>
        <Card className="pro-notice-section-card border-0">
          <div className="pro-notice-header d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2.5 gap-lg-3">
            <div className="d-flex align-items-center justify-content-between w-100 w-lg-auto">
              <div className="d-flex align-items-center gap-2.5 gap-md-3">
                <div className="pro-notice-header-icon">
                  {activeTab === "department" ? (
                    <FaBuilding size={18} color="#fff" />
                  ) : activeTab === "all" ? (
                    <FaLayerGroup size={18} color="#fff" />
                  ) : (
                    <FaBullhorn size={18} color="#fff" />
                  )}
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h5 className="fw-bold mb-0 text-white" style={{ fontSize: "1.05rem", letterSpacing: "-0.2px" }}>
                      {isHindi ? "आधिकारिक सूचनाएं एवं परिपत्र" : "Official Notices & Circulars"}
                    </h5>
                    <Badge color="light" pill className="text-dark fw-bold px-2 py-0.5 d-none d-md-inline-block" style={{ fontSize: "10px" }}>
                      {isHindi ? "अद्यतन" : "LIVE"}
                    </Badge>
                  </div>
                  <p className="text-white-50 mb-0 mt-0.5 d-none d-sm-block" style={{ fontSize: "12px" }}>
                    {isHindi
                      ? "उच्च शिक्षा संचालनालय (इंद्रावती भवन) एवं मंत्रालय (महानदी भवन)"
                      : "Directorate of Higher Education (Indravati) & Ministry (Mahanadi)"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="gov-card-header-btn border-0 text-nowrap d-inline-flex d-lg-none"
                onClick={handleViewAllClick}
                title={isHindi ? "सभी सूचनाएं देखें" : "View Full Archive"}
              >
                <FaArchive size={11} />
                <span>{isHindi ? "अभिलेखागार" : "Archive"}</span>
                <FaChevronRight size={9} />
              </button>
            </div>

            <div className="d-flex align-items-center gap-2.5 w-100 w-lg-auto">
              <div className="pro-notice-tab-container w-100 w-lg-auto flex-grow-1 flex-lg-grow-0">
                <button
                  type="button"
                  className={`pro-notice-tab-btn tab-directorate ${activeTab === "directorate" ? "active" : ""}`}
                  onClick={() => setActiveTab("directorate")}
                  title={isHindi ? "संचालनालय सूचनाएं" : "Directorate Notices"}
                >
                  <FaBuilding size={11} className="opacity-75 flex-shrink-0" />
                  <span>{isHindi ? "संचालनालय" : "Directorate"}</span>
                  <span className="d-none d-xl-inline opacity-75">{isHindi ? " (इंद्रावती)" : " (Indravati)"}</span>
                  <span className="pro-notice-tab-badge">
                    {directorateList.length}
                  </span>
                </button>

                <button
                  type="button"
                  className={`pro-notice-tab-btn tab-department ${activeTab === "department" ? "active" : ""}`}
                  onClick={() => setActiveTab("department")}
                  title={isHindi ? "विभाग सूचनाएं" : "Department Notices"}
                >
                  <FaBuilding size={11} className="opacity-75 flex-shrink-0" />
                  <span>{isHindi ? "विभाग" : "Department"}</span>
                  <span className="d-none d-xl-inline opacity-75">{isHindi ? " (महानदी)" : " (Mahanadi)"}</span>
                  <span className="pro-notice-tab-badge">
                    {departmentList.length}
                  </span>
                </button>

                <button
                  type="button"
                  className={`pro-notice-tab-btn tab-all ${activeTab === "all" ? "active" : ""}`}
                  onClick={() => setActiveTab("all")}
                  title={isHindi ? "सभी सूचनाएं" : "All Notices"}
                >
                  <FaLayerGroup size={11} className="opacity-75 flex-shrink-0" />
                  <span>{isHindi ? "सभी" : "All"}</span>
                  <span className="pro-notice-tab-badge">
                    {directorateList.length + departmentList.length}
                  </span>
                </button>
              </div>

              <button
                type="button"
                className="gov-card-header-btn border-0 text-nowrap d-none d-lg-inline-flex"
                onClick={handleViewAllClick}
                title={isHindi ? "सभी सूचनाएं देखें" : "View Full Archive"}
              >
                <FaArchive size={11} />
                <span>{isHindi ? "अभिलेखागार" : "Archive"}</span>
                <FaChevronRight size={9} />
              </button>
            </div>
          </div>

          <div className="pro-notice-substrip">
            <Row className="align-items-center g-2.5">
              <Col xs={12} md={7}>
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <span
                    className="badge rounded-pill fw-bold text-white px-2.5 py-1 shadow-xs"
                    style={{
                      fontSize: "11px",
                      background:
                        activeTab === "department"
                          ? "linear-gradient(135deg, #065f46 0%, #059669 100%)"
                          : activeTab === "all"
                            ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
                            : "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
                    }}
                  >
                    {activeTab === "department"
                      ? isHindi
                        ? "मंत्रालय (महानदी भवन)"
                        : "Ministry (Mahanadi Bhavan)"
                      : activeTab === "all"
                        ? isHindi
                          ? "समग्र सूचनाएं"
                          : "Combined Notices"
                        : isHindi
                          ? "संचालनालय (इंद्रावती भवन)"
                          : "Directorate (Indravati Bhavan)"}
                  </span>

                  <div className="d-flex align-items-center gap-1.5 text-muted" style={{ fontSize: "11.5px" }}>
                    <FaMapMarkerAlt
                      size={12}
                      style={{
                        color:
                          activeTab === "department"
                            ? "#059669"
                            : activeTab === "all"
                              ? "#64748b"
                              : "#2563eb",
                        flexShrink: 0,
                      }}
                    />
                    <span>
                      {activeTab === "department"
                        ? isHindi
                          ? "महानदी भवन, नया रायपुर"
                          : "Mahanadi Bhavan, New Raipur"
                        : activeTab === "all"
                          ? isHindi
                            ? "नवा रायपुर अटल नगर, छत्तीसगढ़"
                            : "Nava Raipur Atal Nagar, CG"
                          : isHindi
                            ? "इंद्रावती भवन, नया रायपुर"
                            : "Indravati Bhavan, New Raipur"}
                      <span className="d-none d-lg-inline">
                        {activeTab === "department"
                          ? isHindi ? ", प्रथम तल - 492002" : ", First Floor - 492002"
                          : activeTab === "all"
                            ? " - 492002"
                            : isHindi ? ", ब्लॉक-03, तृतीय तल - 492002" : ", Block-03, Third Floor - 492002"}
                      </span>
                    </span>
                  </div>
                </div>
              </Col>

              <Col xs={12} md={5} lg={4} className="mt-1 mt-md-0">
                <InputGroup size="sm" className="shadow-xs rounded-pill overflow-hidden bg-white border">
                  <InputGroupText className="bg-transparent border-0 pe-1 text-muted">
                    <FaSearch size={11} />
                  </InputGroupText>
                  <Input
                    type="text"
                    placeholder={
                      isHindi
                        ? "सूचना का शीर्षक खोजें..."
                        : "Search notices by keyword..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 shadow-none ps-1 py-1"
                    style={{ fontSize: "12px" }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-muted p-0 pe-2 text-decoration-none"
                      onClick={() => setSearchQuery("")}
                      style={{ fontSize: "11px" }}
                    >
                      ✕
                    </button>
                  )}
                </InputGroup>
              </Col>
            </Row>
          </div>

          <CardBody className="p-3 p-md-4" style={{ background: "#fbfcfe" }}>
            {combinedNotices.length === 0 ? (
              <div className="text-center py-5">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center bg-light text-muted mb-2.5 shadow-xs"
                  style={{ width: 56, height: 56 }}
                >
                  <FaBell size={22} className="opacity-50" />
                </div>
                <h6 className="fw-bold text-dark mb-1">
                  {isHindi ? "कोई सूचना उपलब्ध नहीं है" : "No Notices Found"}
                </h6>
                <p className="text-muted small mb-0">
                  {searchQuery
                    ? isHindi
                      ? `"${searchQuery}" से संबंधित कोई सूचना नहीं मिली।`
                      : `No notices matching "${searchQuery}".`
                    : isHindi
                      ? "इस श्रेणी में वर्तमान में कोई सक्रिय सूचना उपलब्ध नहीं है।"
                      : "Currently there are no active notices published under this category."}
                </p>
              </div>
            ) : (
              <div className="pro-notice-grid">
                {combinedNotices.map((item) => {
                  const isDirectorate = item.sourceType === "directorate";
                  const catName = isHindi
                    ? item.categoryId?.categoryNameHi || item.categoryId?.categoryNameEn || "सूचना"
                    : item.categoryId?.categoryNameEn || "Notice";
                  const title = isHindi ? item.titleHi || item.titleEn : item.titleEn || item.titleHi;
                  const isRecent = isRecentNotice(item.createdAt);

                  return (
                    <article
                      key={item._id}
                      className={`pro-notice-card ${isDirectorate ? "directorate-card" : "department-card"
                        }`}
                      onClick={() => handleNoticeClick(item)}
                      role="button"
                      tabIndex={0}
                      aria-label={title}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleNoticeClick(item);
                        }
                      }}
                    >
                      <div>
                        <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span
                              className="badge rounded-pill fw-semibold d-inline-flex align-items-center gap-1 shadow-2xs"
                              style={{
                                fontSize: "10.5px",
                                padding: "3.5px 9px",
                                backgroundColor: isDirectorate ? "#eff6ff" : "#f0fdf4",
                                color: isDirectorate ? "#1d4ed8" : "#047857",
                                border: `1px solid ${isDirectorate ? "#bfdbfe" : "#bbf7d0"}`,
                              }}
                            >
                              <FaBuilding size={9.5} />
                              <span>
                                {isDirectorate
                                  ? isHindi
                                    ? "संचालनालय"
                                    : "Directorate"
                                  : isHindi
                                    ? "विभाग"
                                    : "Department"}
                              </span>
                            </span>

                            <span
                              className="badge rounded-pill fw-semibold shadow-2xs"
                              style={{
                                fontSize: "10.5px",
                                padding: "3.5px 9px",
                                backgroundColor: isDirectorate ? "#f8fafc" : "#f8fafc",
                                color: isDirectorate ? "#0f2b60" : "#064e3b",
                                border: "1px solid #cbd5e1",
                              }}
                            >
                              {catName}
                            </span>

                            {isRecent && (
                              <span
                                className="pro-pulse-badge badge bg-danger text-white rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1.5 shadow-2xs"
                                style={{ fontSize: "10px", letterSpacing: "0.25px", fontWeight: 700 }}
                              >
                                <span
                                  className="d-inline-block rounded-circle bg-white"
                                  style={{ width: 5, height: 5 }}
                                />
                                <span>{isHindi ? "नवीन" : "UPDATE"}</span>
                              </span>
                            )}
                          </div>

                          {/* Date & Time */}
                          <small
                            className="text-muted d-flex align-items-center gap-1.5 text-nowrap flex-shrink-0"
                            style={{ fontSize: "11px" }}
                          >
                            <FaCalendarAlt size={10.5} className="text-muted opacity-75" />
                            <span>{formatDateTime(item.createdAt)}</span>
                          </small>
                        </div>

                        {/* Middle: Notice Title */}
                        <h6
                          className="fw-bold text-dark mb-2"
                          style={{
                            fontSize: "0.9rem",
                            lineHeight: "1.45",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                          title={title}
                        >
                          {title}
                        </h6>
                      </div>

                      {/* Bottom: Read Details Link & Interactive Arrow */}
                      <div className="d-flex align-items-center justify-content-between pt-2 mt-1 border-top border-light">
                        <span
                          className="text-muted fw-semibold d-flex align-items-center gap-1"
                          style={{ fontSize: "11.5px" }}
                        >
                          <span>{isHindi ? "विवरण देखें" : "View Notice Details"}</span>
                        </span>

                        <div className="pro-notice-arrow shadow-2xs">
                          <FaChevronRight size={10} />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CardBody>

          <div
            className="px-3 px-md-4 py-3 d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 border-top"
            style={{ background: "#f8fafc" }}
          >
            <div className="d-flex flex-wrap align-items-center gap-2 text-muted" style={{ fontSize: "12px" }}>
              <span className="fw-semibold text-dark text-nowrap">
                {isHindi ? "कुल उपलब्ध सूचनाएं:" : "Total Notices:"}
              </span>
              <div className="d-inline-flex align-items-center gap-2 flex-nowrap">
                <Badge color="primary" pill className="px-2.5 py-1 text-nowrap" style={{ fontSize: "10.5px" }}>
                  {isHindi
                    ? `संचालनालय: ${directorateList.length}`
                    : `Directorate: ${directorateList.length}`}
                </Badge>
                <Badge color="success" pill className="px-2.5 py-1 text-nowrap" style={{ fontSize: "10.5px" }}>
                  {isHindi
                    ? `विभाग: ${departmentList.length}`
                    : `Department: ${departmentList.length}`}
                </Badge>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap w-100 w-md-auto justify-content-start justify-content-md-end">
              <button
                type="button"
                onClick={() => {
                  navigate("/directorate-notices");
                  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                }}
                className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center justify-content-center gap-2 shadow-xs flex-grow-1 flex-md-grow-0 text-nowrap"
                style={{ fontSize: "12px" }}
              >
                <span>{isHindi ? "संचालनालय अभिलेखागार" : "Directorate Archive"}</span>
                <FaExternalLinkAlt size={10} />
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate("/departments-notices");
                  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                }}
                className="btn btn-sm btn-outline-success rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center justify-content-center gap-2 shadow-xs flex-grow-1 flex-md-grow-0 text-nowrap"
                style={{ fontSize: "12px" }}
              >
                <span>{isHindi ? "विभाग अभिलेखागार" : "Department Archive"}</span>
                <FaExternalLinkAlt size={10} />
              </button>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
};

export default NoticeDepAndDirectorate;