<<<<<<< HEAD
import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PRODUCTS } from "../data";
=======
import React, { useContext } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { PRODUCTS, Fallback } from "../data";
>>>>>>> deploy-branch

const PER_PAGE = 8;

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

<<<<<<< HEAD
  const filtered = PRODUCTS.filter((p) =>
    !q ? true : p.name.toLowerCase().includes(q.toLowerCase()) || (p.desc && p.desc.toLowerCase().includes(q.toLowerCase()))
=======
  const { addToCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);

  const filtered = PRODUCTS.filter((p) =>
    !q
      ? true
      : p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.desc && p.desc.toLowerCase().includes(q.toLowerCase()))
>>>>>>> deploy-branch
  );

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(Math.max(1, page), pages);
  const start = (safePage - 1) * PER_PAGE;
  const slice = filtered.slice(start, start + PER_PAGE);

  const goPage = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  return (
<<<<<<< HEAD
    <>
      <h2>Search results</h2>

      <div className="controls">
        <span id="count" className="chip">
          {total} result{total !== 1 ? "s" : ""} for "{q}"
        </span>
      </div>

      <section id="grid" className="grid mt-3" role="list" aria-label={`Search results`}>
        {slice.map((p) => (
          <article key={p.id} className="card" role="listitem">
            <Link to={`/product/${encodeURIComponent(p.id)}`} aria-label={p.name}>
              <div className="thumb">
                <img src={p.images[0]} alt={p.name} />
              </div>
              <div className="body">
                <div className="title">{p.name}</div>
                <div className="meta">
                  <span className="price">£{p.price.toFixed(2)}</span>
                  {p.tag && <span className="badge">{p.tag}</span>}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </section>

      <nav className="pagination" role="navigation" aria-label="Pagination">
        <button className="btn" onClick={() => goPage(safePage - 1)} disabled={safePage <= 1}>
          Prev
        </button>
        <span className="chip" id="pageStat">
          Page {safePage} of {pages}
        </span>
        <button className="btn" onClick={() => goPage(safePage + 1)} disabled={safePage >= pages}>
          Next
        </button>
      </nav>
    </>
=======
    <div className="page-padded">
      <h2 style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "clamp(28px,5vw,48px)",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        marginBottom: 8,
      }}>
        Search Results
      </h2>

      <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>
        {total} result{total !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
      </p>

      {slice.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
          No products found matching &ldquo;{q}&rdquo;.
        </div>
      ) : (
        <div className="row g-4">
          {slice.map((p) => {
            const img = (p.images && p.images[0]) || p.image || Fallback;
            const price = Number(p.price || 0);

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

                    <p className="card-text fw-bold" style={{ color: "#fff" }}>
                      £{price.toFixed(2)}
                    </p>

                    {p.tag && (
                      <span className="badge mb-2" style={{ alignSelf: "flex-start" }}>
                        {p.tag}
                      </span>
                    )}

                    <div className="d-grid gap-2 mt-auto">
                      <button className="btn btn-dark" onClick={() => addToCart(p)}>
                        Add to Basket
                      </button>
                      <button className="btn btn-outline-danger" onClick={() => addToWishlist(p)}>
                        ♡ Favourite
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
>>>>>>> deploy-branch
  );
}
