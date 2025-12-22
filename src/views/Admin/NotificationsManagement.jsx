import { useState } from 'react';
import { Card, CardBody, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { FaBullhorn, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const NotificationsManagement = () => {
  const { isHindi } = useLanguage();
  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleHi: '',
    contentEn: '',
    contentHi: '',
    date: '',
    file: '',
    active: true
  });

  const [notifications] = useState([
    { id: 1, titleEn: 'Exam Schedule', titleHi: 'परीक्षा कार्यक्रम', date: '2024-01-20', active: true },
    { id: 2, titleEn: 'Holiday Notice', titleHi: 'अवकाश सूचना', date: '2024-01-18', active: true },
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
      contentEn: '',
      contentHi: '',
      date: '',
      file: '',
      active: true
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      titleEn: item.titleEn,
      titleHi: item.titleHi,
      contentEn: item.contentEn || '',
      contentHi: item.contentHi || '',
      date: item.date,
      file: item.file || '',
      active: item.active
    });
    toggleModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving notification:', formData);
    toggleModal();
  };

  const handleDelete = (id) => {
    if (window.confirm(isHindi ? 'क्या आप वाकई इसे हटाना चाहते हैं?' : 'Are you sure you want to delete this?')) {
      console.log('Deleting notification:', id);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-1">{isHindi ? 'सूचनाएं प्रबंधन' : 'Notifications Management'}</h4>
            <p className="text-muted small mb-0">
              {isHindi ? 'सभी सूचनाओं को प्रबंधित करें' : 'Manage all notifications'}
            </p>
          </div>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" />
            {isHindi ? 'नई सूचना' : 'New Notification'}
          </Button>
        </div>

        <Table responsive hover>
          <thead>
            <tr>
              <th>#</th>
              <th>{isHindi ? 'शीर्षक (अंग्रेजी)' : 'Title (English)'}</th>
              <th>{isHindi ? 'शीर्षक (हिंदी)' : 'Title (Hindi)'}</th>
              <th>{isHindi ? 'तारीख' : 'Date'}</th>
              <th>{isHindi ? 'स्थिति' : 'Status'}</th>
              <th>{isHindi ? 'कार्य' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.titleEn}</td>
                <td>{item.titleHi}</td>
                <td>{new Date(item.date).toLocaleDateString()}</td>
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
            <FaBullhorn className="me-2" />
            {editingItem ? (isHindi ? 'सूचना संपादित करें' : 'Edit Notification') : (isHindi ? 'नई सूचना जोड़ें' : 'Add New Notification')}
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
                <Label>{isHindi ? 'तारीख' : 'Date'} *</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
              </FormGroup>
              <FormGroup>
                <Label>{isHindi ? 'फाइल अपलोड करें' : 'Upload File'}</Label>
                <Input type="file" onChange={(e) => setFormData({...formData, file: e.target.files[0]})} />
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

export default NotificationsManagement;

