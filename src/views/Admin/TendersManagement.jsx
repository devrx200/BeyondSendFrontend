import { useState } from 'react';
import { Card, CardBody, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { FaFileAlt, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const TendersManagement = () => {
  const { isHindi } = useLanguage();
  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleHi: '',
    descriptionEn: '',
    descriptionHi: '',
    publishDate: '',
    closingDate: '',
    file: '',
    active: true
  });

  const [tenders] = useState([
    { id: 1, titleEn: 'Construction Tender', titleHi: 'निर्माण निविदा', publishDate: '2024-01-15', closingDate: '2024-02-15', active: true },
    { id: 2, titleEn: 'Supply Tender', titleHi: 'आपूर्ति निविदा', publishDate: '2024-01-10', closingDate: '2024-02-10', active: true },
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
      publishDate: '',
      closingDate: '',
      file: '',
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
      publishDate: item.publishDate,
      closingDate: item.closingDate,
      file: item.file || '',
      active: item.active
    });
    toggleModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving tender:', formData);
    toggleModal();
  };

  const handleDelete = (id) => {
    if (window.confirm(isHindi ? 'क्या आप वाकई इसे हटाना चाहते हैं?' : 'Are you sure you want to delete this?')) {
      console.log('Deleting tender:', id);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-1">{isHindi ? 'निविदाएं प्रबंधन' : 'Tenders Management'}</h4>
            <p className="text-muted small mb-0">
              {isHindi ? 'सभी निविदाओं को प्रबंधित करें' : 'Manage all tenders'}
            </p>
          </div>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" />
            {isHindi ? 'नई निविदा' : 'New Tender'}
          </Button>
        </div>

        <Table responsive hover>
          <thead>
            <tr>
              <th>#</th>
              <th>{isHindi ? 'शीर्षक (अंग्रेजी)' : 'Title (English)'}</th>
              <th>{isHindi ? 'शीर्षक (हिंदी)' : 'Title (Hindi)'}</th>
              <th>{isHindi ? 'प्रकाशन तिथि' : 'Publish Date'}</th>
              <th>{isHindi ? 'समापन तिथि' : 'Closing Date'}</th>
              <th>{isHindi ? 'स्थिति' : 'Status'}</th>
              <th>{isHindi ? 'कार्य' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {tenders.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.titleEn}</td>
                <td>{item.titleHi}</td>
                <td>{new Date(item.publishDate).toLocaleDateString()}</td>
                <td>{new Date(item.closingDate).toLocaleDateString()}</td>
                <td>
                  <span className={`badge bg-${item.active ? 'success' : 'secondary'}`}>
                    {item.active ? (isHindi ? 'सक्रिय' : 'Active') : (isHindi ? 'निष्क्रिय' : 'Inactive')}
                  </span>
                </td>
                <td>
                  <Button color="info" size="sm" className="me-2" onClick={() => handleEdit(item)}>
                    <FaEdit />
                  </Button>
                  <Button color="danger" size="sm" onClick={() => handleDelete(item.id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            <FaFileAlt className="me-2" />
            {editingItem ? (isHindi ? 'निविदा संपादित करें' : 'Edit Tender') : (isHindi ? 'नई निविदा जोड़ें' : 'Add New Tender')}
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

export default TendersManagement;

