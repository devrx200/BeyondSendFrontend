import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col, Badge, CardHeader, UncontrolledCollapse
} from "reactstrap";
import { FaPlus, FaEdit, FaTrash, FaSave, FaImage } from "react-icons/fa";
import apiClient, { BASE_HOST } from "@apiService";
import Swal from "sweetalert2";
import { useLanguage } from "../../contexts/LanguageContext";


const token = sessionStorage.getItem("authToken");

const AboutSectionManagement = () => {
  const { isHindi } = useLanguage();

  const [list, setList] = useState([]);
  const [aboutDepartment, setAboutDepartment] = useState({
    titleEng: "",
    titleHin: "",
    descriptionEng: "",
    descriptionHin: ""
  });
  const [deptSaving, setDeptSaving] = useState(false);

  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    imgNameEng: "",
    imgNameHin: "",
    designationEng: "",
    designationHin: "",
    aboutContentEng: "",
    aboutContentHin: "",
    order: "",
    image: null,
    isActive: true,
    isShowOnHeader: true,
    isHideOnAboutSection: false
  });

  const loadList = async () => {
    try {
      const res = await apiClient.get('/about-sections/list');
      setList(res.data?.departmentLeaderProfiles || []);
      setAboutDepartment({
        titleEng: res.data?.aboutDepartment?.titleEng || "",
        titleHin: res.data?.aboutDepartment?.titleHin || "",
        descriptionEng: res.data?.aboutDepartment?.descriptionEng || "",
        descriptionHin: res.data?.aboutDepartment?.descriptionHin || ""
      });
    } catch {
      Swal.fire("Error", "Failed to load data", "error");
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadList();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      imgNameEng: "",
      imgNameHin: "",
      designationEng: "",
      designationHin: "",
      aboutContentEng: "",
      aboutContentHin: "",
      order: "",
      image: null,
      isActive: true,
      isShowOnHeader: true,
      isHideOnAboutSection: false
    });
    setImagePreview(null);
  };

  const toggleModal = () => {
    setModal(!modal);
    if (modal) resetForm();
  };

  const validateField = (name, value, isHindi) => {
    const TEXTAREA_FIELDS = ["aboutContentEng", "aboutContentHin"];

    const HINDI_TEXT_ONLY = /^[\u0900-\u097F .,!?'"()\-\n\r]+$/;
    const HINDI_WITH_NUMBERS = /^[\u0900-\u097F0-9०-९ .,!?'"()\-\n\r]+$/;
    const ENGLISH_TEXT_ONLY = /^[A-Za-z .,!?'"()\-\n\r]+$/;
    const ENGLISH_WITH_NUMBERS = /^[A-Za-z0-9 .,!?'"()\-\n\r]+$/;

    if (!value || !value.toString().trim()) {
      return isHindi ? "यह फ़ील्ड आवश्यक है" : "This field is required";
    }

    if (name === "order") {
      if (!/^\d+$/.test(value.toString().trim())) {
        return isHindi ? "कृपया एक वैध आदेश संख्या दर्ज करें" : "Please enter a valid order number";
      }
      return "";
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

    newErrors.imgNameEng = validateField("imgNameEng", form.imgNameEng, false);
    newErrors.imgNameHin = validateField("imgNameHin", form.imgNameHin, true);
    newErrors.designationEng = validateField("designationEng", form.designationEng, false);
    newErrors.designationHin = validateField("designationHin", form.designationHin, true);
    newErrors.aboutContentEng = validateField("aboutContentEng", form.aboutContentEng, false);
    newErrors.aboutContentHin = validateField("aboutContentHin", form.aboutContentHin, true);
    newErrors.order = validateField("order", form.order, false);

    if (!editingId && !form.image) {
      newErrors.image = isHindi ? "छवि आवश्यक है" : "Image is required";
    }

    Object.keys(newErrors).forEach(
      key => newErrors[key] === "" && delete newErrors[key]
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e, langType) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value, langType === "hi");
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  const MAX_FILE_SIZE = 520 * 1024;
  const REQUIRED_WIDTH = 250;
  const REQUIRED_HEIGHT = 300;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: "Only JPG, PNG or WEBP images are allowed" }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({ ...prev, image: "Image size must be less than 520 KB" }));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = REQUIRED_WIDTH;
      canvas.height = REQUIRED_HEIGHT;
      const ctx = canvas.getContext("2d");

      const imgRatio = img.width / img.height;
      const targetRatio = REQUIRED_WIDTH / REQUIRED_HEIGHT;
      let sx, sy, sw, sh;
      if (imgRatio > targetRatio) {
        sh = img.height;
        sw = sh * targetRatio;
        sx = (img.width - sw) / 2;
        sy = 0;
      } else {
        sw = img.width;
        sh = sw / targetRatio;
        sx = 0;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, REQUIRED_WIDTH, REQUIRED_HEIGHT);
      canvas.toBlob(
        (blob) => {
          const resizedFile = new File(
            [blob],
            file.name.replace(/\.\w+$/, "_photo.jpg"),
            { type: "image/jpeg", lastModified: Date.now() }
          );
          setForm(prev => ({ ...prev, image: resizedFile }));
          setErrors(prev => ({ ...prev, image: "" }));
          setImagePreview(URL.createObjectURL(blob));
        },
        "image/jpeg",
        0.9
      );
      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = () => {
      setErrors(prev => ({ ...prev, image: "Invalid image file" }));
    };
    img.src = objectUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire(
        isHindi ? "त्रुटि" : "Validation Error",
        isHindi ? "कृपया सभी आवश्यक फ़ील्ड सही भरें" : "Please fill all required fields correctly",
        "error"
      );
      return;
    }

    const newErrors = { ...errors };
    if (!editingId && !form.image) {
      newErrors.image = isHindi ? "छवि आवश्यक है" : "Image is required";
    }

    if (form.image) {
      if (!ALLOWED_TYPES.includes(form.image.type)) {
        newErrors.image = "Only JPG, PNG or WEBP images are allowed";
      } else if (form.image.size > MAX_FILE_SIZE) {
        newErrors.image = "Image size must be 520 KB or less";
      }
    }

    Object.keys(newErrors).forEach(
      key => newErrors[key] === "" && delete newErrors[key]
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          payload.append(key, value);
        }
      });

      let res;
      if (editingId) {
        res = await apiClient.put(
          `/about-sections/update/${editingId}`,
          payload,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        res = await apiClient.post('/about-sections/create', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      Swal.fire("Success", res.data.msg, "success");
      toggleModal();
      loadList();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.msg || "Operation failed", "error");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      imgNameEng: item.imgNameEng,
      imgNameHin: item.imgNameHin,
      designationEng: item.designationEng,
      designationHin: item.designationHin,
      aboutContentEng: item.aboutContentEng,
      aboutContentHin: item.aboutContentHin,
      order: item.order ?? "",
      image: null,
      isActive: item.isActive,
      isShowOnHeader: item.isShowOnHeader ?? true,
      isHideOnAboutSection: item.isHideOnAboutSection ?? false
    });
    setImagePreview(item.profileUrl ? `${BASE_HOST}${item.profileUrl}` : null);
    setModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Record?",
      text: "This record will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete"
    });

    if (!confirm.isConfirmed) return;
    try {
      const res = await apiClient.delete(`/about-sections/delete/${id}`);
      Swal.fire("Deleted", res.data.msg, "success");
      loadList();
    } catch (err) {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const handleDeptChange = (e) => {
    const { name, value } = e.target;
    setAboutDepartment(prev => ({ ...prev, [name]: value }));
  };

  const saveAboutDepartment = async () => {
    setDeptSaving(true);
    try {
      const res = await apiClient.put(
        '/about-sections/update-department',
        aboutDepartment
      );
      Swal.fire("Success", res.data.msg, "success");
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.msg || "Save failed", "error");
    } finally {
      setDeptSaving(false);
    }
  };

  return (
    <>
      <Card className="adm-card mb-4 border-0 shadow-sm overflow-hidden">
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2 p-4">
          <div>
            <h3 className="adm-page-title mb-1">
              🏢 {isHindi ? "विभाग के बारे में" : "About Department Content"}
            </h3>
            <p className="adm-page-subtitle mb-0 text-white">
              {isHindi ? "सार्वजनिक 'हमारे बारे में' पृष्ठ पर दिखाया गया शीर्षक और विवरण" : "Title & description shown on the public About page"}
            </p>
          </div>
        </CardHeader>
        <CardBody className="p-4 bg-white">
          <Row className="g-4">
            <Col md={6}>
              <FormGroup className="mb-0">
                <Label className="fw-bold text-secondary mb-2" style={{ fontSize: "14px" }}>
                  {isHindi ? "शीर्षक (अंग्रेजी)" : "Title (English)"}
                </Label>
                <Input name="titleEng" className="shadow-sm" value={aboutDepartment.titleEng} onChange={handleDeptChange} placeholder="Enter department title in English" />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className="mb-0">
                <Label className="fw-bold text-secondary mb-2" style={{ fontSize: "14px" }}>
                  {isHindi ? "शीर्षक (हिंदी)" : "Title (Hindi)"}
                </Label>
                <Input name="titleHin" className="shadow-sm" value={aboutDepartment.titleHin} onChange={handleDeptChange} placeholder="हिंदी में विभाग का शीर्षक दर्ज करें" />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className="mb-0">
                <Label className="fw-bold text-secondary mb-2" style={{ fontSize: "14px" }}>
                  {isHindi ? "विवरण (अंग्रेजी)" : "Description (English)"}
                </Label>
                <Input type="textarea" rows="6" className="shadow-sm" name="descriptionEng" value={aboutDepartment.descriptionEng} onChange={handleDeptChange} placeholder="Enter detailed description in English..." />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup className="mb-0">
                <Label className="fw-bold text-secondary mb-2" style={{ fontSize: "14px" }}>
                  {isHindi ? "विवरण (हिंदी)" : "Description (Hindi)"}
                </Label>
                <Input type="textarea" rows="6" className="shadow-sm" name="descriptionHin" value={aboutDepartment.descriptionHin} onChange={handleDeptChange} placeholder="हिंदी में विस्तृत विवरण दर्ज करें..." />
              </FormGroup>
            </Col>
          </Row>
          <div className="d-flex justify-content-end mt-4 pt-4 border-top">
            <Button color="primary" disabled={deptSaving} onClick={saveAboutDepartment} className="px-4 shadow-sm d-flex align-items-center">
              <FaSave className="me-2" />
              {deptSaving ? (isHindi ? "सहेजा जा रहा है..." : "Saving...") : (isHindi ? "विभाग सामग्री सहेजें" : "Save Department Content")}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="adm-card mb-4 border-0 shadow-sm overflow-hidden">
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2 p-4">
          <div>
            <h3 className="adm-page-title mb-1">
              👥 {isHindi ? "विभाग के नेता प्रोफाइल" : "Department Leader Profiles"}
            </h3>
            <p className="adm-page-subtitle mb-0 text-white">
              {isHindi ? "सार्वजनिक अबाउट सेक्शन लीडर प्रोफाइल प्रबंधित करें" : "Manage the public about section leader profiles"}
            </p>
          </div>
          <Button color="light" className="text-primary fw-semibold shadow-sm" onClick={toggleModal}>
            <FaPlus className="me-2" /> {isHindi ? "नया जोड़ें" : "Add Leader"}
          </Button>
        </CardHeader>
        <CardBody>
          <Table responsive bordered striped hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Name</th>
                <th>Designation</th>
                <th>About</th>
                <th>Order</th>
                <th>Status</th>
                <th>Show on Header</th>
                <th>Hide on About Section</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted">No records found</td>
                </tr>
              ) : (
                list.map((item, i) => (
                  <tr key={item._id}>
                    <td>{i + 1}</td>
                    <td>
                      <img src={`${BASE_HOST}${item.profileUrl}`} width={60} alt="" />
                    </td>
                    <td>{isHindi ? item.imgNameHin : item.imgNameEng}</td>
                    <td>{isHindi ? item.designationHin : item.designationEng}</td>
                    <td style={{ maxWidth: "300px" }}>
                      <Button color="link" id={`about-toggler-${item._id}`} className="p-0 text-decoration-none fw-semibold" size="sm">
                        {isHindi ? "विवरण दिखाएँ/छिपाएँ" : "Toggle About Details"}
                      </Button>
                      <UncontrolledCollapse toggler={`#about-toggler-${item._id}`}>
                        <div className="mt-2 text-muted border-start border-primary border-2 ps-2" style={{ fontSize: "0.85rem", maxHeight: "150px", overflowY: "auto" }}>
                          {(isHindi ? item.aboutContentHin : item.aboutContentEng)
                            ?.split("\n")
                            .filter(line => line.trim() !== "")
                            .map((line, index) => (
                              <p key={index} className="mb-1">{line}</p>
                            ))}
                        </div>
                      </UncontrolledCollapse>
                    </td>
                    <td>{item.order}</td>
                    <td>
                      <Badge color={item.isActive ? "success" : "danger"}>
                        {isHindi
                          ? (item.isActive ? "सक्रिय" : "निष्क्रिय")
                          : (item.isActive ? "Active" : "Inactive")
                        }
                      </Badge>
                    </td>
                    <td>
                      <Badge color={item.isShowOnHeader !== false ? "info" : "secondary"}>
                        {item.isShowOnHeader !== false ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td>
                      <Badge color={item.isHideOnAboutSection ? "warning" : "light"} className={item.isHideOnAboutSection ? "" : "text-dark border"}>
                        {item.isHideOnAboutSection ? "Hidden" : "Visible"}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        color="warning"
                        size="sm"
                        className="p-0 me-1"
                        style={{ width: 32, height: 32 }}
                        onClick={() => handleEdit(item)}
                      >
                        <FaEdit size={10} />
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        className="p-0"
                        style={{ width: 32, height: 32 }}
                        onClick={() => handleDelete(item._id)}
                      >
                        <FaTrash size={10} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <Modal isOpen={modal} toggle={toggleModal} size="lg">
            <ModalHeader toggle={toggleModal}>
              {editingId ? "Edit Leader Profile" : "Add Leader Profile"}
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <ModalBody>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Name (English)</Label>
                      <Input name="imgNameEng" value={form.imgNameEng} invalid={!!errors.imgNameEng} onChange={(e) => handleChange(e, "en")} />
                      {errors.imgNameEng && <small className="text-danger">{errors.imgNameEng}</small>}
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Name (Hindi)</Label>
                      <Input name="imgNameHin" value={form.imgNameHin} invalid={!!errors.imgNameHin} onChange={(e) => handleChange(e, "hi")} />
                      {errors.imgNameHin && <small className="text-danger">{errors.imgNameHin}</small>}
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Designation (English)</Label>
                      <Input name="designationEng" value={form.designationEng} invalid={!!errors.designationEng} onChange={(e) => handleChange(e, "en")} />
                      {errors.designationEng && <small className="text-danger">{errors.designationEng}</small>}
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Designation (Hindi)</Label>
                      <Input name="designationHin" value={form.designationHin} invalid={!!errors.designationHin} onChange={(e) => handleChange(e, "hi")} />
                      {errors.designationHin && <small className="text-danger">{errors.designationHin}</small>}
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label>About (English)</Label>
                      <Input
                        type="textarea"
                        rows="4"
                        name="aboutContentEng"
                        value={form.aboutContentEng}
                        invalid={!!errors.aboutContentEng}
                        onChange={(e) => handleChange(e, "en")}
                      />
                      {errors.aboutContentEng && <small className="text-danger">{errors.aboutContentEng}</small>}
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label>About (Hindi)</Label>
                      <Input
                        type="textarea"
                        rows="4"
                        name="aboutContentHin"
                        value={form.aboutContentHin}
                        invalid={!!errors.aboutContentHin}
                        onChange={(e) => handleChange(e, "hi")}
                      />
                      {errors.aboutContentHin && <small className="text-danger">{errors.aboutContentHin}</small>}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Order</Label>
                      <Input
                        type="number"
                        min="1"
                        name="order"
                        value={form.order}
                        invalid={!!errors.order}
                        onChange={(e) => handleChange(e, "en")}
                      />
                      {errors.order && <small className="text-danger">{errors.order}</small>}
                    </FormGroup>
                  </Col>

                  <Col md={8}>
                    <FormGroup>
                      <Label>Image</Label>
                      <Input type="file" onChange={handleImageChange} accept="image/jpeg,image/png,image/jpg" />
                      {errors.image && <small className="text-danger">{errors.image}</small>}
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            width={250}
                            height={300}
                            style={{
                              objectFit: "cover",
                              borderRadius: "0px",
                              border: "1px solid #ccc",
                            }}
                            alt="Preview"
                          />
                          <small className="text-muted d-block mt-1">
                            Final size: 250 × 300 px
                          </small>
                        </div>
                      )}
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <Label className="fw-semibold small">Status</Label>
                    <Input type="select" name="isActive" value={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
                      <option value="true">✅ Active</option>
                      <option value="false">⛔ Inactive</option>
                    </Input>
                  </Col>
                  <Col md={4}>
                    <Label className="fw-semibold small">Show on Header</Label>
                    <Input type="select" name="isShowOnHeader" value={form.isShowOnHeader} onChange={e => setForm({ ...form, isShowOnHeader: e.target.value === 'true' })}>
                      <option value="true">✅ Yes</option>
                      <option value="false">⛔ No</option>
                    </Input>
                  </Col>
                  <Col md={4}>
                    <Label className="fw-semibold small">Hide on About Section</Label>
                    <Input type="select" name="isHideOnAboutSection" value={form.isHideOnAboutSection} onChange={e => setForm({ ...form, isHideOnAboutSection: e.target.value === 'true' })}>
                      <option value="false">👁️ Visible</option>
                      <option value="true">🚫 Hidden</option>
                    </Input>
                  </Col>
                </Row>
              </ModalBody>

              <ModalFooter>
                <Button color="primary" type="submit">
                  <FaSave className="me-2" />
                  {editingId ? "Update" : "Save"}
                </Button>
                <Button color="secondary" onClick={toggleModal}>
                  Cancel
                </Button>
              </ModalFooter>
            </Form>
          </Modal>
        </CardBody>
      </Card>
    </>
  );
};

export default AboutSectionManagement;