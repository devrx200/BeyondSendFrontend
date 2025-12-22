import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Badge, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { 
  FaNewspaper, FaArrowRight, FaCalendar, FaExternalLinkAlt,
  FaUniversity, FaSchool, FaBuilding, FaUserGraduate,
  FaVoteYea, FaMoneyBillWave, FaBookReader, FaExclamationCircle, FaInfoCircle
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import DataService from '../services/DataService';

const AfterCarousel = () => {
  const { isHindi } = useLanguage();
  const [latestNews, setLatestNews] = useState([]);
  const [importantLinks, setImportantLinks] = useState([]);
  const [ministerMessage, setMinisterMessage] = useState(null);
  const [quickUpdates, setQuickUpdates] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [news, links, message, updates, statistics] = await Promise.all([
        DataService.getLatestNews(),
        DataService.getImportantLinks(),
        DataService.getMinisterMessage(),
        DataService.getQuickUpdates(),
        DataService.getDepartmentStats()
      ]);
      setLatestNews(news);
      setImportantLinks(links);
      setMinisterMessage(message);
      setQuickUpdates(updates);
      setStats(statistics);
    } catch (error) {
      console.error('Error loading after-carousel content:', error);
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      FaVoteYea: <FaVoteYea />,
      FaUserGraduate: <FaUserGraduate />,
      FaMoneyBillWave: <FaMoneyBillWave />,
      FaBookReader: <FaBookReader />,
      FaExclamationCircle: <FaExclamationCircle />,
      FaInfoCircle: <FaInfoCircle />,
      FaUniversity: <FaUniversity />,
      FaSchool: <FaSchool />,
      FaBuilding: <FaBuilding />
    };
    return icons[iconName] || <FaInfoCircle />;
  };

  return (
    <div className="after-carousel-section">
      {/* Statistics Section */}
      <section className="stats-section py-5 bg-light">
        <Container>
          <Row className="g-4">
            {/* Universities Card */}
            <Col lg={3} md={6}>
              <Card className="stat-card-modern border-0 shadow-sm h-100">
                <CardBody className="p-4">
                  <div className="stat-icon-wrapper mb-3" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                    <FaUniversity size={24} className="text-white" />
                  </div>
                  <h2 className="stat-number mb-2">15</h2>
                  <p className="stat-label text-muted mb-0">
                    {isHindi ? 'विश्वविद्यालय' : 'Universities'}
                  </p>
                </CardBody>
              </Card>
            </Col>

            {/* Government Colleges Card */}
            <Col lg={3} md={6}>
              <Card className="stat-card-modern border-0 shadow-sm h-100">
                <CardBody className="p-4">
                  <div className="stat-icon-wrapper mb-3" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                    <FaSchool size={24} className="text-white" />
                  </div>
                  <h2 className="stat-number mb-2">135</h2>
                  <p className="stat-label text-muted mb-0">
                    {isHindi ? 'सरकारी महाविद्यालय' : 'Government Colleges'}
                  </p>
                </CardBody>
              </Card>
            </Col>

            {/* Private Colleges Card */}
            <Col lg={3} md={6}>
              <Card className="stat-card-modern border-0 shadow-sm h-100">
                <CardBody className="p-4">
                  <div className="stat-icon-wrapper mb-3" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                    <FaBuilding size={24} className="text-white" />
                  </div>
                  <h2 className="stat-number mb-2">296</h2>
                  <p className="stat-label text-muted mb-0">
                    {isHindi ? 'निजी महाविद्यालय' : 'Private Colleges'}
                  </p>
                </CardBody>
              </Card>
            </Col>

            {/* Total Students Card */}
            <Col lg={3} md={6}>
              <Card className="stat-card-modern border-0 shadow-sm h-100">
                <CardBody className="p-4">
                  <div className="stat-icon-wrapper mb-3" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
                    <FaUserGraduate size={24} className="text-white" />
                  </div>
                  <h2 className="stat-number mb-2">3,25,000</h2>
                  <p className="stat-label text-muted mb-0">
                    {isHindi ? 'कुल छात्र' : 'Total Students'}
                  </p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Main Content Section */}
      <section className="main-content-section py-5">
        <Container>
          <Row className="g-4">
            {/* Latest News */}
            <Col lg={4} md={6}>
              <Card className="h-100 border-0 shadow-sm hover-lift">
                <CardBody>
                  <div className="d-flex align-items-center mb-3">
                    <FaNewspaper size={30} className="text-primary me-2" />
                    <CardTitle tag="h4" className="mb-0">
                      {isHindi ? 'ताजा खबर' : 'Latest News'}
                    </CardTitle>
                  </div>
                  <div className="news-list">
                    {latestNews.slice(0, 5).map((news) => (
                      <div key={news.id} className="news-item mb-3 pb-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Link to={news.link} className="news-title text-decoration-none">
                            <h6 className="mb-1">{isHindi ? news.titleHi : news.title}</h6>
                          </Link>
                          {news.isNew && (
                            <Badge color="danger" pill className="ms-2">
                              {isHindi ? 'नया' : 'NEW'}
                            </Badge>
                          )}
                        </div>
                        <small className="text-muted">
                          <FaCalendar className="me-1" />
                          {new Date(news.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN')}
                        </small>
                      </div>
                    ))}
                  </div>
                  <Link to="/notice-board/news" className="btn btn-outline-primary btn-sm w-100 mt-2">
                    {isHindi ? 'और देखें' : 'View All'} <FaArrowRight className="ms-1" />
                  </Link>
                </CardBody>
              </Card>
            </Col>

            {/* Minister Message */}
            <Col lg={4} md={6}>
              <Card className="h-100 border-0 shadow-sm hover-lift minister-card">
                <CardBody className="text-center">
                  <CardTitle tag="h4" className="mb-3 text-primary">
                    {isHindi ? 'मंत्री जी का संदेश' : "Minister's Message"}
                  </CardTitle>
                  {ministerMessage && (
                    <>
                      <div className="minister-image-wrapper mb-3">
                        <img
                          src={ministerMessage.image}
                          alt={isHindi ? ministerMessage.nameHi : ministerMessage.name}
                          className="minister-image rounded shadow"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200x250?text=Minister';
                          }}
                        />
                      </div>
                      <h5 className="mb-1 fw-bold">{isHindi ? ministerMessage.nameHi : ministerMessage.name}</h5>
                      <p className="text-muted small mb-3">
                        {isHindi ? ministerMessage.designationHi : ministerMessage.designation}
                      </p>
                      <p className="minister-message text-start small">
                        "{isHindi ? ministerMessage.messageHi : ministerMessage.message}"
                      </p>
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>

            {/* Quick Updates */}
            <Col lg={4} md={12}>
              <Card className="h-100 border-0 shadow-sm hover-lift">
                <CardBody>
                  <CardTitle tag="h4" className="mb-3 text-primary">
                    {isHindi ? 'सूचना पट्ट' : 'Notice Board'}
                  </CardTitle>
                  <div className="updates-list">
                    {quickUpdates.map((update) => (
                      <div key={update.id} className="update-item mb-3 p-2 bg-light rounded">
                        <Link to={update.link} className="text-decoration-none">
                          <h6 className="mb-1 text-dark">{isHindi ? update.titleHi : update.title}</h6>
                          <small className="text-muted">
                            <FaCalendar className="me-1" />
                            {new Date(update.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN')}
                          </small>
                        </Link>
                      </div>
                    ))}
                  </div>
                  <Link to="/notice-board" className="btn btn-outline-primary btn-sm w-100 mt-2">
                    {isHindi ? 'सभी सूचनाएं देखें' : 'View All Notices'} <FaArrowRight className="ms-1" />
                  </Link>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default AfterCarousel;

