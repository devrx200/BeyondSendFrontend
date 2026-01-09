import { useState, useEffect } from "react";
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
  Row, Col
} from "reactstrap";
import { FaPlus, FaEdit, FaTrash, FaImage } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const ImageMaster = () => {
const API_URL = import.meta.env.VITE_API_URL;

  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    imgNameEng: "",
    imgNameHin: "",
    designationEng: "",
    designationHin: "",
    image: null,
  });


  const toggleModal = () => {
    setModal(!modal);
    if (modal) resetForm();
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      imgNameEng: "",
      imgNameHin: "",
      designationEng: "",
      designationHin: "",
      image: null,
    });
    setImagePreview(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   setFormData({ ...formData, image: file });
  //   setImagePreview(URL.createObjectURL(file));
  // };
  const handleImageChange = (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  setFormData((prev) => ({
    ...prev,
    image: file,
  }));

  setImagePreview(URL.createObjectURL(file));
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      payload.append("imgNameEng", formData.imgNameEng);
      payload.append("imgNameHin", formData.imgNameHin);
      payload.append("designationEng", formData.designationEng);
      payload.append("designationHin", formData.designationHin);

      if (formData.image) {
        payload.append("image", formData.image);
      }

      const response = await axios.post(
        `${API_URL}api/create`,
        payload,
        {
          headers: {
            "web-url": window.location.href,
            //  DO NOT SET Content-Type for FormData
          },
        }
      );


      if (response?.status === 200 || response?.status === 201) {
      await Swal.fire({
        icon: "success",
        title: response.data?.msg || "Added Successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      resetForm();       //  clear form
      setModal(false);   //  close modal
      fetchImages();     // refresh table
    }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.msg ||
          "Something went wrong while saving image",
      });
      console.error("Image upload error:", error);
    }
  };
  const [imageList, setImageList] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchImages = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}api/get-images`,
        {
          headers: {
            "web-url": window.location.href,
          },
        }
      );

      if (response.status === 200) {
        setImageList(response.data || []);

      }
    } catch (error) {
      console.error("Error fetching images:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Failed to load images",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {


    fetchImages();
  }, []);


  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      imgNameEng: item.imgNameEng || "",
      imgNameHin: item.imgNameHin || "",
      designationEng: item.designationEng || "",
      designationHin: item.designationHin || "",
      image: null,
    });

    setImagePreview(
      item.image
        ? `${API_URL}${item.image}`
        : null
    );

    setModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();

      payload.append("imgNameEng", formData.imgNameEng);
      payload.append("imgNameHin", formData.imgNameHin);
      payload.append("designationEng", formData.designationEng);
      payload.append("designationHin", formData.designationHin);

      if (formData.image) {
        payload.append("image", formData.image);
      }

      const response = await axios.put(
        `${API_URL}api/update-image/${editingItem._id}`,
        payload,
        {
          headers: {
            "web-url": window.location.href,
            // Authorization: `Bearer ${token}` (if protected)
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Updated Successfully",
          timer: 2000,
          showConfirmButton: false,
        });

        setModal(false);
        resetForm();
        fetchImages();
      }

    } catch (error) {
      const errorMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while updating";

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: errorMsg,
      });

      console.error("Update error:", error);
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
    const response = await axios.delete(
      `${API_URL}api/delete-image/${id}`,
      {
        headers: {
          "web-url": window.location.href,
          // Authorization: `Bearer ${token}` // if protected
        },
      }
    );

    if (response.status === 200) {
      Swal.fire({
        icon: "success",
        title: response.data?.msg || "Image deleted successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      // Refresh table
      fetchImages();
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Delete Failed",
      text:
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        "Something went wrong while deleting image",
    });

    console.error("Delete error:", error);
  }
};


  return (
    <Card className="shadow-sm border-0">
      <CardBody>
        {/* Header */}
        <div className="d-flex justify-content-between mb-3">
          <h4>
            <FaImage className="me-2" />
            Image Master
          </h4>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" />
            Add Image
          </Button>
        </div>

        {/* Table */}
        <Table bordered responsive hover className="align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Name (EN)</th>
              <th>Name (HI)</th>
              <th>Designation (EN)</th>
              <th>Designation (HI)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {imageList.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  No records found
                </td>
              </tr>
            ) : (
              imageList.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>

                  <td>
                    <img
                      src={`${API_URL}${item.image}`}
                      alt="img"
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #ddd",
                      }}
                    />
                  </td>

                  <td>{item.imgNameEng}</td>
                  <td>{item.imgNameHin}</td>
                  <td>{item.designationEng}</td>
                  <td>{item.designationHin}</td>

                  <td>
                    <Button color="info" size="sm" className="me-2" onClick={() => handleEdit(item)}>
                      <FaEdit />
                    </Button>
                    <Button color="danger" size="sm" onClick={() => handleDelete(item._id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </Table>


        {/* Modal */}
        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            {editingItem ? "Edit Image" : "Add Image"}
          </ModalHeader>
          <ModalBody>
            <Form onSubmit={editingItem ? handleUpdate : handleSubmit}>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Image Name (English)</Label>
                    <Input
                      name="imgNameEng"
                      value={formData.imgNameEng}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>

                </Col>
                <Col md={6}>

                  <FormGroup>
                    <Label>Image Name (Hindi)</Label>
                    <Input
                      name="imgNameHin"
                      value={formData.imgNameHin}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Designation (English)</Label>
                    <Input
                      name="designationEng"
                      value={formData.designationEng}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup></Col>
                <Col md={6}>

                  <FormGroup>
                    <Label>Designation (Hindi)</Label>
                    <Input
                      name="designationHin"
                      value={formData.designationHin}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup></Col>

              </Row>



              <FormGroup>
                <Label>Upload Image</Label>
                <Input type="file" name="image"  accept="image/*" onChange={handleImageChange} />
              </FormGroup>

              {imagePreview && (
                <div className="text-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: "200px", borderRadius: "8px" }}
                  />
                </div>
              )}
            </Form>
          </ModalBody>

          <ModalFooter>
            <Button color="secondary" onClick={toggleModal}>
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={editingItem ? handleUpdate : handleSubmit}
              type="submit"
            >
              {editingItem ? "Update" : "Save"}
            </Button>

          </ModalFooter>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default ImageMaster;
