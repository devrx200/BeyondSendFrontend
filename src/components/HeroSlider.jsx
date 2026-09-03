import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, EffectFade } from "swiper/modules";
import { Button } from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../contexts/LanguageContext";
import { FaGraduationCap, FaExternalLinkAlt } from "react-icons/fa";

// Swiper core CSS
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const API_URL = import.meta.env.VITE_API_URL;

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
          if (active.length > 0) {
            setSlides(active);
          } else {
            // Default fallbacks
            setSlides([
              {
                _id: "default_1",
                titleHin: "उच्च शिक्षा विभाग, छत्तीसगढ़ शासन",
                titleEng: "Department of Higher Education, Govt. of Chhattisgarh",
                subtitleHin: "सशक्त युवा, समृद्ध छत्तीसगढ़",
                subtitleEng: "Empowering Youth, Transforming Chhattisgarh",
                descriptionHin: "गुणवत्तापूर्ण उच्च शिक्षा, शोध और नवाचार के साथ युवाओं के उज्ज्वल भविष्य का निर्माण।",
                descriptionEng: "Building a brighter future for youth through excellence in quality higher education, research, and innovation.",
                image: "/indrawati-bhavan.png",
                linkButtonShow: true,
                titelDesShow: true,
                linkTextHi: "विस्तृत विवरण",
                linkTextEn: "Learn More",
                link: "/about",
              },
            ]);
          }
        }
      } catch (e) {
        if (isMounted) {
          console.error("Slides load error:", e);
          setSlides([
            {
              _id: "default_1",
              titleHin: "उच्च शिक्षा विभाग, छत्तीसगढ़ शासन",
              titleEng: "Department of Higher Education, Govt. of Chhattisgarh",
              subtitleHin: "सशक्त युवा, समृद्ध छत्तीसगढ़",
              subtitleEng: "Empowering Youth, Transforming Chhattisgarh",
              descriptionHin: "गुणवत्तापूर्ण उच्च शिक्षा, शोध और नवाचार के साथ युवाओं के उज्ज्वल भविष्य का निर्माण।",
              descriptionEng: "Building a brighter future for youth through excellence in quality higher education, research, and innovation.",
              image: "/indrawati-bhavan.png",
              linkButtonShow: true,
              titelDesShow: true,
              linkTextHi: "विस्तृत विवरण",
              linkTextEn: "Learn More",
              link: "/about",
            },
          ]);
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
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    if (path.startsWith("/")) return path;
    const cleanPath = path.replace(/\\/g, "/");
    return `${API_URL}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
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
      {slides.map((slide) => {
        const showBtn = slide.linkButtonShow === true || slide.linkButtonShow === "true";
        const titelDesShow = slide.titelDesShow !== false && slide.titelDesShow !== "false";
        const title = isHindi ? slide.titleHin || slide.titleEng : slide.titleEng || slide.titleHin;
        const sub = isHindi ? slide.subtitleHin || slide.subtitleEng : slide.subtitleEng || slide.subtitleHin;
        const desc = isHindi ? slide.descriptionHin || slide.descriptionEng : slide.descriptionEng || slide.descriptionHin;
        const btnText = isHindi ? slide.linkTextHi || "अधिक जानें" : slide.linkTextEn || "Explore More";

        return (
          <SwiperSlide key={slide._id}>
            <div className="hero-slide-wrap">
              {/* Background Image */}
              <img
                src={getImageUrl(slide.image)}
                alt={title || "Higher Education"}
                className="hero-slide-img"
                onError={(e) => {
                  e.currentTarget.src = "/indrawati-bhavan.png";
                }}
              />

              {/* Translucent Vignette Overlay */}
              <div className="hero-slide-overlay" />

              {/* Centered Content */}
              <div className="hero-slide-content">
                {titelDesShow && (
                  <div className="hero-text-wrap">
                    {sub && (
                      <div className="d-flex justify-content-center">
                        <span className="hero-badge">
                          <FaGraduationCap /> {sub}
                        </span>
                      </div>
                    )}
                    {title && <h1 className="hero-title">{title}</h1>}
                    {desc && <p className="hero-desc">{desc}</p>}

                    {showBtn && slide.link && (
                      <div className="mt-2">
                        <Button
                          color="warning"
                          className="fw-bold px-4 py-2 shadow rounded-pill d-inline-flex align-items-center gap-2"
                          style={{
                            fontSize: "clamp(0.82rem, 1.4vw, 0.95rem)",
                            background: "#ffd54f",
                            color: "#0f172a",
                            border: "none",
                            transition: "all 0.2s ease",
                          }}
                          onClick={() => handleRedirect(slide)}
                        >
                          <span>{btnText}</span>
                          <FaExternalLinkAlt size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tribal Folk Art Border Pattern along top */}
              <div className="hero-top-pattern" />

              {/* Tribal Folk Art Border Pattern along bottom */}
              <div className="hero-bottom-pattern" />
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default HeroSlider;