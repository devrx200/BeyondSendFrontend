import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ApiUrl = import.meta.env.VITE_API_URL;

const CreatedDynamicPage = () => {
  const { mainSlug, slug } = useParams();

  const [list, setList] = useState([]);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchSinglePage();
    } else {
      fetchMainSlugList();
    }
  }, [mainSlug, slug]);

  /* ========= SINGLE PAGE ========= */
  const fetchSinglePage = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${ApiUrl}/get-content-by-slug/${slug}`
      );
      setPage(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ========= MAIN SLUG LIST ========= */
  const fetchMainSlugList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${ApiUrl}/get-content-by-main-slug/${mainSlug}`
      );
      setList(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  /* =================================================
     CASE 1: ONLY MAIN SLUG → LIST VIEW
  ================================================= */
  if (!slug) {
    return (
      <div className="container py-4">
        <h2 className="mb-4">सूचियाँ</h2>

        {list.length === 0 && <p>No records found</p>}

        {list.map((item) => (
          <div key={item._id} className="border-bottom pb-3 mb-3">
            <h5 className="mb-1">
              <Link to={`/${mainSlug}/${item.slug}`}>
                {item.titleHin || item.titleEng}
              </Link>
            </h5>

            <small className="text-muted d-block mb-2">
              तारीख :{" "}
              {new Date(item.publishDate).toLocaleDateString("hi-IN")}
            </small>

            {item.documentsUpdate?.map((doc) => (
              <div key={doc._id} className="ms-3">
                📄{" "}
                <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                  {doc.titleHin || doc.titleEng}
                </a>
                <span className="text-muted ms-2">
                  ({doc.fileSize})
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  /* =================================================
     CASE 2: MAIN SLUG + SLUG → DETAIL VIEW
  ================================================= */
  return (
    <div className="container py-4">
      <h1>{page.titleHin || page.titleEng}</h1>

      <small className="text-muted d-block mb-3">
        तारीख :{" "}
        {new Date(page.publishDate).toLocaleDateString("hi-IN")}
      </small>

      {page.htmlContent && (
        <div dangerouslySetInnerHTML={{ __html: page.htmlContent }} />
      )}

      {page.documentsUpdate?.length > 0 && (
        <div className="mt-4">
          <h4>देखें / डाउनलोड</h4>

          {page.documentsUpdate.map((doc) => (
            <div key={doc._id} className="mb-2">
              📄{" "}
              <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                {doc.titleHin || doc.titleEng}
              </a>
              <span className="text-muted ms-2">
                ({doc.fileSize})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatedDynamicPage;
