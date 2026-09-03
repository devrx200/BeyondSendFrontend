import React, { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    CardTitle,
    Spinner,
    Badge,
    Container,
    Row,
    Col,
} from "reactstrap";
import axios from "axios";
import {
    FaCalendarAlt,
    FaBuilding,
    FaArchive,
    FaMapMarkerAlt,
    FaChevronRight,
    FaBell,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const NoticeDepAndDirectorate = () => {
    const { isHindi } = useLanguage();
    const navigate = useNavigate();

    const [directorateList, setDirectorateList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [directorateRes, departmentRes] = await Promise.all([
                    axios.get(`${API}/api/get-directorate-notice-for-user`),
                    axios.get(`${API}/api/get-department-notice-for-user`),
                ]);

                if (directorateRes?.data?.success) {
                    setDirectorateList((directorateRes.data.data || []).slice(0, 5));
                }

                if (departmentRes?.data?.success) {
                    setDepartmentList((departmentRes.data.data || []).slice(0, 5));
                }

            } catch (error) {
                console.error("Error fetching notices:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    /* ─── Helpers ─── */
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
    const renderNotices = (list, type) => {
        if (!list || list.length === 0) {
            return (
                <Card className="border-0 text-center py-4" style={{ background: "transparent" }}>
                    <CardBody>
                        <FaBell size={28} className="text-muted mb-2 opacity-50" />
                        <p className="text-muted small mb-0">
                            {isHindi ? "कोई सूचना उपलब्ध नहीं है" : "No notices available"}
                        </p>
                    </CardBody>
                </Card>
            );
        }

        return list.map((item) => (
            <Card
                key={item._id}
                className={`notice-item-card ${type === "directorate" ? "directorate-card" : "department-card"} mb-2`}
                onClick={() => {
                    navigate(
                        type === "directorate"
                            ? `/directorate-notice/${item.slug}`
                            : `/department-notice/${item.slug}`
                    );
                    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                }}
            >
                <CardBody className="py-2 px-3">
                    {/* Top row: badge + date */}
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <Badge
                            color={type === "directorate" ? "primary" : "success"}
                            pill
                            style={{ fontSize: "0.52rem", letterSpacing: "0.03em" }}
                        >
                            {type === "directorate"
                                ? isHindi ? item.categoryId.categoryNameHi : item.categoryId.categoryNameEn
                                : isHindi ? item.categoryId.categoryNameHi : item.categoryId.categoryNameEn}
                        </Badge>

                        <small
                            className="text-muted d-flex align-items-center gap-1"
                            style={{ fontSize: "0.68rem" }}
                        >
                            <FaCalendarAlt size={10} />
                            {formatDateTime(item.createdAt)}
                        </small>
                    </div>

                    {/* Title row */}
                    <div className="d-flex align-items-start justify-content-between gap-2">
                        <CardTitle
                            tag="h6"
                            className="fw-semibold mb-0 text-black"
                            style={{ fontSize: "0.8rem", lineHeight: "1.4" }}
                        >
                            {isHindi ? item.titleHi : item.titleEn}
                        </CardTitle>
                        <FaChevronRight
                            size={10}
                            className={`notice-card-arrow ${type === "directorate" ? "text-primary" : "text-success"} mt-1 flex-shrink-0`}
                        />
                    </div>
                </CardBody>
            </Card>
        ));
    };

    /* ─── Loading state ─── */
    if (loading) {
        return (
            <Container className="py-5">
                <Card className="border-0 shadow-sm mx-auto" style={{ maxWidth: 340, borderRadius: 16 }}>
                    <CardBody className="text-center py-5">
                        <Spinner color="primary" />
                        <p className="text-muted mt-3 mb-0 small">
                            {isHindi ? "लोड हो रहा है..." : "Loading..."}
                        </p>
                    </CardBody>
                </Card>
            </Container>
        );
    }

    /* ─── Main render ─── */
    return (
        <Container className="py-4">
            <Row className="g-4">

                {/* ══════════════ DIRECTORATE CARD ══════════════ */}
                <Col lg={6}>
                    <Card
                        className="border-0 shadow h-100"
                        style={{ borderRadius: 20, overflow: "hidden" }}
                    >
                        {/* ── Header ── */}
                        <div
                            className="px-4 pt-4 pb-3"
                            style={{
                                background: "linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 60%, #1565c0 100%)",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            {/* decorative circles using inline style only */}
                            <div
                                style={{
                                    position: "absolute", top: -28, right: -28,
                                    width: 100, height: 100,
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.06)",
                                    pointerEvents: "none",
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute", bottom: -36, right: 64,
                                    width: 72, height: 72,
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.04)",
                                    pointerEvents: "none",
                                }}
                            />

                            <div className="d-flex align-items-center justify-content-between gap-2">
                                {/* Left: icon + title */}
                                <div className="d-flex align-items-center gap-3">
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            width: 42, height: 42,
                                            borderRadius: 12,
                                            background: "rgba(255,255,255,0.15)",
                                            border: "1px solid rgba(255,255,255,0.22)",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <FaBuilding color="#fff" size={17} />
                                    </div>
                                    <div>
                                        <h6
                                            className="fw-semibold mb-0 text-white"
                                            style={{ fontSize: "0.9rem", fontFamily: "'Georgia', serif" }}
                                        >
                                            {isHindi
                                                ? "संचालनालय (इंद्रावती भवन) सूचनाए"
                                                : "Directorate (Indravati Bhavan) Notices"}
                                        </h6>

                                    </div>
                                </div>

                                {/* Right: View All */}
                                <div
                                    className="d-flex align-items-center gap-2 text-white"
                                    style={{
                                        background: "rgba(255,255,255,0.15)",
                                        border: "1px solid rgba(255,255,255,0.28)",
                                        borderRadius: 20,
                                        padding: "6px 13px",
                                        fontSize: "0.74rem",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                        whiteSpace: "nowrap",
                                        flexShrink: 0,
                                        userSelect: "none",
                                    }}
                                    onClick={() => {
                                        navigate("/directorate-notices");
                                        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                                    }}
                                >
                                    <FaArchive size={11} />
                                    {isHindi ? "सभी देखें" : "View All"}
                                </div>
                            </div>
                        </div>

                        {/* ── Address strip ── */}
                        <div
                            className="d-flex align-items-center gap-2 px-3 py-2"
                            style={{ background: "#eef2ff", borderBottom: "1px solid #dde4f7" }}
                        >
                            <FaMapMarkerAlt size={11} color="#7a8fc4" style={{ flexShrink: 0 }} />
                            <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                                {isHindi
                                    ? "ब्लॉक-03, तृतीय तल, इंद्रावती भवन, नवा रायपुर अटल नगर, छ.ग, 492002"
                                    : "Block-03, Third Floor, Indravati Bhavan, New Raipur, Chhattisgarh, 492002"}
                            </small>
                        </div>

                        {/* ── Notice list ── */}
                        <CardBody
                            className="px-3 pt-3 pb-2"
                            style={{ background: "#f8faff", overflowY: "auto" }}
                        >
                            {renderNotices(directorateList, "directorate")}
                        </CardBody>
                    </Card>
                </Col>

                {/* ══════════════ DEPARTMENT CARD ══════════════ */}
                <Col lg={6}>
                    <Card
                        className="border-0 shadow h-100"
                        style={{ borderRadius: 20, overflow: "hidden" }}
                    >
                        {/* ── Header ── */}
                        <div
                            className="px-4 pt-4 pb-3"
                            style={{
                                background: "linear-gradient(135deg, #0a3d1f 0%, #1a6b3a 60%, #2e8b57 100%)",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute", top: -28, right: -28,
                                    width: 100, height: 100,
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.06)",
                                    pointerEvents: "none",
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute", bottom: -36, right: 64,
                                    width: 72, height: 72,
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.04)",
                                    pointerEvents: "none",
                                }}
                            />

                            <div className="d-flex align-items-center justify-content-between gap-2">
                                {/* Left: icon + title */}
                                <div className="d-flex align-items-center gap-3">
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            width: 42, height: 42,
                                            borderRadius: 12,
                                            background: "rgba(255,255,255,0.15)",
                                            border: "1px solid rgba(255,255,255,0.22)",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <FaBuilding color="#fff" size={17} />
                                    </div>
                                    <div>
                                        <h6
                                            className="fw-semibold mb-0 text-white"
                                            style={{ fontSize: "0.9rem", fontFamily: "'Georgia', serif" }}
                                        >
                                            {isHindi
                                                ? "विभाग (महानदी भवन) सूचनाए"
                                                : "Department (Mahanadi Bhavan) Notices"}
                                        </h6>

                                    </div>
                                </div>

                                {/* Right: View All */}
                                <div
                                    className="d-flex align-items-center gap-2 text-white"
                                    style={{
                                        background: "rgba(255,255,255,0.15)",
                                        border: "1px solid rgba(255,255,255,0.28)",
                                        borderRadius: 20,
                                        padding: "6px 13px",
                                        fontSize: "0.74rem",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                        whiteSpace: "nowrap",
                                        flexShrink: 0,
                                        userSelect: "none",
                                    }}
                                    onClick={() => {
                                        navigate("/departments-notices");
                                        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                                    }}
                                >
                                    <FaArchive size={11} />
                                    {isHindi ? "सभी देखें" : "View All"}
                                </div>
                            </div>
                        </div>

                        {/* ── Address strip ── */}
                        <div
                            className="d-flex align-items-center gap-2 px-3 py-2"
                            style={{ background: "#eef8f2", borderBottom: "1px solid #d3ead9" }}
                        >
                            <FaMapMarkerAlt size={11} color="#4a9b6a" style={{ flexShrink: 0 }} />
                            <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                                {isHindi
                                    ? "प्रथम तल, महानदी भवन, नवा रायपुर अटल नगर, छ.ग, 492002"
                                    : "First floor, Mahanadi Bhawan, Nava Raipur Atal Nagar, Chhattisgarh, 492002"}
                            </small>
                        </div>

                        {/* ── Notice list ── */}
                        <CardBody
                            className="px-3 pt-3 pb-2"
                            style={{ background: "#f6fbf8", overflowY: "auto" }}
                        >
                            {renderNotices(departmentList, "department")}
                        </CardBody>
                    </Card>
                </Col>

            </Row>
        </Container>
    );
};

export default NoticeDepAndDirectorate;