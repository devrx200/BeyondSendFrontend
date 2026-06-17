import { useEffect, useState } from "react";
import {
  Card, CardBody, Button, Table, Form, FormGroup,
  Label, Input, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Container
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { FaSave } from "react-icons/fa";
import {
  ENGLISH_TEXT_ONLY,
  URL_REGEX
} from "../../data/validation.jsx";
/* ================= VALIDATION REGEX ================= */
const PHONE_REGEX = /^(\+91[- ]?)?[0-9]{10}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OFFICE_HOURS_REGEX = /^[A-Za-z0-9 :–\-()]+$/;

const ContactManagement = () => {
  const API = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
  const [data, setData] = useState({ address: {}, officeHours: {}, officials: [] });
  const [modal, setModal] = useState(false);
  const [official, setOfficial] = useState({});
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    address: {},
    officeHours: {},
    official: {}
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
  const getData = async () => {
    const res = await axios.get(`${API}/api/contact-list-officials`);
    setData(res.data.data || {});
  };

   getData() }, [token, API]);

  const validateAddressField = (name, value) => {
    if (!value || !value.trim()) return "This field is required";

    switch (name) {
      case "addressLine":
      case "city":
      case "state":
        return ENGLISH_TEXT_ONLY.test(value)
          ? ""
          : "Only English characters allowed";

      case "pincode":
        return PINCODE_REGEX.test(value)
          ? ""
          : "Pincode must be 6 digits";

      case "phone":
        return PHONE_REGEX.test(value)
          ? ""
          : "Invalid phone number";

      case "email":
        return EMAIL_REGEX.test(value)
          ? ""
          : "Invalid email address";

      default:
        return "";
    }
  };

  const blockPhoneKeys = (e, value) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End"
    ];

    if (allowedKeys.includes(e.key)) return;

    // Allow digits only
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    // First digit must be 6
    if (value.length === 0 && e.key !== "6") {
      e.preventDefault();
    }
  };


  const validateOfficialField = (name, value) => {
    if (!value || !value.trim()) return "This field is required";

    switch (name) {
      case "name":
      case "designation":
        return ENGLISH_TEXT_ONLY.test(value)
          ? ""
          : "Only English characters allowed";
      case "phone":
        return PHONE_REGEX.test(value) ? "" : "Invalid phone number";
      case "email":
        return EMAIL_REGEX.test(value) ? "" : "Invalid email address";
      case "facebook":
      case "youtube":
      case "instagram":
      case "linkedin":
        return URL_REGEX.test(value) ? "" : "Invalid URL (must start with / or http)";
      default:
        return "";
    }
  };

  const validateContactForm = () => {
    const newErrors = { address: {} };
    const { address } = data;

    ["addressLine", "city", "state", "pincode", "phone", "email"].forEach(field => {
      const error = validateAddressField(field, address?.[field] || "");
      if (error) newErrors.address[field] = error;
    });

    setErrors(prev => ({ ...prev, address: newErrors.address }));
    return Object.keys(newErrors.address).length === 0;
  };

  /* ================= SAVE CONTACT ================= */
  const saveContact = async (e) => {
    e.preventDefault();
    if (!validateContactForm()) {
      Swal.fire("Validation Error", "Please fix the highlighted errors", "warning");
      return;
    }
    const { address, officeHours } = data;

    if (!address?.addressLine || !address.city || !address.state) {
      return Swal.fire("Validation Error", "Address, City and State are required", "warning");
    }
    if (!PINCODE_REGEX.test(address.pincode || "")) {
      return Swal.fire("Invalid Pincode", "Pincode must be 6 digits", "warning");
    }
    if (!PHONE_REGEX.test(address.phone || "")) {
      return Swal.fire("Invalid Phone", "Enter valid 10 digit phone number", "warning");
    }
    if (!EMAIL_REGEX.test(address.email || "")) {
      return Swal.fire("Invalid Email", "Enter valid email address", "warning");
    }

    try {
      setLoading(true);
      const res = await axios.put(`${API}/api/contact`, {
        address,
        officeHours
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire("Success", res.data.message, "success");
    
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };
  const validateOfficialForm = () => {
    const newErrors = {};
    ["name", "designation", "phone", "email"].forEach(field => {
      if (official[field]) {
        const error = validateOfficialField(field, official[field]);
        if (error) newErrors[field] = error;
      }
    });

    setErrors(prev => ({ ...prev, official: newErrors }));
    return Object.keys(newErrors).length === 0;
  };
  const handleAddressChange = (field, value) => {
    setData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));

    setErrors(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: validateAddressField(field, value)
      }
    }));
  };
  const validateOfficeHourField = (name, value) => {
    if (!value || !value.trim()) return "This field is required";

    return OFFICE_HOURS_REGEX.test(value)
      ? ""
      : "Only English text, numbers and time format allowed";
  };
  const handleOfficeHourChange = (field, value) => {
    setData(prev => ({
      ...prev,
      officeHours: {
        ...prev.officeHours,
        [field]: value
      }
    }));

    setErrors(prev => ({
      ...prev,
      officeHours: {
        ...prev.officeHours,
        [field]: validateOfficeHourField(field, value)
      }
    }));
  };

  const handleOfficialChange = (field, value) => {
    setOfficial(prev => ({ ...prev, [field]: value }));

    setErrors(prev => ({
      ...prev,
      official: {
        ...prev.official,
        [field]: validateOfficialField(field, value)
      }
    }));
  };

  /* ================= SAVE OFFICIAL ================= */
  const saveOfficial = async () => {
    if (!validateOfficialForm()) {
      Swal.fire("Validation Error", "Please fix the highlighted errors", "warning");
      return;
    }

    if (!official.name || !official.designation) {
      return Swal.fire("Validation Error", "Official Name and Designation are required", "warning");
    }
    if (official.phone && !PHONE_REGEX.test(official.phone)) {
      return Swal.fire("Invalid Phone", "Enter valid phone number", "warning");
    }
    if (official.email && !EMAIL_REGEX.test(official.email)) {
      return Swal.fire("Invalid Email", "Enter valid email address", "warning");
    }

    const formData = new FormData();
    formData.append("official", JSON.stringify(official));
    if (editId) formData.append("officialId", editId);
    if (file) formData.append("image", file);

    try {
      const res = await axios.post(`${API}/api/contact/official`, formData, {
        headers: { "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
         }
      });

    Swal.fire("Success", res.data.message, "success").then(() => {
  setTimeout(() => {
    window.location.reload();
  }, 2000);
});
      setModal(false);
      setOfficial({});
      setFile(null);
      setEditId(null);
    }catch (err) {
    console.log("Error object:", err);
    console.log("Error response:", err.response);
    console.log("Error message:", err.message);
    
    // This will show you the actual error
    Swal.fire("Error", JSON.stringify(err.response?.data || err.message), "error");
  }
  };

  const handleEdit = (o) => {
    setOfficial(o);
    setEditId(o._id);
    setModal(true);
  };
