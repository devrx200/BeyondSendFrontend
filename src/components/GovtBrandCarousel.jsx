import { useEffect, useRef, useState } from "react";
import axios from "axios";

const GovtBrandMarquee = () => {
  const [brands, setBrands] = useState([]);
  const marqueeRef = useRef(null);
  const speedRef = useRef(0.4);
  const isPaused = useRef(false);
  const contentWidthRef = useRef(0);

  const API_URL = import.meta.env.VITE_API_URL;

  /* ================= FETCH BRANDS ================= */
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/get-brands`);

        const activeBrands = (res.data.data || [])
          .filter(b => b.isActive)
          .sort((a, b) => a.position - b.position);

        setBrands(activeBrands);
      } catch (err) {
        console.error("Failed to fetch brands", err);
      }
    };

    fetchBrands();
  }, [API_URL]);

  /* ================= MARQUEE LOGIC ================= */
  useEffect(() => {
    if (!brands.length) return;

    const marquee = marqueeRef.current;
    let x = 0;
    let animationId;

    // Wait for images to load before measuring
    const measureWidth = () => {
      contentWidthRef.current = marquee.scrollWidth / 2;
    };

    measureWidth();
    window.addEventListener("resize", measureWidth);

    const animate = () => {
      if (!isPaused.current) {
        x -= speedRef.current;

        // ✅ RESET AT EXACT POINT (NO GAP)
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
      <span className=" mb-0 crawling-patten" />
      <section
        className="py-4 border-top"
        style={{ background: "rgba(135, 206, 235, 0.18)" }}
      >

        <div className="container-fluid">
          <h6 className="text-center text-muted fw-bold mb-3">
            Associated With Government Initiatives
          </h6>

          {/* VIEWPORT */}
          <div
            style={{ overflow: "hidden", width: "100%" }}
            onMouseEnter={() => (isPaused.current = true)}
            onMouseLeave={() => (isPaused.current = false)}
          >
            {/* MOVING STRIP */}
            <div
              ref={marqueeRef}
              style={{
                display: "flex",
                gap: "40px",
                width: "max-content",
                alignItems: "center",
                willChange: "transform"
              }}
            >
              {[...brands, ...brands].map((logo, i) => (
                <img
                  key={i}
                  src={`${API_URL}${logo.image}`}
                  alt={logo.name}
                  className="border border-1 border-white rounded"
                  style={{
                    height: "60px",
                    objectFit: "contain",
                    flexShrink: 0
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>

  );
};

export default GovtBrandMarquee;
