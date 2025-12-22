import { Row, Col, Card, CardBody } from 'reactstrap';
import { FaEye, FaBullseye, FaUsers, FaAward } from 'react-icons/fa';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const About = () => {
  const { isHindi } = useLanguage();

  return (
    <PageLayout
      title={isHindi ? 'हमारे बारे में' : 'About Us'}
      titleHi="हमारे बारे में"
      showBreadcrumb={false}
    >
      {/* About Content */}
          <Row className="mb-5">
            <Col lg={12}>
              <Card className="border-0 shadow-sm">
                <CardBody className="p-5">
                  <h2 className="mb-4">About the Department</h2>
                  <p className="lead text-muted">
                    The Department of Higher Education, Government of Chhattisgarh, is committed to providing quality education 
                    and creating opportunities for students to excel in their academic pursuits.
                  </p>
                  <p>
                    Established with the vision of transforming the higher education landscape in Chhattisgarh, our department 
                    oversees the functioning of universities, colleges, and various educational institutions across the state. 
                    We are dedicated to ensuring that every student has access to world-class education and resources.
                  </p>
                  <p>
                    Through various schemes, scholarships, and initiatives, we strive to promote inclusive education, 
                    encourage research and innovation, and build a skilled workforce that can contribute to the state's 
                    and nation's development.
                  </p>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Vision & Mission */}
          <Row className="g-4 mb-5">
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm">
                <CardBody className="p-4">
                  <div className="icon-wrapper text-primary mb-3">
                    <FaEye size={50} />
                  </div>
                  <h3 className="mb-3">Our Vision</h3>
                  <p className="text-muted">
                    To establish Chhattisgarh as a leading state in higher education by providing accessible, 
                    affordable, and quality education to all sections of society, fostering innovation, research, 
                    and holistic development of students.
                  </p>
                </CardBody>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm">
                <CardBody className="p-4">
                  <div className="icon-wrapper text-success mb-3">
                    <FaBullseye size={50} />
                  </div>
                  <h3 className="mb-3">Our Mission</h3>
                  <ul className="text-muted">
                    <li>Ensure quality education in all higher education institutions</li>
                    <li>Promote research and innovation among students and faculty</li>
                    <li>Provide financial assistance through scholarships and schemes</li>
                    <li>Develop modern infrastructure and learning facilities</li>
                    <li>Foster industry-academia collaboration</li>
                  </ul>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Key Focus Areas */}
          <Row className="mb-5">
            <Col lg={12}>
              <h2 className="text-center mb-4">Key Focus Areas</h2>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={3}>
              <Card className="text-center h-100 border-0 shadow-sm hover-card">
                <CardBody className="p-4">
                  <div className="icon-circle bg-primary text-white mb-3">
                    <FaUsers />
                  </div>
                  <h5>Student Welfare</h5>
                  <p className="small text-muted">
                    Comprehensive support systems for student development and well-being
                  </p>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center h-100 border-0 shadow-sm hover-card">
                <CardBody className="p-4">
                  <div className="icon-circle bg-success text-white mb-3">
                    <FaAward />
                  </div>
                  <h5>Quality Education</h5>
                  <p className="small text-muted">
                    Maintaining high standards of education through accreditation and monitoring
                  </p>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center h-100 border-0 shadow-sm hover-card">
                <CardBody className="p-4">
                  <div className="icon-circle bg-warning text-white mb-3">
                    <FaBullseye />
                  </div>
                  <h5>Research & Innovation</h5>
                  <p className="small text-muted">
                    Encouraging cutting-edge research and innovative practices
                  </p>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center h-100 border-0 shadow-sm hover-card">
                <CardBody className="p-4">
                  <div className="icon-circle bg-info text-white mb-3">
                    <FaEye />
                  </div>
                  <h5>Infrastructure</h5>
                  <p className="small text-muted">
                    Developing state-of-the-art facilities and learning environments
                  </p>
                </CardBody>
              </Card>
            </Col>
          </Row>
    </PageLayout>
  );
};

export default About;

