import React, { useEffect, useState } from "react";
import { Table, Button, Modal, ModalHeader, ModalBody, Card, CardBody, CardHeader } from "reactstrap";
import { FaComments, FaEye, FaTrash, FaInbox } from "react-icons/fa";
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
          <div className="d-flex align-items-center gap-2.5">
            <span
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20"
              style={{ width: "40px", height: "40px" }}
            >
              <FaComments className="text-white" />
            </span>
            <div>
              <h3 className="adm-page-title mb-0">
                All Users Feedback List
              </h3>
              <p className="adm-page-subtitle mb-0 text-white-50">
                View and manage feedback submitted by site visitors
              </p>
            </div>
          </div>
          <span className="badge bg-light text-dark px-3 py-2 fw-semibold">
            {feedbacks.length} Entries
          </span>
        </CardHeader>
      </Card>

      <Card className="adm-card shadow-sm border-0 mb-4">
        <CardBody className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "60px" }}>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th className="text-center" style={{ width: "110px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-0">
                      <div className="adm-empty-state">
                        <span className="adm-empty-icon">
                          <FaInbox size={24} />
                        </span>
                        <div className="adm-empty-title">No feedback available</div>
                        <p className="adm-empty-sub mb-0">
                          Feedback submitted by site visitors will appear here in real time.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((item, index) => (
                    <tr key={item._id}>
                      <td className="text-muted small">{index + 1}</td>
                      <td className="fw-semibold">{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.phone}</td>
                      <td>
                        <span className="text-truncate d-block" style={{ maxWidth: "320px" }} title={item.message}>
                          {item.message && item.message.length > 40
                            ? item.message.slice(0, 40) + "…"
                            : item.message || "—"}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="text-center text-nowrap">
                        <div className="d-inline-flex gap-1.5 align-items-center">
                          <Button
                            size="sm"
                            color="light"
                            className="adm-icon-btn"
                            data-tt="View Feedback Details"
                            onClick={() => viewFeedback(item._id)}
                          >
                            <FaEye size={12} />
                          </Button>
                          <Button
                            size="sm"
                            color="light"
                            className="adm-icon-btn is-danger"
                            data-tt="Delete Feedback"
                            onClick={() => deleteFeedback(item._id)}
                          >
                            <FaTrash size={12} />
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

      {/* ------------------ View Modal ------------------ */}
      <Modal isOpen={modalOpen} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal} className="text-white bg-dark">
          <div className="d-flex align-items-center gap-2">
            <FaComments />
            <span>Feedback Details</span>
          </div>
          {selectedFeedback?.createdAt && (
            <small className="text-white-50 d-block mt-1">
              {new Date(selectedFeedback.createdAt).toLocaleString()}
            </small>
          )}
        </ModalHeader>
        <ModalBody>
          {detailLoading ? (
            <PageLoader inline={true} />
          ) : selectedFeedback ? (
            <div className="d-flex flex-column gap-3">
              <div className="d-flex flex-column gap-1">
                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}>
                  Name
                </span>
                <span className="fw-semibold">{selectedFeedback.name || "—"}</span>
              </div>
              <div className="d-flex flex-column gap-1">
                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}>
                  Email
                </span>
                <span className="fw-semibold">{selectedFeedback.email || "—"}</span>
              </div>
              <div className="d-flex flex-column gap-1">
                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}>
                  Phone
                </span>
                <span className="fw-semibold">{selectedFeedback.phone || "—"}</span>
              </div>
              <div className="d-flex flex-column gap-1">
                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}>
                  Message
                </span>
                <div className="border p-3 bg-light rounded-3" style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
                  {selectedFeedback.message || "No message provided"}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted">No feedback data available.</p>
          )}
        </ModalBody>
      </Modal>
    </>
  );
};

export default FeedbackList;