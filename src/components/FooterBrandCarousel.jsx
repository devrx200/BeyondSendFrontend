import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaLandmark } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = import.meta.env.BASE_URL || "/";

const BrandItem = ({ brand }) => {
  const [imgError, setImgError] = useState(false);

  const getUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.replace(/\\/g, "/");
    return `${API_URL}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
  };

  const imgUrl = getUrl(brand.image);

  if (imgError || !imgUrl) {
    return (
      <div className="brand-fallback-badge">
        <FaLandmark style={{ color: "#1e40af", fontSize: "1.1rem" }} />
        <span>{brand.name || "Partner"}</span>
      </div>
    );
  }

  return (
    <div className="brand-card-item">
      <img
        src={imgUrl}
        alt={brand.name || "Government Initiative"}
        style={{
          height: "48px",
          maxWidth: "160px",
          objectFit: "contain",
          display: "block"
        }}
        onError={() => setImgError(true)}
      />
    </div>
  );
};

const FooterBrandCarousel = () => {
  const { isHindi } = useLanguage();
  const [brands, setBrands] = useState([]);
  const marqueeRef = useRef(null);
  const speedRef = useRef(0.45);
  const isPaused = useRef(false);
  const contentWidthRef = useRef(0);

  /* ================= FETCH BRANDS ================= */
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/get-brands`);

        const activeBrands = (res.data.data || [])
          .filter((b) => b.isActive)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

        // Default fallbacks if no brands in DB
        if (activeBrands.length === 0) {
          setBrands([
            { name: "BeyondSend", image: "/beyondsend-logo.svg", isActive: true }
          ]);
        } else {
          setBrands(activeBrands);
        }
      } catch (err) {
        console.error("Failed to fetch brands", err);
        setBrands([
          { name: "BeyondSend", image: "/beyondsend-logo.svg", isActive: true }
        ]);
      }
    };

    fetchBrands();
  }, []);

  /* ================= MARQUEE LOGIC ================= */
  useEffect(() => {
    if (!brands.length) return;

    const marquee = marqueeRef.current;
    if (!marquee) return;

    let x = 0;
    let animationId;

    const measureWidth = () => {
      if (marquee) {
        contentWidthRef.current = marquee.scrollWidth / 2;
      }
    };

    measureWidth();
    window.addEventListener("resize", measureWidth);

    const animate = () => {
      if (!isPaused.current && marquee && contentWidthRef.current > 0) {
        x -= speedRef.current;
        if (Math.abs(x) >= contentWidthRef.current) {
          x = 0;
        }
        marquee.style.transform = `translateX(${x}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", measureWidth);
    };
  }, [brands]);

  if (!brands.length) return null;

  return (
    <>

      <section
        className="py-4 border-top border-bottom"
        style={{
          background: "linear-gradient(180deg, rgba(238, 246, 255, 0.7) 0%, rgba(224, 239, 255, 0.5) 100%)",
        }}
      >
        <div className="container-fluid px-3">
          <div className="text-center mb-3 px-2">
            <span
              className="d-inline-block px-3 py-1 rounded-pill fw-bold text-uppercase"
              style={{
                fontSize: "clamp(0.68rem, 2.2vw, 0.78rem)",
                letterSpacing: "0.06em",
                color: "#1e3a8a",
                background: "rgba(30, 58, 138, 0.08)",
                border: "1px solid rgba(30, 58, 138, 0.18)",
                lineHeight: "1.4",
                maxWidth: "96%",
                wordBreak: "break-word",
              }}
            >
              {isHindi ? "  Our Partners & Clients " : "Our Partners & Clients "}
            </span>
          </div>

          {/* VIEWPORT */}
          <div
            style={{ overflow: "hidden", width: "100%" }}
            onMouseEnter={() => (isPaused.current = true)}
            onMouseLeave={() => (isPaused.current = false)}
            onTouchStart={() => (isPaused.current = true)}
            onTouchEnd={() => (isPaused.current = false)}
          >
            {/* MOVING STRIP */}
            <div
              ref={marqueeRef}
              style={{
                display: "flex",
                gap: "24px",
                width: "max-content",
                alignItems: "center",
                willChange: "transform",
                padding: "6px 0",
              }}
            >
              {[...brands, ...brands].map((brand, i) => (
                <BrandItem key={i} brand={brand} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FooterBrandCarousel;
