<<<<<<< HEAD
import React from "react";

export function HomePage() {
  return (
    <>
      <div
        id="osaiCarousel"
        className="carousel slide mt-4 mb-5"
        data-bs-ride="carousel"
        data-bs-interval="2250"
      >
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#osaiCarousel"
            data-bs-slide-to="0"
            className="active"
          ></button>
          <button
            type="button"
            data-bs-target="#osaiCarousel"
            data-bs-slide-to="1"
          ></button>
          <button
            type="button"
            data-bs-target="#osaiCarousel"
            data-bs-slide-to="2"
          ></button>
        </div>

        <div className="carousel-inner rounded shadow">
          <div className="carousel-item active">
            <img
              src="/images/Slider1.png"
              className="d-block w-100"
              alt="sale slide 1"
            />
          </div>

          <div className="carousel-item">
            <img
              src="/images/Slider2.jpeg"
              className="d-block w-100"
              alt="sale slide 2"
            />
          </div>

          <div className="carousel-item">
            <img
              src="/images/Slider3.jpeg"
              className="d-block w-100"
              alt="Kids style 1"
            />
          </div>
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#osaiCarousel"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon"></span>
        </button>

        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#osaiCarousel"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      <section id="welcome" className="text-center">
        <div className="container d-flex justify-content-center">
          <div
            className="p-4 mt-3 bg-dark text-light shadow rounded"
            style={{ maxWidth: "1500px" }}
          >
            <h1 id="title">Welcome to OSAI&apos;s</h1>
            <p id="description" className="mb-4">
              OSAI&apos;s is one of the leading companies in the fashion industry.
              Pure fashion created from the finest Japanese fibers. Hand-woven
              and tailor-made for every body type — from kids to adults, daily
              wear to timeless pieces, we have it all and you will always find
              something for everyone with us.
            </p>

            
            
          </div>
        </div>
      </section>

      <section id="gallery" className="mt-5">
        <h2 className="text-center">Wear Your Style</h2>

        <div className="row g-4 mt-3">
          <div className="col-md-4">
            <img
              src="/images/Men1.jpg"
              alt="Men's Fit 1"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Woman1.jpg"
              alt="Women's Fit 1"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Kids1.jpg"
              alt="Kid's Fit 1"
              className="img-fluid rounded shadow"
            />
          </div>

          <div className="col-md-4">
            <img
              src="/images/Family1.jpg"
              alt="Family's Fit 1"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Men2.jpg"
              alt="Men's Fit 2"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Woman2.jpg"
              alt="Women's Fit 2"
              className="img-fluid rounded shadow"
            />
          </div>

          <div className="col-md-4">
            <img
              src="/images/Kids2.jpg"
              alt="Kid's Fit 2"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Family2.jpg"
              alt="Family's Fit 2"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Men3.jpg"
              alt="Men's Fit 3"
              className="img-fluid rounded shadow"
            />
          </div>

          <div className="col-md-4">
            <img
              src="/images/Woman3.jpg"
              alt="Women's Fit 3"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Kids3.jpg"
              alt="Kid's Fit 3"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-4">
            <img
              src="/images/Family3.jpg"
              alt="Family's Fit 3"
              className="img-fluid rounded shadow"
            />
          </div>
=======
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import HeroCarouselNew from "../components/HeroCarouselNew";

const categories = [
  { label: "Mens",    to: "/mens",    img: "/images/Men1.jpg" },
  { label: "Womens",  to: "/womens",  img: "/images/Woman1.jpg" },
  { label: "Kids",    to: "/kids",    img: "/images/Kids1.jpg" },
];

const galleryImages = [
  { src: "/images/Men1.jpg",    alt: "Men's Fit" },
  { src: "/images/Woman1.jpg",  alt: "Women's Fit" },
  { src: "/images/Kids1.jpg",   alt: "Kids' Fit" },
  { src: "/images/Family1.jpg", alt: "Family Fit" },
  { src: "/images/Men2.jpg",    alt: "Men's Fit 2" },
  { src: "/images/Woman2.jpg",  alt: "Women's Fit 2" },
  { src: "/images/Kids2.jpg",   alt: "Kids' Fit 2" },
  { src: "/images/Family2.jpg", alt: "Family Fit 2" },
];

const s3 = {
  card: { position: "relative", overflow: "hidden", height: 440, cursor: "pointer", transition: "flex 0.5s ease" },
  img: { width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "filter 0.4s ease" },
  label: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: 20, gap: 8 },
  name: { fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(20px,3vw,32px)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", transition: "all 0.3s ease" },
  sub: { fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" },
};

export function HomePage() {
  const welcomeRef = useRef(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(false);

  useEffect(() => {
    if (!welcomeRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsWelcomeVisible(entry.isIntersecting);
      },
      { threshold: 0.35 }
    );

    observer.observe(welcomeRef.current);

    return () => observer.disconnect();
  }, []);

  const fromLeft = {
    opacity: isWelcomeVisible ? 1 : 0,
    transform: isWelcomeVisible ? "translateX(0)" : "translateX(-36px)",
    transition: "opacity 0.7s ease, transform 0.7s ease",
  };

  const fromRight = {
    opacity: isWelcomeVisible ? 1 : 0,
    transform: isWelcomeVisible ? "translateX(0)" : "translateX(36px)",
    transition: "opacity 0.7s ease, transform 0.7s ease",
  };

  const bodyReveal = {
    opacity: isWelcomeVisible ? 1 : 0,
    transform: isWelcomeVisible ? "translateY(0)" : "translateY(18px)",
    transition: "opacity 0.75s ease 0.2s, transform 0.75s ease 0.2s",
  };

  return (
    <>
      {/* ── Hero ── */}
      <HeroCarouselNew />

      {/* ── Category strip ── */}
      <section style={{ background: "#000", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", gap: 6 }}>
          {categories.map((cat, i) => (
            <NavLink
              key={cat.to}
              to={cat.to}
              style={{
                ...s3.card,
                flex: hoveredCategory === i ? 2.2 : 1,
                display: "block",
              }}
              onMouseEnter={() => setHoveredCategory(i)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <img
                src={cat.img}
                alt={cat.label}
                style={{
                  ...s3.img,
                  filter: hoveredCategory === i ? "brightness(0.75)" : "brightness(0.45)",
                }}
              />
              <div style={s3.label}>
                <span
                  style={{
                    ...s3.name,
                    writingMode: hoveredCategory === i ? "horizontal-tb" : "vertical-rl",
                    transform: hoveredCategory === i ? "none" : "rotate(180deg)",
                  }}
                >
                  {cat.label}
                </span>
                {hoveredCategory === i && <span style={s3.sub}>Shop Now →</span>}
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      {/* ── Welcome / Brand statement ── */}
      <section
        ref={welcomeRef}
        style={{
        background: "#000",
        padding: "100px 24px",
        display: "flex",
        gap: 80,
        maxWidth: 1200,
        margin: "0 auto",
        alignItems: "flex-start",
      }}>
        <div style={{ flex: "0 0 auto" }}>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(64px, 10vw, 120px)",
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: "#fff",
            margin: 0,
          }}>
            <span style={{ display: "block", ...fromLeft }}>Wear</span>
            <span style={{ display: "block", color: "rgba(255,255,255,0.25)", ...fromRight, transitionDelay: "0.12s" }}>Your</span>
            <span style={{ display: "block", ...fromLeft, transitionDelay: "0.22s" }}>Story.</span>
          </h1>
        </div>
        <div style={{ paddingTop: 16, maxWidth: 480, ...bodyReveal }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
            OSAI is one of the leading companies in the fashion industry.
            Pure fashion created from the finest Japanese fibers — hand-woven
            and tailor-made for every body type.
          </p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.8, marginBottom: 36 }}>
            From kids to adults, daily wear to timeless pieces, we have it all.
            You will always find something for everyone with us.
          </p>
          <NavLink
            to="/about"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
            }}
          >
            Our Story →
          </NavLink>
        </div>
      </section>

      {/* ── Editorial Gallery ── */}
      <section className="osai-gallery-section">
        <div className="osai-gallery-header">
          <h2>Wear Your Style</h2>
          <NavLink
            to="/mens"
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              transition: "color 0.15s",
            }}
          >
            View All →
          </NavLink>
        </div>
        <div className="osai-gallery-grid">
          {galleryImages.map((img, i) => (
            <div className="osai-gallery-grid-item" key={i}>
              <img src={img.src} alt={img.alt} loading="lazy" />
            </div>
          ))}
>>>>>>> deploy-branch
        </div>
      </section>
    </>
  );
}
