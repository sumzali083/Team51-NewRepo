import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CartContext } from "./context/CartContext";
import { WishlistContext } from "./context/WishlistContext";
import api from "./api";
import { PRODUCTS, Fallback } from "./data";

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function CategoryPage({ cat, pageTitle }) {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("featured");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const localById = React.useMemo(
    () => Object.fromEntries(PRODUCTS.map((p) => [String(p.id), p])),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch from backend API first
        const res = await api.get("/api/products", {
          params: { cat: cat || (pageTitle === "Mens" ? "men" : pageTitle === "Womens" ? "women" : pageTitle === "Kids" ? "kids" : pageTitle === "New Arrivals" ? "newarrivals" : pageTitle === "Sale" ? "sale" : pageTitle.toLowerCase()) },
        });

        if (!cancelled) {
          const apiProducts = (res.data || []).map((apiProduct) => {
            const localMatch =
              localById[String(apiProduct.id)] ||
              PRODUCTS.find((p) => p.name === apiProduct.name);

            if (!localMatch) return apiProduct;

            const hasImage =
              apiProduct.image ||
              apiProduct.image_url ||
              (Array.isArray(apiProduct.images) && apiProduct.images.length > 0);

            if (hasImage) return apiProduct;

            // Backfill missing media fields from local dataset
            return {
              ...apiProduct,
              image: localMatch.image || localMatch.images?.[0],
              images: localMatch.images || (localMatch.image ? [localMatch.image] : []),
            };
          });
          console.log("Products loaded from API:", apiProducts.length);
          
          // If API returns empty array (DB not connected), use fallback
          if (apiProducts.length === 0) {
            const catMap = { Mens: "men", Womens: "women", Kids: "kids", "New Arrivals": "newarrivals", Sale: "sale" };
            const catKey = catMap[pageTitle] || cat || pageTitle.toLowerCase();
            const localProducts = PRODUCTS.filter((p) => p.cat === catKey);
            console.log("API returned empty — using local PRODUCTS fallback:", localProducts.length);
            setProducts(localProducts);
          } else {
            setProducts(apiProducts);
          }
        }
      } catch (err) {
        console.error("API failed — using local PRODUCTS fallback", err);
        // Fallback to local data if API fails
        if (!cancelled) {
          const catMap = { Mens: "men", Womens: "women", Kids: "kids", "New Arrivals": "newarrivals", Sale: "sale" };
          const catKey = catMap[pageTitle] || cat || pageTitle.toLowerCase();

          if (catKey === "newarrivals" || catKey === "sale") {
            const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
            const menProducts = shuffle(PRODUCTS.filter((p) => p.cat === "men"));
            const womenProducts = shuffle(PRODUCTS.filter((p) => p.cat === "women"));
            const kidsProducts = shuffle(PRODUCTS.filter((p) => p.cat === "kids"));

            const mixed = [
              womenProducts[0],
              menProducts[0],
              kidsProducts[0],
              womenProducts[1],
              kidsProducts[1],
              menProducts[1],
            ].filter(Boolean);

            setProducts(mixed);
          } else {
            const localProducts = PRODUCTS.filter((p) => p.cat === catKey);
            setProducts(localProducts);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [cat, pageTitle]);

  // Apply sorting when products or sortBy changes
  useEffect(() => {
    let sorted = [...products];

    if (sortBy === "price-low-high") {
      sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "price-high-low") {
      sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === "newest") {
      sorted.sort((a, b) => {
        const aId = a.id ? String(a.id).charCodeAt(String(a.id).length - 1) : 0;
        const bId = b.id ? String(b.id).charCodeAt(String(b.id).length - 1) : 0;
        return bId - aId;
      });
    }

    setFilteredProducts(sorted);
  }, [products, sortBy]);

  const handleSortSelect = (option) => {
    setSortBy(option);
    setIsDropdownOpen(false);
  };

  if (loading) {
    return <div className="container mt-5">Loading products…</div>;
  }

  if (error) {
    return (
      <div className="container mt-5 text-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h2 className="mb-0 fw-bold">{pageTitle}</h2>

        <div className="d-flex align-items-center gap-2 position-relative">
          <i className="bi bi-funnel text-secondary" style={{ fontSize: '1.2rem' }}></i>

          <div className="dropdown">
            <button
              className="btn btn-outline-dark dropdown-toggle"
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
              style={{
                padding: '8px 16px',
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                background: 'transparent'
              }}
            >
              Sort By
            </button>

            {isDropdownOpen && (
              <div
                className="dropdown-menu show"
                style={{
                  display: 'block',
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  minWidth: '200px',
                  zIndex: 1000,
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  padding: '6px 0',
                  background: '#111'
                }}
              >
                {[
                  { value: 'featured',       label: 'Featured' },
                  { value: 'newest',         label: 'Newest' },
                  { value: 'price-high-low', label: 'Price: High–Low' },
                  { value: 'price-low-high', label: 'Price: Low–High' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    className="dropdown-item"
                    onClick={() => handleSortSelect(value)}
                    style={{
                      textAlign: 'left',
                      background: sortBy === value ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: 'none',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      color: sortBy === value ? '#fff' : '#888',
                      fontWeight: sortBy === value ? '600' : '400',
                      fontSize: '12px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      width: '100%',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <motion.div
        className="row g-4"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredProducts.map((product) => {
          const img = product.image || product.image_url || (product.images && product.images[0]) || Fallback;
          const hoverImg = (product.images && product.images[1]) || img;
          const isHovered = hoveredProductId === product.id;
          const price = Number(product.price || 0);

          return (
            <motion.div key={product.id} className="col-md-4" variants={cardVariants}>
              <div className="card h-100 shadow-sm">
                <Link
                  to={`/product/${product.id}`}
                  className="text-decoration-none"
                  onMouseEnter={() => setHoveredProductId(product.id)}
                  onMouseLeave={() => setHoveredProductId(null)}
                >
                  <div className="card-img-top" style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={img}
                      alt={product.name}
                      style={{
                        width: '100%',
                        display: 'block',
                        opacity: isHovered ? 0 : 1,
                        transition: 'opacity 0.45s ease',
                      }}
                      onError={(e) => { e.target.src = Fallback; }}
                    />
                    <img
                      src={hoverImg}
                      alt={`${product.name} alternate view`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.45s ease',
                      }}
                      onError={(e) => { e.target.src = Fallback; }}
                    />
                  </div>
                </Link>

                <div className="card-body d-flex flex-column">
                  <Link to={`/product/${product.id}`} className="text-decoration-none">
                    <h5 className="card-title">{product.name}</h5>
                  </Link>
                  <p className="card-text fw-bold" style={{ color: '#fff' }}>
                    £{price.toFixed(2)}
                  </p>
                  <div className="d-grid gap-2 mt-auto">
                    <button
                      className="btn btn-dark"
                      onClick={() => addToCart(product)}
                    >
                      Add to Basket
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => addToWishlist(product)}
                    >
                      ♡ Favourite
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {!filteredProducts.length && (
          <p>No products found in this category.</p>
        )}
      </motion.div>
    </div>
  );
}
