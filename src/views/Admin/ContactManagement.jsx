import { useEffect, useState } from "react";
import {
  Card, CardBody, Button, Table, Form, FormGroup,
  Label, Input, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Container
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";

/* ================= VALIDATION REGEX ================= */
const PHONE_REGEX = /^(\+91[- ]?)?[0-9]{10}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactManagement = () => {
  const API = import.meta.env.VITE_API_URL;

  const [data, setData] = useState({ address: {}, officeHours: {}, officials: [] });
  const [modal, setModal] = useState(false);
  const [official, setOfficial] = useState({});
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD DATA ================= */
  const load = async () => {
    const res = await axios.get(`${API}/api/contact`);
    setData(res.data.data || {});
  };

  useEffect(() => { load() }, []);

  /* ================= SAVE CONTACT ================= */
  const saveContact = async (e) => {
    e.preventDefault();

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
      });

      Swal.fire("Success", res.data.message, "success");
      load();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SAVE OFFICIAL ================= */
  const saveOfficial = async () => {
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
        headers: { "Content-Type": "multipart/form-data" }
      });

      Swal.fire("Success", res.data.message, "success");
      setModal(false);
      setOfficial({});
      setFile(null);
      setEditId(null);
      load();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Unable to save official", "error");
    }
  };

  const handleEdit = (o) => {
    setOfficial(o);
    setEditId(o._id);
    setModal(true);
  };
 return (
  <>
    <Container >
      {/* ================= CONTACT INFORMATION ================= */}
      <Card className="border-0 shadow-sm mb-4">
        <CardBody>
          <h4 className="mb-4 fw-bold">Contact Management</h4>

          <Form onSubmit={saveContact}>
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
                      onChange={e =>
                        setData({
                          ...data,
                          address: { ...data.address, addressLine: e.target.value }
                        })
                      }
                    />
                  </Col>

                  <Col md={3}>
                    <Label className="form-label">City *</Label>
                    <Input
                      placeholder="Raipur"
                      value={data.address?.city || ""}
                      onChange={e =>
                        setData({
                          ...data,
                          address: { ...data.address, city: e.target.value }
                        })
                      }
                    />
                  </Col>

                  <Col md={3}>
                    <Label className="form-label">State *</Label>
                    <Input
                      placeholder="Chhattisgarh"
                      value={data.address?.state || ""}
                      onChange={e =>
                        setData({
                          ...data,
                          address: { ...data.address, state: e.target.value }
                        })
                      }
                    />
                  </Col>

                  <Col md={3}>
                    <Label className="form-label">Pincode *</Label>
                    <Input
                      placeholder="492002"
                      value={data.address?.pincode || ""}
                      onChange={e =>
                        setData({
                          ...data,
                          address: { ...data.address, pincode: e.target.value }
                        })
                      }
                    />
                  </Col>

                  <Col md={3}>
                    <Label className="form-label">Phone *</Label>
                    <Input
                      placeholder="+91-XXXXXXXXXX"
                      value={data.address?.phone || ""}
                      onChange={e =>
                        setData({
                          ...data,
                          address: { ...data.address, phone: e.target.value }
                        })
                      }
                    />
                  </Col>

                  <Col md={6}>
                    <Label className="form-label">Email *</Label>
                    <Input
                      type="email"
                      placeholder="higheredu.cg@gov.in"
                      value={data.address?.email || ""}
                      onChange={e =>
                        setData({
                          ...data,
                          address: { ...data.address, email: e.target.value }
                        })
                      }
                    />
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
                      onChange={e =>
                        setData({
                          ...data,
                          officeHours: {
                            ...data.officeHours,
                            weekdays: e.target.value
                          }
                        })
                      }
                    />
                  </Col>

                  <Col md={4}>
                    <Label className="form-label">Saturday</Label>
                    <Input
                      placeholder="Saturday : 10:00 AM – 2:00 PM"
                      value={data.officeHours?.saturday || ""}
                      onChange={e =>
                        setData({
                          ...data,
                          officeHours: {
                            ...data.officeHours,
                            saturday: e.target.value
                          }
                        })
                      }
                    />
                  </Col>

                  <Col md={4}>
                    <Label className="form-label">Sunday</Label>
                    <Input
                      placeholder="Sunday : Closed"
                      value={data.officeHours?.sunday || ""}
                      onChange={e =>
                        setData({
                          ...data,
                          officeHours: {
                            ...data.officeHours,
                            sunday: e.target.value
                          }
                        })
                      }
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>

            <div className="text-end">
              <Button color="primary" disabled={loading}>
                {loading ? "Saving..." : "Save Contact Information"}
              </Button>
            </div>
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
      <Modal isOpen={modal} toggle={() => setModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setModal(false)}>
          {editId ? "Edit Official" : "Add Official"}
        </ModalHeader>

        <ModalBody>
          <Row className="g-3">
            <Col md={6}>
              <Label className="form-label">Official Name *</Label>
              <Input
                value={official.name || ""}
                onChange={e => setOfficial({ ...official, name: e.target.value })}
              />
            </Col>

            <Col md={6}>
              <Label className="form-label">Designation *</Label>
              <Input
                value={official.designation || ""}
                onChange={e =>
                  setOfficial({ ...official, designation: e.target.value })
                }
              />
            </Col>

            <Col md={6}>
              <Label className="form-label">Phone</Label>
              <Input
                value={official.phone || ""}
                onChange={e => setOfficial({ ...official, phone: e.target.value })}
              />
            </Col>

            <Col md={6}>
              <Label className="form-label">Email</Label>
              <Input
                type="email"
                value={official.email || ""}
                onChange={e => setOfficial({ ...official, email: e.target.value })}
              />
            </Col>

            <Col md={6}>
              <Label className="form-label">Profile Image</Label>
              <Input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
            </Col>

            <Col md={6}>
              <Label className="form-label">Facebook</Label>
              <Input
                value={official.facebook || ""}
                onChange={e =>
                  setOfficial({ ...official, facebook: e.target.value })
                }
              />
            </Col>

            <Col md={6}>
              <Label className="form-label">Instagram</Label>
              <Input
                value={official.instagram || ""}
                onChange={e =>
                  setOfficial({ ...official, instagram: e.target.value })
                }
              />
            </Col>

            <Col md={6}>
              <Label className="form-label">LinkedIn</Label>
              <Input
                value={official.linkedin || ""}
                onChange={e =>
                  setOfficial({ ...official, linkedin: e.target.value })
                }
              />
            </Col>

            <Col md={12}>
              <Label className="form-label">YouTube</Label>
              <Input
                value={official.youtube || ""}
                onChange={e =>
                  setOfficial({ ...official, youtube: e.target.value })
                }
              />
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
  </>
);
//   return (
//     <>
//       <div className="shadow">
//         <Card  className="border-0 shadow-sm mb-4">
//           <CardBody className="">
//             <div className="">
//               <h4 className="mb-4">Contact Management</h4>

