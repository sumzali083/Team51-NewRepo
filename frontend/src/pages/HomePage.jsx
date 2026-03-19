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
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, var(--hero-overlay-start) 0%, var(--hero-overlay-mid) 40%, var(--hero-overlay-bottom) 75%, var(--hero-overlay-end) 100%)",
    pointerEvents: "none",
  },
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
      <section style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border)" }}>
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
                  filter: "brightness(1)",
                }}
              />
              <div style={s3.overlay} />
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
        background: "#f0f0f0",
        width: "100%",
      }}>
        <div style={{
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
            color: "var(--text-primary)",
            margin: 0,
          }}>
            <span style={{ display: "block", ...fromLeft }}>Wear</span>
            <span style={{ display: "block", color: "var(--earth-shade, var(--text-ghost, var(--text-muted)))", ...fromRight, transitionDelay: "0.12s" }}>Your</span>
            <span style={{ display: "block", ...fromLeft, transitionDelay: "0.22s" }}>Story.</span>
          </h1>
        </div>
        <div style={{ paddingTop: 16, maxWidth: 480, ...bodyReveal }}>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
            OSAI is one of the leading companies in the fashion industry.
            Pure fashion created from the finest Japanese fibers — hand-woven
            and tailor-made for every body type.
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.8, marginBottom: 36 }}>
            From kids to adults, daily wear to timeless pieces, we have it all.
            You will always find something for everyone with us.
          </p>
          <NavLink
            to="/about"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              border: "1px solid #000",
              background: "#000",
              color: "#fff",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#FA5400";
              e.currentTarget.style.borderColor = "#FA5400";
              e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#000";
              e.currentTarget.style.borderColor = "#000";
              e.currentTarget.style.color = "#fff";
            }}
          >
            Our Story →
          </NavLink>
        </div>
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
              color: "var(--text-muted)",
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
        </div>
      </section>
    </>
  );
}
