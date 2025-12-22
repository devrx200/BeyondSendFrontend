import { useState } from 'react';
import { Container, Row, Col, Card, CardBody, Nav, NavItem, NavLink, TabContent, TabPane, Table, Badge, Input, Button } from 'reactstrap';
import { FaSchool, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const Colleges = () => {
  const { isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState('government');
  const [searchTerm, setSearchTerm] = useState('');

  const breadcrumb = [
    { label: isHindi ? 'मुख्य पृष्ठ' : 'Home', path: '/' },
    { label: isHindi ? 'महाविद्यालय' : 'Colleges', active: true }
  ];

  const governmentColleges = [
    { id: 1, name: 'Government Digvijay Autonomous PG College', nameHi: 'शासकीय दिग्विजय स्वशासी स्नातकोत्तर महाविद्यालय', location: 'Rajnandgaon', locationHi: 'राजनांदगांव', type: 'PG', courses: 'Arts, Science, Commerce' },
    { id: 2, name: 'Government VYT PG Autonomous College', nameHi: 'शासकीय वी.वाई.टी. स्नातकोत्तर स्वशासी महाविद्यालय', location: 'Durg', locationHi: 'दुर्ग', type: 'PG', courses: 'Arts, Science, Commerce' },
    { id: 3, name: 'Government Bilasa Girls PG College', nameHi: 'शासकीय बिलासा गर्ल्स स्नातकोत्तर महाविद्यालय', location: 'Bilaspur', locationHi: 'बिलासपुर', type: 'PG', courses: 'Arts, Science' },
    { id: 4, name: 'Government Science College', nameHi: 'शासकीय विज्ञान महाविद्यालय', location: 'Raipur', locationHi: 'रायपुर', type: 'UG', courses: 'Science' },
    { id: 5, name: 'Government Arts & Commerce College', nameHi: 'शासकीय कला एवं वाणिज्य महाविद्यालय', location: 'Korba', locationHi: 'कोरबा', type: 'UG', courses: 'Arts, Commerce' }
  ];

  const privateColleges = [
    { id: 1, name: 'St. Thomas College', nameHi: 'सेंट थॉमस कॉलेज', location: 'Bhilai', locationHi: 'भिलाई', type: 'UG/PG', courses: 'Arts, Science, Commerce' },
    { id: 2, name: 'Shri Shankaracharya College', nameHi: 'श्री शंकराचार्य महाविद्यालय', location: 'Bhilai', locationHi: 'भिलाई', type: 'UG/PG', courses: 'Arts, Science, Commerce' },
    { id: 3, name: 'Rungta College of Engineering', nameHi: 'रुंगटा इंजीनियरिंग कॉलेज', location: 'Bhilai', locationHi: 'भिलाई', type: 'UG/PG', courses: 'Engineering' }
  ];

  const aidedColleges = [
    { id: 1, name: 'Kalyan Mahavidyalaya', nameHi: 'कल्याण महाविद्यालय', location: 'Bhilai', locationHi: 'भिलाई', type: 'UG', courses: 'Arts, Commerce' },
    { id: 2, name: 'Bharti College', nameHi: 'भारती महाविद्यालय', location: 'Durg', locationHi: 'दुर्ग', type: 'UG', courses: 'Arts, Science' }
  ];

  const renderCollegeTable = (colleges) => {
    const filteredColleges = colleges.filter(college =>
      college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.nameHi.includes(searchTerm) ||
      college.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <Table responsive striped hover className="mt-3">
        <thead className="table-primary">
          <tr>
            <th>#</th>
            <th>{isHindi ? 'नाम' : 'Name'}</th>
            <th>{isHindi ? 'स्थान' : 'Location'}</th>
            <th>{isHindi ? 'प्रकार' : 'Type'}</th>
            <th>{isHindi ? 'पाठ्यक्रम' : 'Courses'}</th>
          </tr>
        </thead>
        <tbody>
          {filteredColleges.length > 0 ? (
            filteredColleges.map((college, index) => (
              <tr key={college.id}>
                <td>{index + 1}</td>
                <td>
                  <strong>{isHindi ? college.nameHi : college.name}</strong>
                </td>
                <td>
                  <FaMapMarkerAlt className="me-1 text-danger" />
                  {isHindi ? college.locationHi : college.location}
                </td>
                <td>
                  <Badge color="info">{college.type}</Badge>
                </td>
                <td className="small">{college.courses}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                {isHindi ? 'कोई महाविद्यालय नहीं मिला' : 'No colleges found'}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    );
  };

  return (
    <PageLayout 
      title={isHindi ? 'महाविद्यालय' : 'Colleges'} 
      titleHi="महाविद्यालय"
      breadcrumb={breadcrumb}
    >
      <Container className="py-5">
        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm">
              <CardBody className="p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center">
                    <FaSchool size={40} className="text-primary me-3" />
                    <div>
                      <h2 className="mb-1">{isHindi ? 'छत्तीसगढ़ के महाविद्यालय' : 'Colleges in Chhattisgarh'}</h2>
                      <p className="text-muted mb-0">
                        {isHindi ? 'राज्य के विभिन्न महाविद्यालयों की सूची' : 'List of colleges across the state'}
                      </p>
                    </div>
                  </div>
                  <div className="d-flex gap-2" style={{ minWidth: '300px' }}>
                    <Input
                      type="text"
                      placeholder={isHindi ? 'खोजें...' : 'Search...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button color="primary">
                      <FaSearch />
                    </Button>
                  </div>
                </div>

                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={activeTab === 'government' ? 'active' : ''}
                      onClick={() => setActiveTab('government')}
                      style={{ cursor: 'pointer' }}
                    >
                      {isHindi ? 'शासकीय महाविद्यालय' : 'Government Colleges'}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === 'private' ? 'active' : ''}
                      onClick={() => setActiveTab('private')}
                      style={{ cursor: 'pointer' }}
                    >
                      {isHindi ? 'निजी महाविद्यालय' : 'Private Colleges'}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === 'aided' ? 'active' : ''}
                      onClick={() => setActiveTab('aided')}
                      style={{ cursor: 'pointer' }}
                    >
                      {isHindi ? 'अनुदानित महाविद्यालय' : 'Aided Colleges'}
                    </NavLink>
                  </NavItem>
                </Nav>

                <TabContent activeTab={activeTab}>
                  <TabPane tabId="government">
                    {renderCollegeTable(governmentColleges)}
                  </TabPane>
                  <TabPane tabId="private">
                    {renderCollegeTable(privateColleges)}
                  </TabPane>
                  <TabPane tabId="aided">
                    {renderCollegeTable(aidedColleges)}
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

export default Colleges;

