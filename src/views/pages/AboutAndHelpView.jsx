import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Badge,
  Row,
  Col,
  Button,
} from "reactstrap";
import { Calendar, Link2, FileText, Image } from "react-feather";

const AboutAndHelpView = ({ data }) => {
  if (!data) return null;

  const {
    titleEn,
    titleHi,
    contentType,
    shortDescriptionEn,
    shortDescriptionHi,
    descriptionEn,
    descriptionHi,
    link,
    isActive,
    fromDate,
    expirydate,
    createdAt,
  } = data;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const renderContentTypeIcon = () => {
    switch (contentType) {
      case "IMAGE":
        return <Image size={14} className="me-1" />;
      case "PDF":
        return <FileText size={14} className="me-1" />;
      default:
        return <FileText size={14} className="me-1" />;
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="bg-white border-bottom">
        <Row className="align-items-center">
          <Col md="8">
            <h4 className="mb-1 fw-bold">{titleEn}</h4>
            <div className="text-muted">{titleHi}</div>
          </Col>
          <Col md="4" className="text-md-end mt-2 mt-md-0">
            <Badge color={isActive ? "success" : "danger"} pill className="me-2">
              {isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge color="info" pill>
              {renderContentTypeIcon()}
              {contentType}
            </Badge>
          </Col>
        </Row>
      </CardHeader>

      <CardBody>
        {/* Date Info */}
        <Row className="mb-3">
          <Col md="4">
            <small className="text-muted d-block">From Date</small>
            <Calendar size={14} className="me-1" />
            {formatDate(fromDate)}
          </Col>
          <Col md="4">
            <small className="text-muted d-block">Expiry Date</small>
            <Calendar size={14} className="me-1" />
            {formatDate(expirydate)}
          </Col>
          <Col md="4">
            <small className="text-muted d-block">Created On</small>
            <Calendar size={14} className="me-1" />
            {formatDate(createdAt)}
          </Col>
        </Row>

        <hr />

        {/* Short Description */}
        <Row className="mb-3">
          <Col md="6">
            <h6 className="fw-semibold">Short Description (EN)</h6>
            <p className="text-muted mb-0">{shortDescriptionEn}</p>
          </Col>
          <Col md="6">
            <h6 className="fw-semibold">संक्षिप्त विवरण (HI)</h6>
            <p className="text-muted mb-0">{shortDescriptionHi}</p>
          </Col>
        </Row>

        {/* Full Description */}
        <Row className="mb-3">
          <Col md="6">
            <h6 className="fw-semibold">Description (EN)</h6>
            <p style={{ whiteSpace: "pre-line" }}>{descriptionEn}</p>
          </Col>
          <Col md="6">
            <h6 className="fw-semibold">विवरण (HI)</h6>
            <p style={{ whiteSpace: "pre-line" }}>{descriptionHi}</p>
          </Col>
        </Row>

        {/* External Link */}
        {link && (
          <>
            <hr />
            <div className="text-end">
              <Button
                color="primary"
                outline
                size="sm"
                href={link}
                target="_blank"
              >
                <Link2 size={14} className="me-1" />
                Open Related Link
              </Button>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default AboutAndHelpView;
