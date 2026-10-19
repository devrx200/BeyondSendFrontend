import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Button, Badge, Spinner } from "reactstrap";
import { FaTag, FaCheck } from "react-icons/fa";

const AssignPricingPlanModal = ({
  isOpen,
  toggle,
  selectedUser,
  availablePlans = [],
  planForm,
  setPlanForm,
  onSubmit,
  actionLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} backdrop="static" size="md">
      <Form onSubmit={onSubmit}>
        <ModalHeader toggle={toggle}>
          <span className="text-primary d-flex align-items-center gap-2">
            <FaTag /> Assign Credit Pricing Plan
          </span>
        </ModalHeader>
        <ModalBody>
          <div className="p-2.5 bg-light rounded-3 mb-3 border">
            <div className="fw-bold text-dark">{selectedUser?.name || "User Account"}</div>
            <div className="text-muted small">
              {selectedUser?.email} • Role: <Badge color="info">{selectedUser?.role}</Badge>
            </div>
          </div>

          <FormGroup className="mb-3">
            <Label className="small fw-semibold">Select Pricing Plan (CreditPlanChartList)</Label>
            <Input
              type="select"
              size="sm"
              value={planForm.creditPlanId}
              onChange={(e) => {
                const val = e.target.value;
                setPlanForm((p) => ({
                  ...p,
                  creditPlanId: val,
                  isActive: Boolean(val),
                  isShow: Boolean(val),
                  isUse: Boolean(val),
                }));
              }}
            >
              <option value="">-- None (Fall back to Global Channel Master Rates) --</option>
              {availablePlans.map((pl) => (
                <option key={pl._id} value={pl._id}>
                  {pl.planName} [{pl.channel || "MULTI"}] — ₹{pl.costPerUnit || 1}/unit {pl.isDefault ? "(Default Plan)" : ""}
                </option>
              ))}
            </Input>
            <small className="text-muted d-block mt-1">
              When assigned and active, credit requests will calculate amount using this plan&apos;s rates.
            </small>
          </FormGroup>

          <div className="border rounded-3 p-3 bg-white">
            <div className="fw-semibold text-dark small mb-2">Plan Behavior &amp; Flags:</div>
            <div className="d-flex flex-column gap-2">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="planIsActive"
                  checked={planForm.isActive}
                  onChange={(e) => setPlanForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                <label className="form-check-label small" htmlFor="planIsActive">
                  <strong>Is Active:</strong> Enable this plan for this account (default true)
                </label>
              </div>

              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="planIsUse"
                  checked={planForm.isUse}
                  onChange={(e) => setPlanForm((p) => ({ ...p, isUse: e.target.checked }))}
                />
                <label className="form-check-label small" htmlFor="planIsUse">
                  <strong>Is Use:</strong> Use this plan for calculating amounts on credit requests (default true)
                </label>
              </div>

              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="planIsShow"
                  checked={planForm.isShow}
                  onChange={(e) => setPlanForm((p) => ({ ...p, isShow: e.target.checked }))}
                />
                <label className="form-check-label small" htmlFor="planIsShow">
                  <strong>Is Show:</strong> Show the pricing plan badge on client dashboard (default true)
                </label>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="py-2">
          <Button color="light" size="sm" onClick={toggle} disabled={actionLoading}>
            Cancel
          </Button>
          <Button color="primary" size="sm" type="submit" disabled={actionLoading}>
            {actionLoading ? <Spinner size="sm" className="me-1" /> : <FaCheck className="me-1" />}
            Save Plan Mapping
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default AssignPricingPlanModal;
