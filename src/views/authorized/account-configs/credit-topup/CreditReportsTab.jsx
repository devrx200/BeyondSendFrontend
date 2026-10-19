import React from "react";
import { Table, Row, Col } from "reactstrap";
import { CREDIT_KEYS, CHANNEL_META } from "../creditConstants";

const CreditReportsTab = ({ totals, summary }) => {
  return (
    <Row className="g-3">
      <Col lg={7}>
        <div className="border rounded p-3 h-100 bg-white shadow-sm">
          <div className="fw-bold fs-6 mb-3 text-dark">
            System-Wide Total Outstanding Credits Across All Accounts
          </div>
          <Table hover size="sm" className="align-middle mb-0">
            <thead className="table-light small">
              <tr>
                <th>Channel</th>
                <th>Type</th>
                <th className="text-end">Total Outstanding Units</th>
              </tr>
            </thead>
            <tbody>
              {CREDIT_KEYS.map((key) => {
                const meta = CHANNEL_META[key];
                const val = totals?.[key] ?? 0;
                return (
                  <tr key={key}>
                    <td>
                      <span
                        className="badge rounded-pill me-2"
                        style={{ background: `${meta?.color || "#0d6efd"}20`, color: meta?.color || "#0d6efd" }}
                      >
                        {meta?.icon}
                      </span>
                      <strong className="text-dark">{meta?.label || key}</strong>
                    </td>
                    <td className="small text-muted">{meta?.desc || "Route"}</td>
                    <td className="text-end fw-bold fs-6">{val.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Col>

      <Col lg={5}>
        <div className="border rounded p-3 h-100 bg-white shadow-sm d-flex flex-column justify-content-between">
          <div>
            <div className="fw-bold fs-6 mb-3 text-dark">Platform Inflow &amp; Deductions Summary</div>
            <div className="d-flex justify-content-between border-bottom py-2">
              <span className="text-muted">Total Topup Inflows</span>
              <strong className="text-success">
                {summary?.totals?.topup?.amount ? `₹${summary.totals.topup.amount.toLocaleString()}` : "₹0"}
                <span className="text-muted small ms-1">
                  ({summary?.totals?.topup?.count || 0} times)
                </span>
              </strong>
            </div>
            <div className="d-flex justify-content-between border-bottom py-2">
              <span className="text-muted">Total Deductions</span>
              <strong className="text-danger">
                {summary?.totals?.deduct?.amount ? `₹${summary.totals.deduct.amount.toLocaleString()}` : "₹0"}
                <span className="text-muted small ms-1">
                  ({summary?.totals?.deduct?.count || 0} times)
                </span>
              </strong>
            </div>
            <div className="d-flex justify-content-between border-bottom py-2">
              <span className="text-muted">Total Campaign Dispatches Usage</span>
              <strong className="text-warning">
                {summary?.totals?.usage?.amount ? `₹${summary.totals.usage.amount.toLocaleString()}` : "₹0"}
                <span className="text-muted small ms-1">
                  ({summary?.totals?.usage?.count || 0} times)
                </span>
              </strong>
            </div>
          </div>

          <div className="alert alert-info small mt-3 mb-0">
            <strong>Admin Notice:</strong> Credit changes are atomic and fully logged with before/after balances.
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default CreditReportsTab;
