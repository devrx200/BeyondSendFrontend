import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, EffectFade } from "swiper/modules";
import { Button } from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../contexts/LanguageContext";
import { FaGraduationCap, FaExternalLinkAlt } from "react-icons/fa";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const API_URL = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");

const HeroSlider = () => {
  const { isHindi } = useLanguage();
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadSlides = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/get-hero-slides`);
        if (isMounted && res.status === 200) {
          const active = (res.data.data || []).filter((s) => s.isActive);
          setSlides(active);
        }
      } catch (e) {
        if (isMounted) {
          console.error("Slides load error:", e);
          setSlides([]);
        }
      }
    };

    loadSlides();

    return () => {
      isMounted = false;
    };
  }, []);

  const getImageUrl = (path) => {
    if (!path) return "/indrawati-bhavan.png";
    const raw = String(path).trim();
    if (!raw) return "/indrawati-bhavan.png";
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:") || raw.startsWith("blob:")) {
      return raw;
    }
    const normalized = raw.replace(/\\/g, "/");
    const base = API_URL;
    if (normalized.startsWith("/uploads/") || normalized.startsWith("uploads/")) {
      const clean = normalized.startsWith("/") ? normalized : `/${normalized}`;
      return base ? `${base}${clean}` : clean;
    }
    if (normalized.startsWith("/")) {
      return normalized;
    }
    return base ? `${base}/${normalized}` : `/${normalized}`;
  };

  const handleRedirect = async (slide) => {
    if (!slide.link) return;
    const { isConfirmed } = await Swal.fire({
      title: isHindi ? "क्या आप आगे बढ़ना चाहते हैं?" : "Do you want to continue?",
      text: isHindi ? "आप लिंक पर जा रहे हैं" : "You are about to visit this link",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isHindi ? "हाँ, जाएँ" : "Yes, Visit",
      cancelButtonText: isHindi ? "रद्द करें" : "Cancel",
    });
    if (!isConfirmed) return;
    if (slide.isExternal && slide.openInNewTab) {
      window.open(slide.link, "_blank", "noopener,noreferrer");
    } else if (slide.link.startsWith("http")) {
      window.open(slide.link, "_self");
    } else {
      navigate(slide.link);
    }
  };

  if (!slides.length) return null;

  return (
    <section
      className="hero-slider-section"
      aria-label={isHindi ? "मुख्य बैनर एवं मुख्य आकर्षण" : "Hero Banner and Key Highlights"}
    >
      <Swiper
        className="hero-swiper"
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true }}
        loop={slides.length > 1}
        speed={900}
      >
        {slides.map((slide, index) => {
          const showBtn = slide.linkButtonShow === true || slide.linkButtonShow === "true";
          const titelDesShow = slide.titelDesShow !== false && slide.titelDesShow !== "false";
          const title = isHindi ? slide.titleHin || slide.titleEng : slide.titleEng || slide.titleHin;
          const sub = isHindi ? slide.subtitleHin || slide.subtitleEng : slide.subtitleEng || slide.subtitleHin;
          const desc = isHindi ? slide.descriptionHin || slide.descriptionEng : slide.descriptionEng || slide.descriptionHin;
          const btnText = isHindi ? slide.linkTextHi || "अधिक जानें" : slide.linkTextEn || "Explore More";
          const altText = title
            ? `${title} - ${isHindi ? "उच्च शिक्षा विभाग, छत्तीसगढ़ शासन" : "Department of Higher Education, Govt. of Chhattisgarh"}`
            : (isHindi ? "उच्च शिक्षा विभाग, छत्तीसगढ़ शासन" : "Department of Higher Education, Government of Chhattisgarh");

          return (
            <SwiperSlide key={slide._id || index}>
              <div
                className="hero-slide-wrap"
                itemScope
                itemType="https://schema.org/ImageObject"
              >
                <img
                  src={getImageUrl(slide.image)}
                  alt={altText}
                  title={title || (isHindi ? "उच्च शिक्षा विभाग" : "Department of Higher Education")}
                  className="hero-slide-img"
                  width="1920"
                  height="640"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchpriority={index === 0 ? "high" : "low"}
                  decoding="async"
                  itemProp="contentUrl"
                  onError={(e) => {
                    if (!e.currentTarget.src.endsWith("/indrawati-bhavan.png")) {
                      e.currentTarget.src = "/indrawati-bhavan.png";
                    }
                  }}
                />

                <div className="hero-slide-overlay" aria-hidden="true" />

                <div className="hero-slide-content">
                  {titelDesShow && (
                    <div className="hero-text-wrap">
                      {sub && (
                        <div className="d-flex justify-content-center w-100">
                          <span className="hero-badge">
                            <FaGraduationCap />
                            <span className="hero-badge-text">{sub}</span>
                          </span>
                        </div>
                      )}
                      {title && (
                        index === 0 ? (
                          <h1 className="hero-title" itemProp="headline">{title}</h1>
                        ) : (
                          <h2 className="hero-title" itemProp="headline">{title}</h2>
                        )
                      )}
                      {desc && <p className="hero-desc" itemProp="description">{desc}</p>}

                      {showBtn && slide.link && (
                        <div className="mt-2">
                          <Button
                            color="warning"
                            className="hero-action-btn shadow rounded-pill d-inline-flex align-items-center gap-2"
                            onClick={() => handleRedirect(slide)}
                            aria-label={`${btnText}: ${title || (isHindi ? "विस्तृत विवरण" : "Details")}`}
                          >
                            <span>{btnText}</span>
                            <FaExternalLinkAlt className="hero-btn-icon" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="hero-top-pattern" aria-hidden="true" />
                <div className="hero-bottom-pattern" aria-hidden="true" />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
};

export default HeroSlider;