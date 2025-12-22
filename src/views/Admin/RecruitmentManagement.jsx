import { useState } from 'react';
import { Card, CardBody, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { FaUser, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const RecruitmentManagement = () => {
  const { isHindi } = useLanguage();
  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleHi: '',
    positionEn: '',
    positionHi: '',
    vacancies: '',
    publishDate: '',
    lastDate: '',
    file: '',
    active: true
  });

  const [recruitments] = useState([
    { id: 1, titleEn: 'Professor Recruitment', titleHi: 'प्रोफेसर भर्ती', positionEn: 'Professor', positionHi: 'प्रोफेसर', vacancies: 10, publishDate: '2024-01-15', lastDate: '2024-02-15', active: true },
    { id: 2, titleEn: 'Assistant Professor', titleHi: 'सहायक प्रोफेसर', positionEn: 'Assistant Professor', positionHi: 'सहायक प्रोफेसर', vacancies: 25, publishDate: '2024-01-10', lastDate: '2024-02-10', active: true },
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
      positionEn: '',
      positionHi: '',
      vacancies: '',
      publishDate: '',
      lastDate: '',
      file: '',
      active: true
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      titleEn: item.titleEn,
      titleHi: item.titleHi,
      positionEn: item.positionEn,
      positionHi: item.positionHi,
      vacancies: item.vacancies,
      publishDate: item.publishDate,
      lastDate: item.lastDate,
      file: item.file || '',
      active: item.active
    });
    toggleModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving recruitment:', formData);
    toggleModal();
  };

  const handleDelete = (id) => {
    if (window.confirm(isHindi ? 'क्या आप वाकई इसे हटाना चाहते हैं?' : 'Are you sure you want to delete this?')) {
      console.log('Deleting recruitment:', id);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-1">{isHindi ? 'भर्ती प्रबंधन' : 'Recruitment Management'}</h4>
            <p className="text-muted small mb-0">
              {isHindi ? 'सभी भर्ती सूचनाओं को प्रबंधित करें' : 'Manage all recruitment notices'}
            </p>
          </div>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" />
            {isHindi ? 'नई भर्ती' : 'New Recruitment'}
          </Button>
        </div>

        <Table responsive hover>
          <thead>
            <tr>
              <th>#</th>
              <th>{isHindi ? 'शीर्षक' : 'Title'}</th>
              <th>{isHindi ? 'पद' : 'Position'}</th>
              <th>{isHindi ? 'रिक्तियां' : 'Vacancies'}</th>
              <th>{isHindi ? 'अंतिम तिथि' : 'Last Date'}</th>
              <th>{isHindi ? 'स्थिति' : 'Status'}</th>
              <th>{isHindi ? 'कार्य' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {recruitments.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{isHindi ? item.titleHi : item.titleEn}</td>
                <td>{isHindi ? item.positionHi : item.positionEn}</td>
                <td>{item.vacancies}</td>
                <td>{new Date(item.lastDate).toLocaleDateString()}</td>
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
            <FaUser className="me-2" />
            {editingItem ? (isHindi ? 'भर्ती संपादित करें' : 'Edit Recruitment') : (isHindi ? 'नई भर्ती जोड़ें' : 'Add New Recruitment')}
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
                <Label>{isHindi ? 'रिक्तियां' : 'Vacancies'} *</Label>
                <Input type="number" value={formData.vacancies} onChange={(e) => setFormData({...formData, vacancies: e.target.value})} required />
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

export default RecruitmentManagement;

