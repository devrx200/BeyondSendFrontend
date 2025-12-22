import { Container, Row, Col, Card, CardBody, Table, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { FaInfoCircle, FaUserTie, FaFileAlt, FaDownload } from 'react-icons/fa';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const RTI = () => {
  const { isHindi } = useLanguage();

  const breadcrumb = [
    { label: isHindi ? 'मुख्य पृष्ठ' : 'Home', path: '/' },
    { label: isHindi ? 'सूचना का अधिकार' : 'RTI', active: true }
  ];

  const rtiOfficers = [
    {
      id: 1,
      designation: 'Public Information Officer (PIO)',
      designationHi: 'लोक सूचना अधिकारी',
      name: 'Shri Rajesh Kumar',
      nameHi: 'श्री राजेश कुमार',
      phone: '0771-2221234',
      email: 'pio.higheredu-cg@gov.in'
    },
    {
      id: 2,
      designation: 'Assistant Public Information Officer (APIO)',
      designationHi: 'सहायक लोक सूचना अधिकारी',
      name: 'Smt. Priya Sharma',
      nameHi: 'श्रीमती प्रिया शर्मा',
      phone: '0771-2221235',
      email: 'apio.higheredu-cg@gov.in'
    },
    {
      id: 3,
      designation: 'Appellate Authority',
      designationHi: 'अपीलीय प्राधिकारी',
      name: 'Shri Anil Verma',
      nameHi: 'श्री अनिल वर्मा',
      phone: '0771-2221236',
      email: 'appellate.higheredu-cg@gov.in'
    }
  ];

  return (
    <PageLayout 
      title={isHindi ? 'सूचना का अधिकार' : 'Right to Information'} 
      titleHi="सूचना का अधिकार"
      breadcrumb={breadcrumb}
    >
      <Container className="py-5">
        <Row className="g-4">
          {/* RTI Information */}
          <Col lg={12}>
            <Card className="border-0 shadow-sm">
              <CardBody className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <FaInfoCircle size={40} className="text-primary me-3" />
                  <div>
                    <h2 className="mb-1">{isHindi ? 'सूचना का अधिकार अधिनियम, 2005' : 'Right to Information Act, 2005'}</h2>
                    <p className="text-muted mb-0">
                      {isHindi ? 'पारदर्शिता और जवाबदेही को बढ़ावा देना' : 'Promoting transparency and accountability'}
                    </p>
                  </div>
                </div>

                <div className="content-area">
                  <h4>{isHindi ? 'आरटीआई के बारे में' : 'About RTI'}</h4>
                  <p>
                    {isHindi 
                      ? 'सूचना का अधिकार अधिनियम, 2005 नागरिकों को सार्वजनिक प्राधिकरणों से सूचना प्राप्त करने का अधिकार देता है। यह अधिनियम सरकार में पारदर्शिता और जवाबदेही को बढ़ावा देने के लिए बनाया गया है।'
                      : 'The Right to Information Act, 2005 empowers citizens to seek information from public authorities. This Act is designed to promote transparency and accountability in government.'}
                  </p>

                  <h5 className="mt-4">{isHindi ? 'आरटीआई आवेदन कैसे करें' : 'How to Apply for RTI'}</h5>
                  <ol>
                    <li>{isHindi ? 'आवेदन पत्र डाउनलोड करें या ऑनलाइन आवेदन करें' : 'Download the application form or apply online'}</li>
                    <li>{isHindi ? 'आवश्यक विवरण भरें और आवश्यक शुल्क जमा करें' : 'Fill in the required details and pay the necessary fee'}</li>
                    <li>{isHindi ? 'आवेदन लोक सूचना अधिकारी को जमा करें' : 'Submit the application to the Public Information Officer'}</li>
                    <li>{isHindi ? '30 दिनों के भीतर जवाब प्राप्त करें' : 'Receive response within 30 days'}</li>
                  </ol>

                  <div className="mt-4">
                    <Button color="primary" className="me-2">
                      <FaFileAlt className="me-2" />
                      {isHindi ? 'ऑनलाइन आवेदन करें' : 'Apply Online'}
                    </Button>
                    <Button color="outline-primary">
                      <FaDownload className="me-2" />
                      {isHindi ? 'आवेदन पत्र डाउनलोड करें' : 'Download Application Form'}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* RTI Officers */}
          <Col lg={12}>
            <Card className="border-0 shadow-sm">
              <CardBody className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <FaUserTie size={40} className="text-success me-3" />
                  <div>
                    <h3 className="mb-1">{isHindi ? 'आरटीआई अधिकारी' : 'RTI Officers'}</h3>
                    <p className="text-muted mb-0">
                      {isHindi ? 'संपर्क विवरण' : 'Contact Details'}
                    </p>
                  </div>
                </div>

                <Table responsive striped hover>
                  <thead className="table-primary">
                    <tr>
                      <th>{isHindi ? 'पदनाम' : 'Designation'}</th>
                      <th>{isHindi ? 'नाम' : 'Name'}</th>
                      <th>{isHindi ? 'फोन' : 'Phone'}</th>
                      <th>{isHindi ? 'ईमेल' : 'Email'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rtiOfficers.map((officer) => (
                      <tr key={officer.id}>
                        <td><strong>{isHindi ? officer.designationHi : officer.designation}</strong></td>
                        <td>{isHindi ? officer.nameHi : officer.name}</td>
                        <td>{officer.phone}</td>
                        <td><a href={`mailto:${officer.email}`}>{officer.email}</a></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>

          {/* RTI Application Form */}
          <Col lg={12}>
            <Card className="border-0 shadow-sm">
              <CardBody className="p-4">
                <h3 className="mb-4">{isHindi ? 'ऑनलाइन आरटीआई आवेदन' : 'Online RTI Application'}</h3>
                <Form>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <Label>{isHindi ? 'नाम' : 'Name'} *</Label>
                        <Input type="text" required />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>{isHindi ? 'ईमेल' : 'Email'} *</Label>
                        <Input type="email" required />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>{isHindi ? 'फोन' : 'Phone'} *</Label>
                        <Input type="tel" required />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>{isHindi ? 'पता' : 'Address'} *</Label>
                        <Input type="text" required />
                      </FormGroup>
                    </Col>
                    <Col md={12}>
                      <FormGroup>
                        <Label>{isHindi ? 'सूचना का विवरण' : 'Information Required'} *</Label>
                        <Input type="textarea" rows="5" required />
                      </FormGroup>
                    </Col>
                    <Col md={12}>
                      <Button color="primary" size="lg">
                        {isHindi ? 'आवेदन जमा करें' : 'Submit Application'}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
};

export default RTI;

