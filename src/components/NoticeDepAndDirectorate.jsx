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
import { FaCalendarAlt, FaBuilding } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL;

const DUMMY_NOTICE_DATA = {
    mahanadi: [
        {
            id: "m1",
            titleEng:
                "Administrative instructions for offices operating in Mahanadi Bhavan",
            titleHin:
                "महानदी भवन में संचालित कार्यालयों हेतु प्रशासनिक निर्देश।",
        },
    ],
    indravati: [
        {
            id: "i1",
            titleEng:
                "New orders for offices functioning in Indravati Bhavan",
            titleHin:
                "इंद्रावती भवन में संचालित कार्यालयों हेतु नवीन आदेश।",
        },
    ],
};

const NoticeDepAndDirectorate = () => {
    const { isHindi } = useLanguage(); // ✅ SINGLE SOURCE
    const [data, setData] = useState(DUMMY_NOTICE_DATA);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(`${API}/api/notice-tabs`);
                setData(res?.data?.data || DUMMY_NOTICE_DATA);
            } catch {
                setData(DUMMY_NOTICE_DATA);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const renderNotices = (list, type) => {
        if (!list || list.length === 0) {
            return (
                <p className="text-muted small mb-0">
                    {isHindi ? "कोई सूचना उपलब्ध नहीं है" : "No notices available"}
                </p>
            );
        }

        return list.map((item) => (
            <Card
                key={item.id}
                className="mb-2 border-0 shadow-sm hover-shadow"
            >
                <CardBody className="py-2 px-3">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                        <Badge
                            color={type === "directorate" ? "primary" : "success"}
                            pill
                            style={{ fontSize: "0.65rem" }}
                        >
                            {type === "directorate"
                                ? isHindi ? "निर्देशालय" : "Directorate"
                                : isHindi ? "विभाग" : "Department"}
                        </Badge>

                        <small className="text-muted d-flex align-items-center" style={{ fontSize: "0.7rem" }}>
                            <FaCalendarAlt className="me-1" />
                            {new Date().toLocaleDateString(
                                isHindi ? "hi-IN" : "en-IN",
                                { day: "numeric", month: "short", year: "numeric" }
                            )}
                        </small>
                    </div>

                    <CardTitle
                        tag="h6"
                        className="fw-semibold mb-0"
                        style={{ fontSize: "0.85rem" }}
                    >
                        {isHindi ? item.titleHin : item.titleEng}
                    </CardTitle>
                </CardBody>
            </Card>
        ));
    };

    return (
        <Container className="py-4">
            {loading ? (
                <Card className="border-0 shadow-sm">
                    <CardBody className="text-center py-4">
                        <Spinner size="sm" color="primary" />
                        <p className="text-muted mt-2 mb-0" style={{ fontSize: "0.85rem" }}>
                            {isHindi ? "लोड हो रहा है..." : "Loading..."}
                        </p>
                    </CardBody>
                </Card>
            ) : (
                <Row className="g-4">
                    {/* DIRECTORATE */}
                    <Col lg={6}>
                        <Card className="border-0 shadow-sm h-100">
                            <CardBody className="bg-light">
                                <div className="d-flex align-items-center bg-black p-3  mb-2 rounded-top">
                                    <FaBuilding className="text-white me-2" />
                                    <h6 className="fw-bold mb-0 text-white">
                                        {isHindi
                                            ? "संचालनालय (इंद्रावती भवन)"
                                            : "Directorate (Indravati Bhavan)"}
                                    </h6>
                                </div>
                                <hr className="p-0 m-0" />
                                <small className="text-muted ms-2">
                                    {isHindi ? "ब्लॉक-03, तृतीय तल, इंद्रावती भवन, नवा रायपुर अटल नगर, छ.ग, 492002" : " Block-03, Third Floor, Indravati Bhavan, New Raipur, Chhattisgarh, 492002 "}
                                </small>
                                <hr className="p-0 m-0" />
                                <br />

                                {renderNotices(data.indravati, "directorate")}
                            </CardBody>
                        </Card>
                    </Col>

                    {/* DEPARTMENT */}
                    <Col lg={6}>
                        <Card className="border-0 shadow-sm h-100">
                            <CardBody className="bg-light">
                                <div className="d-flex align-items-center mb-2 bg-success  p-3 rounded-top">
                                    <FaBuilding className="text-white me-2" />
                                    <h6 className="fw-bold mb-0 text-white">
                                        {isHindi
                                            ? "विभाग (महानदी भवन)"
                                            : "Department (Mahanadi Bhavan)"}
                                    </h6>
                                </div>
                                <hr className="p-0 m-0" />
                              <small className="text-muted ms-2">
                                    {isHindi ? " प्रथम तल,  महानदी भवन, नवा रायपुर अटल नगर, छ.ग, 492002" : " First floor, Mahanadi Bhawan, Nava Raipur Atal Nagar, Chhattisgarh, 492002"}
                                </small>
                                <hr className="p-0 m-0" />
                                <br />
                                {renderNotices(data.mahanadi, "department")}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Hover */}
            <style jsx>{`
        .hover-shadow {
          transition: all 0.25s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-1px);
          box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.12) !important;
        }
      `}</style>
        </Container>
    );
};

export default NoticeDepAndDirectorate;
