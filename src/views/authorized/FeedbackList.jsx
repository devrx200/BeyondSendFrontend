import React, { useEffect, useState } from "react";
import { Container, Table, Button, Modal, ModalHeader, ModalBody, Card, CardBody, CardHeader, Spinner } from "reactstrap";
import apiClient from "@apiService";
import Swal from "sweetalert2";
import { PageLoader } from "@/components";

const getToken = () => {
  const token = sessionStorage.getItem("authToken");
  if (!token) return "";
  try {
    const parsed = JSON.parse(token);
    return parsed?.token || parsed?.access || token;
  } catch {
    return token;
  }
};

const FeedbackList = () => {
  
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  /* ------------------ Fetch All Feedbacks ------------------ */
  const fetchFeedbacks = async () => {
    const token = getToken();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/feedback/list');
      setFeedbacks(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch feedbacks", err);
      setError("Failed to load feedbacks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  /* ------------------ View Feedback ------------------ */
  const viewFeedback = async (id) => {
    const token = getToken();
    setDetailLoading(true);
    try {
      const res = await apiClient.get(`/feedback/detail/${id}`);
      setSelectedFeedback(res.data?.data || res.data);
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

    const token = getToken();
    try {
      await apiClient.delete(`/feedback/delete/${id}`);

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
    return <PageLoader inline={true} />;
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
    <>
      {/* PAGE HEADER */}
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h3 className="adm-page-title mb-1">
              💬 All Users Feedback List
            </h3>
            <p className="adm-page-subtitle mb-0 text-white">
              View and manage feedback submitted by site visitors
            </p>
          </div>
          <span className="badge bg-light text-dark fs-6 px-3 py-2 fw-semibold">
            {feedbacks.length} Entries
          </span>
        </CardHeader>
      </Card>

      <Card className="adm-card shadow-sm border-0 mb-4">
        <CardBody>

        <Card className="border rounded-3 mb-4 shadow-none">
          <CardBody className="p-3">
            <div className="table-responsive rounded-3 border">
              <Table hover className="align-middle mb-0">
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
            </div>
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
              <PageLoader inline={true} />
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

      </CardBody>
    </Card>
    </>
  );
};

export default FeedbackList;