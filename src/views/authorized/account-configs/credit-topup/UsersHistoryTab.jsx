import React from "react";
import { Table, Button, Badge, Row, Col, Input, InputGroup } from "reactstrap";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { CREDIT_KEYS, CHANNEL_META } from "../creditConstants";

const UsersHistoryTab = ({
  history = [],
  historyMeta = { totalRecords: 0, page: 1, limit: 25, totalPages: 1 },
  historySearch = "",
  setHistorySearch,
  creditTypeFilter = "ALL",
  setCreditTypeFilter,
  selectedUserId = "",
  onUserFilterChange,
  users = [],
  onPageChange,
}) => {
  return (
    <>
      <Row className="g-2 mb-3">
        <Col md={4}>
          <InputGroup size="sm">
            <Input
              placeholder="Search payment reference or remarks…"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
            {historySearch && (
              <Button color="light" onClick={() => setHistorySearch("")}>
                ✕
              </Button>
            )}
          </InputGroup>
        </Col>
        <Col md={2}>
          <Input
            type="select"
            size="sm"
            value={creditTypeFilter}
            onChange={(e) => setCreditTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="topup">Topups Only</option>
            <option value="deduct">Deductions Only</option>
            <option value="refund">Refunds Only</option>
            <option value="usage">Usages Only</option>
            <option value="adjustment">Adjustments</option>
          </Input>
        </Col>
        <Col md={3}>
          <Input
            type="select"
            size="sm"
            value={selectedUserId}
            onChange={(e) => onUserFilterChange(e.target.value)}
          >
            <option value="">All Accounts (Resellers &amp; Clients)</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name || "Unnamed"} — {u.email} ({u.role})
              </option>
            ))}
          </Input>
        </Col>
        <Col md={3} className="d-flex align-items-center justify-content-end gap-2">
          <Button
            color="light"
            size="sm"
            onClick={() => onPageChange(historyMeta.page - 1)}
            disabled={historyMeta.page <= 1}
          >
            Prev
          </Button>
          <span className="small text-muted text-nowrap">
            Page {historyMeta.page} / {historyMeta.totalPages || 1} ({historyMeta.totalRecords} txns)
          </span>
          <Button
            color="light"
            size="sm"
            onClick={() => onPageChange(historyMeta.page + 1)}
            disabled={historyMeta.page >= historyMeta.totalPages}
          >
            Next
          </Button>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table hover bordered size="sm" className="align-middle small">
          <thead className="table-light text-nowrap">
            <tr>
              <th>Date &amp; Time</th>
              <th>Account</th>
              <th>Type</th>
              <th>Credits Delta</th>
              <th className="text-end">Units</th>
              <th className="text-end">Amount (₹)</th>
              <th>Payment Mode</th>
              <th>Reference / Remarks</th>
              <th>Executed By</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-muted py-4">
                  No transactions or deductions found matching this filter.
                </td>
              </tr>
            ) : (
              history.map((row) => {
                const isPlus = ["topup", "refund", "bonus"].includes(row.creditType);
                return (
                  <tr key={row._id}>
                    <td className="text-nowrap">
                      {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{row.user?.name || "User"}</div>
                      <div className="text-muted small">
                        {row.user?.email} {row.user?.role ? `[${row.user.role}]` : ""}
                      </div>
                    </td>
                    <td>
                      {row.creditType === "topup" && (
                        <Badge color="success" pill>
                          <FaArrowUp className="me-1" /> Topup
                        </Badge>
                      )}
                      {row.creditType === "deduct" && (
                        <Badge color="danger" pill>
                          <FaArrowDown className="me-1" /> Deduct
                        </Badge>
                      )}
                      {row.creditType === "refund" && (
                        <Badge color="info" pill>Refund</Badge>
                      )}
                      {row.creditType === "usage" && (
                        <Badge color="warning" pill>Usage</Badge>
                      )}
                      {!["topup", "deduct", "refund", "usage"].includes(row.creditType) && (
                        <Badge color="secondary" pill>{row.creditType}</Badge>
                      )}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {CREDIT_KEYS.map((k) => {
                          const val = row[k] || row.creditsDelta?.[k];
                          if (!val) return null;
                          return (
                            <Badge
                              key={k}
                              color="light"
                              className="border text-dark"
                              style={{ fontSize: "11px" }}
                            >
                              {CHANNEL_META[k]?.label || k}: {isPlus ? "+" : "-"}{Math.abs(val).toLocaleString()}
                            </Badge>
                          );
                        })}
                      </div>
                    </td>
                    <td className="text-end fw-bold">
                      <span className={isPlus ? "text-success" : "text-danger"}>
                        {isPlus ? "+" : "-"}{(row.units || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="text-end fw-semibold">
                      {row.amount ? `₹${Number(row.amount).toLocaleString()}` : "—"}
                    </td>
                    <td className="text-uppercase">{row.paymentMode || "—"}</td>
                    <td>
                      <div
                        className="text-truncate"
                        style={{ maxWidth: 220 }}
                        title={row.description || row.remarks || row.paymentReference}
                      >
                        {row.paymentReference && (
                          <span className="fw-semibold me-1">[{row.paymentReference}]</span>
                        )}
                        {row.remarks || row.description || "—"}
                      </div>
                    </td>
                    <td className="text-muted">
                      {row.actor?.name || row.admin?.name || row.actor?.email || "System"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
};

export default UsersHistoryTab;
