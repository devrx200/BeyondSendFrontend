import { useState, useEffect } from 'react';
import { Carousel, CarouselItem, CarouselControl, CarouselIndicators, CarouselCaption, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import DataService from '../services/DataService';

const HeroSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      const data = await DataService.getHeroSlides();
      setSlides(data);
    } catch (error) {
      console.error('Error loading slides:', error);
    }
  };

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === slides.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? slides.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  };

  const carouselSlides = slides.map((slide) => {
    return (
      <CarouselItem
        onExiting={() => setAnimating(true)}
        onExited={() => setAnimating(false)}
        key={slide.id}
      >
        <div className="hero-slide" style={{ backgroundImage: `url(${slide.image})` }}>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h5 className="hero-subtitle">{slide.subtitle}</h5>
            <h1 className="hero-title">{slide.title}</h1>
            <p className="hero-description">{slide.description}</p>
            <Button color="warning" size="lg" tag={Link} to={slide.cta.link} className="mt-3">
              {slide.cta.text}
            </Button>
          </div>
        </div>
      </CarouselItem>
    );
  });

  if (slides.length === 0) {
    return null;
  }

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

