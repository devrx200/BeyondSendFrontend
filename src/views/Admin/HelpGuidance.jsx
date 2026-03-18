import { useEffect, useState } from "react";
import {
  Card, CardBody, Button, Row, Col,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Form, Label, Input, Badge, Spinner,
  Container
} from "reactstrap";

import {
  FaPlus, FaEdit, FaTrash,
  FaFilePdf, FaVideo, FaEye, FaPlayCircle
} from "react-icons/fa";

import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

const HelpGuidance = () => {

  const [list, setList] = useState([]);
  const [modal, setModal] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);

  const [previewUrl, setPreviewUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    contentType: "VIDEO",
    videoUrl: "",
    order: "",
    status: "ACTIVE"
  });

  /* LOAD */
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/get-help-guidance`);
      setList(res.data?.data || []);
    } catch {
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* MODAL */
  const toggleModal = () => {
    setModal(!modal);
    if (modal) resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFile(null);
    setForm({
      title: "",
      description: "",
      contentType: "VIDEO",
      videoUrl: "",
      order: "",
      status: "ACTIVE"
    });
  };

  /* INPUT */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /* PREVIEW */
  const openPreview = (item) => {
    if (item.contentType === "pdf") {
      setPreviewUrl(`${API_URL}${item.pdfUrl}`);
    } else {
      setPreviewUrl(item.videoUrl);
    }
    setPreviewTitle(item.title);
    setPreviewModal(true);
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.keys(form).forEach(key => fd.append(key, form[key]));

    if (form.contentType === "PDF" && file) {
      fd.append("file", file);
    }

    try {
      const url = editingId
        ? `${API_URL}/api/update-help-guidance/${editingId}`
        : `${API_URL}/api/create-help-guidance`;

      const method = editingId ? "put" : "post";

      const res = await axios({ method, url, data: fd });

      Swal.fire("Success", res.data.message, "success");

      toggleModal();
      loadData();

    } catch {
      Swal.fire("Error", "Failed", "error");
    }
  };

  /* EDIT */
  const handleEdit = (item) => {
    setEditingId(item._id);

    setForm({
      title: item.title,
      description: item.description,
      contentType: item.contentType?.toUpperCase(),
      videoUrl: item.videoUrl || "",
      order: item.order,
      status: item.status?.toUpperCase()
    });

    setModal(true);
  };

  /* DELETE */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete?",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    await axios.delete(`${API_URL}/api/delete-help-guidance/${id}`);
    loadData();
  };

  return (
    <Container>
      <Card className="shadow-sm border-0">
        <CardBody>

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5><FaFilePdf /> Help & Guidance</h5>
            <Button color="primary" onClick={toggleModal}>
              <FaPlus /> Add
            </Button>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">

              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Actions</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center"><Spinner /></td></tr>
                ) : list.map((item, index) => (

                  <tr key={item._id}>
                    <td>{index + 1}</td>

                    <td>
                      <div className="fw-semibold">{item.title}</div>
                      <small className="text-muted">{item.description}</small>
                    </td>

                    <td>
                      {item.contentType === "pdf"
                        ? <FaFilePdf color="red" />
                        : <FaVideo color="blue" />}
                    </td>

                    {/* ACTIONS */}
                    <td>
                      <div className="d-flex gap-2">

                        <Button size="sm" color="primary" onClick={() => openPreview(item)}>
                          <FaEye />
                        </Button>

                        <Button size="sm" color="warning" onClick={() => handleEdit(item)}>
                          <FaEdit />
                        </Button>

                        <Button size="sm" color="danger" onClick={() => handleDelete(item._id)}>
                          <FaTrash />
                        </Button>

                      </div>
                    </td>

                    <td>
                      <Badge color={item.status === "active" ? "success" : "secondary"}>
                        {item.status}
                      </Badge>
                    </td>

                  </tr>

                ))}
              </tbody>

            </table>
          </div>

          {/* ADD / EDIT MODAL */}
          <Modal size="lg" isOpen={modal} toggle={toggleModal}>
            <ModalHeader toggle={toggleModal}>
              {editingId ? "Edit" : "Add"} Help
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <ModalBody>

                <Label>Title</Label>
                <Input name="title" value={form.title} onChange={handleChange} required />

                <Label className="mt-2">Description</Label>
                <Input type="textarea" name="description" value={form.description} onChange={handleChange} />

                <Label className="mt-2">Type</Label>
                <Input type="select" name="contentType" value={form.contentType} onChange={handleChange}>
                  <option value="VIDEO">Video</option>
                  <option value="PDF">PDF</option>
                </Input>

                {form.contentType === "VIDEO" && (
                  <>
                    <Label className="mt-2">Video URL</Label>
                    <Input name="videoUrl" value={form.videoUrl} onChange={handleChange} />
                  </>
                )}

                {form.contentType === "PDF" && (
                  <>
                    <Label className="mt-2">Upload PDF</Label>
                    <Input type="file" onChange={(e) => setFile(e.target.files[0])} />
                  </>
                )}

                <Label className="mt-2">Order</Label>
                <Input type="number" name="order" value={form.order} onChange={handleChange} />

              </ModalBody>

              <ModalFooter>
                <Button color="secondary" onClick={toggleModal}>Cancel</Button>
                <Button color="primary" type="submit">
                  {editingId ? "Update" : "Save"}
                </Button>
              </ModalFooter>
            </Form>
          </Modal>

          {/* PREVIEW MODAL */}
          <Modal size="xl" isOpen={previewModal} toggle={() => setPreviewModal(false)}>
            <ModalHeader toggle={() => setPreviewModal(false)}>
              {previewTitle}
            </ModalHeader>

            <ModalBody style={{ height: "70vh", padding: 0 }}>
              <iframe
                src={previewUrl}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title="Preview"
              />
            </ModalBody>
          </Modal>

        </CardBody>
      </Card>
    </Container>
  );
};

export default HelpGuidance;