import { useState } from 'react';
import { Container, Row, Col, Card, CardBody, Badge, Button, Input } from 'reactstrap';
import { FaBullhorn, FaCalendar, FaEye, FaDownload } from 'react-icons/fa';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const NoticeBoard = () => {
  const { isHindi } = useLanguage();
  const [filter, setFilter] = useState('all');

  const breadcrumb = [
    { label: isHindi ? 'मुख्य पृष्ठ' : 'Home', path: '/' },
    { label: isHindi ? 'सूचना पट्ट' : 'Notice Board', active: true }
  ];

  const notices = [
    { 
      id: 1, 
      title: 'Admission Notification for Academic Year 2024-25', 
      titleHi: 'शैक्षणिक वर्ष 2024-25 के लिए प्रवेश अधिसूचना',
      category: 'news',
      categoryHi: 'समाचार',
      date: '2024-12-15',
      isNew: true
    },
    { 
      id: 2, 
      title: 'Tender for Infrastructure Development', 
      titleHi: 'बुनियादी ढांचे के विकास के लिए निविदा',
      category: 'tenders',
      categoryHi: 'निविदाएं',
      date: '2024-12-14',
      isNew: true
    },
    { 
      id: 3, 
      title: 'Recruitment for Assistant Professor Posts', 
      titleHi: 'सहायक प्रोफेसर पदों के लिए भर्ती',
      category: 'recruitment',
      categoryHi: 'भर्ती',
      date: '2024-12-12',
      isNew: true
    },
    { 
      id: 4, 
      title: 'Seniority List - Government Colleges (Gazetted)', 
      titleHi: 'वरिष्ठता सूची - शासकीय महाविद्यालय (राजपत्रित)',
      category: 'seniority',
      categoryHi: 'वरिष्ठता सूची',
      date: '2024-12-10',
      isNew: false
    },
    { 
      id: 5, 
      title: 'Circular regarding Academic Calendar 2024-25', 
      titleHi: 'शैक्षणिक कैलेंडर 2024-25 के संबंध में परिपत्र',
      category: 'circulars',
      categoryHi: 'परिपत्र',
      date: '2024-12-08',
      isNew: false
    },
    { 
      id: 6, 
      title: 'Transfer Order - Teaching Staff', 
      titleHi: 'स्थानांतरण आदेश - शिक्षण कर्मचारी',
      category: 'orders',
      categoryHi: 'आदेश',
      date: '2024-12-05',
      isNew: false
    }
  ];

  const filteredNotices = filter === 'all' 
    ? notices 
    : notices.filter(notice => notice.category === filter);

  const getCategoryColor = (category) => {
    const colors = {
      news: 'primary',
      tenders: 'warning',
      recruitment: 'success',
      seniority: 'info',
      circulars: 'secondary',
      orders: 'danger'
    };
    return colors[category] || 'secondary';
  };

  return (
    <PageLayout 
      title={isHindi ? 'सूचना पट्ट' : 'Notice Board'} 
      titleHi="सूचना पट्ट"
      breadcrumb={breadcrumb}
    >
      <Container className="py-5">
        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm mb-4">
              <CardBody className="p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center">
                    <FaBullhorn size={40} className="text-primary me-3" />
                    <div>
                      <h2 className="mb-1">{isHindi ? 'सूचना पट्ट' : 'Notice Board'}</h2>
                      <p className="text-muted mb-0">
                        {isHindi ? 'नवीनतम अधिसूचनाएं और अपडेट' : 'Latest notifications and updates'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Input
                      type="select"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      style={{ minWidth: '200px' }}
                    >
                      <option value="all">{isHindi ? 'सभी' : 'All'}</option>
                      <option value="news">{isHindi ? 'समाचार' : 'News'}</option>
                      <option value="tenders">{isHindi ? 'निविदाएं' : 'Tenders'}</option>
                      <option value="recruitment">{isHindi ? 'भर्ती' : 'Recruitment'}</option>
                      <option value="seniority">{isHindi ? 'वरिष्ठता सूची' : 'Seniority List'}</option>
                      <option value="circulars">{isHindi ? 'परिपत्र' : 'Circulars'}</option>
                      <option value="orders">{isHindi ? 'आदेश' : 'Orders'}</option>
                    </Input>
                  </div>
                </div>

                <div className="notices-list">
                  {filteredNotices.map((notice) => (
                    <Card key={notice.id} className="mb-3 border-start border-4" style={{ borderColor: `var(--bs-${getCategoryColor(notice.category)})` }}>
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <Badge color={getCategoryColor(notice.category)}>
                                {isHindi ? notice.categoryHi : notice.category.toUpperCase()}
                              </Badge>
                              {notice.isNew && (
                                <Badge color="danger" pill>
                                  {isHindi ? 'नया' : 'NEW'}
                                </Badge>
                              )}
                              <span className="small text-muted">
                                <FaCalendar className="me-1" />
                                {new Date(notice.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN')}
                              </span>
                            </div>
                            <h5 className="mb-2">{isHindi ? notice.titleHi : notice.title}</h5>
                          </div>
                          <div className="d-flex gap-2">
                            <Button color="outline-primary" size="sm">
                              <FaEye className="me-1" />
                              {isHindi ? 'देखें' : 'View'}
                            </Button>
                            <Button color="primary" size="sm">
                              <FaDownload className="me-1" />
                              {isHindi ? 'डाउनलोड' : 'Download'}
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>

                {filteredNotices.length === 0 && (
                  <div className="text-center py-5 text-muted">
                    <FaBullhorn size={60} className="mb-3 opacity-25" />
                    <p>{isHindi ? 'कोई सूचना उपलब्ध नहीं है' : 'No notices available'}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
};

export default NoticeBoard;

