import { useState, useEffect } from 'react';
import {
  Card, CardBody, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input, Row, Col, Container, Badge, Spinner
} from 'reactstrap';
import { FaImages, FaPlus, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import axios from "axios";
import Swal from "sweetalert2";

const SliderManagement = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("authToken");
  const { isHindi } = useLanguage();
  const [modal, setModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    smallTitleEn: '', smallTitleHi: '',
    mainTitleEn: '', mainTitleHi: '',
    descriptionEn: '', descriptionHi: '',
    image: '', link: '',
    linkTextEn: '', linkTextHi: '',
    order: 1, active: true,
    uploadefile: null, linkButtonShow: true,
    titelDesShow: true,

  });
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const MAX_SLIDER_IMAGE_SIZE = 520 * 1024;
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const SLIDER_WIDTH = 1349;
  const SLIDER_HEIGHT = 450;
  const SLIDER_RATIO = SLIDER_WIDTH / SLIDER_HEIGHT;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: "Only JPG, PNG or WEBP images are allowed" }));
      setImagePreview(null); return;
    }
    if (file.size > MAX_SLIDER_IMAGE_SIZE) {
      setErrors(prev => ({ ...prev, image: "Slider image size must be 520 KB or less" }));
      setImagePreview(null); return;
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = SLIDER_WIDTH; canvas.height = SLIDER_HEIGHT;
      const ctx = canvas.getContext("2d");
      const imgRatio = img.width / img.height;
      let sx, sy, sw, sh;
      if (imgRatio > SLIDER_RATIO) { sh = img.height; sw = sh * SLIDER_RATIO; sx = (img.width - sw) / 2; sy = 0; }
      else { sw = img.width; sh = sw / SLIDER_RATIO; sx = 0; sy = (img.height - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, SLIDER_WIDTH, SLIDER_HEIGHT);
      canvas.toBlob((blob) => {
        const resizedFile = new File([blob], file.name.replace(/\.\w+$/, "_slider.jpg"), { type: "image/jpeg", lastModified: Date.now() });
        setFormData(prev => ({ ...prev, uploadefile: resizedFile, image: resizedFile.name }));
        setErrors(prev => ({ ...prev, image: "" }));
        setImagePreview(URL.createObjectURL(blob));
      }, "image/jpeg", 0.9);
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => { setErrors(prev => ({ ...prev, image: "Invalid image file" })); setImagePreview(null); };
    img.src = objectUrl;
  };

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/get-hero-slides`);
      if (res.status === 200) setSlides(res.data.data || []);
    } catch { Swal.fire({ icon: "error", title: "Error", text: "Failed to load hero slides" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSlides(); }, []);

  const toggleModal = () => {
    setModal(!modal);
    if (modal) { setEditingSlide(null); resetForm(); setImagePreview(null); }
  };

  const resetForm = () => {
    setFormData({ smallTitleEn: '', smallTitleHi: '', mainTitleEn: '', mainTitleHi: '', descriptionEn: '', descriptionHi: '', image: '', link: '', linkTextEn: '', linkTextHi: '', order: 1, active: true, uploadefile: null, linkButtonShow: true, titelDesShow: true, });
    setErrors({});
  };

  const validateField = (name, value, isHindi) => {
    const TEXTAREA_FIELDS = ["descriptionEn", "descriptionHi"];
    const HINDI_TEXT_ONLY = /^[\u0900-\u097F .,!?'"()\-\n\r]+$/;
    const HINDI_WITH_NUMBERS = /^[\u0900-\u097F0-9०-९ .,!?'"()\-\n\r]+$/;
    const ENGLISH_TEXT_ONLY = /^[A-Za-z .,!?'"()\-\n\r]+$/;
    const ENGLISH_WITH_NUMBERS = /^[A-Za-z0-9 .,!?'"()\-\n\r]+$/;
    if (!value || !value.trim()) return isHindi ? "यह फ़ील्ड आवश्यक है" : "This field is required";
    const isTextarea = TEXTAREA_FIELDS.includes(name);
    if (isHindi) {
      const regex = isTextarea ? HINDI_WITH_NUMBERS : HINDI_TEXT_ONLY;
      if (!regex.test(value)) return isTextarea ? "कृपया केवल हिंदी अक्षर और अंक प्रयोग करें" : "कृपया केवल हिंदी अक्षर प्रयोग करें";
    } else {
      const regex = isTextarea ? ENGLISH_WITH_NUMBERS : ENGLISH_TEXT_ONLY;
      if (!regex.test(value)) return isTextarea ? "Please enter English text and numbers only" : "Please enter English text only";
    }
    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.smallTitleEn = validateField("smallTitleEn", formData.smallTitleEn, false);
    newErrors.mainTitleEn = validateField("mainTitleEn", formData.mainTitleEn, false);
    newErrors.linkTextEn = validateField("linkTextEn", formData.linkTextEn, false);
    newErrors.smallTitleHi = validateField("smallTitleHi", formData.smallTitleHi, true);
    newErrors.mainTitleHi = validateField("mainTitleHi", formData.mainTitleHi, true);
    newErrors.linkTextHi = validateField("linkTextHi", formData.linkTextHi, true);
    newErrors.descriptionEn = validateField("descriptionEn", formData.descriptionEn, false);
    newErrors.descriptionHi = validateField("descriptionHi", formData.descriptionHi, true);
    if (!formData.link?.trim()) newErrors.link = isHindi ? "लिंक आवश्यक है" : "Link is required";
    if (!formData.order || isNaN(formData.order) || formData.order <= 0) newErrors.order = isHindi ? "क्रम एक मान्य संख्या होनी चाहिए" : "Order must be a valid number";
    if (!editingSlide && !formData.uploadefile) newErrors.image = isHindi ? "छवि आवश्यक है" : "Image is required";
    Object.keys(newErrors).forEach(key => newErrors[key] === "" && delete newErrors[key]);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e, langType = null) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    if (langType) {
      const error = validateField(name, fieldValue, langType === "hi");
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      smallTitleEn: slide.subtitleEng || "", smallTitleHi: slide.subtitleHin || "",
      mainTitleEn: slide.titleEng || "", mainTitleHi: slide.titleHin || "",
      descriptionEn: slide.descriptionEng || "", descriptionHi: slide.descriptionHin || "",
      link: slide.link || "", linkTextEn: slide.linkTextEn, linkTextHi: slide.linkTextHi,
      order: slide.displayOrder || 1, active: slide.isActive ?? true,
      image: slide.image || "", uploadefile: null, linkButtonShow: slide.linkButtonShow ?? true,
      titelDesShow: slide.titelDesShow ?? true,


    });
    setImagePreview(null);
    setModal(true);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    return `${API_URL}${imagePath.replace(/\\/g, "/")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { Swal.fire(isHindi ? "त्रुटि" : "Validation Error", isHindi ? "कृपया सभी आवश्यक फ़ील्ड सही भरें" : "Please fill all required fields correctly", "error"); return; }
    try {
      const payload = new FormData();
      payload.append("titleEng", formData.mainTitleEn); payload.append("titleHin", formData.mainTitleHi);
      payload.append("subtitleEng", formData.smallTitleEn); payload.append("subtitleHin", formData.smallTitleHi);
      payload.append("descriptionEng", formData.descriptionEn); payload.append("descriptionHin", formData.descriptionHi);
      payload.append("linkTextEn", formData.linkTextEn); payload.append("linkTextHi", formData.linkTextHi);
      payload.append("link", formData.link); payload.append("displayOrder", formData.order);
      payload.append("isActive", formData.active); payload.append("linkButtonShow", formData.linkButtonShow);
      payload.append("titelDesShow", formData.titelDesShow);
      if (formData.uploadefile) payload.append("image", formData.uploadefile);
      const url = editingSlide ? `${API_URL}/api/update-hero-slide/${editingSlide._id}` : `${API_URL}/api/create-hero-slide`;
      const response = await (editingSlide ? axios.put : axios.post)(url, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 200 || response.status === 201) {
        Swal.fire({ icon: "success", title: response.data.message, timer: 2000, showConfirmButton: false });
        toggleModal(); fetchSlides();
      }
    } catch (error) { Swal.fire({ icon: "error", title: "Error", text: error?.response?.data?.message || "Something went wrong" }); }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({ title: "Are you sure?", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Yes, delete it!" });
    if (!confirm.isConfirmed) return;
    try {
      const res = await axios.delete(`${API_URL}/api/deactivate-hero-slide/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 200) { Swal.fire({ icon: "success", title: res.data.message, timer: 2000, showConfirmButton: false }); fetchSlides(); }
    } catch (error) { Swal.fire({ icon: "error", title: "Delete Failed", text: error?.response?.data?.message || "Unable to delete slide" }); }
  };

  const handlePermanentDelete = async (id) => {
    const confirm = await Swal.fire({ title: "Permanent Delete?", text: "This action cannot be undone!", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Yes, delete permanently" });
    if (!confirm.isConfirmed) return;
    try {
      const res = await axios.delete(`${API_URL}/api/permanent-delete-hero-slide/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 200) { Swal.fire({ icon: "success", title: res.data.message, timer: 2000, showConfirmButton: false }); fetchSlides(); }
    } catch (error) { Swal.fire({ icon: "error", title: "Delete Failed", text: error?.response?.data?.message || "Unable to permanently delete slide" }); }
  };

  const Slides = slides.filter(s => s.isDeleted !== true);
  // const inactiveSlides = slides.filter(s => !s.isActive);

  return (
    <Container className="py-3">

      {/* ── Active Slides Card ── */}
      <Card className="border-0 shadow-sm mb-4">
        <CardBody className="p-4">

          {/* Header */}
          <Row className="align-items-center mb-3">
            <Col>
              <h5 className="fw-bold mb-1">
                <FaImages className="me-2 text-primary" />
                {isHindi ? 'होम स्लाइडर प्रबंधन' : 'Home Slider Management'}
              </h5>
              <p className="text-muted small mb-0">
                {isHindi ? 'होम पेज स्लाइडर छवियों और सामग्री को प्रबंधित करें' : 'Manage home page slider images and content'}
              </p>
            </Col>
            <Col xs="auto">
              <Button color="primary" size="sm" onClick={toggleModal}>
                <FaPlus className="me-1" />
                {isHindi ? 'नया स्लाइड जोड़ें' : 'Add New Slide'}
              </Button>
            </Col>
          </Row>

          <hr className="mb-3" />

          {/* Active Table */}
          {loading ? (
            <div className="text-center py-4"><Spinner color="primary" /></div>
          ) : Slides.length === 0 ? (
            <div className="text-center text-muted py-4">
              {isHindi ? 'कोई सक्रिय स्लाइड नहीं' : 'No active slides found'}
            </div>
          ) : (
            <Table responsive bordered hover size="sm" className="mb-0 align-middle">
              <thead className="table-primary">
                <tr>
                  <th style={{ width: 50 }}>S.No.</th>
                  <th>{isHindi ? 'छोटा शीर्षक' : 'Small Title'}</th>
                  <th>{isHindi ? 'मुख्य शीर्षक' : 'Main Title'}</th>
                  <th style={{ maxWidth: 180 }}>{isHindi ? 'विवरण' : 'Description'}</th>
                  <th>{isHindi ? 'लिंक टेक्स्ट' : 'Button Text'}</th>
                  <th style={{ width: 60 }}>{isHindi ? 'क्रम' : 'Order'}</th>
                  <th style={{ width: 90 }}>{isHindi ? 'स्थिति' : 'Status'}</th>
                  <th style={{ width: 90 }}>{isHindi ? 'कार्य' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {Slides.map((slide, index) => (
                  <tr key={slide._id}>
                    <td className="text-center fw-bold">{index + 1}</td>
                    <td>{isHindi ? slide.subtitleHin : slide.subtitleEng}</td>
                    <td>{isHindi ? slide.titleHin : slide.titleEng}</td>
                    <td className="text-truncate" style={{ maxWidth: 180 }}>
                      {isHindi ? slide.descriptionHin : slide.descriptionEng}
                    </td>
                    <td>{isHindi ? slide.linkTextHi : slide.linkTextEn}</td>
                    <td className="text-center">{slide.displayOrder}</td>
                    <td>
                      <Badge color={slide.isActive ? "success" : "danger"}>
                        {isHindi
                          ? (slide.isActive ? "सक्रिय" : "निष्क्रिय")
                          : (slide.isActive ? "Active" : "Inactive")
                        }
                      </Badge>
                    </td>
                    <td className="text-center text-nowrap">
                      <Button color="info" size="sm" className="me-1 px-2 py-1" title="Edit" onClick={() => handleEdit(slide)}>
                        <FaEdit size={11} />
                      </Button>
                      <Button color="danger" size="sm" className="px-2 py-1" title="Deactivate" onClick={() => handleDelete(slide._id)}>
                        <FaTrash size={11} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* ── Inactive Slides Card ── */}


      {/* ── Modal ── */}
      <Modal isOpen={modal} toggle={toggleModal} size="lg" scrollable>
        <ModalHeader toggle={toggleModal} className="bg-light">
          <FaImages className="me-2 text-primary" />
          {editingSlide
            ? (isHindi ? 'स्लाइड संपादित करें' : 'Edit Slide')
            : (isHindi ? 'नया स्लाइड जोड़ें' : 'Add New Slide')}
        </ModalHeader>

        <ModalBody>
          <Form onSubmit={handleSubmit}>

            {/* ── English / Hindi columns ── */}
            <Row>
              {/* English */}
              <Col md={6}>
                <div className="p-3 rounded mb-3" style={{ background: '#f0f4ff', border: '1px solid #d0dbff' }}>
                  <h6 className="text-primary fw-bold mb-3">
                    🇬🇧 {isHindi ? 'अंग्रेजी सामग्री' : 'English Content'}
                  </h6>
                  <FormGroup>
                    <Label className="small fw-bold">{isHindi ? 'छोटा शीर्षक' : 'Small Title'} *</Label>
                    <Input type="text" name="smallTitleEn" value={formData.smallTitleEn}
                      onChange={(e) => handleChange(e, "en")} placeholder="e.g., Welcome to"
                      invalid={!!errors.smallTitleEn} bsSize="sm" />
                    {errors.smallTitleEn && <small className="text-danger">{errors.smallTitleEn}</small>}
                  </FormGroup>
                  <FormGroup>
                    <Label className="small fw-bold">{isHindi ? 'मुख्य शीर्षक' : 'Main Title'} *</Label>
                    <Input type="text" name="mainTitleEn" value={formData.mainTitleEn}
                      onChange={(e) => handleChange(e, "en")} placeholder="e.g., Higher Education Department"
                      invalid={!!errors.mainTitleEn} bsSize="sm" />
                    {errors.mainTitleEn && <small className="text-danger">{errors.mainTitleEn}</small>}
                  </FormGroup>
                  <FormGroup>
                    <Label className="small fw-bold">{isHindi ? 'विवरण' : 'Description'} *</Label>
                    <Input type="textarea" name="descriptionEn" rows="3" value={formData.descriptionEn}
                      onChange={(e) => handleChange(e, "en")} placeholder="Brief description..."
                      invalid={!!errors.descriptionEn} bsSize="sm" />
                    {errors.descriptionEn && <small className="text-danger">{errors.descriptionEn}</small>}
                  </FormGroup>
                  <FormGroup className="mb-0">
                    <Label className="small fw-bold">{isHindi ? 'बटन टेक्स्ट' : 'Button Text (EN)'} *</Label>
                    <Input type="text" name="linkTextEn" value={formData.linkTextEn}
                      onChange={(e) => handleChange(e, "en")} placeholder="e.g., Learn More"
                      invalid={!!errors.linkTextEn} bsSize="sm" />
                    {errors.linkTextEn && <small className="text-danger">{errors.linkTextEn}</small>}
                  </FormGroup>
                </div>
              </Col>

              {/* Hindi */}
              <Col md={6}>
                <div className="p-3 rounded mb-3" style={{ background: '#fff8f0', border: '1px solid #ffd9b3' }}>
                  <h6 className="text-warning fw-bold mb-3">
                    🇮🇳 {isHindi ? 'हिंदी सामग्री' : 'Hindi Content'}
                  </h6>
                  <FormGroup>
                    <Label className="small fw-bold">{isHindi ? 'छोटा शीर्षक' : 'Small Title'} *</Label>
                    <Input type="text" name="smallTitleHi" value={formData.smallTitleHi}
                      onChange={(e) => handleChange(e, "hi")} placeholder="उदा., में आपका स्वागत है"
                      invalid={!!errors.smallTitleHi} bsSize="sm" />
                    {errors.smallTitleHi && <small className="text-danger">{errors.smallTitleHi}</small>}
                  </FormGroup>
                  <FormGroup>
                    <Label className="small fw-bold">{isHindi ? 'मुख्य शीर्षक' : 'Main Title'} *</Label>
                    <Input type="text" name="mainTitleHi" value={formData.mainTitleHi}
                      onChange={(e) => handleChange(e, "hi")} placeholder="उदा., उच्च शिक्षा विभाग"
                      invalid={!!errors.mainTitleHi} bsSize="sm" />
                    {errors.mainTitleHi && <small className="text-danger">{errors.mainTitleHi}</small>}
                  </FormGroup>
                  <FormGroup>
                    <Label className="small fw-bold">{isHindi ? 'विवरण' : 'Description'} *</Label>
                    <Input type="textarea" rows="3" name="descriptionHi" value={formData.descriptionHi}
                      onChange={(e) => handleChange(e, "hi")} placeholder="संक्षिप्त विवरण..."
                      invalid={!!errors.descriptionHi} bsSize="sm" />
                    {errors.descriptionHi && <small className="text-danger">{errors.descriptionHi}</small>}
                  </FormGroup>
                  <FormGroup className="mb-0">
                    <Label className="small fw-bold">{isHindi ? 'बटन टेक्स्ट' : 'Button Text (HI)'} *</Label>
                    <Input type="text" name="linkTextHi" value={formData.linkTextHi}
                      onChange={(e) => handleChange(e, "hi")} placeholder="उदा., और जानें"
                      invalid={!!errors.linkTextHi} bsSize="sm" />
                    {errors.linkTextHi && <small className="text-danger">{errors.linkTextHi}</small>}
                  </FormGroup>
                </div>
              </Col>
            </Row>

            {/* ── Settings Row ── */}
            <div className="p-3 rounded" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
              <h6 className="fw-bold mb-3 text-secondary">
                ⚙️ {isHindi ? 'सेटिंग्स' : 'Settings'}
              </h6>
              <Row className="g-3">
                <Col md={4}>
                  <FormGroup className="mb-0">
                    <Label className="small fw-bold">{isHindi ? 'लिंक URL' : 'Button Link URL'} *</Label>
                    <Input type="text" name="link" value={formData.link} bsSize="sm"
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      placeholder="/about" invalid={!!errors.link} />
                    {errors.link && <small className="text-danger">{errors.link}</small>}
                  </FormGroup>
                </Col>
                <Col md={2}>
                  <FormGroup className="mb-0">
                    <Label className="small fw-bold">{isHindi ? 'क्रम' : 'Order'}</Label>
                    <Input type="number" name="order" value={formData.order} min="1" bsSize="sm"
                      invalid={!!errors.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} />
                    {errors.order && <small className="text-danger">{errors.order}</small>}
                  </FormGroup>
                </Col>
                <Col md={2}>
                  <FormGroup className="mb-0">
                    <Label className="small fw-bold">
                      {isHindi ? 'बटन दिखाएँ' : 'Show Button'}
                    </Label>

                    <Input
                      type="select"
                      name="linkButtonShow"
                      bsSize="sm"
                      value={formData.linkButtonShow}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          linkButtonShow: e.target.value === "true"
                        })
                      }
                    >
                      <option value={true}>Yes</option>
                      <option value={false}>No</option>
                    </Input>
                  </FormGroup>
                </Col>

                <Col md={2}>
                  <FormGroup className="mb-0">
                    <Label className="small fw-bold">
                      {isHindi
                        ? 'टाइटल/विवरण दिखाएँ'
                        : 'Show Title & Description'}
                    </Label>

                    <Input
                      type="select"
                      name="titelDesShow"
                      bsSize="sm"
                      value={formData.titelDesShow}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          titelDesShow: e.target.value === "true"
                        })
                      }
                    >
                      <option value={true}>Yes</option>
                      <option value={false}>No</option>
                    </Input>
                  </FormGroup>
                </Col>

                <Col md={2} className="d-flex align-items-end">
                  <FormGroup check className="mb-1">
                    <Input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          active: e.target.checked
                        })
                      }
                    />

                    <Label check className="small fw-bold ms-1">
                      {isHindi ? 'सक्रिय रखें' : 'Set Active'}
                    </Label>
                  </FormGroup>
                </Col>
              </Row>
            </div>

            <hr />

            {/* ── Image Row ── */}
            <Row className="g-3 align-items-start">
              {/* <Col md={5}>
                <FormGroup className="mb-0">
                  <Label className="small fw-bold">{isHindi ? 'छवि URL' : 'Image URL'}</Label>
                  <Input type="text" value={formData.image} name="image" bsSize="sm"
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/slider1.jpg" />
                </FormGroup>
              </Col> */}
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="small fw-bold">
                    {isHindi ? 'छवि अपलोड करें' : 'Upload Image'}
                    <span className="text-muted ms-1" style={{ fontSize: '11px' }}>(Max 520KB · JPG/PNG/WEBP · 3:1 ratio)</span>
                  </Label>
                  <Input type="file" name="uploadefile" accept="image/*"
                    invalid={!!errors.image} onChange={handleImageChange} bsSize="sm" />
                  {errors.image && <small className="text-danger">{errors.image}</small>}
                </FormGroup>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                {editingSlide && formData.image && !formData.uploadefile && (
                  <a href={getImageUrl(formData.image)} download target="_blank"
                    rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary w-100">
                    <FaDownload className="me-1" size={11} />
                    {isHindi ? 'डाउनलोड' : 'Download'}
                  </a>
                )}
              </Col>

              {/* Image preview */}
              {imagePreview && (
                <Col xs={12}>
                  <Label className="small fw-bold text-success">
                    ✓ {isHindi ? 'नई छवि पूर्वावलोकन' : 'New Image Preview'}
                  </Label>
                  <img src={imagePreview} alt="Preview"
                    style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #dee2e6' }} />
                </Col>
              )}
            </Row>

          </Form>
        </ModalBody>

        <ModalFooter className="bg-light">
          <Button color="secondary" outline size="sm" onClick={toggleModal}>
            {isHindi ? 'रद्द करें' : 'Cancel'}
          </Button>
          <Button color="primary" size="sm" onClick={handleSubmit}>
            {editingSlide ? (isHindi ? 'अपडेट करें' : 'Update Slide') : (isHindi ? 'सहेजें' : 'Save Slide')}
          </Button>
        </ModalFooter>
      </Modal>

    </Container>
  );
};

export default SliderManagement;