//             </div>
//             {/* ================= CONTACT FORM ================= */}
//             <Form onSubmit={saveContact}>
//               <h6 className="border-bottom pb-2 mb-3">Address & Contact</h6>
//               <Row>
//                 <Col xs={6}>
//                   <FormGroup>
//                     <Label>Address Line *</Label>
//                     <Input
//                       placeholder="Mantralaya, Mahanadi Bhawan, Naya Raipur"
//                       value={data.address?.addressLine || ""}
//                       onChange={e => setData({ ...data, address: { ...data.address, addressLine: e.target.value } })}
//                     />
//                   </FormGroup>
//                 </Col>

//                 <Col xs={6}>
//                   <FormGroup>
//                     <Label>City *</Label>
//                     <Input
//                       placeholder="Raipur"
//                       value={data.address?.city || ""}
//                       onChange={e => setData({ ...data, address: { ...data.address, city: e.target.value } })}
//                     />
//                   </FormGroup>
//                 </Col>

//                 <Col xs={6}>
//                   <FormGroup>
//                     <Label>State *</Label>
//                     <Input
//                       placeholder="Chhattisgarh"
//                       value={data.address?.state || ""}
//                       onChange={e => setData({ ...data, address: { ...data.address, state: e.target.value } })}
//                     />
//                   </FormGroup>
//                 </Col>