const handleDelete = (o) => {
  Swal.fire({
    title: "Are you sure?",
    text: `Do you want to delete ${o.name}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!"
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API}/api/contact/official/${o._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      Swal.fire({
  title: "Deleted!",
  text: `${o.name} has been deleted.`,
  icon: "success",
  timer: 2000,
  showConfirmButton: false
}).then(() => {
  window.location.reload();
}); // Reload the page to reflect changes
      } catch (err) {
        Swal.fire("Error", err?.response?.data?.message || "Unable to delete official", "error");
      }
    }
  });
};
  return (
    <Container>

      <Card>
        <CardBody>
            <Form onSubmit={saveContact}>
        <div
  className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-3 shadow-sm"
  style={{
    background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
  }}
>
  <div>
    <h4 className="mb-1 text-white fw-bold">
      📞 Contact Management
    </h4>
    <small className="text-white-50">
      Manage contact details, address, email and communication information
    </small>
  </div>

  <Button color="light" disabled={loading}>
    <FaSave className="me-2" />
    {loading ? "Saving..." : "Save Changes"}
  </Button>
</div>

        
            {/* -------- Address Section -------- */}
            <Card className="border mb-4">
              <CardBody>
                <h6 className="fw-semibold mb-3 text-primary">
                  Address & Contact Details
                </h6>

                <Row className="g-3">
                  <Col md={6}>
                    <Label className="form-label">Address Line *</Label>
                    <Input
                      placeholder="Mantralaya, Mahanadi Bhawan, Naya Raipur"
                      value={data.address?.addressLine || ""}
                      maxLength={255}
                      onChange={e => {
                        const value = e.target.value;

                        setData(prev => ({
                          ...prev,
                          address: { ...prev.address, addressLine: value }
                        }));
                        setErrors(prev => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            addressLine: validateAddressField("addressLine", value)
                          }
                        }));
                      }}
                    />
                    {errors.address?.addressLine && (
                      <small className="text-danger">{errors.address.addressLine}</small>
                    )}
                  </Col>

                  <Col md={3}>
                    <Label className="form-label">City *</Label>
                    <Input
                      placeholder="Raipur"
                      value={data.address?.city || ""}
                      // onChange={e =>
                      //   setData({
                      //     ...data,
                      //     address: { ...data.address, city: e.target.value }
                      //   })
                      // }
                      invalid={!!errors.address?.city}
                      onChange={e => handleAddressChange("city", e.target.value)}
                      maxLength={55}
                    />
                    {errors.address?.city && (
                      <small className="text-danger">{errors.address.city}</small>
                    )}
                  </Col>

                  <Col md={3}>
                    <Label className="form-label">State *</Label>
                    <Input
                      placeholder="Chhattisgarh"
                      value={data.address?.state || ""}
                      invalid={!!errors.address?.state}
                      onChange={e => handleAddressChange("state", e.target.value)}
                      maxLength={65}
                    />
                    {errors.address?.state && (
                      <small className="text-danger">{errors.address.state}</small>
                    )}
                  </Col>

                  <Col md={3}>
                    <Label className="form-label">Pincode *</Label>
                    <Input
                      placeholder="492002"
                      value={data.address?.pincode || ""}
                      invalid={!!errors.address?.pincode}
                      onChange={e => handleAddressChange("pincode", e.target.value)}
                      maxLength={6}
                    />
                    {errors.address?.pincode && (
                      <small className="text-danger">{errors.address.pincode}</small>
                    )}
                  </Col>

                  <Col md={3}>
                    <Label className="form-label">Phone *</Label>
                    <Input
                      value={data.address?.phone || ""}
                      invalid={!!errors.address?.phone}
                      onChange={e => handleAddressChange("phone", e.target.value)}
                      maxLength={10}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="10 digit mobile number"
                      onKeyDown={blockPhoneKeys}
                    />
                    {errors.address?.phone && (
                      <small className="text-danger">{errors.address.phone}</small>
                    )}
                  </Col>

                  <Col md={6}>
                    <Label className="form-label">Email *</Label>
                    <Input
                      type="email"
                      placeholder="higheredu.cg@gov.in"
                      value={data.address?.email || ""}
                      invalid={!!errors.address?.email}
                      onChange={e => handleAddressChange("email", e.target.value)}
                      maxLength={250}
                    />
                    {errors.address?.email && (
                      <small className="text-danger">{errors.address.email}</small>
                    )}
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* -------- Office Hours -------- */}
            <Card className="border mb-4">
              <CardBody>
                <h6 className="fw-semibold mb-3 text-primary">
                  Office Working Hours
                </h6>

                <Row className="g-3">
                  <Col md={4}>
                    <Label className="form-label">Weekdays</Label>
                    <Input
                      placeholder="Monday–Friday : 10:00 AM – 6:00 PM"
                      value={data.officeHours?.weekdays || ""}
                      invalid={!!errors.officeHours?.weekdays}
                      onChange={e => handleOfficeHourChange("weekdays", e.target.value)}
                    />
                    {errors.officeHours?.weekdays && (
                      <small className="text-danger">
                        {errors.officeHours.weekdays}
                      </small>
                    )}
                  </Col>

                  <Col md={4}>
                    <Label className="form-label">Saturday</Label>
                    <Input
                      placeholder="Saturday : 10:00 AM – 2:00 PM"
                      value={data.officeHours?.saturday || ""}
                      invalid={!!errors.officeHours?.saturday}
                      onChange={e => handleOfficeHourChange("saturday", e.target.value)}
                    />
                    {errors.officeHours?.saturday && (
                      <small className="text-danger">
                        {errors.officeHours.saturday}
                      </small>
                    )}
                  </Col>

                  <Col md={4}>
                    <Label className="form-label">Sunday</Label>
                    <Input
                      placeholder="Sunday : Closed"
                      value={data.officeHours?.sunday || ""}
                      invalid={!!errors.officeHours?.sunday}
                      onChange={e => handleOfficeHourChange("sunday", e.target.value)}
                    />
                    {errors.officeHours?.sunday && (
                      <small className="text-danger">
                        {errors.officeHours.sunday}
                      </small>
                    )}
                  </Col>
                </Row>
              </CardBody>
            </Card>

          
          </Form>
        </CardBody>
      </Card>

      {/* ================= OFFICIALS LIST ================= */}
      <Card className="border-0 shadow-sm">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Key Officials</h5>
            <Button size="sm" color="primary" onClick={() => setModal(true)}>
              + Add Official
            </Button>
          </div>

          <Table bordered hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Designation</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.officials?.length > 0 ? (
                data.officials.map(o => (
                  <tr key={o._id}>
                    <td>{o.name}</td>
                    <td>{o.designation}</td>
                    <td>
                      <span className={`badge ${o.isActive ? "bg-success" : "bg-secondary"}`}>
                        {o.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-center">
                      <Button size="sm" color="warning" onClick={() => handleEdit(o)}>
                        Edit
                      </Button>
                       <Button size="sm" color="danger" onClick={() => handleDelete(o)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No officials added
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {/* ================= OFFICIAL MODAL ================= */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="lg">

        <ModalHeader toggle={() => setModal(false)}>
          {editId ? "Edit Official" : "Add Official"}
        </ModalHeader>

        <ModalBody>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>Official Name *</Label>
                <Input
                  placeholder="Enter official name"
                  value={official.name || ""}
                  invalid={!!errors.official?.name}
                  onChange={e => handleOfficialChange("name", e.target.value)}
                />
                {errors.official?.name && (
                  <small className="text-danger">{errors.official.name}</small>
                )}
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label>Designation *</Label>
                <Input
                  placeholder="Enter designation"
                  value={official.designation || ""}
                  invalid={!!errors.official?.designation}
                  onChange={e => handleOfficialChange("designation", e.target.value)}
                />
                {errors.official?.designation && (
                  <small className="text-danger">{errors.official.designation}</small>
                )}
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label>Phone</Label>
                <Input
                  placeholder="+91-XXXXXXXXXX"
                  value={official.phone || ""}
                  maxLength={10}
                  invalid={!!errors.official?.phone}
                  onChange={e => handleOfficialChange("phone", e.target.value)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onKeyDown={blockPhoneKeys}
                />
                {errors.official?.phone && (
                  <small className="text-danger">{errors.official.phone}</small>
                )}
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="official@gov.in"
                  value={official.email || ""}
                  invalid={!!errors.official?.email}
                  onChange={e => handleOfficialChange("email", e.target.value)}
                />
                {errors.official?.email && (
                  <small className="text-danger">{errors.official.email}</small>
                )}
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Profile Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => setFile(e.target.files[0])}
                />
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label>Facebook</Label>
                <Input
                  placeholder="https://facebook.com/username"
                  value={official.facebook || ""}
                  // onChange={e =>
                  //   setOfficial({ ...official, facebook: e.target.value })
                  // }
                  invalid={!!errors.official?.facebook}
                  onChange={e => handleOfficialChange("facebook", e.target.value)}
                />
                {errors.official?.facebook && (
                  <small className="text-danger">{errors.official.facebook}</small>
                )}
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label>Instagram</Label>
                <Input
                  placeholder="https://instagram.com/username"
                  value={official.instagram || ""}
                  invalid={!!errors.official?.instagram}
                  onChange={e => handleOfficialChange("instagram", e.target.value)}
                />
                {errors.official?.instagram && (
                  <small className="text-danger">{errors.official.instagram}</small>
                )}
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label>LinkedIn</Label>
                <Input
                  placeholder="https://linkedin.com/in/username"
                  value={official.linkedin || ""}
                  invalid={!!errors.official?.linkedin}
                  onChange={e => handleOfficialChange("linkedin", e.target.value)}
                />
                {errors.official?.linkedin && (
                  <small className="text-danger">{errors.official.linkedin}</small>
                )}
              </FormGroup>
            </Col>

            <Col md={12}>
              <FormGroup>
                <Label>YouTube</Label>
                <Input
                  placeholder="https://youtube.com/channel/..."
                  value={official.youtube || ""}
                  invalid={!!errors.official?.youtube}
                  onChange={e => handleOfficialChange("youtube", e.target.value)}
                />
                {errors.official?.youtube && (
                  <small className="text-danger">{errors.official.youtube}</small>
                )}
              </FormGroup>
            </Col>
             <Col md={4}>
                  <FormGroup check className="mb-3">
                    <Input
                      type="checkbox"
                      id="isActive"
                      checked={official.isActive}
                      onChange={(e) => setOfficial({ ...official, isActive: e.target.checked })}
                    />
                    <Label check for="isActive" className="fw-semibold">
                      Is Active
                    </Label>
                  </FormGroup>
                  </Col>
          </Row>
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" onClick={() => setModal(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={saveOfficial}>
            Save Official
          </Button>
        </ModalFooter>
      </Modal>

    </Container>

  );

};

export default ContactManagement;
