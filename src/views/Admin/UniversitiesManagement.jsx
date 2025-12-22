import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Badge } from 'reactstrap';
import { FaUniversity, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
// import axios from 'axios';

const UniversitiesManagement = () => {
  const { isHindi } = useLanguage();
  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [formData, setFormData] = useState({
    nameEn: '',
    nameHi: '',
    location: '',
    established: '',
    type: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    active: true
  });

  useEffect(() => {
    loadUniversities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUniversities = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const dummyData = [
        { id: 1, nameEn: 'Pt. Ravishankar Shukla University', nameHi: 'पं. रविशंकर शुक्ल विश्वविद्यालय', location: 'Raipur', established: '1964', type: 'State University', website: 'https://www.prsu.ac.in/', email: 'info@prsu.ac.in', phone: '0771-2262378', address: 'Amanaka, Raipur, Chhattisgarh', active: true },
        { id: 2, nameEn: 'Atal Bihari Vajpayee Vishwavidyalaya', nameHi: 'अटल बिहारी वाजपेयी विश्वविद्यालय', location: 'Bilaspur', established: '2012', type: 'State University', website: 'https://www.abvvbilaspur.ac.in/', email: 'info@abvv.ac.in', phone: '07752-260209', address: 'Bilaspur, Chhattisgarh', active: true },
        { id: 3, nameEn: 'Indira Kala Sangit Vishwavidyalaya', nameHi: 'इंदिरा कला संगीत विश्वविद्यालय', location: 'Khairagarh', established: '1956', type: 'State University', website: 'https://www.iksv.ac.in/', email: 'info@iksv.ac.in', phone: '07724-222275', address: 'Khairagarh, Chhattisgarh', active: true },
        { id: 4, nameEn: 'Kushabhau Thakre Patrakarita Vishwavidyalaya', nameHi: 'कुशाभाऊ ठाकरे पत्रकारिता विश्वविद्यालय', location: 'Raipur', established: '2005', type: 'State University', website: 'https://www.ktujm.ac.in/', email: 'info@ktujm.ac.in', phone: '0771-2282100', address: 'Raipur, Chhattisgarh', active: true },
        { id: 5, nameEn: 'Hidayatullah National Law University', nameHi: 'हिदायतुल्लाह राष्ट्रीय विधि विश्वविद्यालय', location: 'Raipur', established: '2003', type: 'State University', website: 'https://www.hnlu.ac.in/', email: 'info@hnlu.ac.in', phone: '0771-2260382', address: 'Raipur, Chhattisgarh', active: true },
      ];

      setUniversities(dummyData);
      // When API is ready: const response = await axios.get('/api/universities');
    } catch (error) {
      console.error('Error loading universities:', error);
    }
  };

  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setEditingItem(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      nameEn: '', nameHi: '', location: '', established: '', type: '', website: '', email: '', phone: '', address: '', active: true
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    toggleModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm(isHindi ? 'क्या आप वाकई इसे हटाना चाहते हैं?' : 'Are you sure you want to delete this?')) {
      setUniversities(universities.filter(u => u.id !== id));
      // When API is ready: await axios.delete(`/api/universities/${id}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingItem) {
      setUniversities(universities.map(u => u.id === editingItem.id ? { ...u, ...formData } : u));
    } else {
      setUniversities([...universities, { ...formData, id: Date.now() }]);
    }
    toggleModal();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-1">
              <FaUniversity className="me-2" />
              {isHindi ? 'विश्वविद्यालय प्रबंधन' : 'Universities Management'}
            </h4>
            <p className="text-muted small mb-0">
              {isHindi ? 'सभी विश्वविद्यालयों को प्रबंधित करें' : 'Manage all universities'}
            </p>
          </div>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" />
            {isHindi ? 'नया विश्वविद्यालय' : 'Add University'}
          </Button>
        </div>

        <Table responsive hover striped>
          <thead>
            <tr>
              <th>#</th>
              <th>{isHindi ? 'नाम' : 'Name'}</th>
              <th>{isHindi ? 'स्थान' : 'Location'}</th>
              <th>{isHindi ? 'स्थापित' : 'Established'}</th>
              <th>{isHindi ? 'प्रकार' : 'Type'}</th>
              <th>{isHindi ? 'स्थिति' : 'Status'}</th>
              <th>{isHindi ? 'कार्य' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {universities.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{isHindi ? item.nameHi : item.nameEn}</td>
                <td>{item.location}</td>
                <td>{item.established}</td>
                <td><Badge color="info">{item.type}</Badge></td>
                <td>
                  <Badge color={item.active ? 'success' : 'secondary'}>
                    {item.active ? (isHindi ? 'सक्रिय' : 'Active') : (isHindi ? 'निष्क्रिय' : 'Inactive')}
                  </Badge>
                </td>
                <td>
                  <Button color="primary" size="sm" className="me-1" onClick={() => handleEdit(item)}><FaEdit /></Button>
                  <Button color="danger" size="sm" onClick={() => handleDelete(item.id)}><FaTrash /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            {editingItem ? (isHindi ? 'विश्वविद्यालय संपादित करें' : 'Edit University') : (isHindi ? 'नया विश्वविद्यालय जोड़ें' : 'Add University')}
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <div className="row">
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'नाम (अंग्रेजी)' : 'Name (English)'} *</Label>
                    <Input type="text" name="nameEn" value={formData.nameEn} onChange={handleChange} required />
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'नाम (हिंदी)' : 'Name (Hindi)'} *</Label>
                    <Input type="text" name="nameHi" value={formData.nameHi} onChange={handleChange} required />
                  </FormGroup>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'स्थान' : 'Location'} *</Label>
                    <Input type="text" name="location" value={formData.location} onChange={handleChange} required />
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'स्थापित वर्ष' : 'Established Year'} *</Label>
                    <Input type="text" name="established" value={formData.established} onChange={handleChange} required />
                  </FormGroup>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'प्रकार' : 'Type'} *</Label>
                    <Input type="select" name="type" value={formData.type} onChange={handleChange} required>
                      <option value="">{isHindi ? 'चुनें' : 'Select'}</option>
                      <option value="State University">{isHindi ? 'राज्य विश्वविद्यालय' : 'State University'}</option>
                      <option value="Central University">{isHindi ? 'केंद्रीय विश्वविद्यालय' : 'Central University'}</option>
                      <option value="Private University">{isHindi ? 'निजी विश्वविद्यालय' : 'Private University'}</option>
                      <option value="Deemed University">{isHindi ? 'मानित विश्वविद्यालय' : 'Deemed University'}</option>
                    </Input>
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'वेबसाइट' : 'Website'}</Label>
                    <Input type="url" name="website" value={formData.website} onChange={handleChange} />
                  </FormGroup>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'ईमेल' : 'Email'}</Label>
                    <Input type="email" name="email" value={formData.email} onChange={handleChange} />
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'फोन' : 'Phone'}</Label>
                    <Input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                  </FormGroup>
                </div>
              </div>
              <FormGroup>
                <Label>{isHindi ? 'पता' : 'Address'}</Label>
                <Input type="textarea" name="address" rows="2" value={formData.address} onChange={handleChange} />
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
                  {' '}{isHindi ? 'सक्रिय' : 'Active'}
                </Label>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit">
                <FaSave className="me-2" />
                {isHindi ? 'सहेजें' : 'Save'}
              </Button>
              <Button color="secondary" onClick={toggleModal}>
                <FaTimes className="me-2" />
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default UniversitiesManagement;