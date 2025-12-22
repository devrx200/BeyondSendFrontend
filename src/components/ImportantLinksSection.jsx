import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import { 
  FaVoteYea, FaUserGraduate, FaMoneyBillWave, FaBookReader, 
  FaExclamationCircle, FaInfoCircle, FaExternalLinkAlt 
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import DataService from '../services/DataService';

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
      console.error('Error loading important links:', error);
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      FaVoteYea: <FaVoteYea />,
      FaUserGraduate: <FaUserGraduate />,
      FaMoneyBillWave: <FaMoneyBillWave />,
      FaBookReader: <FaBookReader />,
      FaExclamationCircle: <FaExclamationCircle />,
      FaInfoCircle: <FaInfoCircle />
    };
    return icons[iconName] || <FaInfoCircle />;
  };

  return (
    <section className="important-links-section py-5 bg-light">
      <Container>
        <div className="text-center mb-4">
          <h2 className="section-title">
            {isHindi ? 'महत्वपूर्ण लिंक' : 'Important Links'}
          </h2>
          <div className="title-underline mx-auto"></div>
        </div>

        <Row className="g-4">
          {links.map((link) => (
            <Col lg={4} md={6} key={link.id}>
              {link.external ? (
                <a 
                  href={link.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-decoration-none"
                >
                  <Card className="link-card h-100 border-0 shadow-sm hover-lift">
                    <CardBody className="text-center p-4">
                      <div className="link-card-icon text-primary mb-3">
                        {getIcon(link.icon)}
                      </div>
                      <h5 className="mb-0">{isHindi ? link.titleHi : link.title}</h5>
                      <FaExternalLinkAlt className="mt-2 text-muted" size={14} />
                    </CardBody>
                  </Card>
                </a>
              ) : (
                <Link to={link.link} className="text-decoration-none">
                  <Card className="link-card h-100 border-0 shadow-sm hover-lift">
                    <CardBody className="text-center p-4">
                      <div className="link-card-icon text-primary mb-3">
                        {getIcon(link.icon)}
                      </div>
                      <h5 className="mb-0">{isHindi ? link.titleHi : link.title}</h5>
                    </CardBody>
                  </Card>
                </Link>
              )}
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default ImportantLinksSection;

