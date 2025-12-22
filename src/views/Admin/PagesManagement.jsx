import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Badge } from 'reactstrap';
import { FaFileAlt, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaEye } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
// import axios from 'axios'; // Will be used when API is ready

const PagesManagement = () => {
  const { isHindi } = useLanguage();
  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [pages, setPages] = useState([]);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleHi: '',
    contentEn: '',
    contentHi: '',
    slug: '',
    metaDescriptionEn: '',
    metaDescriptionHi: '',
    metaKeywords: '',
    category: '',
    active: true,
    featured: false
  });

  useEffect(() => {
    loadPages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPages = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Dummy pages data based on government website structure
      const dummyPages = [
        // About Us Section
        {
          id: 1,
          titleEn: 'Growth of Colleges',
          titleHi: 'कॉलेजों का विकास',
          slug: 'about/growth-colleges',
          contentEn: '<h2>Growth of Colleges in Chhattisgarh</h2><p>The higher education sector in Chhattisgarh has witnessed remarkable growth...</p>',
          contentHi: '<h2>छत्तीसगढ़ में कॉलेजों का विकास</h2><p>छत्तीसगढ़ में उच्च शिक्षा क्षेत्र में उल्लेखनीय वृद्धि हुई है...</p>',
          category: 'About Us',
          active: true,
          featured: false
        },
        {
          id: 2,
          titleEn: 'Location of Colleges',
          titleHi: 'कॉलेजों के स्थान',
          slug: 'about/location-colleges',
          contentEn: '<h2>Location of Colleges</h2><p>Colleges are strategically located across all districts...</p>',
          contentHi: '<h2>कॉलेजों के स्थान</h2><p>सभी जिलों में कॉलेज रणनीतिक रूप से स्थित हैं...</p>',
          category: 'About Us',
          active: true,
          featured: false
        },
        {
          id: 3,
          titleEn: 'Academic Calendar',
          titleHi: 'शैक्षणिक कैलेंडर',
          slug: 'about/academic-calendar',
          contentEn: '<h2>Academic Calendar 2024-25</h2><p>The academic calendar for the year 2024-25...</p>',
          contentHi: '<h2>शैक्षणिक कैलेंडर 2024-25</h2><p>वर्ष 2024-25 के लिए शैक्षणिक कैलेंडर...</p>',
          category: 'About Us',
          active: true,
          featured: true
        },
        {
          id: 4,
          titleEn: 'Departmental Budget',
          titleHi: 'विभागीय बजट',
          slug: 'about/budget',
          contentEn: '<h2>Departmental Budget</h2><p>Budget allocation for higher education department...</p>',
          contentHi: '<h2>विभागीय बजट</h2><p>उच्च शिक्षा विभाग के लिए बजट आवंटन...</p>',
          category: 'About Us',
          active: true,
          featured: false
        },
        {
          id: 5,
          titleEn: 'Annual Report',
          titleHi: 'वार्षिक प्रतिवेदन',
          slug: 'about/annual-report',
          contentEn: '<h2>Annual Report 2023-24</h2><p>Comprehensive annual report of the department...</p>',
          contentHi: '<h2>वार्षिक प्रतिवेदन 2023-24</h2><p>विभाग की व्यापक वार्षिक रिपोर्ट...</p>',
          category: 'About Us',
          active: true,
          featured: true
        },
        {
          id: 6,
          titleEn: 'Acts and Rules',
          titleHi: 'महत्वपूर्ण नियम एवं अधिनियम',
          slug: 'about/acts-rules',
          contentEn: '<h2>Important Acts and Rules</h2><p>Key legislation governing higher education...</p>',
          contentHi: '<h2>महत्वपूर्ण नियम एवं अधिनियम</h2><p>उच्च शिक्षा को नियंत्रित करने वाले प्रमुख कानून...</p>',
          category: 'About Us',
          active: true,
          featured: false
        },
        {
          id: 7,
          titleEn: "Who's Who",
          titleHi: 'कौन क्या है',
          slug: 'about/whos-who',
          contentEn: '<h2>Who\'s Who</h2><p>Key officials and their responsibilities...</p>',
          contentHi: '<h2>कौन क्या है</h2><p>प्रमुख अधिकारी और उनकी जिम्मेदारियां...</p>',
          category: 'About Us',
          active: true,
          featured: false
        },
        {
          id: 8,
          titleEn: 'Organization Chart',
          titleHi: 'संगठन चार्ट',
          slug: 'about/organization-chart',
          contentEn: '<h2>Organization Chart</h2><p>Organizational structure of the department...</p>',
          contentHi: '<h2>संगठन चार्ट</h2><p>विभाग की संगठनात्मक संरचना...</p>',
          category: 'About Us',
          active: true,
          featured: false
        },

        // Services Section
        {
          id: 9,
          titleEn: 'Compassionate Appointment',
          titleHi: 'अनुकम्पा नियुक्ति',
          slug: 'services/compassionate-appointment',
          contentEn: '<h2>Compassionate Appointment</h2><p>Guidelines for compassionate appointments...</p>',
          contentHi: '<h2>अनुकम्पा नियुक्ति</h2><p>अनुकम्पा नियुक्ति के लिए दिशानिर्देश...</p>',
          category: 'Services',
          active: true,
          featured: false
        },
        {
          id: 10,
          titleEn: 'Private Colleges',
          titleHi: 'अशासकीय महाविद्यालय',
          slug: 'services/private-colleges',
          contentEn: '<h2>Private Colleges</h2><p>Information about private colleges...</p>',
          contentHi: '<h2>अशासकीय महाविद्यालय</h2><p>निजी कॉलेजों के बारे में जानकारी...</p>',
          category: 'Services',
          active: true,
          featured: false
        },
        {
          id: 11,
          titleEn: 'Web Application Portal',
          titleHi: 'वेब एप्लीकेशन पोर्टल',
          slug: 'services/web-portal',
          contentEn: '<h2>Web Application Portal</h2><p>Access various online services...</p>',
          contentHi: '<h2>वेब एप्लीकेशन पोर्टल</h2><p>विभिन्न ऑनलाइन सेवाओं तक पहुंचें...</p>',
          category: 'Services',
          active: true,
          featured: true
        },

        // RTI Section
        {
          id: 12,
          titleEn: 'Right to Information',
          titleHi: 'सूचना का अधिकार',
          slug: 'rti',
          contentEn: '<h2>Right to Information</h2><p>RTI guidelines and procedures...</p>',
          contentHi: '<h2>सूचना का अधिकार</h2><p>आरटीआई दिशानिर्देश और प्रक्रियाएं...</p>',
          category: 'RTI',
          active: true,
          featured: true
        },

        // NEP 2020 Section
        {
          id: 13,
          titleEn: 'NEP 2020 - Orders / Instructions',
          titleHi: 'राष्ट्रीय शिक्षा नीति 2020 - आदेश / निर्देश',
          slug: 'nep-2020/orders',
          contentEn: '<h2>Orders and Instructions</h2><p>Official orders related to NEP 2020...</p>',
          contentHi: '<h2>आदेश और निर्देश</h2><p>एनईपी 2020 से संबंधित आधिकारिक आदेश...</p>',
          category: 'NEP 2020',
          active: true,
          featured: false
        },
        {
          id: 14,
          titleEn: 'NEP 2020 - Curriculum',
          titleHi: 'राष्ट्रीय शिक्षा नीति 2020 - पाठ्यक्रम',
          slug: 'nep-2020/curriculum',
          contentEn: '<h2>Curriculum</h2><p>New curriculum under NEP 2020...</p>',
          contentHi: '<h2>पाठ्यक्रम</h2><p>एनईपी 2020 के तहत नया पाठ्यक्रम...</p>',
          category: 'NEP 2020',
          active: true,
          featured: false
        },
        {
          id: 15,
          titleEn: 'NEP 2020 - Various Committees',
          titleHi: 'राष्ट्रीय शिक्षा नीति 2020 - विभिन्न समितिया',
          slug: 'nep-2020/committees',
          contentEn: '<h2>Various Committees</h2><p>Committees formed for NEP implementation...</p>',
          contentHi: '<h2>विभिन्न समितिया</h2><p>एनईपी कार्यान्वयन के लिए गठित समितियां...</p>',
          category: 'NEP 2020',
          active: true,
          featured: false
        },
        {
          id: 16,
          titleEn: 'NEP 2020 - FAQs',
          titleHi: 'राष्ट्रीय शिक्षा नीति 2020 - सामान्य प्रश्न',
          slug: 'nep-2020/faqs',
          contentEn: '<h2>Frequently Asked Questions</h2><p>Common questions about NEP 2020...</p>',
          contentHi: '<h2>सामान्य प्रश्न</h2><p>एनईपी 2020 के बारे में सामान्य प्रश्न...</p>',
          category: 'NEP 2020',
          active: true,
          featured: false
        }
      ];

      setPages(dummyPages);

      // When API is ready:
      // const response = await axios.get('/api/pages');
      // setPages(response.data);
    } catch (error) {
      console.error('Error loading pages:', error);
      setPages([]);
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
      titleEn: '',
      titleHi: '',
      contentEn: '',
      contentHi: '',
      slug: '',
      metaDescriptionEn: '',
      metaDescriptionHi: '',
      metaKeywords: '',
      category: '',
      active: true,
      featured: false
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      titleEn: item.titleEn,
      titleHi: item.titleHi,
      contentEn: item.contentEn || '',
      contentHi: item.contentHi || '',
      slug: item.slug,
      metaDescriptionEn: item.metaDescriptionEn || '',
      metaDescriptionHi: item.metaDescriptionHi || '',
      metaKeywords: item.metaKeywords || '',
      category: item.category || '',
      active: item.active !== undefined ? item.active : true,
      featured: item.featured || false
    });
    toggleModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm(isHindi ? 'क्या आप वाकई इसे हटाना चाहते हैं?' : 'Are you sure you want to delete this?')) {
      try {
        setPages(pages.filter(page => page.id !== id));
        // When API is ready:
        // await axios.delete(`/api/pages/${id}`);
        // loadPages();
      } catch (error) {
        console.error('Error deleting page:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Update page
        setPages(pages.map(page => page.id === editingItem.id ? { ...page, ...formData } : page));
        // When API is ready:
        // await axios.put(`/api/pages/${editingItem.id}`, formData);
      } else {
        // Add new page
        const newPage = { ...formData, id: Date.now() };
        setPages([...pages, newPage]);
        // When API is ready:
        // await axios.post('/api/pages', formData);
      }
      toggleModal();
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-1">{isHindi ? 'पृष्ठ सामग्री प्रबंधन' : 'Pages Content Management'}</h4>
            <p className="text-muted small mb-0">
              {isHindi ? 'सभी पृष्ठों की सामग्री को संपादित करें (हिंदी और अंग्रेजी)' : 'Edit all pages content (Hindi and English)'}
            </p>
          </div>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" />
            {isHindi ? 'नया पृष्ठ' : 'New Page'}
          </Button>
        </div>

        <Table responsive hover striped>
          <thead>
            <tr>
              <th>#</th>
              <th>{isHindi ? 'शीर्षक' : 'Title'}</th>
              <th>{isHindi ? 'श्रेणी' : 'Category'}</th>
              <th>{isHindi ? 'स्लग' : 'Slug'}</th>
              <th>{isHindi ? 'स्थिति' : 'Status'}</th>
              <th>{isHindi ? 'कार्य' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>
                  <div>{isHindi ? item.titleHi : item.titleEn}</div>
                  {item.featured && (
                    <Badge color="warning" className="mt-1">
                      {isHindi ? 'विशेष' : 'Featured'}
                    </Badge>
                  )}
                </td>
                <td>
                  <Badge color="info">{item.category}</Badge>
                </td>
                <td><code className="small">{item.slug}</code></td>
                <td>
                  <Badge color={item.active ? 'success' : 'secondary'}>
                    {item.active ? (isHindi ? 'सक्रिय' : 'Active') : (isHindi ? 'निष्क्रिय' : 'Inactive')}
                  </Badge>
                </td>
                <td>
                  <Button color="primary" size="sm" className="me-1" onClick={() => handleEdit(item)}>
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

        <Modal isOpen={modal} toggle={toggleModal} size="xl">
          <ModalHeader toggle={toggleModal}>
            <FaFileAlt className="me-2" />
            {editingItem ? (isHindi ? 'पृष्ठ संपादित करें' : 'Edit Page') : (isHindi ? 'नया पृष्ठ जोड़ें' : 'Add New Page')}
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              {/* Basic Information */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'शीर्षक (अंग्रेजी)' : 'Title (English)'} *</Label>
                    <Input
                      type="text"
                      name="titleEn"
                      value={formData.titleEn}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'शीर्षक (हिंदी)' : 'Title (Hindi)'} *</Label>
                    <Input
                      type="text"
                      name="titleHi"
                      value={formData.titleHi}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'स्लग' : 'Slug'} *</Label>
                    <Input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="about/growth-colleges"
                      required
                    />
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'श्रेणी' : 'Category'}</Label>
                    <Input
                      type="select"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">{isHindi ? 'चुनें' : 'Select'}</option>
                      <option value="About Us">{isHindi ? 'हमारे बारे में' : 'About Us'}</option>
                      <option value="Services">{isHindi ? 'सेवाएं' : 'Services'}</option>
                      <option value="Notice Board">{isHindi ? 'सूचना पट्ट' : 'Notice Board'}</option>
                      <option value="RTI">{isHindi ? 'आरटीआई' : 'RTI'}</option>
                      <option value="NEP 2020">{isHindi ? 'एनईपी 2020' : 'NEP 2020'}</option>
                      <option value="Other">{isHindi ? 'अन्य' : 'Other'}</option>
                    </Input>
                  </FormGroup>
                </div>
              </div>

              {/* Content */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'सामग्री (अंग्रेजी)' : 'Content (English)'} *</Label>
                    <Input
                      type="textarea"
                      name="contentEn"
                      rows="8"
                      value={formData.contentEn}
                      onChange={handleChange}
                      required
                    />
                    <small className="text-muted">
                      {isHindi ? 'HTML टैग का उपयोग किया जा सकता है' : 'HTML tags can be used'}
                    </small>
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'सामग्री (हिंदी)' : 'Content (Hindi)'} *</Label>
                    <Input
                      type="textarea"
                      name="contentHi"
                      rows="8"
                      value={formData.contentHi}
                      onChange={handleChange}
                      required
                    />
                    <small className="text-muted">
                      {isHindi ? 'HTML टैग का उपयोग किया जा सकता है' : 'HTML tags can be used'}
                    </small>
                  </FormGroup>
                </div>
              </div>

              {/* Meta Information */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'मेटा विवरण (अंग्रेजी)' : 'Meta Description (English)'}</Label>
                    <Input
                      type="textarea"
                      name="metaDescriptionEn"
                      rows="2"
                      value={formData.metaDescriptionEn}
                      onChange={handleChange}
                      maxLength="160"
                    />
                    <small className="text-muted">
                      {isHindi ? 'SEO के लिए (अधिकतम 160 वर्ण)' : 'For SEO (max 160 characters)'}
                    </small>
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label>{isHindi ? 'मेटा विवरण (हिंदी)' : 'Meta Description (Hindi)'}</Label>
                    <Input
                      type="textarea"
                      name="metaDescriptionHi"
                      rows="2"
                      value={formData.metaDescriptionHi}
                      onChange={handleChange}
                      maxLength="160"
                    />
                    <small className="text-muted">
                      {isHindi ? 'SEO के लिए (अधिकतम 160 वर्ण)' : 'For SEO (max 160 characters)'}
                    </small>
                  </FormGroup>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-12">
                  <FormGroup>
                    <Label>{isHindi ? 'मेटा कीवर्ड' : 'Meta Keywords'}</Label>
                    <Input
                      type="text"
                      name="metaKeywords"
                      value={formData.metaKeywords}
                      onChange={handleChange}
                      placeholder={isHindi ? 'कीवर्ड1, कीवर्ड2, कीवर्ड3' : 'keyword1, keyword2, keyword3'}
                    />
                  </FormGroup>
                </div>
              </div>

              {/* Status */}
              <div className="row">
                <div className="col-md-6">
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleChange}
                      />
                      {' '}{isHindi ? 'सक्रिय' : 'Active'}
                    </Label>
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                      />
                      {' '}{isHindi ? 'विशेष पृष्ठ' : 'Featured Page'}
                    </Label>
                  </FormGroup>
                </div>
              </div>
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

export default PagesManagement;

