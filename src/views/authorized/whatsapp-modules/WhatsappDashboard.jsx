import { createElement, useCallback, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import {
  FaBullhorn,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaComments,
  FaExclamationTriangle,
  FaFileAlt,
  FaInbox,
  FaSyncAlt,
  FaUsers,
  FaWhatsapp,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import apiClient, { getApiResponseData } from "@apiService";

const numberFormatter = new Intl.NumberFormat("en-IN");

const MetricCard = ({ title, value, detail, icon, color = "primary" }) => (
  <Card className="h-100 border-0 shadow-sm rounded-3">
    <CardBody className="d-flex align-items-center gap-3">
      <div className={`rounded-3 bg-${color} bg-opacity-10 text-${color} p-3`}>
        {createElement(icon, { size: 20 })}
      </div>
      <div className="min-w-0">
        <div className="small text-muted">{title}</div>
        <div className="fs-4 fw-bold text-dark">{numberFormatter.format(value || 0)}</div>
        <div className="small text-muted">{detail}</div>
      </div>
    </CardBody>
  </Card>
);

const WhatsappDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestDashboard = useCallback(async () => {
    const response = await apiClient.get("/whatsapp/analytics/dashboard");
    return getApiResponseData(response) || null;
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDashboard(await requestDashboard());
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load WhatsApp performance."
      );
    } finally {
      setLoading(false);
    }
  }, [requestDashboard]);

  useEffect(() => {
    let active = true;
    requestDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Unable to load WhatsApp performance."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [requestDashboard]);

  const growth = dashboard?.contacts?.growth || [];
  const maxGrowth = Math.max(1, ...growth.map((item) => item.count || 0));
  const messages = dashboard?.messages || {};
  const campaigns = dashboard?.campaigns?.recent || [];
  const health = dashboard?.channelHealth;

  if (loading && !dashboard) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner color="success" />
      </div>
    );
  }

  return (
    <div className="telecom-module-wrapper">
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-success text-white">
        <CardBody className="d-flex flex-wrap justify-content-between align-items-center gap-3 p-4">
          <div className="d-flex align-items-center gap-3">
            <FaWhatsapp color="white" size={45} />
            <div>
              <h3 className="fw-bold text-white mb-1">WhatsApp Dashboard</h3>
              <div className="small text-white opacity-75">Performance for the last 30 days</div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            {health && (
              <Badge color={health.status === "CONNECTED" ? "light" : "warning"} className="text-dark">
                {health.status === "CONNECTED" ? (
                  <FaCheckCircle className="me-1" />
                ) : (
                  <FaExclamationTriangle className="me-1" />
                )}
                {health.provider ? `${health.provider} · ` : ""}
                {health.status === "CONNECTED" ? "Connected" : "Not configured"}
              </Badge>
            )}
            <Button color="light" outline onClick={fetchDashboard} disabled={loading}>
              {loading ? <Spinner size="sm" /> : <FaSyncAlt className="me-1" />}
              Refresh
            </Button>
          </div>
        </CardBody>
      </Card>

      {error && <Alert color="danger">{error}</Alert>}

      <Row className="g-3 mb-4">
        <Col sm="6" xl="3">
          <MetricCard title="Messages sent" value={messages.sent} detail={`${numberFormatter.format(messages.delivered || 0)} delivered`} icon={FaBullhorn} color="primary" />
        </Col>
        <Col sm="6" xl="3">
          <MetricCard title="Messages received" value={messages.received} detail={`${numberFormatter.format(messages.read || 0)} read`} icon={FaInbox} color="info" />
        </Col>
        <Col sm="6" xl="3">
          <MetricCard title="Active conversations" value={dashboard?.conversations?.active} detail={`${numberFormatter.format(dashboard?.conversations?.pending || 0)} pending`} icon={FaComments} color="success" />
        </Col>
        <Col sm="6" xl="3">
          <MetricCard title="WhatsApp contacts" value={dashboard?.contacts?.total} detail="Shared contact database" icon={FaUsers} color="warning" />
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg="7">
          <Card className="h-100 border-0 shadow-sm rounded-3">
            <CardHeader className="bg-white border-0 fw-bold d-flex align-items-center gap-2">
              <FaChartLine className="text-success" /> Contact growth
            </CardHeader>
            <CardBody>
              {growth.length ? (
                <div className="d-flex align-items-end gap-1" style={{ minHeight: 180 }}>
                  {growth.map((item) => (
                    <div
                      key={item._id}
                      className="flex-fill d-flex flex-column align-items-center justify-content-end h-100"
                      title={`${item._id}: ${item.count} new contacts`}
                    >
                      <span className="small text-muted mb-1">{item.count}</span>
                      <div
                        className="w-100 rounded-top bg-success"
                        style={{ height: `${Math.max(4, (item.count / maxGrowth) * 125)}px` }}
                      />
                      <small className="text-muted mt-2" style={{ fontSize: 9 }}>
                        {item._id.slice(5)}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted text-center py-5">No WhatsApp contacts were added in this period.</div>
              )}
            </CardBody>
          </Card>
        </Col>
        <Col lg="5">
          <Card className="h-100 border-0 shadow-sm rounded-3">
            <CardHeader className="bg-white border-0 fw-bold d-flex align-items-center gap-2">
              <FaClock className="text-primary" /> Conversation overview
            </CardHeader>
            <CardBody className="d-flex flex-column gap-3">
              {[
                ["Open", dashboard?.conversations?.active, "success"],
                ["Pending", dashboard?.conversations?.pending, "warning"],
                ["Resolved", dashboard?.conversations?.resolved, "secondary"],
              ].map(([label, count, color]) => (
                <div key={label} className="d-flex align-items-center justify-content-between">
                  <span>{label}</span>
                  <Badge color={color}>{numberFormatter.format(count || 0)}</Badge>
                </div>
              ))}
              <div className="mt-auto pt-3 d-flex flex-wrap gap-2">
                <Button tag={Link} to="/authorized/responses/whatsapp" color="success" size="sm">
                  Open inbox
                </Button>
                <Button tag={Link} to="/authorized/campaigns/lists" color="light" size="sm">
                  Contacts &amp; groups
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xs="12">
          <Card className="border-0 shadow-sm rounded-3">
            <CardHeader className="bg-white border-0 fw-bold d-flex flex-wrap justify-content-between align-items-center gap-2">
              <span className="d-flex align-items-center gap-2"><FaBullhorn className="text-primary" /> Recent campaign performance</span>
              <div className="d-flex gap-2">
                <Button tag={Link} to="/authorized/whatsapp/templates" color="light" size="sm">
                  <FaFileAlt className="me-1" /> Templates
                </Button>
                <Button tag={Link} to="/authorized/whatsapp/campaigns" color="success" size="sm">
                  Campaigns
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Campaign</th>
                    <th>Status</th>
                    <th className="text-end">Sent</th>
                    <th className="text-end">Delivered</th>
                    <th className="text-end">Read</th>
                    <th className="text-end">Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.length ? campaigns.map((campaign) => (
                    <tr key={campaign._id}>
                      <td>
                        <div className="fw-semibold">{campaign.name}</div>
                        <small className="text-muted">
                          {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : ""}
                        </small>
                      </td>
                      <td><Badge color={campaign.status === "COMPLETED" ? "success" : campaign.status === "FAILED" ? "danger" : "secondary"}>{campaign.status}</Badge></td>
                      <td className="text-end">{numberFormatter.format(campaign.totalSent || 0)}</td>
                      <td className="text-end">{numberFormatter.format(campaign.delivered || 0)}</td>
                      <td className="text-end">{numberFormatter.format(campaign.read || 0)}</td>
                      <td className="text-end">{numberFormatter.format(campaign.failed || 0)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="text-center text-muted py-4">No WhatsApp campaigns in this period.</td></tr>
                  )}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WhatsappDashboard;
