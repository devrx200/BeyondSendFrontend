import { useState } from 'react';
import { Container, Row, Col, Card, CardBody, Nav, NavItem, NavLink, TabContent, TabPane, Table, Badge, Button } from 'reactstrap';
import { FaDownload, FaFilePdf, FaFileWord, FaFileExcel, FaCalendar } from 'react-icons/fa';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const Downloads = () => {
  const { isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState('forms');

  const breadcrumb = [
    { label: isHindi ? 'मुख्य पृष्ठ' : 'Home', path: '/' },
    { label: isHindi ? 'डाउनलोड' : 'Downloads', active: true }
  ];

  const forms = [
    { id: 1, title: 'Scholarship Application Form', titleHi: 'छात्रवृत्ति आवेदन पत्र', type: 'PDF', size: '245 KB', date: '2024-12-01' },
    { id: 2, title: 'College Affiliation Form', titleHi: 'महाविद्यालय संबद्धता फॉर्म', type: 'PDF', size: '180 KB', date: '2024-11-28' },
    { id: 3, title: 'Faculty Recruitment Form', titleHi: 'संकाय भर्ती फॉर्म', type: 'PDF', size: '320 KB', date: '2024-11-25' },
    { id: 4, title: 'Student Grievance Form', titleHi: 'छात्र शिकायत फॉर्म', type: 'PDF', size: '150 KB', date: '2024-11-20' }
  ];

  const notifications = [
    { id: 1, title: 'Admission Notification 2024-25', titleHi: 'प्रवेश अधिसूचना 2024-25', type: 'PDF', size: '450 KB', date: '2024-12-10' },
    { id: 2, title: 'Examination Schedule', titleHi: 'परीक्षा कार्यक्रम', type: 'PDF', size: '280 KB', date: '2024-12-05' },
    { id: 3, title: 'Holiday List 2025', titleHi: 'अवकाश सूची 2025', type: 'PDF', size: '120 KB', date: '2024-11-30' },
    { id: 4, title: 'Fee Structure Notification', titleHi: 'शुल्क संरचना अधिसूचना', type: 'PDF', size: '200 KB', date: '2024-11-25' }
  ];

  const reports = [
    { id: 1, title: 'Annual Report 2023-24', titleHi: 'वार्षिक रिपोर्ट 2023-24', type: 'PDF', size: '2.5 MB', date: '2024-10-15' },
    { id: 2, title: 'Performance Report Q2 2024', titleHi: 'प्रदर्शन रिपोर्ट Q2 2024', type: 'PDF', size: '1.8 MB', date: '2024-09-30' },
    { id: 3, title: 'Audit Report 2023-24', titleHi: 'लेखा परीक्षा रिपोर्ट 2023-24', type: 'PDF', size: '3.2 MB', date: '2024-08-20' }
  ];

  const guidelines = [
    { id: 1, title: 'Scholarship Guidelines', titleHi: 'छात्रवृत्ति दिशानिर्देश', type: 'PDF', size: '680 KB', date: '2024-11-15' },
    { id: 2, title: 'College Affiliation Guidelines', titleHi: 'महाविद्यालय संबद्धता दिशानिर्देश', type: 'PDF', size: '920 KB', date: '2024-10-10' },
    { id: 3, title: 'Faculty Recruitment Guidelines', titleHi: 'संकाय भर्ती दिशानिर्देश', type: 'PDF', size: '540 KB', date: '2024-09-05' }
  ];

  const getFileIcon = (type) => {
    switch (type.toUpperCase()) {
      case 'PDF': return <FaFilePdf className="text-danger" />;
      case 'DOC':
      case 'DOCX': return <FaFileWord className="text-primary" />;
      case 'XLS':
      case 'XLSX': return <FaFileExcel className="text-success" />;
      default: return <FaDownload />;
    }
  };

  const renderDownloadTable = (items) => (
    <Table responsive striped hover className="mt-3">
      <thead className="table-primary">
        <tr>
          <th>#</th>
          <th>{isHindi ? 'शीर्षक' : 'Title'}</th>
          <th>{isHindi ? 'प्रकार' : 'Type'}</th>
          <th>{isHindi ? 'आकार' : 'Size'}</th>
          <th>{isHindi ? 'तिथि' : 'Date'}</th>
          <th>{isHindi ? 'डाउनलोड' : 'Download'}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id}>
            <td>{index + 1}</td>
            <td>
              <div className="d-flex align-items-center gap-2">
                {getFileIcon(item.type)}
                <strong>{isHindi ? item.titleHi : item.title}</strong>
              </div>
            </td>
            <td>
              <Badge color="secondary">{item.type}</Badge>
            </td>
            <td className="small text-muted">{item.size}</td>
            <td className="small">
              <FaCalendar className="me-1" />
              {new Date(item.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN')}
            </td>
            <td>
              <Button color="primary" size="sm">
                <FaDownload className="me-1" />
                {isHindi ? 'डाउनलोड' : 'Download'}
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <PageLayout 
      title={isHindi ? 'डाउनलोड' : 'Downloads'} 
      titleHi="डाउनलोड"
      breadcrumb={breadcrumb}
    >
      <Container className="py-5">
        <Row>
          <Col lg={12}>
            <Card className="border-0 shadow-sm">
              <CardBody className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <FaDownload size={40} className="text-primary me-3" />
                  <div>
                    <h2 className="mb-1">{isHindi ? 'डाउनलोड केंद्र' : 'Download Center'}</h2>
                    <p className="text-muted mb-0">
                      {isHindi ? 'फॉर्म, अधिसूचनाएं, रिपोर्ट और दिशानिर्देश' : 'Forms, Notifications, Reports and Guidelines'}
                    </p>
                  </div>
                </div>

                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={activeTab === 'forms' ? 'active' : ''}
                      onClick={() => setActiveTab('forms')}
                      style={{ cursor: 'pointer' }}
                    >
                      {isHindi ? 'प्रपत्र' : 'Forms'}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === 'notifications' ? 'active' : ''}
                      onClick={() => setActiveTab('notifications')}
                      style={{ cursor: 'pointer' }}
                    >
                      {isHindi ? 'अधिसूचनाएं' : 'Notifications'}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === 'reports' ? 'active' : ''}
                      onClick={() => setActiveTab('reports')}
                      style={{ cursor: 'pointer' }}
                    >
                      {isHindi ? 'रिपोर्ट' : 'Reports'}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={activeTab === 'guidelines' ? 'active' : ''}
                      onClick={() => setActiveTab('guidelines')}
                      style={{ cursor: 'pointer' }}
                    >
                      {isHindi ? 'दिशानिर्देश' : 'Guidelines'}
                    </NavLink>
                  </NavItem>
                </Nav>

                <TabContent activeTab={activeTab}>
                  <TabPane tabId="forms">
                    {renderDownloadTable(forms)}
                  </TabPane>
                  <TabPane tabId="notifications">
                    {renderDownloadTable(notifications)}
                  </TabPane>
                  <TabPane tabId="reports">
                    {renderDownloadTable(reports)}
                  </TabPane>
                  <TabPane tabId="guidelines">
                    {renderDownloadTable(guidelines)}
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

export default Downloads;

