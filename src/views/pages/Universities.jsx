import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Nav, NavItem, NavLink, TabContent, TabPane, Table, Badge } from 'reactstrap';
import { FaUniversity, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe } from 'react-icons/fa';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const Universities = () => {
  const { isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState('state');

  const breadcrumb = [
    { label: isHindi ? 'मुख्य पृष्ठ' : 'Home', path: '/' },
    { label: isHindi ? 'विश्वविद्यालय' : 'Universities', active: true }
  ];

  const stateUniversities = [
    {
      id: 1,
      name: 'Pt. Ravishankar Shukla University',
      nameHi: 'पं. रविशंकर शुक्ल विश्वविद्यालय',
      location: 'Raipur',
      locationHi: 'रायपुर',
      phone: '0771-2262832',
      email: 'info@prsu.ac.in',
      website: 'https://www.prsu.ac.in',
      established: '1964'
    },
    {
      id: 2,
      name: 'Atal Bihari Vajpayee Vishwavidyalaya',
      nameHi: 'अटल बिहारी वाजपेयी विश्वविद्यालय',
      location: 'Bilaspur',
      locationHi: 'बिलासपुर',
      phone: '07752-260209',
      email: 'info@abvv.ac.in',
      website: 'https://www.abvv.ac.in',
      established: '2012'
    },
    {
      id: 3,
      name: 'Hemchand Yadav Vishwavidyalaya',
      nameHi: 'हेमचंद यादव विश्वविद्यालय',
      location: 'Durg',
      locationHi: 'दुर्ग',
      phone: '0788-2359146',
      email: 'info@hcv.ac.in',
      website: 'https://www.hcv.ac.in',
      established: '2013'
    }
  ];

  const privateUniversities = [
    {
      id: 1,
      name: 'ICFAI University',
      nameHi: 'आईसीएफएआई विश्वविद्यालय',
      location: 'Raipur',
      locationHi: 'रायपुर',
      phone: '0771-2970000',
      email: 'info@iuraipur.edu.in',
      website: 'https://www.iuraipur.edu.in',
      established: '2011'
    },
    {
      id: 2,
      name: 'Kalinga University',
      nameHi: 'कलिंगा विश्वविद्यालय',
      location: 'Raipur',
      locationHi: 'रायपुर',
      phone: '0771-4082111',
      email: 'info@kalingauniversity.ac.in',
      website: 'https://www.kalingauniversity.ac.in',
      established: '2013'
    }
  ];

  const centralUniversities = [
    {
      id: 1,
      name: 'Indira Gandhi National Tribal University',
      nameHi: 'इंदिरा गांधी राष्ट्रीय जनजातीय विश्वविद्यालय',
      location: 'Amarkantak',
      locationHi: 'अमरकंटक',
      phone: '07629-264002',
      email: 'info@igntu.ac.in',
      website: 'https://www.igntu.ac.in',
      established: '2008'
    }
  ];

  const renderUniversityTable = (universities) => (
    <Table responsive striped hover className="mt-3">
      <thead className="table-primary">
        <tr>
          <th>#</th>
          <th>{isHindi ? 'नाम' : 'Name'}</th>
          <th>{isHindi ? 'स्थान' : 'Location'}</th>
          <th>{isHindi ? 'स्थापना वर्ष' : 'Established'}</th>
          <th>{isHindi ? 'संपर्क' : 'Contact'}</th>
          <th>{isHindi ? 'वेबसाइट' : 'Website'}</th>
        </tr>
      </thead>
      <tbody>
        {universities.map((uni, index) => (
          <tr key={uni.id}>
            <td>{index + 1}</td>
            <td>
              <strong>{isHindi ? uni.nameHi : uni.name}</strong>
            </td>
            <td>
              <FaMapMarkerAlt className="me-1 text-danger" />
              {isHindi ? uni.locationHi : uni.location}
            </td>
            <td>
              <Badge color="info">{uni.established}</Badge>
            </td>
            <td>
              <div className="small">
                <div><FaPhone className="me-1" /> {uni.phone}</div>
                <div><FaEnvelope className="me-1" /> {uni.email}</div>
              </div>
            </td>
            <td>
              <a href={uni.website} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                <FaGlobe className="me-1" />
                {isHindi ? 'वेबसाइट' : 'Visit'}
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <PageLayout 
      title={isHindi ? 'विश्वविद्यालय' : 'Universities'} 
      titleHi="विश्वविद्यालय"
      breadcrumb={breadcrumb}
    >
      <Container className="py-5">
        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm">
              <CardBody className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <FaUniversity size={40} className="text-primary me-3" />
                  <div>
                    <h2 className="mb-1">{isHindi ? 'छत्तीसगढ़ के विश्वविद्यालय' : 'Universities in Chhattisgarh'}</h2>
                    <p className="text-muted mb-0">
                      {isHindi ? 'राज्य में उच्च शिक्षा के प्रमुख केंद्र' : 'Leading centers of higher education in the state'}
                    </p>
                  </div>
                </div>

                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={activeTab === 'state' ? 'active' : ''}
                      onClick={() => setActiveTab('state')}
                      style={{ cursor: 'pointer' }}
                    >
                      {isHindi ? 'राज्य विश्वविद्यालय' : 'State Universities'}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === 'private' ? 'active' : ''}
                      onClick={() => setActiveTab('private')}
                      style={{ cursor: 'pointer' }}
                    >
                      {isHindi ? 'निजी विश्वविद्यालय' : 'Private Universities'}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === 'central' ? 'active' : ''}
                      onClick={() => setActiveTab('central')}
                      style={{ cursor: 'pointer' }}
                    >
                      {isHindi ? 'केंद्रीय विश्वविद्यालय' : 'Central Universities'}
                    </NavLink>
                  </NavItem>
                </Nav>

                <TabContent activeTab={activeTab}>
                  <TabPane tabId="state">
                    {renderUniversityTable(stateUniversities)}
                  </TabPane>
                  <TabPane tabId="private">
                    {renderUniversityTable(privateUniversities)}
                  </TabPane>
                  <TabPane tabId="central">
                    {renderUniversityTable(centralUniversities)}
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
};

export default Universities;

