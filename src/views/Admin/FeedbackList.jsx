import React, { useEffect, useState } from "react";
import { Container, Table, Button, Modal, ModalHeader, ModalBody, Card, CardBody, CardHeader, Spinner } from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";

const AdminFeedbackList = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("authToken");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Redirect or show error if no token
  if (!token) {
    // You can replace with navigate("/login") if using react-router
    return (
      <Container className="py-4 text-center">
        <h4>You are not authenticated. Please log in.</h4>
        <Button color="primary" onClick={() => window.location.href = "/login"}>
          Go to Login
        </Button>
      </Container>
    );
  }

  /* ------------------ Fetch All Feedbacks ------------------ */
  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/admin/feedbacks`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFeedbacks(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch feedbacks", err);
      setError("Failed to load feedbacks. Please try again.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not fetch feedback list.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  /* ------------------ View Feedback ------------------ */
  const viewFeedback = async (id) => {
    setDetailLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/feedbacks/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedFeedback(res.data.data);
      setModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch feedback detail", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load feedback details.",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  /* ------------------ Delete Feedback ------------------ */
  const deleteFeedback = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This feedback will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/api/admin/feedbacks/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setFeedbacks((prev) => prev.filter((item) => item._id !== id));

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Feedback has been deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Delete error", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete feedback. Please try again.",
      });
    }
  };

  /* ------------------ Close Modal ------------------ */
  const toggleModal = () => {
    setModalOpen(!modalOpen);
    if (!modalOpen) {
      // Clear selected when closing
      setSelectedFeedback(null);
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner color="primary" /> Loading feedbacks...
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4 text-center">
        <p className="text-danger">{error}</p>
        <Button color="primary" onClick={fetchFeedbacks}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="adm-card shadow-sm">
        <CardHeader>
          <div className="d-flex align-items-center justify-content-between">
            <h4 className="mb-0">All Users Feedback List</h4>
            <span className="badge bg-info">{feedbacks.length} entries</span>
          </div>
        </CardHeader>

        <CardBody>
          <Table bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No feedback available
                  </td>
                </tr>
              ) : (
                feedbacks.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.phone}</td>
                    <td>
                      {item.message && item.message.length > 30
                        ? item.message.slice(0, 30) + "..."
                        : item.message || "—"}
                    </td>
                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        color="info"
                        className="me-2"
                        onClick={() => viewFeedback(item._id)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        onClick={() => deleteFeedback(item._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {/* ------------------ View Modal ------------------ */}
      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          Feedback Details
          {selectedFeedback?.createdAt && (
            <small className="text-muted d-block">
              {new Date(selectedFeedback.createdAt).toLocaleString()}
            </small>
          )}
        </ModalHeader>
        <ModalBody>
          {detailLoading ? (
            <div className="text-center py-3">
              <Spinner color="primary" /> Loading...
            </div>
          ) : selectedFeedback ? (
            <>
              <p>
                <strong>Name:</strong> {selectedFeedback.name || "—"}
              </p>
              <p>
                <strong>Email:</strong> {selectedFeedback.email || "—"}
              </p>
              <p>
                <strong>Phone:</strong> {selectedFeedback.phone || "—"}
              </p>
              <p>
                <strong>Message:</strong>
              </p>
              <p className="border p-2 bg-light rounded">
                {selectedFeedback.message || "No message provided"}
              </p>
            </>
          ) : (
            <p className="text-center text-muted">No feedback data available.</p>
          )}
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default AdminFeedbackList;