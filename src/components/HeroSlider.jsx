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
      const res = await axios.get(`${API_URL}api/get-hero-slides`);
      if (res.status === 200) {
        //  only active slides
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
    const nextIndex =
      activeIndex === slides.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex =
      activeIndex === 0 ? slides.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  };

  if (slides.length === 0) return null;

  const carouselSlides = slides.map((slide) => (
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

          {slide.link && (
            <Button
              color="warning"
              size="lg"
              tag={Link}
              to={slide.link}
              className="mt-3"
            >
              {isHindi ? "और जानें" : "Learn More"}
            </Button>
          )}
        </div>
      </div>
    </CarouselItem>
  ));

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
