import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Container, Row, Col, Card, CardBody, Spinner, Badge
} from "reactstrap";
import {
    FaUserGraduate, FaMoneyBillWave, FaBook,
    FaClipboardList, FaBookReader, FaExclamationCircle
} from "react-icons/fa";

const QUICK_LINKS = [
    { id: 1, titleEn: "Admissions", titleHi: "प्रवेश", link: "/admissions", Icon: FaUserGraduate },
    { id: 2, titleEn: "Scholarships", titleHi: "छात्रवृत्ति", link: "/schemes/scholarship", Icon: FaMoneyBillWave },
    { id: 3, titleEn: "Syllabus", titleHi: "पाठ्यक्रम", link: "/academics/syllabus", Icon: FaBook },
    { id: 4, titleEn: "Examinations", titleHi: "परीक्षाएं", link: "/academics/examinations", Icon: FaClipboardList },
    { id: 5, titleEn: "E-Library", titleHi: "ई-पुस्तकालय", link: "/resources/e-library", Icon: FaBookReader },
    { id: 6, titleEn: "Grievances", titleHi: "शिकायतें", link: "/services/grievances", Icon: FaExclamationCircle },
];

const QuickAccess = ({ isHindi }) => {
    const [loading, setLoading] = useState(true);
    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 400);
        return () => clearTimeout(t);
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center py-5">
                <Spinner color="primary" />
            </div>
        );
    }

    return (
        <>

            <style>{`
        .qa-card { transition: transform .2s ease, box-shadow .2s ease; }
        .qa-card:hover { transform: translateY(-6px); }
        .qa-icon-circle { transition: background .2s ease, color .2s ease; }
        .qa-icon-circle svg { transition: color .2s ease; }
      `}</style>

            <section


            >
                <Container className="bg-white rounded my-2 py-3 shadow">

                    {/* Header */}
                    <div className=" text-dark">
                        <h2 className="fw-bold  mb-0" style={{ fontSize: "28px" }}>
                            {isHindi ? "त्वरित लिंक" : "Quick Access"}
                        </h2>
                        <hr className="p-0 m-0" />
                        <div
                            className="mx-auto mt-2"
                            style={{
                                width: "44px",
                                height: "3px",
                                background: "rgba(255,255,255,0.7)",
                                borderRadius: "3px",
                            }}
                        />
                    </div>

                    {/* Cards */}
                    <Row className="g-3 justify-content-center">
                        {QUICK_LINKS.map(({ id, titleEn, titleHi, link, Icon }) => {
                            const isHov = hovered === id;
                            return (
                                <Col key={id} xs={6} sm={4} md={2}>
                                    <Link to={link} className="text-decoration-none">
                                        <Card
                                            className={`qa-card border-0 h-100 ${isHov ? "shadow" : "shadow-sm"}`}
                                            style={{ borderRadius: "16px", cursor: "pointer" }}
                                            onMouseEnter={() => setHovered(id)}
                                            onMouseLeave={() => setHovered(null)}
                                        >
                                            <CardBody className="text-center py-4 px-2">

                                                {/* Icon circle */}
                                                <div
                                                    className="qa-icon-circle mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                                                    style={{
                                                        width: "62px",
                                                        height: "62px",
                                                        background: isHov ? "#0d6efd" : "#eef2ff",
                                                    }}
                                                >
                                                    <Icon
                                                        style={{
                                                            fontSize: "22px",
                                                            color: isHov ? "#fff" : "#0d6efd",
                                                        }}
                                                    />
                                                </div>

                                                {/* Primary label */}
                                                <p
                                                    className="mb-1 fw-semibold"
                                                    style={{ fontSize: "13.5px", color: "#1a1d2e" }}
                                                >
                                                    {isHindi ? titleHi : titleEn}
                                                </p>

                                                {/* Secondary label */}
                                                <p
                                                    className="mb-0"
                                                    style={{ fontSize: "11.5px", color: "#9ca3af" }}
                                                >
                                                    {isHindi ? titleEn : titleHi}
                                                </p>

                                            </CardBody>
                                        </Card>
                                    </Link>
                                </Col>
                            );
                        })}
                    </Row>

                </Container>
            </section>
        </>
    );
};

export default QuickAccess;