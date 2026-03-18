import { useEffect, useState, useMemo, useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import api from "../api";
import { PRODUCTS, Fallback } from "../data";

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const GENDER_OPTIONS = [
  { label: "Men",   value: "Mens" },
  { label: "Women", value: "Womens" },
  { label: "Kids",  value: "Kids" },
];

const COLOR_CSS = {
  black: "#111111", white: "#f5f5f5", red: "#e53935", blue: "#1565c0",
  navy: "#0d1b4b", green: "#2e7d32", grey: "#757575", gray: "#757575",
  beige: "#d4b896", cream: "#f5f0e8", brown: "#6d4c41", pink: "#ec407a",
  purple: "#7b1fa2", yellow: "#f9a825", orange: "#e65100", khaki: "#b5a642",
  lilac: "#c5b3e6", teal: "#00695c", burgundy: "#6d1a2e", coral: "#ff6b6b",
};

function colorToCss(name) {
  if (!name) return null;
  const k = name.toLowerCase();
  if (k === "multi" || k === "multicolour" || k === "multicolor") return "multi";
  return COLOR_CSS[k] ?? null;
}

function AccordionSection({ title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "13px 0", background: "none",
          border: "none", cursor: "pointer", color: "#fff",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
        }}
      >
        <span>
          {title}
          {badge ? <span style={{ marginLeft: 6, color: "#aaa", fontWeight: 400 }}>({badge})</span> : null}
        </span>
        <i className={`bi bi-chevron-${open ? "up" : "down"}`} style={{ fontSize: 11, color: "#666" }} />
      </button>
      {open && <div style={{ paddingBottom: 14 }}>{children}</div>}
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

export function AllProductsPage() {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);

  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [hoveredId, setHoveredId]   = useState(null);
  const [cartMsg, setCartMsg]       = useState("");
  const [cartMsgType, setCartMsgType] = useState("success");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortOpen, setSortOpen]     = useState(false);

  // ── Filters ──────────────────────────────────────────────────────────
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [minPrice, setMinPrice]   = useState("");
  const [maxPrice, setMaxPrice]   = useState("");
  const [saleOnly, setSaleOnly]   = useState(false);
  const [selectedSizes, setSelectedSizes]   = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy]       = useState("featured");

  // ── Fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get("/api/products", { params: { cat: "all" } })
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

  // ── Active filter count ───────────────────────────────────────────────
  const activeFilters =
    (selectedGenders.length > 0 ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
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

    if (minPrice !== "")
      list = list.filter(p => Number(p.price) >= Number(minPrice));

    if (maxPrice !== "")
      list = list.filter(p => Number(p.price) <= Number(maxPrice));

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

    return list;
  }, [products, selectedGenders, saleOnly, minPrice, maxPrice, selectedSizes, selectedColors, minRating, sortBy]);

  const clearAll = () => {
    setSelectedGenders([]); setMinPrice(""); setMaxPrice("");
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
      background: "#0d0d0d",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 4,
      padding: "0 18px",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "15px 0", borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>
          Filters {activeFilters > 0 && <span style={{ color: "#666" }}>({activeFilters})</span>}
        </span>
        {activeFilters > 0 && (
          <button onClick={clearAll} style={{
            background: "none", border: "none", color: "#666", fontSize: 10,
            cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            Clear all
          </button>
        )}
      </div>

      {/* Gender */}
      <AccordionSection title="Gender" badge={selectedGenders.length || null} defaultOpen>
        {GENDER_OPTIONS.map(({ label, value }) => (
          <label key={value} style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
            cursor: "pointer", fontSize: 13,
            color: selectedGenders.includes(value) ? "#fff" : "#888",
          }}>
            <input
              type="checkbox"
              checked={selectedGenders.includes(value)}
              onChange={() => toggle(setSelectedGenders, value)}
              style={{ width: 15, height: 15, accentColor: "#fff", cursor: "pointer", flexShrink: 0 }}
            />
            {label}
          </label>
        ))}
      </AccordionSection>

      {/* Price Range */}
      <AccordionSection title="Shop By Price" badge={(minPrice || maxPrice) ? 1 : null}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="number" placeholder="Min" value={minPrice}
            onChange={e => setMinPrice(e.target.value)} min={0}
            style={{
              width: "100%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 3, color: "#fff", padding: "7px 10px", fontSize: 13, outline: "none",
            }}
          />
          <span style={{ color: "#444", flexShrink: 0, fontSize: 12 }}>–</span>
          <input
            type="number" placeholder="Max" value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)} min={0}
            style={{
              width: "100%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 3, color: "#fff", padding: "7px 10px", fontSize: 13, outline: "none",
            }}
          />
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: "#555" }}>
          £0 – £{priceMax || "∞"}
        </div>
      </AccordionSection>

      {/* Sale */}
      <AccordionSection title="Sale & Offers" badge={saleOnly ? 1 : null}>
        <label style={{
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          fontSize: 13, color: saleOnly ? "#fff" : "#888",
        }}>
          <input
            type="checkbox" checked={saleOnly} onChange={e => setSaleOnly(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: "#fff", cursor: "pointer", flexShrink: 0 }}
          />
          On Sale Only
          <span style={{
            marginLeft: 4, background: "#e53935", color: "#fff",
            fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 2, letterSpacing: "0.06em",
          }}>SALE</span>
        </label>
      </AccordionSection>

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
                  border: `1px solid ${active ? "#fff" : "rgba(255,255,255,0.12)"}`,
                  background: active ? "#fff" : "transparent",
                  color: active ? "#000" : "#777",
                  borderRadius: 2, cursor: "pointer", transition: "all 0.15s",
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
        {[4, 3, 2, 1].map(r => (
          <label key={r} style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
            cursor: "pointer", fontSize: 13, color: minRating === r ? "#fff" : "#888",
          }}>
            <input
              type="radio" name="rating"
              checked={minRating === r}
              onChange={() => setMinRating(minRating === r ? 0 : r)}
              style={{ accentColor: "#fff", cursor: "pointer", flexShrink: 0 }}
            />
            <span style={{ color: "#f9a825", letterSpacing: 1 }}>{"★".repeat(r)}</span>
            <span style={{ color: "#444", letterSpacing: 1 }}>{"★".repeat(4 - r)}</span>
            <span style={{ color: "#666", fontSize: 11 }}>&amp; up</span>
          </label>
        ))}
      </AccordionSection>

      {/* Colour */}
      <AccordionSection title="Colour" badge={selectedColors.length || null}>
        {availableColors.length === 0 ? (
          <p style={{ color: "#555", fontSize: 12, margin: 0 }}>No colour data available</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {availableColors.map(color => {
              const css = colorToCss(color);
              const active = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  onClick={() => toggle(setSelectedColors, color)}
                  title={color}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 9px", fontSize: 11, borderRadius: 2, cursor: "pointer",
                    border: `1px solid ${active ? "#fff" : "rgba(255,255,255,0.12)"}`,
                    background: active ? "rgba(255,255,255,0.08)" : "transparent",
                    color: active ? "#fff" : "#888", transition: "all 0.15s",
                  }}
                >
                  {css && (
                    <span style={{
                      width: 11, height: 11, borderRadius: "50%", flexShrink: 0,
                      background: css === "multi"
                        ? "linear-gradient(135deg,#e53935 25%,#1565c0 50%,#2e7d32 75%,#f9a825)"
                        : css,
                      border: color.toLowerCase() === "white" || color.toLowerCase() === "cream"
                        ? "1px solid rgba(255,255,255,0.25)" : "none",
                    }} />
                  )}
                  {color}
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
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 4 }}>All Products</h2>
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

      {/* Mobile filter toggle bar */}
      <div className="d-flex justify-content-between align-items-center mb-3 d-lg-none">
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            background: "none", border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff", padding: "7px 14px", borderRadius: 3, fontSize: 12,
            fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <i className="bi bi-sliders" />
          Filters {activeFilters > 0 && `(${activeFilters})`}
        </button>

        {/* Sort — mobile */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setSortOpen(o => !o)}
            style={{
              background: "none", border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff", padding: "7px 14px", borderRadius: 3, fontSize: 12,
              fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            Sort <i className={`bi bi-chevron-${sortOpen ? "up" : "down"}`} style={{ fontSize: 11 }} />
          </button>
          {sortOpen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 200,
              background: "#111", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 4, minWidth: 180, padding: "6px 0",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}>
              {SORT_OPTIONS.map(({ value, label }) => (
                <button key={value} onClick={() => { setSortBy(value); setSortOpen(false); }}
                  style={{
                    width: "100%", textAlign: "left", background: sortBy === value ? "rgba(255,255,255,0.08)" : "transparent",
                    border: "none", padding: "9px 16px", cursor: "pointer",
                    color: sortBy === value ? "#fff" : "#888", fontWeight: sortBy === value ? 600 : 400,
                    fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase",
                  }}
                >{label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.7)", display: "flex",
          }}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            style={{
              width: 290, height: "100%", overflowY: "auto",
              background: "#0d0d0d", padding: "20px 18px",
              boxShadow: "4px 0 24px rgba(0,0,0,0.8)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>Filters</span>
              <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main layout */}
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>

        {/* Desktop sidebar */}
        <div className="d-none d-lg-block" style={{ width: 260, flexShrink: 0, position: "sticky", top: 90 }}>
          {sidebarContent}

          {/* Sort — desktop */}
          <div style={{ marginTop: 16 }}>
            <div style={{
              background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4, padding: "0 18px",
            }}>
              <div style={{ padding: "15px 0 0", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>
                Sort By
              </div>
              <div style={{ padding: "10px 0 14px", display: "flex", flexDirection: "column", gap: 2 }}>
                {SORT_OPTIONS.map(({ value, label }) => (
                  <button key={value} onClick={() => setSortBy(value)}
                    style={{
                      textAlign: "left", background: sortBy === value ? "rgba(255,255,255,0.06)" : "transparent",
                      border: "none", padding: "7px 0", cursor: "pointer",
                      color: sortBy === value ? "#fff" : "#666",
                      fontWeight: sortBy === value ? 600 : 400,
                      fontSize: 12, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    {sortBy === value && <span style={{ width: 3, height: 12, background: "#fff", borderRadius: 2, display: "inline-block" }} />}
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
                  <motion.div key={product.id} className="col-6 col-md-4 col-xl-3" variants={cardVariants}>
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
                              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>£{price.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>£{price.toFixed(2)}</span>
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
