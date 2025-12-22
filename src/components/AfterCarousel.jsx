import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
} from "reactstrap";
import { useLanguage } from "../contexts/LanguageContext";

const AfterCarousel = () => {
  const { isHindi } = useLanguage();

  /* ---------- STATIC STATS DATA ---------- */
  const statsData = [
    {
      value: 15,
      labelEn: "Universities",
      labelHi: "विश्वविद्यालय",
      icon: "bi-bank",
      bg: "bg-primary",
    },
    {
      value: 135,
      labelEn: "Government Colleges",
      labelHi: "सरकारी महाविद्यालय",
      icon: "bi-building",
      bg: "bg-danger",
    },
    {
      value: 296,
      labelEn: "Private Colleges",
      labelHi: "निजी महाविद्यालय",
      icon: "bi-buildings",
      bg: "bg-info",
    },
    {
      value: 325000,
      labelEn: "Total Students",
      labelHi: "कुल छात्र",
      icon: "bi-mortarboard",
      bg: "bg-success",
    },
  ];

  return (
    <div className="after-carousel-section">
      <section className="stats-section py-5 bg-light">
        <Container>
          <Row className="g-4">
            {statsData.map((item, i) => (
              <Col lg="3" md="6" key={i}>
                <Card className="border-0 shadow-sm h-100 text-center rounded-4">
                  <CardBody>
                    <div
                      className={`d-inline-flex align-items-center justify-content-center rounded-4 ${item.bg} mb-3`}
                      style={{ width: 64, height: 64 }}
                    >
                      <i className={`bi ${item.icon} fs-3 text-white`} />
                    </div>

                    <h2 className="fw-bold">{item.value}</h2>
                    <p className="text-muted mb-0">
                      {isHindi ? item.labelHi : item.labelEn}
                    </p>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default AfterCarousel;
