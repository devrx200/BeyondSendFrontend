import { useLocation } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import ContentPreview from "../../utilies/ContentPreview";
import {
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Badge,
  Progress,
  Alert,
} from "reactstrap";
import { useLanguage } from '../../contexts/LanguageContext';

const API = import.meta.env.VITE_API_URL;

const DynamicPage = () => {
  const location = useLocation();
    const { isHindi } = useLanguage();

    
  

  const [pageData2, setPageData2] = useState([]);

  const menu = location.state?.menu;
  const data = location.state?.pageData;

  const dataFromState = location.state?.pageData;

  const pageDataByprops = data && data[0];

  const path = location.pathname;

  const pageData = pageDataByprops ? pageDataByprops : pageData2;


    console.log("Entering in Dynamic Page",menu);


  useEffect(() => {
    if (!pageDataByprops) {
      fetchPageData();
    }
  }, [path]);

  const fetchPageData = async () => {
    try {
      const res = await axios.get(`${API}/api/menu-page-data-by-path`, {
        params: { path },
      });

     setPageData2(res?.data[0]) ;
    } catch (error) {
      console.error("Failed to load page data", error);
    }
  };

//   console.log();

  /* ================= LOADING ================= */
  if (!pageData) {
    return <div className="text-center my-5">Loading...</div>;
  }

  /* ================= UI ================= */
  return (
    <div className="container my-5">
      {/* {menu && (
        <div className="mb-3 text-muted">
          <h5>{menu.titleEng}</h5>
        </div>
      )} */}

      <section className="container my-5">
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
          <Row>
            <Col>
              <h5 className="fw-bold mb-2 text-dark">
                
             {isHindi ? pageData.titleHi :pageData.titleEn }  
              </h5>
            </Col>{" "}
            <Col>
              <div
                style={{ textAlign: "right" }}
                className="text-danger  small mb-3"
              >
                <span style={{ color: "green", fontWeight: "600" }}>
                  {" • "}
                  Published on:{" "}
                  {new Date(pageData.createdAt).toLocaleDateString()}
                </span>

                <span
                  style={{
                    paddingLeft: "30px",
                    color: "red",
                    fontWeight: "600",
                  }}
                >
                  {" • "}
                  Last Updated:{" "}
                  {new Date(pageData.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </Col>
          </Row>

          {/* SHORT DESCRIPTION */}
          <p className="fs-6 text-secondary mb-4">
            {pageData.shortDescriptionEn}
          </p>

          {/* CONTENT BLOCKS */}
          {pageData.contents && pageData.contents.length > 0 && (
            <ContentPreview contents={pageData.contents} />
          )}

          {/* MAIN DESCRIPTION */}
          <div className="mt-4">
            <p className="text-dark lh-lg">{pageData.descriptionEn}</p>
          </div>

          {/* EXTERNAL LINK */}
          {/* {pageData.link && (
            <div className="mt-4">
              <a
                href={pageData.link}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary px-4 py-2"
              >
                Visit Related Page
              </a>
            </div>
          )} */}
        </div>
      </section>
    </div>
  );
};

export default DynamicPage;
