import { useState, useEffect } from "react";
import {
  Card, CardBody, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input, Container, Badge, Row, Col,
  CardHeader
} from "reactstrap";
import { FaPlus, FaEdit, FaTrash, FaFileAlt } from "react-icons/fa";
import apiClient from "../../services/api.service";
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
          `/create-downloads`,
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
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold text-white">
              <FaFileAlt className="me-2" />
              Download Management
            </h4>
            <Button color="light" className="text-success" onClick={toggleModal}>
              <FaPlus className="me-2" /> Add Download
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <Table hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Title (EN)</th>
                <th>Category</th>
                <th>Type</th>
                <th>Size</th>
                <th>Created Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {downloads.map((d, i) => (
                <tr key={d._id}>
                  <td>{i + 1}</td>
                  <td className="fw-semibold">{d.titleEn}</td>
                  <td>
                    <Badge color="info" pill>{getCategoryName(d.category)}</Badge>
                  </td>
                  <td>{d.fileType}</td>
                  <td>{d.fileSize}</td>
                  <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Badge color={d.isActive ? "success" : "secondary"}>
                      {d.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="text-nowrap">
                    <Button size="sm" color="info" onClick={() => handleEdit(d)}>
                      <FaEdit />
                    </Button>{" "}
                    <Button size="sm" color="danger" onClick={() => handleDelete(d._id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
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
                <Label className="fw-semibold small">Status</Label>
                <Input type="select" name="isActive" value={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.value })}>
                  <option value="true">✅ Active</option>
                  <option value="false">⛔ Inactive</option>
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
