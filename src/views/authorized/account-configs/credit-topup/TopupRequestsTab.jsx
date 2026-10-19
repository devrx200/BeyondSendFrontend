import React from "react";
import { Table, Button, Badge, ButtonGroup } from "reactstrap";
import { FaCheck, FaTimes, FaHourglassHalf, FaUserTie, FaUser } from "react-icons/fa";
import { CREDIT_KEYS, CHANNEL_META } from "../creditConstants";

const TopupRequestsTab = ({
  requests = [],
  requestStatusFilter = "ALL",
  setRequestStatusFilter,
  pendingRequestsCount = 0,
  onApprove,
  onOpenRejectModal,
  actionLoading = false,
}) => {
  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <ButtonGroup size="sm">
          <Button
            color={requestStatusFilter === "ALL" ? "primary" : "light"}
            onClick={() => setRequestStatusFilter("ALL")}
          >
            All ({requests.length})
          </Button>
          <Button
            color={requestStatusFilter === "PENDING" ? "warning" : "light"}
            onClick={() => setRequestStatusFilter("PENDING")}
          >
            Pending ({pendingRequestsCount})
          </Button>
          <Button
            color={requestStatusFilter === "APPROVED" ? "success" : "light"}
            onClick={() => setRequestStatusFilter("APPROVED")}
          >
            Approved
          </Button>
          <Button
            color={requestStatusFilter === "REJECTED" ? "danger" : "light"}
            onClick={() => setRequestStatusFilter("REJECTED")}
          >
            Rejected
          </Button>
        </ButtonGroup>
        <div className="small text-muted">
          Showing {requests.length} credit topup requests
        </div>
      </div>

      <div className="table-responsive">
        <Table hover bordered size="sm" className="align-middle small">
          <thead className="table-light text-nowrap">
            <tr>
              <th>Date</th>
              <th>Requester Account</th>
              <th>Credits Breakdown</th>
              <th className="text-end">Units</th>
              <th className="text-end">Amount (₹)</th>
              <th>Mode</th>
              <th>UTR / Reference</th>
              <th>Remarks</th>
              <th>Status</th>
              <th className="text-center">Review Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center text-muted py-4">
                  No credit topup requests found matching this filter.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r._id}>
                  <td className="text-nowrap">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                  </td>
                  <td>
                    <div className="fw-bold text-dark d-flex align-items-center gap-1">
                      {r.user?.role === "RESELLER" ? (
                        <FaUserTie className="text-primary" />
                      ) : (
                        <FaUser className="text-info" />
                      )}
                      {r.user?.name || "User"}
                    </div>
                    <div className="text-muted small">
                      {r.user?.email} [{r.user?.role}]
                    </div>
                    {r.user?.role === "MANAGER" && (r.user?.owner || r.user?.createdBy) && (
                      <div className="text-primary small" style={{ fontSize: "11px" }}>
                        Parent Client ID: {r.user.owner?._id || r.user.createdBy?._id}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      {CREDIT_KEYS.map((k) => {
                        const val = r[k] || r.creditsDelta?.[k];
                        if (!val) return null;
                        return (
                          <Badge key={k} color="light" className="border text-dark">
                            {CHANNEL_META[k]?.label || k}: +{val.toLocaleString()}
                          </Badge>
                        );
                      })}
                    </div>
                  </td>
                  <td className="text-end fw-bold">{r.units?.toLocaleString()}</td>
                  <td className="text-end fw-semibold">₹{Number(r.amount || 0).toLocaleString()}</td>
                  <td className="text-uppercase">{r.paymentMode}</td>
                  <td className="fw-semibold">{r.paymentReference || "—"}</td>
                  <td>
                    <div className="text-truncate" style={{ maxWidth: 150 }} title={r.remarks}>
                      {r.remarks || "—"}
                    </div>
                  </td>
                  <td>
                    {r.status === "PENDING" && (
                      <Badge color="warning" pill className="d-inline-flex align-items-center gap-1">
                        <FaHourglassHalf /> Pending
                      </Badge>
                    )}
                    {r.status === "APPROVED" && (
                      <Badge color="success" pill className="d-inline-flex align-items-center gap-1">
                        <FaCheck /> Approved
                      </Badge>
                    )}
                    {r.status === "REJECTED" && (
                      <Badge color="danger" pill className="d-inline-flex align-items-center gap-1">
                        <FaTimes /> Rejected
                      </Badge>
                    )}
                  </td>
                  <td className="text-center text-nowrap">
                    {r.status === "PENDING" ? (
                      <>
                        <Button
                          color="success"
                          size="sm"
                          className="py-0 px-2 me-1"
                          onClick={() => onApprove(r._id)}
                          disabled={actionLoading}
                          title="Approve and credit wallet immediately"
                        >
                          <FaCheck /> Approve
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          className="py-0 px-2"
                          onClick={() => onOpenRejectModal(r)}
                          disabled={actionLoading}
                          title="Reject request with note"
                        >
                          <FaTimes /> Reject
                        </Button>
                      </>
                    ) : (
                      <span className="text-muted small">
                        {r.status === "APPROVED"
                          ? `Approved by ${r.approvedBy?.name || "Admin"}`
                          : r.rejectionReason || "Closed"}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
};

export default TopupRequestsTab;
