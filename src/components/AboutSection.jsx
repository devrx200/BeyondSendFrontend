import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card, CardImg, CardBody } from "reactstrap";

const AboutSection = () => {
    const profiles = [
        {
            id: 1,
            name: "श्री विष्णु देव साय",
            title: "मान. मुख्यमंत्री",
            image: "https://placehold.co/400x500/ff9966/white?text=CM+Image",
        },
        {
            id: 2,
            name: "श्री राम विचार नेताम",
            title: "मान. शिक्षा मंत्री",
            image: "https://placehold.co/400x500/003366/white?text=Minister+Image",
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % profiles.length);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const currentProfile = profiles[currentIndex];

    return (
        <section className="py-3 bg-white">
            <Container>
                <Row className="align-items-start">
                    {/* LEFT CONTENT */}
                    <Col lg="8" md="12">
                        <h4 className="mb-4 text-secondary">हमारे बारे में</h4>

                        {[
                            "छत्तीसगढ़ राज्य में उच्च शिक्षा विभाग उत्कृष्टता को केन्द्र में रखकर, विश्वविद्यालयों एवं महाविद्यालयों का विस्तार करते हुये",
                            "उच्च शिक्षा की सुविधा अधिकाधिक युवाओं तक पहुँचाने के लिये दृढप्रतिज्ञ है। इस उद्देश्य की पूर्ति के लिये 9 शासकीय विश्वविद्यालय,",
                            "15 निजी विश्वविद्यालय, 335 शासकीय महाविद्यालय, 12 अनुदान प्राप्त अशासकीय महाविद्यालय तथा 256 अनुदान अप्राप्त अशासकीय",
                            "महाविद्यालयों के माध्यम से निरंतर प्रयासरत है।",
                        ].map((text, i) => (
                            <div key={i} className={i < 3 ? "border-bottom pb-3 mb-3" : "pb-3"}>
                                <p className="mb-0 text-secondary">{text}</p>
                            </div>
                        ))}
                        <Button
                            tag={Link}
                            to="/about"
                            className="rounded-0 px-4 mt-2"
                            style={{
                                backgroundColor: "#E65100",
                                borderColor: "#E65100",
                                color: "#fff",
                                fontSize: "0.9rem"
                            }}
                        >
                            और अधिक पढ़ें
                        </Button>
                    </Col>

                    {/* RIGHT PROFILE CARD */}
                    <Col lg="4" md="8" className="mt-4 mt-lg-0 mx-auto">
                        <Card className="border-0 shadow-sm rounded-0">
                            <div style={{ overflow: "hidden" }}>
                                <CardImg
                                    top
                                    src={currentProfile.image}
                                    alt={currentProfile.name}
                                    className="rounded-0"
                                    style={{
                                        height: "300px",     // ✅ FIXED SIZE
                                        width: "100%",
                                        objectFit: "cover",  // ✅ Prevent stretch
                                        transition: "opacity 0.5s ease-in-out",
                                    }}
                                />
                            </div>

                            <CardBody
                                className="text-center p-2 rounded-0"
                                style={{ backgroundColor: "#003f6b" }}
                            >
                                <h6 className="mb-0 text-white fw-bold">
                                    {currentProfile.name}
                                </h6>
                                <small className="text-white-50">
                                    {currentProfile.title}
                                </small>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default AboutSection;
