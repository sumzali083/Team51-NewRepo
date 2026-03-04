import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import './hero-new.css';

const slides = [
  { id: 1, image: "/images/Slider1.jpg", title: "New Season Arrivals", subtitle: "Discover the latest collection" },
  { id: 2, image: "/images/Slider2.jpg", title: "Sports Meets Style", subtitle: "Crafted for perfection" },
  { id: 3, image: "/images/Slider3.png", title: "Family Collection", subtitle: "Style for everyone" }
];

export default function HeroCarouselNew() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = React.useRef(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    startTimer();
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    startTimer();
  };

  return (
    <div className="osai-hero-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="osai-hero-slide"
          style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
        >
          <div className="osai-hero-overlay" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="osai-hero-content text-center"
          >
            <h2 className="osai-hero-title">{slides[currentSlide].title}</h2>
            <p className="osai-hero-sub">{slides[currentSlide].subtitle}</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <button onClick={prevSlide} className="osai-hero-nav left" aria-label="Previous slide">
        <AiOutlineLeft />
      </button>

      <button onClick={nextSlide} className="osai-hero-nav right" aria-label="Next slide">
        <AiOutlineRight />
      </button>

      <div className="osai-hero-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              startTimer();
            }}
            className={index === currentSlide ? 'dot active' : 'dot'}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
