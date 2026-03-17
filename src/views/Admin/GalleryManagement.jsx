import { useEffect, useState } from "react";
import {
  Card, CardBody, Button, Row, Col,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Form, Label, Input, Badge
} from "reactstrap";
import { FaImages, FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

const GalleryManagement = () => {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [imageModal, setImageModal] = useState(false);
  const [sliderImages, setSliderImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [form, setForm] = useState({
    titleEng: "",
    titleHin: "",
    shortDescEng: "",
    shortDescHin: "",
    images: [],
    displayOrder: 0,
    link: "",
    isExternal: false,
    openInNewTab: false,
    isActive: true
  });

  /* ================= LOAD ================= */
  const loadGallery = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/get-gallery`);
      setList(res.data?.data || []);

      if (!res.data.success) {
        Swal.fire("Error", res.data.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to load gallery", "error");
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  /* ================= MODAL ================= */
  const toggleModal = () => {
    setModal(!modal);
    if (modal) resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setExistingImages([]);
    setRemovedImages([]);
    setPreviewImages([]);
    setForm({
      titleEng: "",
      titleHin: "",
      shortDescEng: "",
      shortDescHin: "",
      images: [],
      displayOrder: 0,
      link: "",
      isExternal: false,
      openInNewTab: false,
      isActive: true
    });
  };

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    setPreviewImages(prev => [
      ...prev,
      ...files.map(file => ({ file, url: URL.createObjectURL(file) }))
    ]);
  };

  const removeSelectedImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (img) => {
    setExistingImages(prev => prev.filter(i => i !== img));
    setRemovedImages(prev => [...prev, img]);
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();

      payload.append("titleEng", form.titleEng);
      payload.append("titleHin", form.titleHin);
      payload.append("shortDescEng", form.shortDescEng);
      payload.append("shortDescHin", form.shortDescHin);
      payload.append("displayOrder", form.displayOrder);
      payload.append("link", form.link);
      payload.append("isExternal", form.isExternal);
      payload.append("openInNewTab", form.openInNewTab);
      payload.append("isActive", form.isActive);

      form.images.forEach(file => payload.append("images", file));
      removedImages.forEach(img => payload.append("removeImages[]", img));

      const url = editingId
        ? `${API_URL}/api/update-gallery/${editingId}`
        : `${API_URL}/api/add-gallery`;

      const method = editingId ? "put" : "post";

      const res = await axios({ method, url, data: payload });

      Swal.fire(
        res.data.success ? "Success" : "Error",
        res.data.message,
        res.data.success ? "success" : "error"
      );

      if (res.data.success) {
        toggleModal();
        loadGallery();
      }

    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Something went wrong",
        "error"
      );
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/api/get-gallery-by-id/${id}`);

      if (!res.data.success) {
        return Swal.fire("Error", res.data.message, "error");
      }

      const item = res.data.data;

      setEditingId(item._id);
      setExistingImages(item.images || []);
      setRemovedImages([]);

      setForm({
        titleEng: item.titleEng,
        titleHin: item.titleHin,
        shortDescEng: item.shortDescEng || "",
        shortDescHin: item.shortDescHin || "",
        images: [],
        displayOrder: item.displayOrder,
        link: item.link || "",
        isExternal: item.isExternal,
        openInNewTab: item.openInNewTab,
        isActive: item.isActive
      });

      setPreviewImages([]);
      setModal(true);

    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to fetch", "error");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Gallery?",
      text: "This will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33"
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(`${API_URL}/api/delete-gallery/${id}`);

      Swal.fire(
        res.data.success ? "Deleted" : "Error",
        res.data.message,
        res.data.success ? "success" : "error"
      );

      if (res.data.success) loadGallery();

    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Delete failed", "error");
    }
  };

  /* ================= IMAGE SLIDER ================= */
  const openImageModal = (images, index = 0) => {
    setSliderImages(images);
    setCurrentIndex(index);
    setImageModal(true);
  };

  const nextImage = () =>
    setCurrentIndex(prev => (prev + 1) % sliderImages.length);

  const prevImage = () =>
    setCurrentIndex(prev =>
      prev === 0 ? sliderImages.length - 1 : prev - 1
    );

  return (
    <Card className="shadow-sm border-0">
      <CardBody>

        {/* HEADER */}
        <div className="d-flex justify-content-between mb-3">
          <h4><FaImages /> Gallery Management</h4>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus /> Add Gallery
          </Button>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Preview</th>
                <th>Title</th>
                <th>Images</th>
                <th>Status</th>
                <th width="140">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={`${API_URL}${item.images[0]}`}
                      width="60"
                      height="60"
                      style={{ objectFit: "cover", borderRadius: 6, cursor: "pointer" }}
                      onClick={() => openImageModal(item.images)}
                    />
                  </td>
                  <td><b>{item.titleEng}</b><br /><small>{item.titleHin}</small></td>
                  <td>
                    <Badge color="info" style={{ cursor: "pointer" }}
                      onClick={() => openImageModal(item.images)}>
                      {item.images.length} Images
                    </Badge>
                  </td>
                  <td>
                    <Badge color={item.isActive ? "success" : "secondary"}>
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" color="info" onClick={() => handleEdit(item._id)}>
                      <FaEdit />
                    </Button>{" "}
                    <Button size="sm" color="danger" onClick={() => handleDelete(item._id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ADD / EDIT MODAL */}
        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            {editingId ? "Edit Gallery" : "Add Gallery"}
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <Row className="g-3">

                <Col md={6}>
                  <Label>Title (English)</Label>
                  <Input name="titleEng" value={form.titleEng} onChange={handleChange} required />
                </Col>

                <Col md={6}>
                  <Label>Title (Hindi)</Label>
                  <Input name="titleHin" value={form.titleHin} onChange={handleChange} required />
                </Col>

                <Col md={6}>
                  <Label>Short Desc (English)</Label>
                  <Input type="textarea" name="shortDescEng" value={form.shortDescEng} onChange={handleChange} />
                </Col>

                <Col md={6}>
                  <Label>Short Desc (Hindi)</Label>
                  <Input type="textarea" name="shortDescHin" value={form.shortDescHin} onChange={handleChange} />
                </Col>

                <Col md={4}>
                  <Label>Display Order</Label>
                  <Input type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange} />
                </Col>

                <Col md={4}>
                  <Label>Link</Label>
                  <Input name="link" value={form.link} onChange={handleChange} />
                </Col>

                <Col md={4}>
                  <Label>Status</Label>
                  <Input type="select"
                    value={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.value === "true" })}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Input>
                </Col>

                <Col md={6}>
                  <Label><Input type="checkbox" name="isExternal" checked={form.isExternal} onChange={handleChange} /> External Link</Label>
                </Col>

                <Col md={6}>
                  <Label><Input type="checkbox" name="openInNewTab" checked={form.openInNewTab} onChange={handleChange} /> Open in New Tab</Label>
                </Col>

                {existingImages.length > 0 && (
                  <Col md={12}>
                    <Label>Existing Images</Label>
                    <div className="d-flex gap-2 flex-wrap">
                      {existingImages.map((img, i) => (
                        <div key={i} className="position-relative">
                          <img src={`${API_URL}${img}`} width="90" style={{ borderRadius: 8 }} />
                          <Button size="sm" color="danger"
                            className="position-absolute top-0 end-0 p-0 px-1"
                            onClick={() => removeExistingImage(img)}>
                            <FaTimes />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Col>
                )}

                <Col md={12}>
                  <Label>Add New Images</Label>
                  <Input type="file" multiple accept="image/*" onChange={handleImagesChange} />
                </Col>

                <Col md={12} className="d-flex gap-2 flex-wrap">
                  {previewImages.map((img, i) => (
                    <div key={i} className="position-relative">
                      <img src={img.url} width="90" style={{ borderRadius: 8 }} />
                      <Button size="sm" color="danger"
                        className="position-absolute top-0 end-0 p-0 px-1"
                        onClick={() => removeSelectedImage(i)}>
                        <FaTimes />
                      </Button>
                    </div>
                  ))}
                </Col>

              </Row>
            </ModalBody>

            <ModalFooter>
              <Button color="secondary" onClick={toggleModal}>Cancel</Button>
              <Button color="primary" type="submit">
                {editingId ? "Update" : "Save"}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

        {/* IMAGE SLIDER MODAL */}
        <Modal isOpen={imageModal} toggle={() => setImageModal(false)} size="lg" centered>
          <ModalHeader toggle={() => setImageModal(false)}>Gallery Images</ModalHeader>
          <ModalBody className="text-center">
            <img
              src={`${API_URL}${sliderImages[currentIndex]}`}
              className="img-fluid"
              style={{ maxHeight: "70vh", borderRadius: 10 }}
            />
            <div className="d-flex justify-content-between mt-3">
              <Button onClick={prevImage}>⬅ Prev</Button>
              <span>{currentIndex + 1} / {sliderImages.length}</span>
              <Button onClick={nextImage}>Next ➡</Button>
            </div>
          </ModalBody>
        </Modal>

      </CardBody>
    </Card>
  );
};
export default GalleryManagement;
