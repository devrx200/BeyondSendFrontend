import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Button, Spinner } from "reactstrap";
import { FaTimes } from "react-icons/fa";

const RejectTopupModal = ({
  isOpen,
  toggle,
  activeRequest,
  rejectionReason,
  setRejectionReason,
  onSubmit,
  actionLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} backdrop="static">
      <Form onSubmit={onSubmit}>
        <ModalHeader toggle={toggle}>
          <span className="text-danger d-flex align-items-center gap-2">
            <FaTimes /> Reject Credit Topup Request
          </span>
        </ModalHeader>
        <ModalBody>
          <p className="small text-muted mb-3">
            Provide a reason for rejecting the topup request from{" "}
            <strong>{activeRequest?.user?.name || "User"}</strong> (Amount: ₹{activeRequest?.amount}).
          </p>
          <FormGroup>
            <Label className="small fw-semibold">Rejection Reason</Label>
            <Input
              type="textarea"
              rows="3"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Invalid UTR reference, payment not received, duplicate request"
              required
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter className="py-2">
          <Button color="light" onClick={toggle} disabled={actionLoading}>
            Cancel
          </Button>
          <Button color="danger" type="submit" disabled={actionLoading}>
            {actionLoading ? <Spinner size="sm" className="me-1" /> : <FaTimes className="me-1" />}
            Confirm Rejection
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default RejectTopupModal;
