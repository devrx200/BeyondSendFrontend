import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Button, Badge } from 'reactstrap';
import { Link } from 'react-router-dom';
import {
  FaUserGraduate, FaMoneyBillWave, FaBook, FaClipboardList,
  FaBookReader, FaExclamationCircle, FaUniversity, FaSchool,
  FaAward, FaGraduationCap, FaMedal, FaFemale, FaFlask,
  FaArrowRight, FaCalendar
} from 'react-icons/fa';
// import axios from 'axios'; // Will be used when API is ready
import { useLanguage } from '../../contexts/LanguageContext';
import HeroSlider from '../../components/HeroSlider';
import AfterCarousel from '../../components/AfterCarousel';
import ImportantLinksSection from '../../components/ImportantLinksSection';

const Home = () => {
  const { isHindi } = useLanguage();
  const [quickLinks, setQuickLinks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
    try {
      setLoading(true);

      // Simulate API calls with axios (using dummy data since API is not created)
      // In production, replace these with actual API endpoints

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Dummy Quick Links Data
      const quickLinksData = [
        {
          id: 1,
          titleEn: 'Admissions',
          titleHi: 'प्रवेश',
          link: '/admissions',
          icon: 'FaUserGraduate'
        },
        {
          id: 2,
          titleEn: 'Scholarships',
          titleHi: 'छात्रवृत्ति',
          link: '/schemes/scholarship',
          icon: 'FaMoneyBillWave'
        },
        {
          id: 3,
          titleEn: 'Syllabus',
          titleHi: 'पाठ्यक्रम',
          link: '/academics/syllabus',
          icon: 'FaBook'
        },
        {
          id: 4,
          titleEn: 'Examinations',
          titleHi: 'परीक्षाएं',
          link: '/academics/examinations',
          icon: 'FaClipboardList'
        },
        {
          id: 5,
          titleEn: 'E-Library',
          titleHi: 'ई-पुस्तकालय',
          link: '/resources/e-library',
          icon: 'FaBookReader'
        },
        {
          id: 6,
          titleEn: 'Grievances',
          titleHi: 'शिकायतें',
          link: '/services/grievances',
          icon: 'FaExclamationCircle'
        }
      ];

      // Dummy Announcements Data
      const announcementsData = [
        {
          id: 1,
          titleEn: 'Admission Notice for Academic Year 2024-25',
          titleHi: 'शैक्षणिक वर्ष 2024-25 के लिए प्रवेश सूचना',
          descriptionEn: 'Online applications are invited for admission to various undergraduate and postgraduate courses.',
          descriptionHi: 'विभिन्न स्नातक और स्नातकोत्तर पाठ्यक्रमों में प्रवेश के लिए ऑनलाइन आवेदन आमंत्रित हैं।',
          category: isHindi ? 'प्रवेश' : 'Admissions',
          date: '2024-12-15',
          link: '/announcements/admission-2024'
        },
        {
          id: 2,
          titleEn: 'Scholarship Application Deadline Extended',
          titleHi: 'छात्रवृत्ति आवेदन की अंतिम तिथि बढ़ाई गई',
          descriptionEn: 'The last date for submitting scholarship applications has been extended to 31st December 2024.',
          descriptionHi: 'छात्रवृत्ति आवेदन जमा करने की अंतिम तिथि 31 दिसंबर 2024 तक बढ़ा दी गई है।',
          category: isHindi ? 'छात्रवृत्ति' : 'Scholarship',
          date: '2024-12-10',
          link: '/announcements/scholarship-deadline'
        },
        {
          id: 3,
          titleEn: 'University Examination Schedule Released',
          titleHi: 'विश्वविद्यालय परीक्षा कार्यक्रम जारी',
          descriptionEn: 'The examination schedule for semester exams has been published on the official website.',
          descriptionHi: 'सेमेस्टर परीक्षाओं का परीक्षा कार्यक्रम आधिकारिक वेबसाइट पर प्रकाशित किया गया है।',
          category: isHindi ? 'परीक्षा' : 'Examination',
          date: '2024-12-08',
          link: '/announcements/exam-schedule'
        },
        {
          id: 4,
          titleEn: 'Faculty Recruitment Notification',
          titleHi: 'संकाय भर्ती अधिसूचना',
          descriptionEn: 'Applications are invited for the post of Assistant Professor in various departments.',
          descriptionHi: 'विभिन्न विभागों में सहायक प्रोफेसर के पद के लिए आवेदन आमंत्रित हैं।',
          category: isHindi ? 'भर्ती' : 'Recruitment',
          date: '2024-12-05',
          link: '/announcements/faculty-recruitment'
        }
      ];



      // Dummy Featured Schemes Data
      const featuredSchemesData = [
        {
          id: 1,
          titleEn: 'Mukhyamantri Medhavi Vidyarthi Yojana',
          titleHi: 'मुख्यमंत्री मेधावी विद्यार्थी योजना',
          descriptionEn: 'Financial assistance for meritorious students',
          descriptionHi: 'मेधावी छात्रों के लिए वित्तीय सहायता',
          link: '/schemes/medhavi-vidyarthi',
          icon: 'FaAward'
        },
        {
          id: 2,
          titleEn: 'Post Matric Scholarship',
          titleHi: 'पोस्ट मैट्रिक छात्रवृत्ति',
          descriptionEn: 'Scholarship for SC/ST/OBC students',
          descriptionHi: 'SC/ST/OBC छात्रों के लिए छात्रवृत्ति',
          link: '/schemes/post-matric',
          icon: 'FaGraduationCap'
        },
        {
          id: 3,
          titleEn: 'Kanya Shiksha Protsahan Yojana',
          titleHi: 'कन्या शिक्षा प्रोत्साहन योजना',
          descriptionEn: 'Incentive scheme for girl students',
          descriptionHi: 'बालिका छात्रों के लिए प्रोत्साहन योजना',
          link: '/schemes/kanya-shiksha',
          icon: 'FaFemale'
        },
        {
          id: 4,
          titleEn: 'Research Fellowship Program',
          titleHi: 'अनुसंधान फेलोशिप कार्यक्रम',
          descriptionEn: 'Support for research scholars',
          descriptionHi: 'शोध विद्वानों के लिए सहायता',
          link: '/schemes/research-fellowship',
          icon: 'FaFlask'
        }
      ];

      // Simulate axios API calls (commented out - will be used when API is ready)
      /*
      const [linksRes, announcementsRes, schemesRes] = await Promise.all([
        axios.get('/api/quick-links'),
        axios.get('/api/announcements?limit=4'),
        axios.get('/api/featured-schemes')
      ]);

      setQuickLinks(linksRes.data);
      setAnnouncements(announcementsRes.data);
      setFeaturedSchemes(schemesRes.data);
      */

      // Set dummy data
      setQuickLinks(quickLinksData);
      setAnnouncements(announcementsData);
      setFeaturedSchemes(featuredSchemesData);

    } catch (error) {
      console.error('Error loading home data:', error);
      // Set empty arrays on error
      setQuickLinks([]);
      setAnnouncements([]);
      setFeaturedSchemes([]);
    } finally {
      setLoading(false);
    }
  };

    loadHomeData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIcon = (iconName) => {
    const icons = {
      FaUserGraduate: <FaUserGraduate />,
      FaMoneyBillWave: <FaMoneyBillWave />,
      FaBook: <FaBook />,
      FaClipboardList: <FaClipboardList />,
      FaBookReader: <FaBookReader />,
      FaExclamationCircle: <FaExclamationCircle />,
      FaUniversity: <FaUniversity />,
      FaSchool: <FaSchool />,
      FaAward: <FaAward />,
      FaGraduationCap: <FaGraduationCap />,
      FaMedal: <FaMedal />,
      FaFemale: <FaFemale />,
      FaFlask: <FaFlask />
    };
    return icons[iconName] || <FaBook />;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Slider */}
      <HeroSlider />

      {/* After Carousel Section - Dynamic Content */}
      <AfterCarousel />

      {/* Quick Links Section */}
      <section className="quick-links-section py-4 bg-light">
        <Container>
          <Row className="g-3">
            {quickLinks.map((link) => (
              <Col key={link.id} xs={6} md={4} lg={2}>
                <Link to={link.link} className="quick-link-card text-decoration-none">
                  <Card className="text-center h-100 border-0 shadow-sm hover-card">
                    <CardBody>
                      <div className="icon-wrapper text-primary mb-2">
                        {getIcon(link.icon)}
                      </div>
                      <p className="mb-0 small fw-semibold">
                        {isHindi ? link.titleHi : link.titleEn}
                      </p>
                    </CardBody>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Main Content Section */}
      <section className="main-content py-5">
        <Container>
          <Row className="g-4">
            {/* Announcements */}
            <Col lg={8}>
              <div className="section-header mb-4 d-flex justify-content-between align-items-center">
                <h3 className="section-title mb-0">
                  {isHindi ? 'नवीनतम घोषणाएं' : 'Latest Announcements'}
                </h3>
                <Link to="/announcements" className="view-all-link text-decoration-none">
                  {isHindi ? 'सभी देखें' : 'View All'} <FaArrowRight />
                </Link>
              </div>
              <div className="announcements-list">
                {announcements.map((announcement) => (
                  <Card key={announcement.id} className="mb-3 border-0 shadow-sm announcement-card hover-lift">
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge color="primary" className="mb-2">{announcement.category}</Badge>
                        <small className="text-muted">
                          <FaCalendar className="me-1" />
                          {new Date(announcement.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN')}
                        </small>
                      </div>
                      <CardTitle tag="h5" className="mb-2">
                        {isHindi ? announcement.titleHi : announcement.titleEn}
                      </CardTitle>
                      <CardText className="text-muted">
                        {isHindi ? announcement.descriptionHi : announcement.descriptionEn}
                      </CardText>
                      <Link to={announcement.link} className="btn btn-sm btn-outline-primary">
                        {isHindi ? 'और पढ़ें' : 'Read More'} <FaArrowRight />
                      </Link>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </Col>

            {/* Sidebar */}
            <Col lg={4}>
              <Card className="mb-4 border-0 shadow-sm">
                <CardBody className="bg-warning text-dark">
                  <h5 className="mb-3">
                    {isHindi ? 'महत्वपूर्ण सूचना' : 'Important Notice'}
                  </h5>
                  <p className="small mb-2">
                    📢 {isHindi
                      ? 'शैक्षणिक वर्ष 2024-25 के लिए छात्रवृत्ति आवेदन अब खुले हैं!'
                      : 'Scholarship applications for 2024-25 are now open!'}
                  </p>
                  <Button color="dark" size="sm" block tag={Link} to="/schemes/scholarship">
                    {isHindi ? 'अभी आवेदन करें' : 'Apply Now'}
                  </Button>
                </CardBody>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardBody>
                  <h5 className="mb-3">
                    {isHindi ? 'प्रमुख योजनाएं' : 'Featured Schemes'}
                  </h5>
                  {featuredSchemes.map((scheme) => (
                    <div key={scheme.id} className="scheme-item mb-3 pb-3 border-bottom">
                      <div className="d-flex align-items-start">
                        <div className="scheme-icon text-primary me-3">
                          {getIcon(scheme.icon)}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">
                            {isHindi ? scheme.titleHi : scheme.titleEn}
                          </h6>
                          <p className="small text-muted mb-2">
                            {isHindi ? scheme.descriptionHi : scheme.descriptionEn}
                          </p>
                          <Link to={scheme.link} className="small text-primary text-decoration-none">
                            {isHindi ? 'और जानें →' : 'Learn More →'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Important Links Section */}
      <ImportantLinksSection />
    </div>
  );
};

export default Home;

