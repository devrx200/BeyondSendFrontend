import { useState, useEffect } from 'react';
import { 
  Card, CardBody, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input, Badge 
} from 'reactstrap';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import DataService from '../../services/DataService';

const NewsManagement = () => {
  const { isHindi } = useLanguage();
  const [newsList, setNewsList] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    titleHi: '',
    date: '',
    category: 'admission',
    isNew: true,
    link: ''
  });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const data = await DataService.getLatestNews();
      setNewsList(data);
    } catch (error) {
      console.error('Error loading news:', error);
    }
  };

  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setEditingNews(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleHi: '',
      date: '',
      category: 'admission',
      isNew: true,
      link: ''
    });
  };

  const handleEdit = (news) => {
    setEditingNews(news);
    setFormData({
      title: news.title,
      titleHi: news.titleHi,
      date: news.date,
      category: news.category,
      isNew: news.isNew,
      link: news.link
    });
    toggleModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm(isHindi ? 'क्या आप वाकई इसे हटाना चाहते हैं?' : 'Are you sure you want to delete this?')) {
      try {
        await DataService.deleteNews(id);
        loadNews();
      } catch (error) {
        console.error('Error deleting news:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNews) {
        await DataService.updateNews(editingNews.id, formData);
      } else {
        await DataService.addNews(formData);
      }
      loadNews();
      toggleModal();
    } catch (error) {
      console.error('Error saving news:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>{isHindi ? 'समाचार प्रबंधन' : 'News Management'}</h4>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" />
            {isHindi ? 'नया समाचार जोड़ें' : 'Add News'}
          </Button>
        </div>

        <Table responsive striped hover>
          <thead>
            <tr>
              <th>#</th>
              <th>{isHindi ? 'शीर्षक' : 'Title'}</th>
              <th>{isHindi ? 'तिथि' : 'Date'}</th>
              <th>{isHindi ? 'श्रेणी' : 'Category'}</th>
              <th>{isHindi ? 'स्थिति' : 'Status'}</th>
              <th>{isHindi ? 'कार्रवाई' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {newsList.map((news, index) => (
              <tr key={news.id}>
                <td>{index + 1}</td>
                <td>{isHindi ? news.titleHi : news.title}</td>
                <td>{new Date(news.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN')}</td>
                <td><Badge color="info">{news.category}</Badge></td>
                <td>
                  {news.isNew && <Badge color="danger">{isHindi ? 'नया' : 'NEW'}</Badge>}
                </td>
                <td>
                  <Button color="warning" size="sm" className="me-2" onClick={() => handleEdit(news)}>
                    <FaEdit />
                  </Button>
                  <Button color="danger" size="sm" onClick={() => handleDelete(news.id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Add/Edit Modal */}
        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            {editingNews 
              ? (isHindi ? 'समाचार संपादित करें' : 'Edit News')
              : (isHindi ? 'नया समाचार जोड़ें' : 'Add News')
            }
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormGroup>
                <Label>{isHindi ? 'शीर्षक (अंग्रेजी)' : 'Title (English)'}</Label>
                <Input type="text" name="title" value={formData.title} onChange={handleChange} required />
              </FormGroup>
              <FormGroup>
                <Label>{isHindi ? 'शीर्षक (हिंदी)' : 'Title (Hindi)'}</Label>
                <Input type="text" name="titleHi" value={formData.titleHi} onChange={handleChange} required />
              </FormGroup>
              <FormGroup>
                <Label>{isHindi ? 'तिथि' : 'Date'}</Label>
                <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </FormGroup>
              <FormGroup>
                <Label>{isHindi ? 'श्रेणी' : 'Category'}</Label>
                <Input type="select" name="category" value={formData.category} onChange={handleChange}>
                  <option value="admission">Admission</option>
                  <option value="recruitment">Recruitment</option>
                  <option value="policy">Policy</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="event">Event</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label>{isHindi ? 'लिंक' : 'Link'}</Label>
                <Input type="text" name="link" value={formData.link} onChange={handleChange} required />
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} />
                  {isHindi ? ' नया के रूप में चिह्नित करें' : ' Mark as New'}
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

export default NewsManagement;