//                 <Col xs={6}>
//                   <FormGroup>
//                     <Label>Pincode *</Label>
//                     <Input
//                       placeholder="492002"
//                       value={data.address?.pincode || ""}
//                       onChange={e => setData({ ...data, address: { ...data.address, pincode: e.target.value } })}
//                     />
//                   </FormGroup>
//                 </Col>

//                 <Col xs={6}>
//                   <FormGroup>
//                     <Label>Phone *</Label>
//                     <Input
//                       placeholder="+91-771-2221234"
//                       value={data.address?.phone || ""}
//                       onChange={e => setData({ ...data, address: { ...data.address, phone: e.target.value } })}
//                     />
//                   </FormGroup>
//                 </Col>

//                 <Col xs={6}>
//                   <FormGroup>
//                     <Label>Email *</Label>
//                     <Input
//                       type="email"
//                       placeholder="higheredu.cg@gov.in"
//                       value={data.address?.email || ""}
//                       onChange={e => setData({ ...data, address: { ...data.address, email: e.target.value } })}
//                     />
//                   </FormGroup>
//                 </Col>
//               </Row>

//               <h6 className="border-bottom pb-2 mt-4 mb-3">Office Hours</h6>
//               <Row>
//                 <Col xs={4}>
//                   <Input
//                     placeholder="Monday to Friday: 10:00 AM - 6:00 PM"
//                     value={data.officeHours?.weekdays || ""}
//                     onChange={e => setData({ ...data, officeHours: { ...data.officeHours, weekdays: e.target.value } })}
//                   />
//                 </Col>
//                 <Col xs={4}>
//                   <Input
//                     placeholder="Saturday: 10:00 AM - 2:00 PM"
//                     value={data.officeHours?.saturday || ""}
//                     onChange={e => setData({ ...data, officeHours: { ...data.officeHours, saturday: e.target.value } })}
//                   />
//                 </Col>
//                 <Col xs={4}>
//                   <Input
//                     placeholder="Sunday: Closed"
//                     value={data.officeHours?.sunday || ""}
//                     onChange={e => setData({ ...data, officeHours: { ...data.officeHours, sunday: e.target.value } })}
//                   />
//                 </Col>
//               </Row>

//               <Button color="primary" className="mt-3" disabled={loading}>
//                 {loading ? "Saving..." : "Save Contact Info"}
//               </Button>
//             </Form>

//             <hr />

          


//           </CardBody>
         

         
//         </Card>
//     <Card  className="border-0 shadow-sm">
//         {/* ================= OFFICIALS ================= */}
//             <div className="d-flex justify-content-between mb-2">
//               <h5>Key Officials</h5>
//               <Button size="sm" onClick={() => setModal(true)}>+ Add Official</Button>
//             </div>
//             <CardBody>
//               <Table bordered responsive>
//                 <thead className="table-light">
//                   <tr>
//                     <th>Name</th>
//                     <th>Designation</th>
//                     <th>Status</th>
//                     <th width="120">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {data.officials?.map(o => (
//                     <tr key={o._id}>
//                       <td>{o.name}</td>
//                       <td>{o.designation}</td>
//                       <td>{o.isActive ? "Active" : "Inactive"}</td>
//                       <td>
//                         <Button size="sm" onClick={() => handleEdit(o)}>Edit</Button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </CardBody>
//           </Card>
//  {/* ================= OFFICIAL MODAL ================= */}
//           <Modal isOpen={modal} toggle={() => setModal(false)} size="lg">

