import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Row, Col, Container } from 'reactstrap';
import { FaImages, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import axios from "axios";
import Swal from "sweetalert2";
const SliderManagement = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { isHindi } = useLanguage();
  const [modal, setModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [errors, setErrors] = useState({});
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
    active: true,
    uploadefile: null,
  });
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  // const handleImageChange = (e) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   setFormData((prev) => ({
  //     ...prev,
  //     uploadefile: file,        //  actual file (FormData ke liye)
  //     image: file.name,         //  filename store (string)
  //   }));

  //   setPreview(URL.createObjectURL(file));
  // };
const [imagePreview, setImagePreview] = useState(null);
const MAX_SLIDER_IMAGE_SIZE = 520 * 1024; // 520 KB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const handleImageChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  //  File type validation
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    setErrors(prev => ({
      ...prev,
      image: "Only JPG, PNG or WEBP images are allowed",
      
    }));
    setImagePreview(null);
    return;
  }


  if (file.size > MAX_SLIDER_IMAGE_SIZE) {
    setErrors(prev => ({
      ...prev,
      image: "Slider image size must be 520 KB or less",
    }));
    setImagePreview(null);
    return;
  }

  // Passed all validations
  setFormData(prev => ({
    ...prev,
    uploadefile: file,
    image: file.name,
  }));

  setErrors(prev => ({ ...prev, image: "" }));
  setImagePreview(URL.createObjectURL(file));
};

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/get-hero-slides`,
        {
          headers: { "web-url": window.location.href },
        }
      );

      if (res.status === 200) {
        setSlides(res.data.data || []);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load hero slides",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);
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

    const validateField = (name, value, isHindi) => {
    const TEXTAREA_FIELDS = ["descriptionEn", "descriptionHi"];

    const HINDI_TEXT_ONLY = /^[\u0900-\u097F .,!?'"()\-\n\r]+$/;
    const HINDI_WITH_NUMBERS = /^[\u0900-\u097F0-9०-९ .,!?'"()\-\n\r]+$/;

    const ENGLISH_TEXT_ONLY = /^[A-Za-z .,!?'"()\-\n\r]+$/;
    const ENGLISH_WITH_NUMBERS = /^[A-Za-z0-9 .,!?'"()\-\n\r]+$/;

    if (!value || !value.trim()) {
      return isHindi ? "यह फ़ील्ड आवश्यक है" : "This field is required";
    }

    const isTextarea = TEXTAREA_FIELDS.includes(name);

    if (isHindi) {
      const regex = isTextarea ? HINDI_WITH_NUMBERS : HINDI_TEXT_ONLY;
      if (!regex.test(value)) {
        return isTextarea
          ? "कृपया केवल हिंदी अक्षर और अंक प्रयोग करें"
          : "कृपया केवल हिंदी अक्षर प्रयोग करें";
      }
    } else {
      const regex = isTextarea ? ENGLISH_WITH_NUMBERS : ENGLISH_TEXT_ONLY;
      if (!regex.test(value)) {
        return isTextarea
          ? "Please enter English text and numbers only"
          : "Please enter English text only";
      }
    }

    return "";
  };
  
  const validateForm = () => {
  const newErrors = {};

  // English fields
  newErrors.smallTitleEn = validateField("smallTitleEn", formData.smallTitleEn, false);
  newErrors.mainTitleEn = validateField("mainTitleEn", formData.mainTitleEn, false);
  newErrors.linkTextEn = validateField("linkTextEn", formData.linkTextEn, false);

  // Hindi fields
  newErrors.smallTitleHi = validateField("smallTitleHi", formData.smallTitleHi, true);
  newErrors.mainTitleHi = validateField("mainTitleHi", formData.mainTitleHi, true);
  newErrors.linkTextHi = validateField("linkTextHi", formData.linkTextHi, true);

  newErrors.descriptionEn = validateField("descriptionEn", formData.descriptionEn, false);
  newErrors.descriptionHi = validateField("descriptionHi", formData.descriptionHi, true);

  if (!formData.link || !formData.link.trim()) {
    newErrors.link = isHindi ? "लिंक आवश्यक है" : "Link is required";
  }

  if (!formData.order || isNaN(formData.order) || formData.order <= 0) {
    newErrors.order = isHindi
      ? "क्रम एक मान्य संख्या होनी चाहिए"
      : "Order must be a valid number";
  }

  if (!editingSlide && !formData.uploadefile) {
    newErrors.image = isHindi
      ? "छवि आवश्यक है"
      : "Image is required";
  }

  Object.keys(newErrors).forEach(
    key => newErrors[key] === "" && delete newErrors[key]
  );

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

 const handleChange = (e, langType = null) => {
  const { name, value, type, checked } = e.target;

  const fieldValue = type === "checkbox" ? checked : value;

  setFormData(prev => ({
    ...prev,
    [name]: fieldValue,
  }));

  if (langType) {
    const error = validateField(name, fieldValue, langType === "hi");
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  } else {
    setErrors(prev => ({
      ...prev,
      [name]: "",
    }));
  }
};


  const handleEdit = (slide) => {
    setEditingSlide(slide);

    setFormData({
      smallTitleEn: slide.subtitleEng || "",
      smallTitleHi: slide.subtitleHin || "",

      mainTitleEn: slide.titleEng || "",
      mainTitleHi: slide.titleHin || "",

      descriptionEn: slide.descriptionEng || "",
      descriptionHi: slide.descriptionHin || "",

      link: slide.link || "",

      linkTextEn: slide.linkTextEn,   // backend me nahi hai
      linkTextHi: slide.linkTextHi,     // backend me nahi hai

      order: slide.displayOrder || 1,
      active: slide.isActive ?? true,

      image: slide.image || "",   // filename/path show ke liye
      uploadefile: null           // edit me file optional
    });

    setModal(true);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    return `${API_URL}${imagePath.replace(/\\/g, "/")}`;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
 if (!validateForm()) {
      Swal.fire(
        isHindi ? "त्रुटि" : "Validation Error",
        isHindi
          ? "कृपया सभी आवश्यक फ़ील्ड सही भरें"
          : "Please fill all required fields correctly",
        "error"
      );
      return;
    }
    try {
      const payload = new FormData();

      payload.append("titleEng", formData.mainTitleEn);
      payload.append("titleHin", formData.mainTitleHi);
      payload.append("subtitleEng", formData.smallTitleEn);
      payload.append("subtitleHin", formData.smallTitleHi);
      payload.append("descriptionEng", formData.descriptionEn);
      payload.append("descriptionHin", formData.descriptionHi);
      payload.append("linkTextEn", formData.linkTextEn);
      payload.append("linkTextHi", formData.linkTextHi);
      payload.append("displayOrder", formData.order);
      payload.append("isActive", formData.active);

      // SEND FILE CORRECTLY
      if (formData.uploadefile) {
        payload.append("image", formData.uploadefile);
      }

      let response;

      if (editingSlide) {
        response = await axios.put(
          `${API_URL}/api/update-hero-slide/${editingSlide._id}`,
          payload,
          { headers: { "web-url": window.location.href } }
        );
      } else {
        response = await axios.post(
          `${API_URL}/api/create-hero-slide`,
          payload,
          { headers: { "web-url": window.location.href } }
        );
      }

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: response.data.message,
          timer: 2000,
          showConfirmButton: false,
        });

        toggleModal();      // HERE ONLY
        fetchSlides();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Something went wrong",
      });
    }
  };


  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(
        `${API_URL}/api/deactivate-hero-slide/${id}`,
        { headers: { "web-url": window.location.href } }
      );

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: res.data.message,
          timer: 2000,
          showConfirmButton: false,
        });

        fetchSlides();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text:
          error?.response?.data?.message ||
          "Unable to delete slide",
      });
    }
  };
  const activeSlides = slides.filter(slide => slide.isActive);
  const inactiveSlides = slides.filter(slide => !slide.isActive);

  const handlePermanentDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Permanent Delete?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete permanently",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(
        `${API_URL}/api/permanent-delete-hero-slide/${id}`,
        { headers: { "web-url": window.location.href } }
      );

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: res.data.message,
          timer: 2000,
          showConfirmButton: false,
        });

        fetchSlides();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text:
          error?.response?.data?.message ||
          "Unable to permanently delete slide",
      });
    }
  };

  return (
    <>
      <Container>
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
            <hr className="my-4" />

            <Table responsive bordered hover>
              <thead>
                <tr>
                  <th>S.NO.</th>
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
                {slides
                  .filter(slide => slide.isActive)   // ONLY ACTIVE
                  .map((slide, index) => (
                    <tr key={slide.id}>
                      <td>{index + 1}</td>
                      <td>{isHindi ? slide.subtitleHin : slide.subtitleEng}</td>
                      <td>{isHindi ? slide.titleHin : slide.titleEng}</td>
                      <td className="text-truncate" style={{ maxWidth: '200px' }}>
                        {isHindi ? slide.descriptionHin : slide.descriptionEng}
                      </td>
                      <td>{isHindi ? slide.linkTextHi : slide.linkTextEn}</td>
                      <td>{slide.displayOrder}</td>
                      <td>
                        <span className={`badge bg-${slide.isActive ? 'success' : 'secondary'}`}>
                          {slide.isActive ? (isHindi ? 'सक्रिय' : 'Active') : (isHindi ? 'निष्क्रिय' : 'Inactive')}
                        </span>
                      </td>
                      <td className="text-nowrap">
                        <Button
                          color="info"
                          size="sm"
                          className="px-2 py-1 me-1"
                          onClick={() => handleEdit(slide)}
                        >
                          <FaEdit size={12} />
                        </Button>

                        <Button
                          color="danger"
                          size="sm"
                          className="px-2 py-1"
                          onClick={() => handleDelete(slide._id)}
                        >
                          <FaTrash size={12} />
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
                <Form>
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-primary mb-3">{isHindi ? 'अंग्रेजी सामग्री' : 'English Content'}</h6>

                      <FormGroup>
                        <Label>{isHindi ? 'छोटा शीर्षक' : 'Small Title'} *</Label>
                        <Input
                          type="text"
                          name="smallTitleEn"  
                          value={formData.smallTitleEn}
                           onChange={(e) => handleChange(e, "en")}
                          placeholder="e.g., Welcome to"
                          invalid={!!errors.smallTitleEn}
                          required
                        />
                        {errors.smallTitleEn && <small className="text-danger">{errors.smallTitleEn}</small>}
                      </FormGroup>

                      <FormGroup>
                        <Label>{isHindi ? 'मुख्य शीर्षक' : 'Main Title'} *</Label>
                        <Input
                          type="text"
                          name="mainTitleEn"  
                          value={formData.mainTitleEn}
                              onChange={(e) => handleChange(e, "en")}
                           invalid={!!errors.mainTitleEn}
                          placeholder="e.g., Higher Education Department"
                          required
                        />
                        {errors.mainTitleEn && <small className="text-danger">{errors.mainTitleEn}</small>}
                      </FormGroup>

                      <FormGroup>
                        <Label>{isHindi ? 'विवरण' : 'Description'} *</Label>
                        <Input
                          type="textarea"
                          name="descriptionEn"  
                          rows="3"
                          value={formData.descriptionEn}
                           onChange={(e) => handleChange(e, "en")}
                            invalid={!!errors.descriptionEn}
                          placeholder="Brief description..."
                          required
                        />
                        {errors.descriptionEn && <small className="text-danger">{errors.descriptionEn}</small>}
                      </FormGroup>

                      <FormGroup>
                        <Label>{isHindi ? 'लिंक टेक्स्ट' : 'Link Text'} *</Label>
                        <Input
                          type="text"
                          value={formData.linkTextEn}
                          name="linkTextEn"  
                           onChange={(e) => handleChange(e, "en")}
                           invalid={!!errors.linkTextEn}
                          placeholder="e.g., Learn More"
                          required
                        />
                        {errors.linkTextEn && <small className="text-danger">{errors.linkTextEn}</small>}
                      </FormGroup>
                    </div>

                    <div className="col-md-6">
                      <h6 className="text-primary mb-3">{isHindi ? 'हिंदी सामग्री' : 'Hindi Content'}</h6>

                      <FormGroup>
                        <Label>{isHindi ? 'छोटा शीर्षक' : 'Small Title'} *</Label>
                        <Input
                          type="text"
                          name="smallTitleHi"  
                          value={formData.smallTitleHi}
                          onChange={(e) => handleChange(e, "hi")}
                          invalid={!!errors.smallTitleHi}
                          placeholder="उदा., में आपका स्वागत है"
                          required
                        />
                        {errors.smallTitleHi && <small className="text-danger">{errors.smallTitleHi}</small>}
                      </FormGroup>

                      <FormGroup>
                        <Label>{isHindi ? 'मुख्य शीर्षक' : 'Main Title'} *</Label>
                        <Input
                          type="text"
                          value={formData.mainTitleHi}
                          name="mainTitleHi"  
                         onChange={(e) => handleChange(e, "hi")}
                          invalid={!!errors.mainTitleHi}
                          placeholder="उदा., उच्च शिक्षा विभाग"
                          required
                        />
                         {errors.mainTitleHi && <small className="text-danger">{errors.mainTitleHi}</small>}
                      </FormGroup>

                      <FormGroup>
                        <Label>{isHindi ? 'विवरण' : 'Description'} *</Label>
                        <Input
                          type="textarea"
                          rows="3"
                           name="descriptionHi"  
                          value={formData.descriptionHi}
                          onChange={(e) => handleChange(e, "hi")}
                           invalid={!!errors.descriptionHi}
                          placeholder="संक्षिप्त विवरण..."
                          required
                        />
                         {errors.descriptionHi && <small className="text-danger">{errors.descriptionHi}</small>}
                      </FormGroup>

                      <FormGroup>
                        <Label>{isHindi ? 'लिंक टेक्स्ट' : 'Link Text'} *</Label>
                        <Input
                          type="text"
                          value={formData.linkTextHi}
                          name="linkTextHi"  
                          onChange={(e) => handleChange(e, "hi")}
                          invalid={!!errors.linkTextHi}
                          placeholder="उदा., और जानें"
                          required
                        />
                         {errors.linkTextHi && <small className="text-danger">{errors.linkTextHi}</small>}
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
                          name="image"  
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                         
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
                           name="link" 
                          value={formData.link}
                          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
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
                           name="order" 
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                          min="1"
                        />
                      </FormGroup>
                    </div>

                    <div className="col-md-2">
                      <FormGroup check className="mt-4">
                        <Label check>
                          <Input
                            type="checkbox"
                             name="active" 
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                          />
                          {' '}{isHindi ? 'सक्रिय' : 'Active'}
                        </Label>
                      </FormGroup>
                    </div>
                  </div>
                  <Row>
                    <Col xs={6}>
                      <FormGroup>
                        <Label>Upload Image</Label>
                        <Input type="file" name="uploadefile"  invalid={!!errors.image} accept="image/*" onChange={handleImageChange} />
                         {errors.image && <small className="text-danger">{errors.image}</small>}
                        {/* <p>{formData.image}</p> */}
                      </FormGroup>
                    </Col>
                    <Col xs={6}>
                      {editingSlide && formData.image && (
                        <div className="mt-4">
                          {/* <Label className="d-block">Existing Image</Label>

    <img
      src={getImageUrl(formData.image)}
      alt="Hero Slide"
      style={{
        width: "100%",
        maxHeight: "150px",
        objectFit: "cover",
        border: "1px solid #ddd",
        borderRadius: "6px",
      }}
    /> */}

                          {editingSlide && formData.image && !formData.uploadefile && (
                            <a
                              href={getImageUrl(formData.image)}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-secondary mt-2"
                            >
                              ⬇ Download Existing Image
                            </a>
                          )}


                        </div>
                      )}
                    </Col>

                    {/* {preview && (
                      <img src={preview} style={{ width: "100%", maxHeight: 150 }} />
                    )} */}

                  </Row>
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onClick={toggleModal}>{isHindi ? 'रद्द करें' : 'Cancel'}</Button>
                <Button color="primary" onClick={handleSubmit}>{isHindi ? 'सहेजें' : 'Save'}</Button>
              </ModalFooter>
            </Modal>

          </CardBody>
        </Card>
        <br />
        <Card>
          <CardBody>
            {inactiveSlides.length > 0 && (
              <>


                <h5 className="mb-3 text-danger">
                  {isHindi ? "निष्क्रिय स्लाइडर सूची" : "Inactive Slider List"}
                </h5>
                <hr className="my-4" />
                <Table responsive bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th>S.No.</th>
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
                    {inactiveSlides.map((slide, index) => (
                      <tr key={slide._id}>
                        <td>{index + 1}</td>
                        <td>{isHindi ? slide.subtitleHin : slide.subtitleEng}</td>
                        <td>{isHindi ? slide.titleHin : slide.titleEng}</td>
                        <td className="text-truncate" style={{ maxWidth: '200px' }}>
                          {isHindi ? slide.descriptionHin : slide.descriptionEng}
                        </td>
                        <td>{isHindi ? slide.linkTextHi : slide.linkTextEn}</td>
                        <td>{slide.displayOrder}</td>
                        <td>
                          <span className={`badge bg-${slide.isActive ? 'success' : 'secondary'}`}>
                            {slide.isActive ? (isHindi ? 'सक्रिय' : 'Active') : (isHindi ? 'निष्क्रिय' : 'Inactive')}
                          </span>
                        </td>
                        <td>
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => handlePermanentDelete(slide._id)}
                          >
                            <FaTrash />{" "}
                            {isHindi ? "हटाएँ" : "Delete"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default SliderManagement;

