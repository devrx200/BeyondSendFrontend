import { Row, Col, Card, CardBody } from 'reactstrap';
import { FaEye, FaBullseye, FaUsers, FaAward } from 'react-icons/fa';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const KEY_AREAS = [
  {
    icon: <FaUsers aria-hidden="true" />,
    titleEn: 'Student Welfare',
    titleHi: 'छात्र कल्याण',
    descEn: 'Support systems for student growth and development.',
    descHi: 'छात्रों के विकास हेतु सहायता प्रणालियाँ।',
  },
  {
    icon: <FaAward aria-hidden="true" />,
    titleEn: 'Quality Education',
    titleHi: 'गुणवत्तापूर्ण शिक्षा',
    descEn: 'Maintaining high education standards across institutions.',
    descHi: 'संस्थानों में शिक्षा की गुणवत्ता बनाए रखना।',
  },
  {
    icon: <FaBullseye aria-hidden="true" />,
    titleEn: 'Research & Innovation',
    titleHi: 'अनुसंधान एवं नवाचार',
    descEn: 'Encouraging a culture of research and creative thinking.',
    descHi: 'अनुसंधान एवं नवाचार की संस्कृति को बढ़ावा देना।',
  },
  {
    icon: <FaEye aria-hidden="true" />,
    titleEn: 'Infrastructure',
    titleHi: 'अधोसंरचना',
    descEn: 'Development of modern facilities and resources.',
    descHi: 'आधुनिक सुविधाओं एवं संसाधनों का विकास।',
  },
];

const About = () => {
  const { isHindi } = useLanguage();

  return (
    <PageLayout
      title="About Us"
      titleHi="हमारे बारे में"
      showBreadcrumb
    >
      {/* ── Department Overview ── */}
      <section aria-labelledby="about-dept-heading">
        <Row className="mb-5">
          <Col lg={12}>
            <Card className="border-0 shadow-sm about-dept-card">
              <CardBody className="p-4 p-md-5">
                <h2 id="about-dept-heading" className="mb-3 text-primary fw-bold">
                  {isHindi ? 'विभाग के बारे में' : 'About the Department'}
                </h2>
                <p className="lead text-muted">
                  {isHindi
                    ? 'उच्च शिक्षा विभाग, छत्तीसगढ़ शासन राज्य में उच्च शिक्षा के विकास, विस्तार एवं गुणवत्ता सुधार हेतु कार्यरत है।'
                    : 'The Department of Higher Education, Government of Chhattisgarh, works towards the development, expansion, and quality improvement of higher education in the state.'}
                </p>
                <p>
                  {isHindi
                    ? 'विभाग राज्य के विश्वविद्यालयों, महाविद्यालयों एवं अन्य उच्च शिक्षण संस्थानों का संचालन एवं पर्यवेक्षण करता है। इसका उद्देश्य छात्रों को गुणवत्तापूर्ण शिक्षा, बेहतर संसाधन एवं आधुनिक सुविधाएं उपलब्ध कराना है।'
                    : 'The department administers universities, colleges, and other higher educational institutions across the state, ensuring quality education, better resources, and modern facilities for students.'}
                </p>
                <p className="mb-0">
                  {isHindi
                    ? 'विभाग विभिन्न योजनाओं, छात्रवृत्तियों एवं नवाचार कार्यक्रमों के माध्यम से समावेशी शिक्षा को बढ़ावा देता है तथा युवाओं को सक्षम एवं आत्मनिर्भर बनाने का प्रयास करता है।'
                    : 'Through various schemes, scholarships, and innovation programs, the department promotes inclusive education and aims to empower youth with knowledge and skills.'}
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </section>

      {/* ── Vision & Mission ── */}
      <section aria-labelledby="vision-mission-heading">
        <h2 id="vision-mission-heading" className="visually-hidden">
          {isHindi ? 'दृष्टिकोण एवं उद्देश्य' : 'Vision and Mission'}
        </h2>
        <Row className="g-4 mb-5">
          <Col xs={12} md={6}>
            <Card className="h-100 border-0 shadow-sm about-hover-card">
              <CardBody className="p-4">
                <div className="about-icon-box bg-primary" aria-hidden="true">
                  <FaEye />
                </div>
                <h3 className="fw-bold h5">
                  {isHindi ? 'हमारा दृष्टिकोण' : 'Our Vision'}
                </h3>
                <p className="text-muted mb-0">
                  {isHindi
                    ? 'छत्तीसगढ़ को उच्च शिक्षा के क्षेत्र में अग्रणी राज्य बनाना तथा सभी वर्गों को सुलभ, सस्ती एवं गुणवत्तापूर्ण शिक्षा उपलब्ध कराना।'
                    : 'To make Chhattisgarh a leading state in higher education by providing accessible, affordable, and quality education to all sections of society.'}
                </p>
              </CardBody>
            </Card>
          </Col>

          <Col xs={12} md={6}>
            <Card className="h-100 border-0 shadow-sm about-hover-card">
              <CardBody className="p-4">
                <div className="about-icon-box bg-success" aria-hidden="true">
                  <FaBullseye />
                </div>
                <h3 className="fw-bold h5">
                  {isHindi ? 'हमारा उद्देश्य' : 'Our Mission'}
                </h3>
                <ul className="text-muted mission-list mb-0">
                  <li>{isHindi ? 'गुणवत्तापूर्ण शिक्षा सुनिश्चित करना' : 'Ensure quality education'}</li>
                  <li>{isHindi ? 'अनुसंधान एवं नवाचार को बढ़ावा देना' : 'Promote research and innovation'}</li>
                  <li>{isHindi ? 'छात्रवृत्ति एवं योजनाओं के माध्यम से सहायता' : 'Provide scholarships and schemes'}</li>
                  <li>{isHindi ? 'आधुनिक अधोसंरचना का विकास' : 'Develop modern infrastructure'}</li>
                  <li>{isHindi ? 'उद्योग एवं शिक्षा के बीच समन्वय' : 'Strengthen industry-academia collaboration'}</li>
                </ul>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </section>

      {/* ── Key Focus Areas ── */}
      <section aria-labelledby="key-focus-heading">
        <Row className="mb-4">
          <Col>
            <h2 id="key-focus-heading" className="text-center fw-bold text-primary">
              {isHindi ? 'मुख्य कार्य क्षेत्र' : 'Key Focus Areas'}
            </h2>
          </Col>
        </Row>

        <Row className="g-4">
          {KEY_AREAS.map((item, i) => (
            <Col xs={12} sm={6} md={3} key={i}>
              <Card className="text-center h-100 border-0 shadow-sm about-hover-card">
                <CardBody className="p-3 p-md-4">
                  <div className="about-icon-circle" aria-hidden="true">
                    {item.icon}
                  </div>
                  <h4 className="fw-bold h6 mb-2">
                    {isHindi ? item.titleHi : item.titleEn}
                  </h4>
                  <p className="small text-muted mb-0">
                    {isHindi ? item.descHi : item.descEn}
                  </p>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </PageLayout>
  );
};

export default About;
