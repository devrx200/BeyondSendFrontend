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

        setAnnouncements([
          {
            id: 1,
            titleEn: "Admission Notice 2024-25",
            titleHi: "प्रवेश सूचना 2024-25",
            descriptionEn: "Online applications are invited for UG & PG courses.",
            descriptionHi: "यूजी एवं पीजी पाठ्यक्रमों के लिए ऑनलाइन आवेदन आमंत्रित हैं।",
            category: isHindi ? "प्रवेश" : "Admissions",
            date: "2024-12-15",
            link: "/announcements/admission-2024"
          },
          {
            id: 2,
            titleEn: "Scholarship Deadline Extended",
            titleHi: "छात्रवृत्ति तिथि बढ़ी",
            descriptionEn: "Last date extended till 31 December 2024.",
            descriptionHi: "अंतिम तिथि 31 दिसंबर 2024 तक बढ़ाई गई।",
            category: isHindi ? "छात्रवृत्ति" : "Scholarship",
            date: "2024-12-10",
            link: "/announcements/scholarship"
          }
        ]);

        setFeaturedSchemes([
          {
            id: 1,
            titleEn: "Medhavi Vidyarthi Yojana",
            titleHi: "मेधावी विद्यार्थी योजना",
            descriptionEn: "Financial assistance for meritorious students",
            descriptionHi: "मेधावी छात्रों के लिए वित्तीय सहायता",
            link: "/schemes/medhavi",
            icon: "FaAward"
          },
          {
            id: 2,
            titleEn: "Post Matric Scholarship",
            titleHi: "पोस्ट मैट्रिक छात्रवृत्ति",
            descriptionEn: "Scholarship for SC/ST/OBC",
            descriptionHi: "SC/ST/OBC छात्रों के लिए",
            link: "/schemes/post-matric",
            icon: "FaGraduationCap"
          },
          {
            id: 3,
            titleEn: "Kanya Shiksha Yojana",
            titleHi: "कन्या शिक्षा योजना",
            descriptionEn: "Support for girl students",
            descriptionHi: "बालिका छात्रों के लिए सहायता",
            link: "/schemes/kanya",
            icon: "FaFemale"
          },
          {
            id: 4,
            titleEn: "Research Fellowship",
            titleHi: "अनुसंधान फेलोशिप",
            descriptionEn: "Support for researchers",
            descriptionHi: "शोधार्थियों के लिए सहायता",
            link: "/schemes/research",
            icon: "FaFlask"
          }
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
          <Row className="g-4 justify-content-center">
            {quickLinks.map((link) => (
              <Col key={link.id} xs={6} sm={4} md={3} lg={2}>
                <Link to={link.link} className="text-decoration-none">
                  <Card className="h-100 text-center border-0 shadow-sm">
                    <CardBody className="py-4">
                      <div className="mb-3 text-primary fs-4">
                        {iconMap[link.icon]}
                      </div>
                      <small className="fw-semibold">
                        {isHindi ? link.titleHi : link.titleEn}
                      </small>
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
