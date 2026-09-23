import { useState } from "react";
import {
  Card, CardBody, CardHeader, Row, Col, Badge, Progress
} from "reactstrap";
import {
  FaExchangeAlt, FaBolt, FaCheckCircle, FaExclamationTriangle,
  FaClock, FaServer, FaShieldAlt
} from "react-icons/fa";

const TransactionalDashboard = () => {
  return (
    <div className="telecom-module-wrapper">
      {/* ── HEADER ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardHeader
          className="border-0 py-3.5 px-4 text-white d-flex flex-wrap justify-content-between align-items-center gap-3"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20"
              style={{ width: "44px", height: "44px" }}
            >
              <FaExchangeAlt size={20} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">Transactional API Console</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Real-time REST API latency, message throughput, status distribution, and edge gateway health
              </small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-40 px-3 py-1.5 rounded-pill fw-semibold">
              ● All Edge Gateways Operational
            </span>
          </div>
        </CardHeader>

        <CardBody className="p-4 bg-light">
          {/* 4 PRIMARY METRIC CARDS */}
          <Row className="g-3 mb-4">
            <Col xs={12} sm={6} lg={3}>
              <div className="p-3.5 bg-white rounded-3 shadow-xs border h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="small text-muted fw-bold text-uppercase">Throughput</span>
                  <div className="rounded p-1.5 bg-primary bg-opacity-10 text-primary">
                    <FaBolt size={14} />
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-0">1,480 <span className="small fs-6 fw-normal text-muted">req/sec</span></h3>
                <small className="text-success fw-semibold">↑ 12% vs last hour</small>
              </div>
            </Col>

            <Col xs={12} sm={6} lg={3}>
              <div className="p-3.5 bg-white rounded-3 shadow-xs border h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="small text-muted fw-bold text-uppercase">Delivery Success</span>
                  <div className="rounded p-1.5 bg-success bg-opacity-10 text-success">
                    <FaCheckCircle size={14} />
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-0">99.94%</h3>
                <small className="text-muted">Target SLA: 99.9%</small>
              </div>
            </Col>

            <Col xs={12} sm={6} lg={3}>
              <div className="p-3.5 bg-white rounded-3 shadow-xs border h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="small text-muted fw-bold text-uppercase">Median Latency</span>
                  <div className="rounded p-1.5 bg-info bg-opacity-10 text-info">
                    <FaClock size={14} />
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-0">48 <span className="small fs-6 fw-normal text-muted">ms</span></h3>
                <small className="text-success fw-semibold">Super-fast Edge Delivery</small>
              </div>
            </Col>

            <Col xs={12} sm={6} lg={3}>
              <div className="p-3.5 bg-white rounded-3 shadow-xs border h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="small text-muted fw-bold text-uppercase">API Errors (24h)</span>
                  <div className="rounded p-1.5 bg-danger bg-opacity-10 text-danger">
                    <FaExclamationTriangle size={14} />
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-0">0.06%</h3>
                <small className="text-muted">429 Rate Limits / 400 Bad Req</small>
              </div>
            </Col>
          </Row>

          {/* CHANNEL VOLUME BREAKDOWN & HTTP STATUS CODES */}
          <Row className="g-3">
            <Col xs={12} lg={7}>
              <div className="p-4 bg-white rounded-3 shadow-xs border h-100">
                <h6 className="fw-bold text-dark mb-3">Live Channel Volume (24 Hours)</h6>
                <div className="d-flex flex-column gap-3">
                  <div>
                    <div className="d-flex justify-content-between small fw-bold mb-1">
                      <span>WhatsApp Business Cloud API</span>
                      <span>482,000 msgs (48%)</span>
                    </div>
                    <Progress value={48} color="success" style={{ height: "8px" }} />
                  </div>
                  <div>
                    <div className="d-flex justify-content-between small fw-bold mb-1">
                      <span>SMS DLT Enterprise Gateways</span>
                      <span>320,000 msgs (32%)</span>
                    </div>
                    <Progress value={32} color="primary" style={{ height: "8px" }} />
                  </div>
                  <div>
                    <div className="d-flex justify-content-between small fw-bold mb-1">
                      <span>High-Volume Transactional Email</span>
                      <span>150,000 msgs (15%)</span>
                    </div>
                    <Progress value={15} color="info" style={{ height: "8px" }} />
                  </div>
                  <div>
                    <div className="d-flex justify-content-between small fw-bold mb-1">
                      <span>RCS & Voice Broadcast (OBD)</span>
                      <span>50,000 msgs (5%)</span>
                    </div>
                    <Progress value={5} color="warning" style={{ height: "8px" }} />
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={12} lg={5}>
              <div className="p-4 bg-white rounded-3 shadow-xs border h-100">
                <h6 className="fw-bold text-dark mb-3">HTTP Response Codes Distribution</h6>
                <div className="d-flex flex-column gap-2.5">
                  <div className="p-2.5 rounded bg-light d-flex justify-content-between align-items-center">
                    <span className="badge bg-success font-monospace">200 OK / 202 ACCEPTED</span>
                    <span className="fw-bold text-dark">99.85%</span>
                  </div>
                  <div className="p-2.5 rounded bg-light d-flex justify-content-between align-items-center">
                    <span className="badge bg-warning font-monospace text-dark">400 BAD REQUEST</span>
                    <span className="fw-bold text-dark">0.08%</span>
                  </div>
                  <div className="p-2.5 rounded bg-light d-flex justify-content-between align-items-center">
                    <span className="badge bg-secondary font-monospace">429 RATE LIMITED</span>
                    <span className="fw-bold text-dark">0.05%</span>
                  </div>
                  <div className="p-2.5 rounded bg-light d-flex justify-content-between align-items-center">
                    <span className="badge bg-danger font-monospace">500 UPSTREAM ERROR</span>
                    <span className="fw-bold text-dark">0.02%</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default TransactionalDashboard;
