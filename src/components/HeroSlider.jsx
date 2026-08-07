import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, EffectFade } from "swiper/modules";
import { Button } from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../contexts/LanguageContext";

// Swiper core CSS (add these imports in your main CSS or index.jsx if not already)
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const API_URL = import.meta.env.VITE_API_URL;

const styles = `
  .hero-swiper {
    width: 100%;
    --swiper-theme-color: #d6f5e8;
  }

  .hero-slide-wrap {
    position: relative;
    width: 100%;
    height: 85vh;
    min-height: 340px;
    max-height: 470px;
    overflow: hidden;
  }

  /* Full-cover image, never crops or distorts */
  .hero-slide-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
  }

  /* Dark center overlay for text legibility */
  .hero-slide-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(5, 18, 50, 0.78) 0%,
      rgba(5, 18, 50, 0.55) 50%,
      rgba(5, 18, 50, 0.35) 100%
    );
  }

  /* Text block — centered on ALL screen sizes */
  .hero-slide-content {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px 10% 60px;
  }

  .hero-badge {
    display: inline-block;
    background: rgba(7, 65, 255, 0.18);
    border: 1px solid #f9fcfd;
    color: #ffffff;
    font-size: clamp(0.68rem, 1.4vw, 0.88rem);
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 4px 16px;
    border-radius: 20px;
    margin-bottom: 14px;
  }

  .hero-title {
    color: #fff;
    font-size: clamp(1.4rem, 4vw, 2.8rem);
    font-weight: 700;
    line-height: 1.18;
    text-shadow: 0 3px 16px rgba(0,0,0,.45);
    margin-bottom: 14px;
  }

  .hero-desc {
    color: rgba(255,255,255,.85);
    font-size: clamp(0.82rem, 1.8vw, 1.05rem);
    line-height: 1.7;
    max-width: 640px;
    margin: 0 auto 22px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Swiper navigation arrows */
  .hero-swiper .swiper-button-prev,
  .hero-swiper .swiper-button-next {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: rgba(255,255,255,.15);
    border: 2px solid rgba(255,255,255,.4);
    backdrop-filter: blur(6px);
    color: #fff !important;
    transition: background .2s;
  }
  .hero-swiper .swiper-button-prev:hover,
  .hero-swiper .swiper-button-next:hover {
    background: rgba(29, 253, 216, 0.5);
    border-color: #ffffff;
  }
  .hero-swiper .swiper-button-prev::after,
  .hero-swiper .swiper-button-next::after {
    font-size: 14px !important;
    font-weight: 900;
  }

  /* Pagination dots */
  .hero-swiper .swiper-pagination-bullet {
    width: 10px; height: 10px;
    background: rgba(255,255,255,.5);
    opacity: 1;
    transition: transform .3s, background .3s;
  }
  .hero-swiper .swiper-pagination-bullet-active {
    background: #6cc1fa;
    transform: scale(1.4);
  }
  .hero-swiper .swiper-pagination {
    bottom: 14px;
  }

  /* Mobile */
  @media (max-width: 767.98px) {
    .hero-slide-wrap {
      height: 58vw;
      min-height: 260px;
      max-height: 420px;
    }
    .hero-slide-content { padding: 16px 6% 52px; }
    .hero-swiper .swiper-button-prev,
    .hero-swiper .swiper-button-next { width: 34px; height: 34px; }
    .hero-swiper .swiper-button-prev::after,
    .hero-swiper .swiper-button-next::after { font-size: 11px !important; }
  }
  @media (max-width: 575.98px) {
    .hero-slide-wrap { height: 65vw; min-height: 220px; }
    .hero-slide-content { padding: 12px 5% 48px; }
    .hero-badge { font-size: 0.65rem; padding: 3px 12px; margin-bottom: 8px; }
    .hero-desc { -webkit-line-clamp: 2; margin-bottom: 14px; }
  }
`;

const HeroSlider = () => {
  const { isHindi } = useLanguage();
  const [slides, setSlides] = useState([]);

  useEffect(() => { loadSlides(); }, []);

  const loadSlides = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/get-hero-slides`);
      if (res.status === 200)
        setSlides((res.data.data || []).filter(s => s.isActive));
    } catch (e) { console.error("Slides load error:", e); }
  };

  const getImageUrl = (path) =>
    path ? `${API_URL}${path.replace(/\\/g, "/")}` : "";

  const handleRedirect = async (slide) => {
    if (!slide.link) return;
    const { isConfirmed } = await Swal.fire({
      title: isHindi ? "क्या आप आगे बढ़ना चाहते हैं?" : "Do you want to continue?",
      text: isHindi ? "आप लिंक पर जा रहे हैं" : "You are about to visit this link",
      icon: "question", showCancelButton: true,
      confirmButtonText: isHindi ? "हाँ, जाएँ" : "Yes, Visit",
      cancelButtonText: isHindi ? "रद्द करें" : "Cancel",
    });
    if (!isConfirmed) return;
    if (slide.isExternal && slide.openInNewTab) window.open(slide.link, "_blank");
    else window.location.href = slide.link;
  };

  if (!slides.length) return null;

  return (
    <>
      <style>{styles}</style>

      <Swiper
        className="hero-swiper"
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true }}
        loop={slides.length > 1}
        speed={800}
      >
        {slides.map(slide => {
          const showBtn = slide.linkButtonShow === true || slide.linkButtonShow === "true";
          const titelDesShow = slide.titelDesShow === true || slide.linkButtonShow === "true";
          const title = isHindi ? slide.titleHin : slide.titleEng;
          const sub = isHindi ? slide.subtitleHin : slide.subtitleEng;
          const desc = isHindi ? slide.descriptionHin : slide.descriptionEng;
          const btnText = isHindi ? slide.linkTextHi : slide.linkTextEn;

          return (
            <SwiperSlide key={slide._id}>
              <div className="hero-slide-wrap">

                {/* Full-bleed image */}
                <img
                  src={getImageUrl(slide.image)}
                  alt={title}
                  className="hero-slide-img"
                />

                {/* Overlay */}
                <div className="hero-slide-overlay" />

                {/* Centered content — always fully visible */}
                <div className="hero-slide-content">
                  {titelDesShow && (
                    <>
                      {sub && <span className="hero-badge">{sub}</span>}
                      <h1 className="hero-title">{title}</h1>
                      {desc && <p className="hero-desc">{desc}</p>}
                    </>
                  )}


                  {showBtn && slide.link && (
                    <Button
                      color="warning"
                      className="fw-semibold px-4 py-2 shadow"
                      style={{ fontSize: "clamp(.82rem,1.6vw,1rem)" }}
                      onClick={() => handleRedirect(slide)}
                    >
                      {btnText}
                    </Button>
                  )}
                </div>

              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </>
  );
};

export default HeroSlider;