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
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaFileUpload,
  FaFilePdf
} from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const PageCreatorManagement = () => {
  const [list, setList] = useState([]);
  const [menuList, setMenuList] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titleEng: "",
    titleHin: "",
    slug: "",
    mainSlug: "",
    menuId: "",
    department: "",
    examYear: "",
    publishDate: "",
    htmlContent: "",
    documentsUpdate: []
  });

  // Document form state
  const [documentModal, setDocumentModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState({
    titleEng: "",
    titleHin: "",
    fileUrl: "",
    fileSize: "",
    fileType: "",
    publishDate: ""
  });
  const [editingDocIndex, setEditingDocIndex] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/content/get-all-content`);
      setList(res.data?.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load pages", "error");
    }
  };

  const loadMenus = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/menu/get-all-menus`);
      setMenuList(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    loadMenus();
  }, []);

  /* ================= HELPERS ================= */
  const toggleModal = () => {
    setModal(!modal);
    if (modal) resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      titleEng: "",
      titleHin: "",
      slug: "",
      mainSlug: "",
      menuId: "",
      department: "",
      examYear: "",
      publishDate: "",
      htmlContent: "",
      documentsUpdate: []
    });
  };

  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  /* ================= DOCUMENT MANAGEMENT ================= */
  const toggleDocumentModal = () => {
    setDocumentModal(!documentModal);
    if (documentModal) {
      setCurrentDocument({
        titleEng: "",
        titleHin: "",
        fileUrl: "",
        fileSize: "",
        fileType: "",
        publishDate: ""
      });
      setEditingDocIndex(null);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    const formDataFile = new FormData();
    formDataFile.append("file", file);

    try {
      // Adjust this endpoint to match your file upload API
      const res = await axios.post(
        `${API_URL}/api/upload/document`,
        formDataFile,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      const uploadedFile = res.data?.data || res.data;
      setCurrentDocument({
        ...currentDocument,
        fileUrl: uploadedFile.url || uploadedFile.fileUrl,
        fileSize: (file.size / 1024).toFixed(2) + " KB",
        fileType: file.type || file.name.split(".").pop()
      });

      Swal.fire("Success", "File uploaded successfully", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "File upload failed", "error");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddDocument = () => {
    if (
      !currentDocument.titleEng ||
      !currentDocument.titleHin ||
      !currentDocument.fileUrl ||
      !currentDocument.publishDate
    ) {
      Swal.fire("Required", "Please fill all document fields", "warning");
      return;
    }

    const updatedDocs = [...formData.documentsUpdate];

    if (editingDocIndex !== null) {
      updatedDocs[editingDocIndex] = currentDocument;
      Swal.fire("Updated", "Document updated", "success");
    } else {
      updatedDocs.push(currentDocument);
      Swal.fire("Added", "Document added", "success");
    }

    setFormData({ ...formData, documentsUpdate: updatedDocs });
    toggleDocumentModal();
  };

  const handleEditDocument = (index) => {
    setCurrentDocument(formData.documentsUpdate[index]);
    setEditingDocIndex(index);
    setDocumentModal(true);
  };

  const handleDeleteDocument = (index) => {
    Swal.fire({
      title: "Delete Document?",
      text: "This will remove the document from the list",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete"
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedDocs = formData.documentsUpdate.filter(
          (_, i) => i !== index
        );
        setFormData({ ...formData, documentsUpdate: updatedDocs });
        Swal.fire("Deleted", "Document removed", "success");
      }
    });
  };

  /* ================= CRUD ================= */
  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      titleEng: item.titleEng || "",
      titleHin: item.titleHin || "",
      slug: item.slug || "",
      mainSlug: item.mainSlug || "",
      menuId: item.menuId?._id || item.menuId || "",
      department: item.department || "",
      examYear: item.examYear || "",
      publishDate: item.publishDate?.slice(0, 10) || "",
      htmlContent: item.htmlContent || "",
      documentsUpdate: item.documentsUpdate || []
    });
    setModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Page?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete"
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/api/content/delete-content/${id}`);
      Swal.fire("Deleted", "Page deleted successfully", "success");
      loadData();
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = [
      "titleEng",
      "titleHin",
      "slug",
      "mainSlug",
      "menuId",
      "department",
      "examYear",
      "publishDate"
    ];

    for (let field of required) {
      if (!formData[field]) {
        Swal.fire("Required", `Please fill: ${field}`, "warning");
        return;
      }
    }

    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/api/content/update-content/${editingId}`,
          formData
        );
        Swal.fire("Updated", "Page updated successfully", "success");
      } else {
        await axios.post(`${API_URL}/api/content/create-content`, formData);
        Swal.fire("Created", "Page created successfully", "success");
      }
      toggleModal();
      loadData();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Save failed", "error");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container-fluid mt-4">
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">📄 Page Creator Management</h4>
            <Button color="primary" onClick={toggleModal}>
              <FaPlus /> Add Page
            </Button>
          </div>

          <Table responsive bordered hover>
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Title (EN)</th>
                <th>Slug</th>
                <th>Department</th>
                <th>Exam Year</th>
                <th>Publish Date</th>
                <th>Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    No pages found
                  </td>
                </tr>
              ) : (
                list.map((item, i) => (
                  <tr key={item._id}>
                    <td>{i + 1}</td>
                    <td>{item.titleEng}</td>
                    <td>
                      <code>{item.slug}</code>
                    </td>
                    <td>{item.department}</td>
                    <td>{item.examYear}</td>
                    <td>{item.publishDate?.slice(0, 10)}</td>
                    <td>
                      <span className="badge bg-info">
                        {item.documentsUpdate?.length || 0} files
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        color="warning"
                        className="me-2"
                        onClick={() => handleEdit(item)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        onClick={() => handleDelete(item._id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {/* ================= MAIN MODAL ================= */}
      <Modal isOpen={modal} toggle={toggleModal} size="xl">
        <ModalHeader toggle={toggleModal}>
          {editingId ? "✏️ Edit Page" : "➕ Create Page"}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Title (English) <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    value={formData.titleEng}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData({
                        ...formData,
                        titleEng: title,
                        slug: generateSlug(title)
                      });
                    }}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Title (Hindi) <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    value={formData.titleHin}
                    onChange={(e) =>
                      setFormData({ ...formData, titleHin: e.target.value })
                    }
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Slug <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Main Slug <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    value={formData.mainSlug}
                    onChange={(e) =>
                      setFormData({ ...formData, mainSlug: e.target.value })
                    }
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Menu <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    required
                    value={formData.menuId}
                    onChange={(e) =>
                      setFormData({ ...formData, menuId: e.target.value })
                    }
                  >
                    <option value="">-- Select Menu --</option>
                    {menuList.map((menu) => (
                      <option key={menu._id} value={menu._id}>
                        {menu.titleEng || menu.name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Department <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Exam Year <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    value={formData.examYear}
                    onChange={(e) =>
                      setFormData({ ...formData, examYear: e.target.value })
                    }
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Publish Date <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="date"
                    required
                    value={formData.publishDate}
                    onChange={(e) =>
                      setFormData({ ...formData, publishDate: e.target.value })
                    }
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Label>HTML Content</Label>
              <ReactQuill
                theme="snow"
                value={formData.htmlContent}
                onChange={(value) =>
                  setFormData({ ...formData, htmlContent: value })
                }
                style={{ height: "200px", marginBottom: "50px" }}
              />
            </FormGroup>

            {/* ================= DOCUMENTS SECTION ================= */}
            <hr />
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>📎 Documents ({formData.documentsUpdate.length})</h5>
              <Button
                color="success"
                size="sm"
                onClick={toggleDocumentModal}
                type="button"
              >
                <FaPlus /> Add Document
              </Button>
            </div>

            {formData.documentsUpdate.length > 0 && (
              <Table size="sm" bordered>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title (EN)</th>
                    <th>Title (HI)</th>
                    <th>File</th>
                    <th>Size</th>
                    <th>Publish Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.documentsUpdate.map((doc, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{doc.titleEng}</td>
                      <td>{doc.titleHin}</td>
                      <td>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaFilePdf /> View
                        </a>
                      </td>
                      <td>{doc.fileSize}</td>
                      <td>{doc.publishDate?.slice(0, 10)}</td>
                      <td>
                        <Button
                          size="sm"
                          color="warning"
                          className="me-1"
                          onClick={() => handleEditDocument(idx)}
                          type="button"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          onClick={() => handleDeleteDocument(idx)}
                          type="button"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit">
              <FaSave /> {editingId ? "Update" : "Save"}
            </Button>
            <Button color="secondary" onClick={toggleModal} type="button">
              <FaTimes /> Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ================= DOCUMENT MODAL ================= */}
      <Modal
        isOpen={documentModal}
        toggle={toggleDocumentModal}
        size="lg"
      >
        <ModalHeader toggle={toggleDocumentModal}>
          {editingDocIndex !== null ? "✏️ Edit Document" : "➕ Add Document"}
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Document Title (English) <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  value={currentDocument.titleEng}
                  onChange={(e) =>
                    setCurrentDocument({
                      ...currentDocument,
                      titleEng: e.target.value
                    })
                  }
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Document Title (Hindi) <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  value={currentDocument.titleHin}
                  onChange={(e) =>
                    setCurrentDocument({
                      ...currentDocument,
                      titleHin: e.target.value
                    })
                  }
                />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label>
              Upload File <span className="text-danger">*</span>
            </Label>
            <Input
              type="file"
              onChange={handleFileUpload}
              disabled={uploadingFile}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />
            {uploadingFile && (
              <small className="text-info">Uploading...</small>
            )}
            {currentDocument.fileUrl && (
              <small className="text-success d-block mt-1">
                ✓ File uploaded: {currentDocument.fileUrl}
              </small>
            )}
          </FormGroup>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>File Size (auto-filled)</Label>
                <Input
                  type="text"
                  value={currentDocument.fileSize}
                  readOnly
                  disabled
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>File Type (auto-filled)</Label>
                <Input
                  type="text"
                  value={currentDocument.fileType}
                  readOnly
                  disabled
                />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label>
              Publish Date <span className="text-danger">*</span>
            </Label>
            <Input
              type="date"
              value={currentDocument.publishDate}
              onChange={(e) =>
                setCurrentDocument({
                  ...currentDocument,
                  publishDate: e.target.value
                })
              }
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleAddDocument}>
            <FaSave /> {editingDocIndex !== null ? "Update" : "Add"}
          </Button>
          <Button color="secondary" onClick={toggleDocumentModal}>
            <FaTimes /> Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PageCreatorManagement;