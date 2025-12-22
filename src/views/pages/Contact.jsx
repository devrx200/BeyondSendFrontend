import { useState, useEffect } from 'react';
import { Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaUser } from 'react-icons/fa';
import DataService from '../../services/DataService';
import PageLayout from '../../components/PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const Contact = () => {
  const { isHindi } = useLanguage();
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [officeHours, setOfficeHours] = useState(null);
  const [keyOfficials, setKeyOfficials] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContactData();
  }, []);

  const loadContactData = async () => {
    try {
      const [deptInfo, hours, officials] = await Promise.all([
        DataService.getDepartmentInfo(),
        DataService.getOfficeHours(),
        DataService.getKeyOfficials()
      ]);
      setDepartmentInfo(deptInfo);
      setOfficeHours(hours);
      setKeyOfficials(officials);
    } catch (error) {
      console.error('Error loading contact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await DataService.submitContactForm(formData);
      setSubmitStatus({ show: true, type: 'success', message: result.message });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitStatus({ show: false, type: '', message: '' }), 5000);
    } catch (error) {
      setSubmitStatus({ show: true, type: 'danger', message: error.message });
    }
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
    <PageLayout
      title={isHindi ? 'हमसे संपर्क करें' : 'Contact Us'}
      titleHi="हमसे संपर्क करें"
      showBreadcrumb={true}
    >
      {/* Contact Information */}
      <Row className="g-4 mb-5">
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm text-center">
                <CardBody className="p-4">
                  <div className="icon-circle bg-primary text-white mb-3">
                    <FaMapMarkerAlt />
                  </div>
                  <h5>Address</h5>
                  {departmentInfo && (
                    <p className="text-muted">
                      {departmentInfo.address}<br />
                      {departmentInfo.city}, {departmentInfo.state}<br />
                      {departmentInfo.pincode}
                    </p>
                  )}
                </CardBody>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm text-center">
                <CardBody className="p-4">
                  <div className="icon-circle bg-success text-white mb-3">
                    <FaPhone />
                  </div>
                  <h5>Phone & Email</h5>
                  {departmentInfo && (
                    <>
                      <p className="text-muted mb-1">{departmentInfo.phone}</p>
                      <p className="text-muted">{departmentInfo.email}</p>
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm text-center">
                <CardBody className="p-4">
                  <div className="icon-circle bg-warning text-white mb-3">
                    <FaClock />
                  </div>
                  <h5>Office Hours</h5>
                  {officeHours && (
                    <>
                      <p className="text-muted mb-1 small">{officeHours.weekdays}</p>
                      <p className="text-muted mb-1 small">{officeHours.saturday}</p>
                      <p className="text-muted small">{officeHours.sunday}</p>
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            {/* Contact Form */}
            <Col lg={8}>
              <Card className="border-0 shadow-sm">
                <CardBody className="p-4">
                  <h3 className="mb-4">Send us a Message</h3>
                  {submitStatus.show && (
                    <Alert color={submitStatus.type} toggle={() => setSubmitStatus({ show: false, type: '', message: '' })}>
                      {submitStatus.message}
                    </Alert>
                  )}
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="name">Full Name *</Label>
                          <Input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your name"
                          />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="email">Email Address *</Label>
                          <Input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your email"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="phone">Phone Number</Label>
                          <Input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your phone"
                          />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <Label for="subject">Subject *</Label>
                          <Input
                            type="text"
                            name="subject"
                            id="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter subject"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <FormGroup>
                      <Label for="message">Message *</Label>
                      <Input
                        type="textarea"
                        name="message"
                        id="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your message"
                      />
                    </FormGroup>
                    <Button color="primary" size="lg" type="submit">
                      Send Message
                    </Button>
                  </Form>
                </CardBody>
              </Card>
            </Col>

            {/* Key Officials */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm">
                <CardBody className="p-4">
                  <h5 className="mb-4">Key Officials</h5>
                  {keyOfficials.map((official) => (
                    <div key={official.id} className="official-card mb-3 pb-3 border-bottom">
                      <div className="d-flex align-items-start">
                        <div className="official-icon me-3">
                          <FaUser />
                        </div>
                        <div>
                          <h6 className="mb-1">{official.name}</h6>
                          <p className="small text-muted mb-1">{official.designation}</p>
                          <p className="small mb-0">
                            <FaPhone className="me-1" /> {official.phone}<br />
                            <FaEnvelope className="me-1" /> {official.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Col>
          </Row>
    </PageLayout>
  );
};

export default Contact;

