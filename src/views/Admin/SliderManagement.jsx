import { useState } from 'react';
import { Card, CardBody, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { FaImages, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const SliderManagement = () => {
  const { isHindi } = useLanguage();
  const [modal, setModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState({
    smallTitleEn: '',
    smallTitleHi: '',
    mainTitleEn: '',
    mainTitleHi: '',
    descriptionEn: '',
    descriptionHi: '',
    image: '',
    link: '',
    linkTextEn: '',
    linkTextHi: '',
    order: 1,
    active: true
  });

  const [slides] = useState([
    {
      id: 1,
      smallTitleEn: 'Welcome to',
      smallTitleHi: 'में आपका स्वागत है',
      mainTitleEn: 'Higher Education Department',
      mainTitleHi: 'उच्च शिक्षा विभाग',
      descriptionEn: 'Building future leaders through quality education and innovation',
      descriptionHi: 'गुणवत्तापूर्ण शिक्षा और नवाचार के माध्यम से भविष्य के नेताओं का निर्माण',
      image: '/slider1.jpg',
      link: '/about',
      linkTextEn: 'Learn More',
      linkTextHi: 'और जानें',
      order: 1,
      active: true
    },
    {
      id: 2,
      smallTitleEn: 'Empowering',
      smallTitleHi: 'सशक्तिकरण',
      mainTitleEn: 'Quality Education for All',
      mainTitleHi: 'सभी के लिए गुणवत्तापूर्ण शिक्षा',
      descriptionEn: 'Excellence in learning and research across universities and colleges',
      descriptionHi: 'विश्वविद्यालयों और महाविद्यालयों में सीखने और अनुसंधान में उत्कृष्टता',
      image: '/slider2.jpg',
      link: '/universities',
      linkTextEn: 'Explore Universities',
      linkTextHi: 'विश्वविद्यालय देखें',
      order: 2,
      active: true
    },
  ]);

  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setEditingSlide(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      smallTitleEn: '',
      smallTitleHi: '',
      mainTitleEn: '',
      mainTitleHi: '',
      descriptionEn: '',
      descriptionHi: '',
      image: '',
      link: '',
      linkTextEn: '',
      linkTextHi: '',
      order: 1,
      active: true
    });
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      smallTitleEn: slide.smallTitleEn || '',
      smallTitleHi: slide.smallTitleHi || '',
      mainTitleEn: slide.mainTitleEn || '',
      mainTitleHi: slide.mainTitleHi || '',
      descriptionEn: slide.descriptionEn || '',
      descriptionHi: slide.descriptionHi || '',
      image: slide.image,
      link: slide.link || '',
      linkTextEn: slide.linkTextEn || '',
      linkTextHi: slide.linkTextHi || '',
      order: slide.order,
      active: slide.active
    });
    toggleModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving slide:', formData);
    toggleModal();
  };

  const handleDelete = (id) => {
    if (window.confirm(isHindi ? 'क्या आप वाकई इसे हटाना चाहते हैं?' : 'Are you sure you want to delete this?')) {
      console.log('Deleting slide:', id);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-1">{isHindi ? 'होम स्लाइडर प्रबंधन' : 'Home Slider Management'}</h4>
            <p className="text-muted small mb-0">
              {isHindi ? 'होम पेज स्लाइडर छवियों और सामग्री को प्रबंधित करें' : 'Manage home page slider images and content'}
            </p>
          </div>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" />
            {isHindi ? 'नया स्लाइड जोड़ें' : 'Add New Slide'}
          </Button>
        </div>

        <Table responsive hover>
          <thead>
            <tr>
              <th>#</th>
              <th>{isHindi ? 'छोटा शीर्षक' : 'Small Title'}</th>
              <th>{isHindi ? 'मुख्य शीर्षक' : 'Main Title'}</th>
              <th>{isHindi ? 'विवरण' : 'Description'}</th>
              <th>{isHindi ? 'लिंक टेक्स्ट' : 'Link Text'}</th>
              <th>{isHindi ? 'क्रम' : 'Order'}</th>
              <th>{isHindi ? 'स्थिति' : 'Status'}</th>
              <th>{isHindi ? 'कार्य' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {slides.map((slide, index) => (
              <tr key={slide.id}>
                <td>{index + 1}</td>
                <td>{isHindi ? slide.smallTitleHi : slide.smallTitleEn}</td>
                <td>{isHindi ? slide.mainTitleHi : slide.mainTitleEn}</td>
                <td className="text-truncate" style={{maxWidth: '200px'}}>
                  {isHindi ? slide.descriptionHi : slide.descriptionEn}
                </td>
                <td>{isHindi ? slide.linkTextHi : slide.linkTextEn}</td>
                <td>{slide.order}</td>
                <td>
                  <span className={`badge bg-${slide.active ? 'success' : 'secondary'}`}>
                    {slide.active ? (isHindi ? 'सक्रिय' : 'Active') : (isHindi ? 'निष्क्रिय' : 'Inactive')}
                  </span>
                </td>
                <td>
                  <Button color="info" size="sm" className="me-2" onClick={() => handleEdit(slide)}>
                    <FaEdit />
                  </Button>
                  <Button color="danger" size="sm" onClick={() => handleDelete(slide.id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            <FaImages className="me-2" />
            {editingSlide ? (isHindi ? 'स्लाइड संपादित करें' : 'Edit Slide') : (isHindi ? 'नया स्लाइड जोड़ें' : 'Add New Slide')}
          </ModalHeader>
          <ModalBody>
            <Form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-primary mb-3">{isHindi ? 'अंग्रेजी सामग्री' : 'English Content'}</h6>

                  <FormGroup>
                    <Label>{isHindi ? 'छोटा शीर्षक' : 'Small Title'} *</Label>
                    <Input
                      type="text"
                      value={formData.smallTitleEn}
                      onChange={(e) => setFormData({...formData, smallTitleEn: e.target.value})}
                      placeholder="e.g., Welcome to"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>{isHindi ? 'मुख्य शीर्षक' : 'Main Title'} *</Label>
                    <Input
                      type="text"
                      value={formData.mainTitleEn}
                      onChange={(e) => setFormData({...formData, mainTitleEn: e.target.value})}
                      placeholder="e.g., Higher Education Department"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>{isHindi ? 'विवरण' : 'Description'} *</Label>
                    <Input
                      type="textarea"
                      rows="3"
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({...formData, descriptionEn: e.target.value})}
                      placeholder="Brief description..."
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>{isHindi ? 'लिंक टेक्स्ट' : 'Link Text'} *</Label>
                    <Input
                      type="text"
                      value={formData.linkTextEn}
                      onChange={(e) => setFormData({...formData, linkTextEn: e.target.value})}
                      placeholder="e.g., Learn More"
                      required
                    />
                  </FormGroup>
                </div>

                <div className="col-md-6">
                  <h6 className="text-primary mb-3">{isHindi ? 'हिंदी सामग्री' : 'Hindi Content'}</h6>

                  <FormGroup>
                    <Label>{isHindi ? 'छोटा शीर्षक' : 'Small Title'} *</Label>
                    <Input
                      type="text"
                      value={formData.smallTitleHi}
                      onChange={(e) => setFormData({...formData, smallTitleHi: e.target.value})}
                      placeholder="उदा., में आपका स्वागत है"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>{isHindi ? 'मुख्य शीर्षक' : 'Main Title'} *</Label>
                    <Input
                      type="text"
                      value={formData.mainTitleHi}
                      onChange={(e) => setFormData({...formData, mainTitleHi: e.target.value})}
                      placeholder="उदा., उच्च शिक्षा विभाग"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>{isHindi ? 'विवरण' : 'Description'} *</Label>
                    <Input
                      type="textarea"
                      rows="3"
                      value={formData.descriptionHi}
                      onChange={(e) => setFormData({...formData, descriptionHi: e.target.value})}
                      placeholder="संक्षिप्त विवरण..."
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>{isHindi ? 'लिंक टेक्स्ट' : 'Link Text'} *</Label>
                    <Input
                      type="text"
                      value={formData.linkTextHi}
                      onChange={(e) => setFormData({...formData, linkTextHi: e.target.value})}
                      placeholder="उदा., और जानें"
                      required
                    />
                  </FormGroup>
                </div>
              </div>

              <hr className="my-4" />

              <div className="row">
                <div className="col-md-4">
                  <FormGroup>
                    <Label>{isHindi ? 'छवि URL' : 'Image URL'} *</Label>
                    <Input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      placeholder="/slider1.jpg"
                      required
                    />
                  </FormGroup>
                </div>

                <div className="col-md-4">
                  <FormGroup>
                    <Label>{isHindi ? 'लिंक URL' : 'Link URL'} *</Label>
                    <Input
                      type="text"
                      value={formData.link}
                      onChange={(e) => setFormData({...formData, link: e.target.value})}
                      placeholder="/about"
                      required
                    />
                  </FormGroup>
                </div>

                <div className="col-md-2">
                  <FormGroup>
                    <Label>{isHindi ? 'क्रम' : 'Order'}</Label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                      min="1"
                    />
                  </FormGroup>
                </div>

                <div className="col-md-2">
                  <FormGroup check className="mt-4">
                    <Label check>
                      <Input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({...formData, active: e.target.checked})}
                      />
                      {' '}{isHindi ? 'सक्रिय' : 'Active'}
                    </Label>
                  </FormGroup>
                </div>
              </div>
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

export default SliderManagement;

