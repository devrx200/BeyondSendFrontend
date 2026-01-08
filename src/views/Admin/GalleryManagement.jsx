import { useState } from 'react';
import { Card, CardBody, Button, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { FaImages, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const GalleryManagement = () => {
  const { isHindi } = useLanguage();
  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleHi: '',
    descriptionEn: '',
    descriptionHi: '',
    image: '',
    category: '',
    date: '',
    active: true
  });

  const [gallery] = useState([
    { id: 1, titleEn: 'Convocation 2024', titleHi: 'दीक्षांत समारोह 2024', image: '/gallery1.jpg', category: 'Events', date: '2024-01-15', active: true },
    { id: 2, titleEn: 'Campus View', titleHi: 'परिसर दृश्य', image: '/gallery2.jpg', category: 'Campus', date: '2024-01-10', active: true },
    { id: 3, titleEn: 'Sports Day', titleHi: 'खेल दिवस', image: '/gallery3.jpg', category: 'Events', date: '2024-01-05', active: true },
    { id: 4, titleEn: 'Library', titleHi: 'पुस्तकालय', image: '/gallery4.jpg', category: 'Facilities', date: '2024-01-01', active: true },
  ]);

  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setEditingItem(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      titleEn: '',
      titleHi: '',
      descriptionEn: '',
      descriptionHi: '',
      image: '',
      category: '',
      date: '',
      active: true
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      titleEn: item.titleEn,
      titleHi: item.titleHi,
      descriptionEn: item.descriptionEn || '',
      descriptionHi: item.descriptionHi || '',
      image: item.image,
      category: item.category,
      date: item.date,
      active: item.active
    });
    toggleModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toggleModal();
  };

  const handleDelete = (id) => {
    if (window.confirm(isHindi ? 'क्या आप वाकई इसे हटाना चाहते हैं?' : 'Are you sure you want to delete this?')) {
    
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-1">{isHindi ? 'गैलरी प्रबंधन' : 'Gallery Management'}</h4>
            <p className="text-muted small mb-0">
              {isHindi ? 'फोटो गैलरी में छवियां जोड़ें और प्रबंधित करें' : 'Add and manage images in photo gallery'}
            </p>
          </div>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" />
            {isHindi ? 'छवि अपलोड करें' : 'Upload Image'}
          </Button>
        </div>

        <Row className="g-4">
          {gallery.map((item) => (
            <Col md={3} key={item.id}>
              <Card className="h-100">
                <div className="position-relative">
                  <img src={item.image} alt={item.titleEn} className="card-img-top" style={{height: '200px', objectFit: 'cover'}} />
                  <div className="position-absolute top-0 end-0 p-2">
                    <span className={`badge bg-${item.active ? 'success' : 'secondary'}`}>
                      {item.active ? (isHindi ? 'सक्रिय' : 'Active') : (isHindi ? 'निष्क्रिय' : 'Inactive')}
                    </span>
                  </div>
                </div>
                <CardBody>
                  <h6 className="mb-2">{isHindi ? item.titleHi : item.titleEn}</h6>
                  <p className="text-muted small mb-2">{item.category}</p>
                  <p className="text-muted small mb-3">{new Date(item.date).toLocaleDateString()}</p>
                  <div className="d-flex gap-2">
                    <Button color="info" size="sm" onClick={() => handleEdit(item)}>
                      <FaEdit />
                    </Button>
                    <Button color="danger" size="sm" onClick={() => handleDelete(item.id)}>
                      <FaTrash />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            <FaImages className="me-2" />
            {editingItem ? (isHindi ? 'छवि संपादित करें' : 'Edit Image') : (isHindi ? 'नई छवि जोड़ें' : 'Add New Image')}
          </ModalHeader>
          <ModalBody>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>{isHindi ? 'शीर्षक (अंग्रेजी)' : 'Title (English)'} *</Label>
                <Input type="text" value={formData.titleEn} onChange={(e) => setFormData({...formData, titleEn: e.target.value})} required />
              </FormGroup>
              <FormGroup>
                <Label>{isHindi ? 'शीर्षक (हिंदी)' : 'Title (Hindi)'} *</Label>
                <Input type="text" value={formData.titleHi} onChange={(e) => setFormData({...formData, titleHi: e.target.value})} required />
              </FormGroup>
              <FormGroup>
                <Label>{isHindi ? 'श्रेणी' : 'Category'} *</Label>
                <Input type="select" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                  <option value="">{isHindi ? 'चुनें' : 'Select'}</option>
                  <option value="Events">{isHindi ? 'कार्यक्रम' : 'Events'}</option>
                  <option value="Campus">{isHindi ? 'परिसर' : 'Campus'}</option>
                  <option value="Facilities">{isHindi ? 'सुविधाएं' : 'Facilities'}</option>
                </Input>
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleModal}>{isHindi ? 'रद्द करें' : 'Cancel'}</Button>
            <Button color="primary" onClick={handleSubmit}>{isHindi ? 'सहेजें' : 'Save'}</Button>
          </ModalFooter>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default GalleryManagement;