//             <ModalHeader toggle={() => setModal(false)}>
//               {editId ? "Edit Official" : "Add Official"}
//             </ModalHeader>

//             <ModalBody>
//               <Row>
//                 <Col md={6}>
//                   <FormGroup>
//                     <Label>Official Name *</Label>
//                     <Input
//                       placeholder="Enter official name"
//                       value={official.name || ""}
//                       onChange={e =>
//                         setOfficial({ ...official, name: e.target.value })
//                       }
//                     />
//                   </FormGroup>
//                 </Col>

//                 <Col md={6}>
//                   <FormGroup>
//                     <Label>Designation *</Label>
//                     <Input
//                       placeholder="Enter designation"
//                       value={official.designation || ""}
//                       onChange={e =>
//                         setOfficial({ ...official, designation: e.target.value })
//                       }
//                     />
//                   </FormGroup>
//                 </Col>

//                 <Col md={6}>
//                   <FormGroup>
//                     <Label>Phone</Label>
//                     <Input
//                       placeholder="+91-XXXXXXXXXX"
//                       value={official.phone || ""}
//                       onChange={e =>
//                         setOfficial({ ...official, phone: e.target.value })
//                       }
//                     />
//                   </FormGroup>
//                 </Col>

//                 <Col md={6}>
//                   <FormGroup>
//                     <Label>Email</Label>
//                     <Input
//                       type="email"
//                       placeholder="official@gov.in"
//                       value={official.email || ""}
//                       onChange={e =>
//                         setOfficial({ ...official, email: e.target.value })
//                       }
//                     />
//                   </FormGroup>
//                 </Col>

//                 <Col md={6}>
//                   <FormGroup>
//                     <Label>Profile Image</Label>
//                     <Input
//                       type="file"
//                       accept="image/*"
//                       onChange={e => setFile(e.target.files[0])}
//                     />
//                   </FormGroup>
//                 </Col>

//                 <Col md={6}>
//                   <FormGroup>
//                     <Label>Facebook</Label>
//                     <Input
//                       placeholder="https://facebook.com/username"
//                       value={official.facebook || ""}
//                       onChange={e =>
//                         setOfficial({ ...official, facebook: e.target.value })
//                       }
//                     />
//                   </FormGroup>
//                 </Col>

//                 <Col md={6}>
//                   <FormGroup>
//                     <Label>Instagram</Label>
//                     <Input
//                       placeholder="https://instagram.com/username"
//                       value={official.instagram || ""}
//                       onChange={e =>
//                         setOfficial({ ...official, instagram: e.target.value })
//                       }
//                     />
//                   </FormGroup>
//                 </Col>

//                 <Col md={6}>
//                   <FormGroup>
//                     <Label>LinkedIn</Label>
//                     <Input
//                       placeholder="https://linkedin.com/in/username"
//                       value={official.linkedin || ""}
//                       onChange={e =>
//                         setOfficial({ ...official, linkedin: e.target.value })
//                       }
//                     />
//                   </FormGroup>
//                 </Col>

//                 <Col md={12}>
//                   <FormGroup>
//                     <Label>YouTube</Label>
//                     <Input
//                       placeholder="https://youtube.com/channel/..."
//                       value={official.youtube || ""}
//                       onChange={e =>
//                         setOfficial({ ...official, youtube: e.target.value })
//                       }
//                     />
//                   </FormGroup>
//                 </Col>
//               </Row>
//             </ModalBody>

//             <ModalFooter>
//               <Button color="secondary" onClick={() => setModal(false)}>
//                 Cancel
//               </Button>
//               <Button color="primary" onClick={saveOfficial}>
//                 Save Official
//               </Button>
//             </ModalFooter>
//           </Modal>
//           </div>
//     </>



//   );
};

export default ContactManagement;
