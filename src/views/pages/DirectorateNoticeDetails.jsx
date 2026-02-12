import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Badge, Spinner } from "reactstrap";
import axios from "axios";
import { useLanguage } from "../../contexts/LanguageContext";
import { FaCalendarAlt } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const DirectorateNoticeDetails = () => {
  const { slug } = useParams();
  const { isHindi } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [slug]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await axios.get(
        `${API_URL}/api/get-directorate-notice/${slug}`
      );

      setData(res.data.data);
    } catch (err) {
      console.error("Directorate Notice fetch failed", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error || !data) {
    return (
      <div className="text-center py-5 text-danger">
        {isHindi ? "निदेशालय सूचना उपलब्ध नहीं है" : "Directorate notice not found"}
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <Container className="py-4 bg-white rounded my-3 border border-3 border-white shadow">
      {/* CATEGORY + NEW */}
      <div className="mb-2">
        <Badge color="primary">
          {isHindi ? data.categoryId?.nameHi : data.categoryId?.nameEn}
        </Badge>

        {data.isNew && (
          <Badge color="danger" className="ms-2" pill>
            NEW
          </Badge>
        )}
      </div>

      {/* TITLE */}
      <h3 className="fw-bold mb-2">
        {isHindi ? data.titleHi : data.titleEn}
      </h3>
      <hr />

      {/* DATE */}
      <div className="text-muted small fw-bold mb-3 d-flex justify-content-between">
        <i>
          <FaCalendarAlt className="me-1" />
          Created At {new Date(data.createdAt).toLocaleDateString()}
        </i>
        <i>
          <FaCalendarAlt className="me-1" />
          Updated At {new Date(data.updatedAt || data.createdAt).toLocaleDateString()}
        </i>
      </div>
      <hr />

      {/* SHORT DESCRIPTION */}
      <p className="lead text-muted mb-4">
        {isHindi ? data.shortDescriptionHi : data.shortDescriptionEn}
      </p>

      {/* IMAGE */}
      {data.image && (
        <img
          src={`${API_URL}${data.image}`}
          alt={data.titleEn}
          className="img-fluid rounded shadow-sm mb-4"
          style={{ maxHeight: "420px", objectFit: "cover" }}
        />
      )}

      {/* DESCRIPTION */}
      <div
        className="notice-content"
        dangerouslySetInnerHTML={{
          __html: isHindi ? data.descriptionHi : data.descriptionEn,
        }}
      />
    </Container>
  );
};

export default DirectorateNoticeDetails;
