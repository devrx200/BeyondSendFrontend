import { useState } from "react";
import {
  Carousel,
  CarouselItem,
  CarouselControl
} from "reactstrap";

const brandLogos = [
  { id: 1, name: "Digital India", image: "/digital-india.webp" },
  { id: 2, name: "Make in India", image: "/make-India.jpg" },
  { id: 3, name: "Skill India", image: "/skillindia.png" },
  { id: 4, name: "NIC", image: "/nic-logo.jpg" },
  { id: 5, name: "Ministry of Education", image: "/education-ministary.png" },
  { id: 6, name: "UGC", image: "/ugc-logo.png" },
  { id: 7, name: "AICTE", image: "/aicte-logo.png" },
  { id: 8, name: "NAAC", image: "/naac-logo.png" },
  { id: 9, name: "Scholarship Portal", image: "/scholarship-logo.png" },
  { id: 10, name: "Voter Service Portal", image: "/voter-portal-logo.png" }
];

/* logos per slide */
const perSlide = 5;
const slides = [];
for (let i = 0; i < brandLogos.length; i += perSlide) {
  slides.push(brandLogos.slice(i, i + perSlide));
}

const GovtBrandCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const next = () => {
    if (animating) return;
    setActiveIndex((activeIndex + 1) % slides.length);
  };

  const previous = () => {
    if (animating) return;
    setActiveIndex(
      activeIndex === 0 ? slides.length - 1 : activeIndex - 1
    );
  };

  return (
    <section className="py-4 bg-light border-top">
      <div className="container text-center">
        <h6 className="text-muted fw-bold mb-3">
          Associated With Government Initiatives
        </h6>

        <Carousel
          activeIndex={activeIndex}
          next={next}
          previous={previous}
          interval={2000}          // 🔁 continuous auto slide
          ride="carousel"
          pause={false}
          wrap
        >
          {slides.map((group, index) => (
            <CarouselItem
              key={index}
              onExiting={() => setAnimating(true)}
              onExited={() => setAnimating(false)}
            >
              <div className="row justify-content-center align-items-center g-3">
                {group.map((logo) => (
                  <div
                    key={logo.id}
                    className="col-4 col-md-2 d-flex justify-content-center align-items-center"
                  >
                    <img
                      src={logo.image}
                      alt={logo.name}
                      className="img-fluid"
                      style={{
                        maxHeight: "60px",
                        objectFit: "contain"
                      }}
                    />
                  </div>
                ))}
              </div>
            </CarouselItem>
          ))}

          {/* PREV BUTTON */}
          <CarouselControl
            direction="prev"
            directionText="Previous"
            onClickHandler={previous}
            style={{
              backgroundColor: "#fff",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              opacity: 1
            }}
          />

          {/* NEXT BUTTON */}
          <CarouselControl className="border-primary"
            direction="next"
            directionText="Next"
            onClickHandler={next}
            style={{
              backgroundColor: "#ffffffff",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              opacity: 1,
            }}
          />
        </Carousel>
      </div>
    </section>
  );
};

export default GovtBrandCarousel;
