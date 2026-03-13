import React, { useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { PRODUCTS, Fallback } from "../data";
import api from "../api";

const PER_PAGE = 8;

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const { addToCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);
  const [cartMsg, setCartMsg] = useState("");
  const [cartMsgType, setCartMsgType] = useState("success");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    api
      .get("/api/products", { params: { q: q.trim() } })
      .then((res) => {
        const apiResults = res.data || [];
        if (apiResults.length > 0) {
          setResults(apiResults);
        } else {
          // Fallback to local data if API returns nothing
          const lower = q.toLowerCase();
          setResults(
            PRODUCTS.filter(
              (p) =>
                p.name.toLowerCase().includes(lower) ||
                (p.desc && p.desc.toLowerCase().includes(lower))
            )
          );
        }
      })
      .catch(() => {
        // API failed — use local fallback
        const lower = q.toLowerCase();
        setResults(
          PRODUCTS.filter(
            (p) =>
              p.name.toLowerCase().includes(lower) ||
              (p.desc && p.desc.toLowerCase().includes(lower))
          )
        );
      })
      .finally(() => setLoading(false));
  }, [q]);

  const total = results.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * PER_PAGE;
  const slice = results.slice(start, start + PER_PAGE);

  const goPage = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const handleAddToCart = async (product) => {
    const result = await addToCart(product);
    if (result && result.message) {
      setCartMsg(result.message);
      setCartMsgType(result.ok ? "success" : "danger");
      setTimeout(() => setCartMsg(""), 3000);
    }
  };

  return (
    <div className="page-padded">
      <h2
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "clamp(28px,5vw,48px)",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: 8,
        }}
      >
        Search Results
      </h2>

      <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>
        {loading
          ? "Searching…"
          : `${total} result${total !== 1 ? "s" : ""} for \u201c${q}\u201d`}
      </p>

      {cartMsg && <div className={`alert alert-${cartMsgType}`}>{cartMsg}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
          Searching…
        </div>
      ) : slice.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
          No products found matching &ldquo;{q}&rdquo;.
        </div>
      ) : (
        <div className="row g-4">
          {slice.map((p) => {
            const img = (p.images && p.images[0]) || p.image || Fallback;
            const price = Number(p.price || 0);
            const originalPrice = p.originalPrice ? Number(p.originalPrice) : null;
            const discountPct = originalPrice
              ? Math.round((1 - price / originalPrice) * 100)
              : null;
            const stock = Number(p.stock);
            const hasStockInfo = Number.isFinite(stock);
            const isSoldOut = hasStockInfo && stock <= 0;
            const isLowStock = hasStockInfo && stock > 0 && stock <= 5;

            return (
              <div key={p.id} className="col-md-4">
                <div className="card h-100 shadow-sm">
                  <Link to={`/product/${encodeURIComponent(p.id)}`} className="text-decoration-none">
                    <img
                      src={img}
                      className="card-img-top"
                      alt={p.name}
                      style={{ cursor: "pointer" }}
                      onError={(e) => { e.target.src = Fallback; }}
                    />
                  </Link>

                  <div className="card-body d-flex flex-column">
                    <Link to={`/product/${encodeURIComponent(p.id)}`} className="text-decoration-none">
                      <h5 className="card-title">{p.name}</h5>
                    </Link>

                    <div style={{ marginBottom: 8 }}>
                      {originalPrice ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ color: "#888", fontSize: 13, textDecoration: "line-through" }}>
                            £{originalPrice.toFixed(2)}
                          </span>
                          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                            £{price.toFixed(2)}
                          </span>
                          <span style={{
                            background: "#e53935",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            padding: "2px 7px",
                            borderRadius: 3,
                          }}>
                            -{discountPct}%
                          </span>
                        </div>
                      ) : (
                        <p className="card-text fw-bold mb-0" style={{ color: "#fff" }}>
                          £{price.toFixed(2)}
                        </p>
                      )}
                    </div>

                    {hasStockInfo && (isSoldOut || isLowStock) && (
                      <div className="mb-2">
                        {isSoldOut ? (
                          <span className="osai-stock-pill osai-stock-pill-soldout">Sold out</span>
                        ) : isLowStock ? (
                          <span className="osai-stock-pill osai-stock-pill-low">Low stock: {stock} left</span>
                        ) : null}
                      </div>
                    )}

                    <div className="d-grid gap-2 mt-auto">
                      <button className="btn btn-dark" onClick={() => handleAddToCart(p)} disabled={isSoldOut}>
                        {isSoldOut ? "Sold Out" : "Add to Basket"}
                      </button>
                      <button className="btn btn-outline-danger" onClick={() => addToWishlist(p)}>
                        Favourite
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <nav className="pagination" role="navigation" aria-label="Pagination" style={{ marginTop: 40 }}>
          <button className="btn" onClick={() => goPage(safePage - 1)} disabled={safePage <= 1}>
            Prev
          </button>
          <span style={{ color: "#888", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Page {safePage} of {pages}
          </span>
          <button className="btn" onClick={() => goPage(safePage + 1)} disabled={safePage >= pages}>
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
