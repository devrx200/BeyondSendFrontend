import { useState, useEffect } from "react";
import {
  Card, CardBody, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input, Container, Badge, Row, Col,
  CardHeader
} from "reactstrap";
import { FaPlus, FaEdit, FaTrash, FaFileAlt } from "react-icons/fa";
import apiClient, { BASE_HOST } from "@apiService";
import Swal from "sweetalert2";
import { useLanguage } from '../../contexts/LanguageContext';

const DownloadManagement = () => {
  
  const token = sessionStorage.getItem("authToken");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [fileInfo, setFileInfo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isHindi } = useLanguage();
  const [formData, setFormData] = useState({
    titleEn: "",
    titleHi: "",
    category: "",
    isActive: true,
    file: null,
  });

  const toggleModal = () => {
    setModal(!modal);
    if (modal) resetForm();
  };

  const resetForm = () => {
    setEditing(null);
    setFileInfo(null);
    setFormData({
      titleEn: "",
      titleHi: "",
      category: "",
      isActive: true,
      file: null,
    });
  };

  /* ================= FETCH ================= */
  const fetchDownloads = async () => {
    const res = await apiClient.get('/downloads/list');
    setDownloads(res.data || []);
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  /* ================= FILE ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData({ ...formData, file });
    setFileInfo({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
      type: file.type.split("/")[1].toUpperCase(),
    });
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get('/category/list');

      if (res.status === 200) {
        setCategories(res.data.data || []);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load categories",
      });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCategories();
  }, []);
  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("titleEn", formData.titleEn);
    payload.append("titleHi", formData.titleHi);
    payload.append("category", formData.category);
    payload.append("isActive", formData.isActive);

    if (formData.file) {
      payload.append("file", formData.file);
    }

    try {
      let res;
      if (editing) {
        res = await apiClient.put(
          `/downloads/update/${editing._id}`,
          payload,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        res = await apiClient.post(
          '/downloads/create',
          payload,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      Swal.fire("Success", res.data.message, "success");
      toggleModal();
      fetchDownloads();
    } catch (err) {
      // Check if error has response from backend
      if (err.response) {
        // Backend returned an error response
        const errorMessage = err.response.data?.message ||
          err.response.data?.error ||
          "Something went wrong";
        Swal.fire("Error", errorMessage, "error");
      } else if (err.request) {
        // Request was made but no response received
        Swal.fire("Error", "No response from server", "error");
      } else {
        // Something else happened
        Swal.fire("Error", err.message, "error");
      }
    }
  };


  const getCategoryName = (categoryValue) => {
    const cat = categories.find(
      (c) => c._id === categoryValue || c.slug === categoryValue
    );

    if (!cat) return "—";

    return isHindi ? cat.categoryNameHi : cat.categoryNameEn;
  };


  const handleEdit = (row) => {
    setEditing(row);

    setFormData({
      titleEn: row.titleEn,
      titleHi: row.titleHi,
      category: row.category,
      isActive: row.isActive,
      file: null,
    });
    if (row.filePath) {
      setFileInfo({
        name: row.filePath.split("/").pop(),
        size: row.fileSize,
        type: row.fileType,
        path: row.filePath,
      });
    } else {
      setFileInfo(null);
    }

    setModal(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete download?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (!confirm.isConfirmed) return;

    await apiClient.delete(`/downloads/delete/${id}`);
    Swal.fire("Removed", "Download deactivated", "success");
    fetchDownloads();
  };

  /* ================= UI ================= */
  return (
    <>
      <Card className="adm-card border-0 shadow-sm overflow-hidden mb-4">
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2 py-3 px-3 px-md-4">
          <div className="d-flex align-items-center gap-2.5">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-xs flex-shrink-0"
              style={{ width: "38px", height: "38px", background: "rgba(255, 255, 255, 0.15)", fontSize: "1.1rem" }}
            >
              <FaFileAlt />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white fw-bold d-flex align-items-center gap-2" style={{ fontSize: "1.1rem" }}>
                <span>{isHindi ? "डाउनलोड प्रबंधन" : "Download Management"}</span>
              </h4>
              <p className="adm-page-subtitle mb-0 text-white-50 small">
                <span>{isHindi ? "पोर्टल फ़ाइलें, प्रपत्र और दस्तावेज़ प्रबंधित करें" : "Manage portal files, forms, and documents"}</span>
              </p>
            </div>
          </div>
          <Button
            color="light"
            size="sm"
            className="text-primary fw-bold shadow-sm d-flex align-items-center gap-1.5 px-3 py-1.5 border-0"
            onClick={toggleModal}
          >
            <FaPlus size={11} />
            <span>{isHindi ? "डाउनलोड जोड़ें" : "Add Download"}</span>
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-2.5 px-3 text-secondary small fw-semibold" style={{ width: "50px" }}>#</th>
                  <th className="py-2.5 px-3 text-secondary small fw-semibold">{isHindi ? "शीर्षक" : "Title (EN)"}</th>
                  <th className="py-2.5 px-3 text-secondary small fw-semibold">{isHindi ? "श्रेणी" : "Category"}</th>
                  <th className="py-2.5 px-3 text-secondary small fw-semibold">{isHindi ? "प्रकार" : "Type"}</th>
                  <th className="py-2.5 px-3 text-secondary small fw-semibold">{isHindi ? "आकार" : "Size"}</th>
                  <th className="py-2.5 px-3 text-secondary small fw-semibold">{isHindi ? "दिनांक" : "Created Date"}</th>
                  <th className="py-2.5 px-3 text-secondary small fw-semibold text-center">{isHindi ? "स्थिति" : "Status"}</th>
                  <th className="py-2.5 px-3 text-secondary small fw-semibold text-center" style={{ width: "120px" }}>{isHindi ? "कार्रवाई" : "Action"}</th>
                </tr>
              </thead>
              <tbody>
                {downloads.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4 small">
                      {isHindi ? "कोई डाउनलोड उपलब्ध नहीं है" : "No downloads found"}
                    </td>
                  </tr>
                ) : (
                  downloads.map((d, i) => (
                    <tr key={d._id}>
                      <td className="px-3 text-muted small">{i + 1}</td>
                      <td className="px-3 fw-semibold text-dark">{d.titleEn}</td>
                      <td className="px-3">
                        <Badge color="info" pill className="bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1">
                          {getCategoryName(d.category)}
                        </Badge>
                      </td>
                      <td className="px-3 small text-muted">{d.fileType || "—"}</td>
                      <td className="px-3 small text-muted">{d.fileSize || "—"}</td>
                      <td className="px-3 small text-muted">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 text-center">
                        <Badge color={d.isActive ? "success" : "secondary"} pill className="px-2 py-1">
                          {d.isActive ? (isHindi ? "सक्रिय" : "Active") : (isHindi ? "निष्क्रिय" : "Inactive")}
                        </Badge>
                      </td>
                      <td className="px-3 text-center text-nowrap">
                        <div className="d-flex gap-1 justify-content-center">
                          <Button size="sm" color="light" className="border text-primary px-2 py-1" onClick={() => handleEdit(d)} title={isHindi ? "संपादित करें" : "Edit"}>
                            <FaEdit size={12} />
                          </Button>
                          <Button size="sm" color="light" className="border text-danger px-2 py-1" onClick={() => handleDelete(d._id)} title={isHindi ? "हटाएं" : "Delete"}>
                            <FaTrash size={11} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* ================= MODAL ================= */}
      <Modal isOpen={modal} toggle={toggleModal} centered size="lg" backdrop="static">
        <ModalHeader toggle={toggleModal}>
          {editing ? "Edit Download" : "Add Download"}
        </ModalHeader>
        <ModalBody>

          <Form>
            <Row>
              <Col xs={6}>
                <FormGroup>
                  <Label>Title (English)</Label>
                  <Input
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col xs={6}>
                <FormGroup>
                  <Label>Title (Hindi)</Label>
                  <Input
                    value={formData.titleHi}
                    onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                  />
                </FormGroup>
              </Col>

            </Row>
            <Row>
              <Col xs={6}>
                <FormGroup>
                  <Label>Category</Label>
                  <Input
                    type="select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >

                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.slug || cat._id}>
                        {cat.categoryNameEn} ({cat.categoryNameHi})
                      </option>
                    ))}

                  </Input>
                </FormGroup>
              </Col>
              <Col xs={6}>
                <FormGroup>
                  <Label>Upload File</Label>
                  <Input type="file" name="file" onChange={handleFileChange} />
                  {fileInfo && (
                    <div className="mt-2 text-muted small">
                      {fileInfo.name} • {fileInfo.size} • {fileInfo.type}
                    </div>
                  )}
                </FormGroup>
              </Col>
              <Col xs={6}>
                <Label className="fw-semibold small">{isHindi ? "स्थिति" : "Status"}</Label>
                <Input type="select" name="isActive" value={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.value })}>
                  <option value="true">{isHindi ? "सक्रिय (Active)" : "Active"}</option>
                  <option value="false">{isHindi ? "निष्क्रिय (Inactive)" : "Inactive"}</option>
                </Input>
              </Col>
            </Row>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>Cancel</Button>
          <Button color="primary" onClick={handleSubmit}>
            Save
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default DownloadManagement;
