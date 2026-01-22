import React, { useEffect, useState } from "react";
import { Container, Table, Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const AdminFeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  /* ------------------ Fetch All Feedbacks ------------------ */
  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/admin/feedbacks`
      );
      setFeedbacks(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch feedbacks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  /* ------------------ View Feedback ------------------ */
  const viewFeedback = async (id) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/admin/feedbacks/${id}`
      );
      setSelectedFeedback(res.data.data);
      setModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch feedback detail");
    }
  };

  /* ------------------ Delete Feedback ------------------ */
  const deleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?"))
      return;

    try {
      await axios.delete(
        `${API_URL}/api/admin/feedbacks/${id}`
      );

      // remove from UI
      setFeedbacks((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error("Failed to delete feedback");
    }
  };

  if (loading) {
    return <p className="text-center mt-4">Loading feedbacks...</p>;
  }

  return (
    <Container className="py-4">
      <h4 className="mb-4 text-center">Admin – User Feedback List</h4>

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
                  {item.message.length > 30
                    ? item.message.slice(0, 30) + "..."
                    : item.message}
                </td>
                <td>
                  {new Date(item.createdAt).toLocaleDateString()}
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

      {/* ------------------ View Modal ------------------ */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
        <ModalHeader toggle={() => setModalOpen(false)}>
          Feedback Details
        </ModalHeader>
        <ModalBody>
          {selectedFeedback && (
            <>
              <p><strong>Name:</strong> {selectedFeedback.name}</p>
              <p><strong>Email:</strong> {selectedFeedback.email}</p>
              <p><strong>Phone:</strong> {selectedFeedback.phone}</p>
              <p><strong>Message:</strong></p>
              <p>{selectedFeedback.message}</p>
              <p className="text-muted">
                {new Date(selectedFeedback.createdAt).toLocaleString()}
              </p>
            </>
          )}
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default AdminFeedbackList;
