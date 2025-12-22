import { useState, useEffect } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import {
  FaVoteYea,
  FaUserGraduate,
  FaMoneyBillWave,
  FaBookReader,
  FaExclamationCircle,
  FaInfoCircle,
  FaExternalLinkAlt
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import DataService from "../services/DataService";

const ImportantLinksSection = () => {
  const { isHindi } = useLanguage();
  const [links, setLinks] = useState([]);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const data = await DataService.getImportantLinks();
      setLinks(data);
    } catch (error) {
      console.error("Error loading important links:", error);
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      FaVoteYea: FaVoteYea,
      FaUserGraduate: FaUserGraduate,
      FaMoneyBillWave: FaMoneyBillWave,
      FaBookReader: FaBookReader,
      FaExclamationCircle: FaExclamationCircle,
      FaInfoCircle: FaInfoCircle
    };
    const Icon = icons[iconName] || FaInfoCircle;
    return <Icon size={34} />;
  };

  return (
    <section className="py-5 bg-light border-top">
      <Container>
        {/* SECTION HEADER */}
        <div className="text-center mb-5">
          <h2 className="fw-bold">
            {isHindi ? "महत्वपूर्ण लिंक" : "Important Links"}
          </h2>
          <p className="text-muted mb-0">
            {isHindi
              ? "त्वरित पहुँच के लिए आवश्यक सरकारी सेवाएँ"
              : "Quick access to essential government services"}
          </p>
        </div>

        {/* LINKS GRID */}
        <Row className="g-4">
          {links.map((link) => {
            const CardContent = (
              <Card
                className="h-100 border-0 shadow-sm"
                style={{
                  transition: "all 0.25s ease",
                  cursor: "pointer"
                }}
              >
                <CardBody className="text-center p-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{
                      width: 70,
                      height: 70,
                      background: "rgba(13,110,253,0.1)",
                      color: "var(--bs-primary)"
                    }}
                  >
                    {getIcon(link.icon)}
                  </div>

                  <h5 className="fw-semibold mb-1">
                    {isHindi ? link.titleHi : link.title}
                  </h5>

                  {link.external && (
                    <small className="text-muted d-block mt-1">
                      <FaExternalLinkAlt size={12} className="me-1" />
                      External Link
                    </small>
                  )}
                </CardBody>
              </Card>
            );

            return (
              <Col xl={3} lg={4} md={6} sm={12} key={link.id}>
                {link.external ? (
                  <a
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none"
                  >
                    {CardContent}
                  </a>
                ) : (
                  <Link to={link.link} className="text-decoration-none">
                    {CardContent}
                  </Link>
                )}
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default ImportantLinksSection;
