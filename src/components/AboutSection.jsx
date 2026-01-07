import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Button,
    Card,
    CardImg,
    CardBody,
} from "reactstrap";
import { useLanguage } from "../contexts/LanguageContext";
const AboutSection = () => {
    const [profiles, setProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
const { isHindi } = useLanguage();
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                setLoading(true);
                const res = await axios.get(
                    "http://localhost:4000/api/get-images"
                );
                setProfiles(res.data || []);
            } catch (err) {
                console.error("Failed to fetch profiles", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, []);

    useEffect(() => {
        if (profiles.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % profiles.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [profiles]);

    const currentProfile = profiles[currentIndex] || {};


    return (
        <section className="py-3 bg-white">
            <Container>
                <Row className="align-items-start">
                    {/* LEFT CONTENT */}
                    <Col lg="8" md="12">
                        <h4 className="mb-4 text-secondary">{ isHindi ? "हमारे बारे में" :"About Us" }</h4>

                       {(
  isHindi
    ? [
        "छत्तीसगढ़ राज्य में उच्च शिक्षा विभाग उत्कृष्टता को केन्द्र में रखकर, विश्वविद्यालयों एवं महाविद्यालयों का विस्तार करते हुये",
        "उच्च शिक्षा की सुविधा अधिकाधिक युवाओं तक पहुँचाने के लिये दृढप्रतिज्ञ है। इस उद्देश्य की पूर्ति के लिये 9 शासकीय विश्वविद्यालय,",
        "15 निजी विश्वविद्यालय, 335 शासकीय महाविद्यालय, 12 अनुदान प्राप्त अशासकीय महाविद्यालय तथा 256 अनुदान अप्राप्त अशासकीय",
        "महाविद्यालयों के माध्यम से निरंतर प्रयासरत है।",
      ]
    : [
        "The Department of Higher Education of the State of Chhattisgarh, with excellence at its core, is continuously expanding universities and colleges.",
        "It is firmly committed to making higher education accessible to a larger number of youth.",
        "To achieve this objective, it is consistently working through 9 government universities, 15 private universities,",
        "335 government colleges, 12 aided non-government colleges, and 256 unaided non-government colleges.",
      ]
).map((text, i) => (
  <div
    key={i}
    className={i < 3 ? "border-bottom pb-3 mb-3" : "pb-3"}
  >
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
                                fontSize: "0.9rem",
                            }}
                        >
                           { isHindi ? "और अधिक पढ़ें" : "Read More"}
                        </Button>
                    </Col>

                    {/* RIGHT PROFILE CARD */}
                    <Col lg="4" md="8" className="mt-4 mt-lg-0 mx-auto">
                        <Card className="border-0 shadow-sm rounded-0">
                            <div style={{ overflow: "hidden" }}>
                                <CardImg
                                    top
                                    src={
                                        currentProfile.image
                                            ? `http://localhost:4000/${currentProfile.image.replace(/\\/g, "/")}`
                                            : "/placeholder.png"
                                    }
                                    alt={currentProfile.imgNameEng || "Profile"}
                                    className="rounded-0"
                                    style={{
                                        width: "250px",
                                        height: "300px",
                                        objectFit: "cover",
                                        maxWidth: "none",
                                        transition: "opacity 0.5s ease-in-out",
                                        display: "block",
                                        margin: "0 auto",
                                    }}
                                />

                            </div>

                            <CardBody
                                className="text-center p-2 rounded-0"
                                style={{ backgroundColor: "#003f6b" }}
                            >
                                <h6 className="mb-0 text-white fw-bold">
                                    {loading
                                        ? "Loading..."
                                        :
                                        isHindi ? currentProfile.imgNameHin : currentProfile.imgNameEng  || "—"}
                                </h6>
                                <small className="text-white-50">
                                    {isHindi ? currentProfile.designationHin : currentProfile.designationEng || ""}
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
