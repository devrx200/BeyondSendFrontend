import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
  Badge
} from "reactstrap";
import { Link } from "react-router-dom";
import {
  FaUserGraduate,
  FaMoneyBillWave,
  FaBook,
  FaClipboardList,
  FaBookReader,
  FaExclamationCircle,
  FaAward,
  FaGraduationCap,
  FaFemale,
  FaFlask,
  FaArrowRight,
  FaCalendar
} from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";
import HeroSlider from "../../components/HeroSlider";
import NoticeTicker from "../../components/NoticeTicker";
import AfterCarousel from "../../components/AfterCarousel";
import AboutSection from "../../components/AboutSection";
import ImportantLinksSection from "../../components/ImportantLinksSection";
import AnnouncementsAndSchemes from "../../components/AnnouncementsAndSchemes";
import NoticeDepAndDirectorate from "../../components/NoticeDepAndDirectorate";

const Home = () => {
  const { isHindi } = useLanguage();

  const [quickLinks, setQuickLinks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        await new Promise((res) => setTimeout(res, 400));

        setQuickLinks([
          { id: 1, titleEn: "Admissions", titleHi: "प्रवेश", link: "/admissions", icon: "FaUserGraduate" },
          { id: 2, titleEn: "Scholarships", titleHi: "छात्रवृत्ति", link: "/schemes/scholarship", icon: "FaMoneyBillWave" },
          { id: 3, titleEn: "Syllabus", titleHi: "पाठ्यक्रम", link: "/academics/syllabus", icon: "FaBook" },
          { id: 4, titleEn: "Examinations", titleHi: "परीक्षाएं", link: "/academics/examinations", icon: "FaClipboardList" },
          { id: 5, titleEn: "E-Library", titleHi: "ई-पुस्तकालय", link: "/resources/e-library", icon: "FaBookReader" },
          { id: 6, titleEn: "Grievances", titleHi: "शिकायतें", link: "/services/grievances", icon: "FaExclamationCircle" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [isHindi]);

  /* ---------------- ICON MAP ---------------- */
  const iconMap = {
    FaUserGraduate: <FaUserGraduate />,
    FaMoneyBillWave: <FaMoneyBillWave />,
    FaBook: <FaBook />,
    FaClipboardList: <FaClipboardList />,
    FaBookReader: <FaBookReader />,
    FaExclamationCircle: <FaExclamationCircle />,
    FaAward: <FaAward />,
    FaGraduationCap: <FaGraduationCap />,
    FaFemale: <FaFemale />,
    FaFlask: <FaFlask />
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div>
      <HeroSlider />
      <NoticeTicker />
      <AfterCarousel />
      <AboutSection />

      {/* QUICK LINKS */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h4 className="fw-bold">
              {isHindi ? "त्वरित लिंक" : "Quick Access"}
            </h4>
            <div
              className="mx-auto mt-2"
              style={{
                width: "60px",
                height: "3px",
                background: "#0d6efd",
                borderRadius: "10px",
              }}
            />
          </div>

          <Row className="g-4 justify-content-center">
            {quickLinks.map((link) => (
              <Col key={link.id} xs={6} sm={4} md={3} lg={2}>
                <Link to={link.link} className="text-decoration-none">
                  <Card
                    className="text-center border-0 shadow-sm h-100"
                    style={{
                      borderRadius: "18px",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 25px rgba(13,110,253,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(0,0,0,0.08)";
                    }}
                  >
                    <CardBody className="py-4">

                      {/* Icon Circle */}
                      <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #0d6efd, #6610f2)",
                          color: "#fff",
                          fontSize: "22px",
                        }}
                      >
                        {iconMap[link.icon]}
                      </div>

                      <div className="fw-semibold text-dark small">
                        {isHindi ? link.titleHi : link.titleEn}
                      </div>

                    </CardBody>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <NoticeDepAndDirectorate />
      <AnnouncementsAndSchemes />
      <ImportantLinksSection />
    </div>
  );
};

export default Home;
