import { useEffect, useState } from "react";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

const HomeHeroSlider = () => {
  const { isHindi } = useLanguage();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHeroSlides = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}api/get-hero-slides`);
      if (res.status === 200) {
        setSlides(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to load hero slides", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroSlides();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return "";
    return `${API_URL}${path.replace(/\\/g, "/")}`;
  };

  if (loading) return null;

  const activeSlides = slides.filter(slide => slide.isActive);

  if (activeSlides.length === 0) return null;

  return (
    <div className="hero-slider">
      {activeSlides.map((slide) => (
        <div className="hero-slide" key={slide._id}>
          <img
            src={getImageUrl(slide.image)}
            alt={isHindi ? slide.titleHin : slide.titleEng}
            className="hero-image"
          />

          <div className="hero-content">
            <h5>{isHindi ? slide.subtitleHin : slide.subtitleEng}</h5>
            <h1>{isHindi ? slide.titleHin : slide.titleEng}</h1>
            <p>
              {isHindi ? slide.descriptionHin : slide.descriptionEng}
            </p>

            {slide.link && (
              <a
                href={slide.link}
                target={slide.openInNewTab ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                {isHindi ? "और जानें" : "Learn More"}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomeHeroSlider;
