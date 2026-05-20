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
  Col
} from "reactstrap";
import { FaPlus, FaEdit, FaTrash, FaSave, FaImage } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
const AboutSectionMangement = () => {
  const { isHindi } = useLanguage();

  const [list, setList] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    imgNameEng: "",
    imgNameHin: "",
    designationEng: "",
    designationHin: "",
    aboutContentEn: "",
    aboutContentHi: "",
    order: "",
    image: null
  });

  const loadList = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/get-about-sections`, {
      });
      setList(res.data || []);
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
      aboutContentEn: "",
      aboutContentHi: "",
      order: "",
      image: null
    });
    setImagePreview(null);
  };

  const toggleModal = () => {
    setModal(!modal);
    if (modal) resetForm();
  };

  const validateField = (name, value, isHindi) => {
    const TEXTAREA_FIELDS = ["aboutContentEn", "aboutContentHi"];

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
    newErrors.aboutContentEn = validateField("aboutContentEn", form.aboutContentEn, false);
    newErrors.aboutContentHi = validateField("aboutContentHi", form.aboutContentHi, true);
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

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];
  const MAX_FILE_SIZE = 520 * 1024;
  const REQUIRED_WIDTH = 250;
  const REQUIRED_HEIGHT = 300;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: "Only JPG or PNG images are allowed" }));
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
        res = await axios.put(
          `${API_URL}/api/update-about-section/${editingId}`,
          payload,
          { headers: {
             authorization: `Bearer ${token}`
           } }
        );
      } else {
        res = await axios.post(`${API_URL}/api/create-about-section`, payload, {
          headers: { 
            authorization: `Bearer ${token}`
           }
        });
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
      aboutContentEn: item.aboutContentEn,
      aboutContentHi: item.aboutContentHi,
      order: item.order ?? "",
      image: null
    });
    setImagePreview(item.image ? `${API_URL}${item.image}` : null);
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
      const res = await axios.delete(
        `${API_URL}/api/delete-about-section/${id}`
      );
      Swal.fire("Deleted", res.data.msg, "success");
      loadList();
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">
            <FaImage className="me-2" /> About Section
          </h4>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" /> Add
          </Button>
        </div>

        <Table responsive bordered striped hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Name</th>
              <th>Designation</th>
              <th>About</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted">No records found</td>
              </tr>
            ) : (
              list.map((item, i) => (
                <tr key={item._id}>
                  <td>{i + 1}</td>
                  <td>
                    <img src={`${API_URL}${item.image}`} width={60} alt="" />
                  </td>
                  <td>{isHindi ? item.imgNameHin : item.imgNameEng}</td>
                  <td>{isHindi ? item.designationHin : item.designationEng}</td>
                  <td style={{ maxWidth: "300px" }}>
                    {(isHindi ? item.aboutContentHi : item.aboutContentEn)
                      ?.split("\n")
                      .filter(line => line.trim() !== "")
                      .map((line, index) => (
                        <p key={index} className="mb-1">{line}</p>
                      ))}
                  </td>
                  <td>{item.order}</td>
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
            {editingId ? "Edit About Section" : "Add About Section"}
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
                      name="aboutContentEn"
                      value={form.aboutContentEn}
                      invalid={!!errors.aboutContentEn}
                      onChange={(e) => handleChange(e, "en")}
                    />
                    {errors.aboutContentEn && <small className="text-danger">{errors.aboutContentEn}</small>}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>About (Hindi)</Label>
                    <Input
                      type="textarea"
                      rows="4"
                      name="aboutContentHi"
                      value={form.aboutContentHi}
                      invalid={!!errors.aboutContentHi}
                      onChange={(e) => handleChange(e, "hi")}
                    />
                    {errors.aboutContentHi && <small className="text-danger">{errors.aboutContentHi}</small>}
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
  );
};

export default AboutSectionMangement;
