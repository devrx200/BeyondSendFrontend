import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  Button,
} from "reactstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

const HeroSlider = () => {
  const { isHindi } = useLanguage();

  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/get-hero-slides`);
      if (res.status === 200) {
        const activeSlides = (res.data.data || []).filter(
          (slide) => slide.isActive
        );
        setSlides(activeSlides);
      }
    } catch (error) {
      console.error("Error loading slides:", error);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    return `${API_URL}${path.replace(/\\/g, "/")}`;
  };

  const next = () => {
    if (animating) return;
    setActiveIndex(activeIndex === slides.length - 1 ? 0 : activeIndex + 1);
  };

  const previous = () => {
    if (animating) return;
    setActiveIndex(activeIndex === 0 ? slides.length - 1 : activeIndex - 1);
  };

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  };

  /* ✅ HANDLE BUTTON CLICK */
  const handleRedirect = async (slide) => {
    if (!slide.link) return;

    const confirm = await Swal.fire({
      title: isHindi ? "क्या आप आगे बढ़ना चाहते हैं?" : "Do you want to continue?",
      text: isHindi ? "आप लिंक पर जा रहे हैं" : "You are about to visit this link",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isHindi ? "हाँ, जाएँ" : "Yes, Visit",
      cancelButtonText: isHindi ? "रद्द करें" : "Cancel",
    });

    if (!confirm.isConfirmed) return;

    // ✅ HANDLE EXTERNAL / INTERNAL
    if (slide.isExternal) {
      if (slide.openInNewTab) {
        window.open(slide.link, "_blank");
      } else {
        window.location.href = slide.link;
      }
    } else {
      window.location.href = slide.link; // internal fallback
    }
  };

  if (slides.length === 0) return null;

  const carouselSlides = slides.map((slide) => {
    const showButton =
      slide.linkButtonShow === true || slide.linkButtonShow === "true";

    return (
      <CarouselItem
        onExiting={() => setAnimating(true)}
        onExited={() => setAnimating(false)}
        key={slide._id}
      >
        <div
          className="hero-slide"
          style={{
            backgroundImage: `url(${getImageUrl(slide.image)})`,
          }}
        >
          <div className="hero-overlay"></div>

          <div className="hero-content">
            <h5 className="hero-subtitle">
              {isHindi ? slide.subtitleHin : slide.subtitleEng}
            </h5>

            <h1 className="hero-title">
              {isHindi ? slide.titleHin : slide.titleEng}
            </h1>

            <p className="hero-description">
              {isHindi
                ? slide.descriptionHin
                : slide.descriptionEng}
            </p>

            {/* ✅ BUTTON SHOW CONDITION */}
            {showButton && slide.link && (
              <Button
                color="warning"
                size="lg"
                className="mt-3"
                onClick={() => handleRedirect(slide)}
              >
                {isHindi ? slide.linkTextHi : slide.linkTextEn}
              </Button>
            )}
          </div>
        </div>
      </CarouselItem>
    );
  });

  return (
    <Carousel
      activeIndex={activeIndex}
      next={next}
      previous={previous}
      className="hero-carousel"
      interval={5000}
      ride="carousel"
    >
      <CarouselIndicators
        items={slides}
        activeIndex={activeIndex}
        onClickHandler={goToIndex}
      />
      {carouselSlides}
      <CarouselControl
        direction="prev"
        directionText="Previous"
        onClickHandler={previous}
      />
      <CarouselControl
        direction="next"
        directionText="Next"
        onClickHandler={next}
      />
    </Carousel>
  );
};

export default HeroSlider;