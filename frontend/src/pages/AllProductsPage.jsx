import { useEffect, useState, useMemo, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import api from "../api";
import { PRODUCTS, Fallback } from "../data";

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const FILTER_ACCENT = "var(--filter-accent, #fff)";
const FILTER_RADIUS = "var(--filter-radius, 4px)";
const GENDER_OPTIONS = [
  { label: "Male",   value: "Mens" },
  { label: "Female", value: "Womens" },
  { label: "Kids",   value: "Kids" },
];

const COLOR_CSS = {
  // Basics
  black: "#111111", white: "#f5f5f5", red: "#e53935", blue: "#1e88e5",
  navy: "#0d1b4b", green: "#2e7d32", grey: "#757575", gray: "#757575",
  beige: "#d4b896", cream: "#f5f0e8", brown: "#6d4c41", pink: "#ec407a",
  purple: "#7b1fa2", yellow: "#f9a825", orange: "#e65100", khaki: "#b5a642",
  lilac: "#c5b3e6", teal: "#00695c", burgundy: "#6d1a2e", coral: "#ff6b6b",
  // Extended palette
  berry: "#8b1a4a",
  "bright white": "#ffffff",
  charcoal: "#3c3c3c",
  cinder: "#2a2a2a",
  "dusty terracotta": "#c17f6a",
  fig: "#6b3050",
  fog: "#d0cfc8",
  forest: "#2d5a27",
  "forest green": "#2d5a27",
  "grey marl": "#9e9e9e",
  ink: "#1c2340",
  "light wash": "#b8ccd8",
  moon: "#d8d5c8",
  oat: "#e8d9c0",
  "olive green": "#6b7c45",
  "orange & navy": "linear-gradient(135deg,#e65100 50%,#0d1b4b 50%)",
  pine: "#2d4a38",
  sage: "#8fa67a",
  "sky blue": "#87ceeb",
  "slate blue": "#6a7fbd",
  "soft white": "#f8f4ef",
  "stone beige": "#c5b49a",
  "washed black & grey": "linear-gradient(135deg,#222 50%,#888 50%)",
  "washed brown & tan": "linear-gradient(135deg,#6d4c41 50%,#c9aa7c 50%)",
  "washed yellow": "#e8d060",
  "red & black": "linear-gradient(135deg,#e53935 50%,#111 50%)",
  "light grey": "#c0c0c0",
  "dark green": "#1b4d2e",
  "dark navy": "#0a1128",
  "mid blue": "#4a7bb5",
  "pale blue": "#b8d0e8",
  "electric blue": "#0066ff",
  camel: "#c19a6b",
  sand: "#d4b896",
  tan: "#c9aa7c",
  ivory: "#fffff0",
  ecru: "#e8dcc8",
  indigo: "#3949ab",
  turquoise: "#00bcd4",
  aqua: "#00bcd4",
  mint: "#98ff98",
  gold: "#ffc107",
  silver: "#bdbdbd",
  rust: "#b7410e",
  wine: "#722f37",
  plum: "#8e4585",
  rose: "#ff7f7f",
  blush: "#ffb6c1",
  peach: "#ffcba4",
  mustard: "#ffdb58",
  lemon: "#fff44f",
  lime: "#cddc39",
  olive: "#808000",
  slate: "#708090",
  denim: "#1560bd",
};

function colorToCss(name) {
  if (!name) return null;
  const k = name.toLowerCase().trim();
  if (k === "multi" || k === "multicolour" || k === "multicolor" || k === "multi-colour") return "multi";
  return COLOR_CSS[k] ?? null;
}

function isLight(name) {
  const light = ["white","bright white","soft white","cream","ivory","ecru","fog","moon","oat","lemon","mint","pale blue","silver","light wash","light grey","washed yellow"];
  return light.includes((name || "").toLowerCase().trim());
}

function AccordionSection({ title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid #000" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "15px 0", background: "none",
          border: "none", cursor: "pointer", color: "#000",
          fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {title}
          {badge ? (
            <span style={{
              background: "#000", color: "#fff", borderRadius: "50%",
              width: 18, height: 18, display: "inline-flex", alignItems: "center",
              justifyContent: "center", fontSize: 10, fontWeight: 700,
            }}>{badge}</span>
          ) : null}
        </span>
        <i className={`bi bi-chevron-${open ? "up" : "down"}`} style={{ fontSize: 11, color: "#000" }} />
      </button>
      {open && <div style={{ paddingBottom: 16 }}>{children}</div>}
    </div>
  );
}


function DualRangeSlider({ min, max, minVal, maxVal, onMinChange, onMaxChange }) {
  const fillRef = useRef(null);

  useEffect(() => {
    if (!fillRef.current || max === min) return;
    const lo = ((minVal - min) / (max - min)) * 100;
    const hi = ((maxVal - min) / (max - min)) * 100;
    fillRef.current.style.left  = `${lo}%`;
    fillRef.current.style.width = `${hi - lo}%`;
  }, [min, max, minVal, maxVal]);

  return (
    <div style={{ paddingTop: 4 }}>
      <style>{`
        .osai-range-slider {
          -webkit-appearance: none; appearance: none;
          position: absolute; left: 0; top: 50%;
          transform: translateY(-50%);
          width: 100%; height: 0;
          background: transparent; pointer-events: none;
          outline: none; margin: 0;
        }
        .osai-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 16px; height: 16px; border-radius: 3px;
          background: #111; border: 2px solid var(--filter-accent, #fff);
          cursor: pointer; pointer-events: all;
        }
        .osai-range-slider::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 3px;
          background: #111; border: 2px solid var(--filter-accent, #fff);
          cursor: pointer; pointer-events: all; box-sizing: border-box;
        }
      `}</style>

      {/* Track */}
      <div style={{ position: "relative", height: 24, margin: "8px 0" }}>
        <div style={{
          position: "absolute", top: "50%", left: 0, right: 0,
          height: 2, background: "rgba(255,255,255,0.15)",
          transform: "translateY(-50%)", borderRadius: 1,
        }} />
        <div ref={fillRef} style={{
          position: "absolute", top: "50%", height: 2,
          background: FILTER_ACCENT, transform: "translateY(-50%)", borderRadius: 1,
        }} />
        <input
          type="range" className="osai-range-slider"
          min={min} max={max} value={minVal}
          style={{ zIndex: minVal > max * 0.9 ? 5 : 3 }}
          onChange={e => onMinChange(Math.min(Number(e.target.value), maxVal - 1))}
        />
        <input
          type="range" className="osai-range-slider"
          min={min} max={max} value={maxVal}
          style={{ zIndex: 4 }}
          onChange={e => onMaxChange(Math.max(Number(e.target.value), minVal + 1))}
        />
      </div>

      {/* Value labels */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa", marginTop: 4 }}>
        <span>£{minVal}</span>
        <span>£{maxVal}</span>
      </div>
    </div>
  );
}

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function FilteredProductPage({ cat = "all", pageTitle = "All Products", showCategory = true, showSale = true }) {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);

  const stickyCenterOffsetByCategory = {
    all: 300,
    men: 285,
    mens: 285,
    women: 285,
    womens: 285,
    kids: 265,
    sale: 295,
    new: 295,
    newarrivals: 295,
  };
  const stickyCenterOffset =
    stickyCenterOffsetByCategory[String(cat || "all").toLowerCase()] ?? 290;

  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [hoveredId, setHoveredId]   = useState(null);
  const [cartMsg, setCartMsg]       = useState("");
  const [cartMsgType, setCartMsgType] = useState("success");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortOpen, setSortOpen]     = useState(false);

  // ── Filters ──────────────────────────────────────────────────────────
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [sliderMin, setSliderMin] = useState(0);
  const [sliderMax, setSliderMax] = useState(500);
  const [sliderBound, setSliderBound] = useState(500);
  const [saleOnly, setSaleOnly]   = useState(false);
  const [selectedSizes, setSelectedSizes]   = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy]       = useState("featured");

  // Lock body scroll when mobile filter sheet is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  // ── Fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get("/api/products", { params: { cat } })
      .then(res => { if (!cancelled) setProducts(res.data || []); })
      .catch(() => { if (!cancelled) setProducts(PRODUCTS); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // ── Derived filter options from data ──────────────────────────────────
  const availableColors = useMemo(() => {
    const set = new Set();
    products.forEach(p => (p.colors || []).forEach(c => { if (c?.trim()) set.add(c.trim()); }));
    return [...set].sort();
  }, [products]);

  const availableSizes = useMemo(() => {
    const set = new Set();
    products.forEach(p => (p.sizes || []).forEach(s => { if (s?.trim()) set.add(s.trim()); }));
    const ordered = STANDARD_SIZES.filter(s => set.has(s));
    set.forEach(s => { if (!STANDARD_SIZES.includes(s)) ordered.push(s); });
    return ordered.length ? ordered : STANDARD_SIZES;
  }, [products]);

  const priceMax = useMemo(() =>
    Math.ceil(Math.max(0, ...products.map(p => Number(p.price) || 0)) / 10) * 10,
  [products]);

  // Initialise slider bounds once products load
  useEffect(() => {
    if (priceMax > 0) {
      setSliderBound(priceMax);
      setSliderMax(prev => prev === 500 || prev > priceMax ? priceMax : prev);
    }
  }, [priceMax]);

  // ── Active filter count ───────────────────────────────────────────────
  const activeFilters =
    (selectedGenders.length > 0 ? 1 : 0) +
    (sliderMin > 0 || sliderMax < sliderBound ? 1 : 0) +
    (saleOnly ? 1 : 0) +
    (selectedSizes.length > 0 ? 1 : 0) +
    (selectedColors.length > 0 ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  // ── Filter + sort ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...products];

    if (selectedGenders.length > 0)
      list = list.filter(p => selectedGenders.includes(p.category));

    if (saleOnly)
      list = list.filter(p => p.originalPrice || p.original_price);

    if (sliderMin > 0)
      list = list.filter(p => Number(p.price) >= sliderMin);

    if (sliderMax < sliderBound)
      list = list.filter(p => Number(p.price) <= sliderMax);

    if (selectedSizes.length > 0)
      list = list.filter(p => (p.sizes || []).some(s => selectedSizes.includes(s)));

    if (selectedColors.length > 0)
      list = list.filter(p => (p.colors || []).some(c => selectedColors.includes(c?.trim())));

    if (minRating > 0)
      list = list.filter(p => Number(p.avg_rating || 0) >= minRating);

    if (sortBy === "price-low-high") list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === "price-high-low") list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sortBy === "newest") list.sort((a, b) => Number(b.db_id || b.id) - Number(a.db_id || a.id));
    else if (sortBy === "rating") list.sort((a, b) => Number(b.avg_rating || 0) - Number(a.avg_rating || 0));
    else {
      // Interleave by category so products from different categories are mixed
      const buckets = {};
      list.forEach(p => {
        const cat = (p.category || "other").toLowerCase();
        if (!buckets[cat]) buckets[cat] = [];
        buckets[cat].push(p);
      });
      const keys = Object.keys(buckets);
      const interleaved = [];
      const maxLen = Math.max(...keys.map(k => buckets[k].length));
      for (let i = 0; i < maxLen; i++) {
        keys.forEach(k => { if (buckets[k][i]) interleaved.push(buckets[k][i]); });
      }
      list = interleaved;
    }

    return list;
  }, [products, selectedGenders, saleOnly, sliderMin, sliderMax, sliderBound, selectedSizes, selectedColors, minRating, sortBy]);

  const clearAll = () => {
    setSelectedGenders([]);
    setSliderMin(0); setSliderMax(sliderBound);
    setSaleOnly(false); setSelectedSizes([]); setSelectedColors([]); setMinRating(0);
  };

  const toggle = (setter, val) =>
    setter(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const handleAddToCart = async (product) => {
    const result = await addToCart(product);
    if (result?.message) {
      setCartMsg(result.message);
      setCartMsgType(result.ok ? "success" : "danger");
      setTimeout(() => setCartMsg(""), 3000);
    }
  };

  // ── Sidebar content ───────────────────────────────────────────────────
  const sidebarContent = (
    <div style={{
      background: "#f0f0f0",
      border: "1px solid #000",
      borderRadius: FILTER_RADIUS,
      padding: "0 18px",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "15px 0", borderBottom: "1px solid #000",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#000" }}>
          Filters {activeFilters > 0 && <span style={{ color: "#000" }}>({activeFilters})</span>}
        </span>
        {activeFilters > 0 && (
          <button onClick={clearAll} style={{
            background: "none", border: "none", color: "#000", fontSize: 10,
            cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            Clear all
          </button>
        )}
      </div>

      {/* Category — hidden on single-category pages like Mens */}
      {showCategory && <AccordionSection title="Category" badge={selectedGenders.length || null} defaultOpen>
        <div style={{ display: "flex", gap: 8 }}>
          {GENDER_OPTIONS.map(({ label, value }) => {
            const active = selectedGenders.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggle(setSelectedGenders, value)}
                style={{
                  flex: 1, padding: "9px 0", fontSize: 12, fontWeight: 600,
                  letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
                  border: `1px solid ${active ? "#FA5400" : "#000"}`,
                  background: active ? "#FA5400" : "transparent",
                  color: active ? "#fff" : "#000",
                  borderRadius: FILTER_RADIUS, transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </AccordionSection>}

      {/* Price Range */}
      <AccordionSection title="Shop By Price" badge={(sliderMin > 0 || sliderMax < sliderBound) ? 1 : null}>
        <DualRangeSlider
          min={0} max={sliderBound || 500}
          minVal={sliderMin} maxVal={sliderMax}
          onMinChange={setSliderMin} onMaxChange={setSliderMax}
        />
      </AccordionSection>

      {/* Sale */}
      {showSale && <AccordionSection title="Sale & Offers" badge={saleOnly ? 1 : null}>
        <button
          onClick={() => setSaleOnly(o => !o)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 12px", cursor: "pointer", borderRadius: FILTER_RADIUS,
            border: `1px solid ${saleOnly ? "#FA5400" : "#000"}`,
            background: saleOnly ? "#FA5400" : "transparent",
            color: saleOnly ? "#fff" : "#000",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: saleOnly ? 600 : 400 }}>On Sale Only</span>
          <span style={{
            background: "#e53935", color: "#fff",
            fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 2, letterSpacing: "0.08em",
          }}>SALE</span>
        </button>
      </AccordionSection>}

      {/* Size */}
      <AccordionSection title="Size" badge={selectedSizes.length || null}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {availableSizes.map(size => {
            const active = selectedSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => toggle(setSelectedSizes, size)}
                style={{
                  padding: "5px 10px", fontSize: 11, fontWeight: 600,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  border: `1px solid ${active ? "#FA5400" : "#000"}`,
                  background: active ? "#FA5400" : "transparent",
                  color: active ? "#fff" : "#000",
                  borderRadius: FILTER_RADIUS, cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </AccordionSection>

      {/* Rating */}
      <AccordionSection title="Rating" badge={minRating > 0 ? 1 : null}>
        {[4, 3, 2, 1].map(r => {
          const active = minRating === r;
          return (
            <button
              key={r}
              onClick={() => setMinRating(active ? 0 : r)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", marginBottom: 6, padding: "7px 10px",
                  background: active ? "#FA5400" : "transparent",
                  border: `1px solid ${active ? "#FA5400" : "transparent"}`,
                borderRadius: FILTER_RADIUS, cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              <span style={{ color: "#f9a825", letterSpacing: 2, fontSize: 13 }}>{"★".repeat(r)}</span>
              <span style={{ color: "#d0d0d0", letterSpacing: 2, fontSize: 13 }}>{"★".repeat(4 - r)}</span>
              <span style={{ color: active ? "#fff" : "#000", fontSize: 11, fontFamily: "var(--font-body)" }}>&amp; up</span>
            </button>
          );
        })}
      </AccordionSection>

      {/* Colour */}
      <AccordionSection title="Colour" badge={selectedColors.length || null}>
        {availableColors.length === 0 ? (
          <p style={{ color: "#000", fontSize: 12, margin: 0 }}>No colour data available</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {availableColors.map(color => {
              const css = colorToCss(color);
              const active = selectedColors.includes(color);
              const light = isLight(color);
              const isMulti = css === "multi";
              const swatchBg = isMulti
                ? "linear-gradient(135deg,#e53935 25%,#1565c0 50%,#2e7d32 75%,#f9a825)"
                : (css || "rgba(255,255,255,0.08)");
              return (
                <button
                  key={color}
                  onClick={() => toggle(setSelectedColors, color)}
                  title={color}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    padding: 0, background: "none", border: "none", cursor: "pointer",
                    width: 52,
                  }}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: "50%", display: "block",
                    background: swatchBg,
                    border: active
                      ? `2px solid #FA5400`
                      : light
                        ? "1px solid #000"
                        : "1px solid #000",
                    boxShadow: active ? `0 0 0 2px color-mix(in srgb, #FA5400 25%, transparent)` : "none",
                    transition: "all 0.15s",
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 9, color: active ? "#FA5400" : "#000",
                    textAlign: "center", lineHeight: 1.2,
                    fontFamily: "var(--font-body)", letterSpacing: "0.02em",
                    wordBreak: "break-word", maxWidth: 52,
                  }}>
                    {color}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </AccordionSection>
    </div>
  );

  // ── Sort options ──────────────────────────────────────────────────────
  const SORT_OPTIONS = [
    { value: "featured",       label: "Featured" },
    { value: "newest",         label: "Newest" },
    { value: "price-low-high", label: "Price: Low–High" },
    { value: "price-high-low", label: "Price: High–Low" },
    { value: "rating",         label: "Top Rated" },
  ];

  return (
    <div className="container-fluid" style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 20px 60px" }}>

      {/* Page heading */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 4 }}>{pageTitle}</h2>
        {!loading && (
          <p style={{ color: "#666", fontSize: 13, margin: 0 }}>
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
            {activeFilters > 0 ? " — filters applied" : ""}
          </p>
        )}
      </div>

      {cartMsg && (
        <div className={`alert alert-${cartMsgType} mb-3`} role="alert">{cartMsg}</div>
      )}

      {/* Mobile filter/sort bar */}
      <div className="d-lg-none" style={{
        display: "flex", gap: 8, marginBottom: 16,
      }}>
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            minHeight: 44, background: activeFilters > 0 ? FILTER_ACCENT : "transparent",
            border: `1px solid ${activeFilters > 0 ? FILTER_ACCENT : "rgba(255,255,255,0.2)"}`,
            color: activeFilters > 0 ? "#111" : FILTER_ACCENT,
            borderRadius: FILTER_RADIUS, fontFamily: "var(--font-display)", fontSize: 14,
            fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
          }}
        >
          <i className="bi bi-sliders" />
          Filters {activeFilters > 0 && `(${activeFilters})`}
        </button>

        <div style={{ position: "relative", flex: 1 }}>
          <button
            onClick={() => setSortOpen(o => !o)}
            style={{
              width: "100%", minHeight: 44, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8,
              background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
              color: FILTER_ACCENT, borderRadius: FILTER_RADIUS, fontFamily: "var(--font-display)", fontSize: 14,
              fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
            }}
          >
            <i className="bi bi-arrow-down-up" style={{ fontSize: 12 }} />
            Sort
          </button>
          {sortOpen && (
            <div style={{
              position: "absolute", left: 0, right: 0, top: "calc(100% + 4px)", zIndex: 200,
              background: "#111", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: FILTER_RADIUS, padding: "4px 0", boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
            }}>
              {SORT_OPTIONS.map(({ value, label }) => (
                <button key={value} onClick={() => { setSortBy(value); setSortOpen(false); }}
                  style={{
                    width: "100%", textAlign: "left", minHeight: 44,
                    background: sortBy === value ? "rgba(255,255,255,0.08)" : "transparent",
                    border: "none", padding: "12px 16px", cursor: "pointer",
                    color: sortBy === value ? FILTER_ACCENT : "#888",
                    fontFamily: "var(--font-body)", fontSize: 13,
                    fontWeight: sortBy === value ? 600 : 400,
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  {sortBy === value && <span style={{ width: 3, height: 12, background: FILTER_ACCENT, borderRadius: 2, display: "inline-block", flexShrink: 0 }} />}
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 400,
            background: "rgba(0,0,0,0.65)",
            WebkitBackdropFilter: "blur(2px)", backdropFilter: "blur(2px)",
          }}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              maxHeight: "85dvh", background: "#0d0d0d",
              borderRadius: "16px 16px 0 0",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.8)",
              display: "flex", flexDirection: "column",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px", flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
            </div>

            {/* Sheet header */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 20px 12px", flexShrink: 0,
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}>
              <span style={{
                fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase", color: FILTER_ACCENT,
              }}>
                Filters {activeFilters > 0 && <span style={{ color: "#888" }}>({activeFilters})</span>}
              </span>
              {activeFilters > 0 && (
                <button onClick={clearAll} style={{
                  background: "none", border: "none", color: "#888",
                  fontFamily: "var(--font-body)", fontSize: 12, cursor: "pointer",
                  padding: "8px 0", letterSpacing: "0.06em",
                }}>
                  Clear all
                </button>
              )}
            </div>

            {/* Filter content — scrollable */}
            <div style={{ padding: "0 20px", overflowY: "auto", flex: 1, WebkitOverflowScrolling: "touch" }}>
              {sidebarContent}
            </div>

            {/* Sticky apply button */}
            <div style={{
              padding: "12px 20px", flexShrink: 0,
              borderTop: "1px solid rgba(255,255,255,0.07)",
              background: "#0d0d0d",
            }}>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  width: "100%", minHeight: 48, background: FILTER_ACCENT, color: "#111",
                  border: "none", borderRadius: FILTER_RADIUS, cursor: "pointer",
                  fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                }}
              >
                View {filtered.length} {filtered.length === 1 ? "Product" : "Products"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>

        {/* Desktop sidebar */}
        <div
          className="d-none d-lg-block"
          style={{
            "--filters-sticky-top": `max(calc(var(--nav-h, 80px) + 10px), calc(50vh - ${stickyCenterOffset}px))`,
            width: 260,
            flexShrink: 0,
            position: "sticky",
            top: "var(--filters-sticky-top)",
            alignSelf: "flex-start",
            maxHeight: "calc(100vh - var(--filters-sticky-top) - 10px)",
            overflowY: "auto",
          }}
        >
          {sidebarContent}

          {/* Sort — desktop */}
          <div style={{ marginTop: 16 }}>
            <div style={{
              background: "#f0f0f0", border: "1px solid #000",
              borderRadius: FILTER_RADIUS, padding: "0 18px",
            }}>
              <div style={{ padding: "15px 0 0", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#000" }}>
                Sort By
              </div>
              <div style={{ padding: "10px 0 14px", display: "flex", flexDirection: "column", gap: 2 }}>
                {SORT_OPTIONS.map(({ value, label }) => (
                  <button key={value} onClick={() => setSortBy(value)}
                    style={{
                      textAlign: "left", background: sortBy === value ? "transparent" : "transparent",
                      border: "none", padding: "7px 0", cursor: "pointer",
                      color: sortBy === value ? "#FA5400" : "#000",
                      fontWeight: sortBy === value ? 600 : 400,
                      fontSize: 12, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    {sortBy === value && <span style={{ width: 3, height: 12, background: "#FA5400", borderRadius: 2, display: "inline-block" }} />}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={{ color: "#666", padding: "60px 0", textAlign: "center" }}>Loading products…</div>
          ) : filtered.length === 0 ? (
            <div style={{ color: "#666", padding: "60px 0", textAlign: "center" }}>
              <i className="bi bi-search" style={{ fontSize: 32, display: "block", marginBottom: 12 }} />
              No products match your filters.
              {activeFilters > 0 && (
                <button onClick={clearAll} style={{
                  display: "block", margin: "14px auto 0", background: "none",
                  border: "1px solid rgba(255,255,255,0.15)", color: "#fff",
                  padding: "8px 20px", borderRadius: 3, cursor: "pointer", fontSize: 12,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                }}>Clear Filters</button>
              )}
            </div>
          ) : (
            <motion.div
              className="row g-4"
              variants={gridVariants}
              initial="hidden"
              animate="visible"
            >
              {filtered.map(product => {
                const img = product.image || product.image_url || product.images?.[0] || Fallback;
                const hoverImg = product.images?.[1] || img;
                const isHovered = hoveredId === product.id;
                const price = Number(product.price || 0);
                const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
                const discountPct = originalPrice ? Math.round((1 - price / originalPrice) * 100) : null;
                const stock = Number(product.stock);
                const isSoldOut = Number.isFinite(stock) && stock <= 0;
                const isLowStock = Number.isFinite(stock) && stock > 0 && stock <= 5;
                const rating = product.avg_rating ? Number(product.avg_rating) : null;

                return (
                  <motion.div key={product.id} className="col-12 col-sm-6 col-md-4" variants={cardVariants}>
                    <div className="card h-100 shadow-sm">
                      <Link
                        to={`/product/${product.id}`}
                        className="text-decoration-none"
                        onMouseEnter={() => setHoveredId(product.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        <div style={{ position: "relative", overflow: "hidden" }}>
                          <img
                            src={img} alt={product.name}
                            style={{ width: "100%", display: "block", opacity: isHovered ? 0 : 1, transition: "opacity 0.4s ease" }}
                            onError={e => { e.target.src = Fallback; }}
                          />
                          <img
                            src={hoverImg} alt=""
                            style={{
                              position: "absolute", inset: 0, width: "100%", height: "100%",
                              objectFit: "cover", opacity: isHovered ? 1 : 0, transition: "opacity 0.4s ease",
                            }}
                            onError={e => { e.target.src = Fallback; }}
                          />
                          {discountPct && (
                            <span style={{
                              position: "absolute", top: 10, left: 10,
                              background: "#e53935", color: "#fff",
                              fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 2,
                            }}>-{discountPct}%</span>
                          )}
                        </div>
                      </Link>

                      <div className="card-body d-flex flex-column" style={{ padding: "12px 14px" }}>
                        <Link to={`/product/${product.id}`} className="text-decoration-none">
                          <h6 className="card-title mb-1" style={{ fontSize: 13, lineHeight: 1.3 }}>{product.name}</h6>
                        </Link>

                        {/* Rating stars */}
                        {rating && (
                          <div style={{ marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ color: "#f9a825", fontSize: 11 }}>
                              {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
                            </span>
                            <span style={{ color: "#555", fontSize: 10 }}>{rating.toFixed(1)}</span>
                          </div>
                        )}

                        {/* Price */}
                        <div style={{ marginBottom: 8 }}>
                          {originalPrice ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                              <span style={{ color: "#888", fontSize: 12, textDecoration: "line-through" }}>£{originalPrice.toFixed(2)}</span>
                              <span style={{ color: "var(--text)", fontWeight: 700, fontSize: 15 }}>£{price.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span style={{ color: "var(--text)", fontWeight: 700, fontSize: 15 }}>£{price.toFixed(2)}</span>
                          )}
                        </div>

                        {(isSoldOut || isLowStock) && (
                          <div className="mb-2">
                            {isSoldOut
                              ? <span className="osai-stock-pill osai-stock-pill-soldout">Sold out</span>
                              : <span className="osai-stock-pill osai-stock-pill-low">Low stock: {stock} left</span>
                            }
                          </div>
                        )}

                        <div className="d-grid gap-2 mt-auto">
                          <button className="btn btn-dark btn-sm" onClick={() => handleAddToCart(product)} disabled={isSoldOut}>
                            {isSoldOut ? "Sold Out" : "Add to Basket"}
                          </button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => addToWishlist(product)}>
                            ♡ Favourite
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AllProductsPage() { return <FilteredProductPage cat="all" pageTitle="All Products" showCategory />; }
