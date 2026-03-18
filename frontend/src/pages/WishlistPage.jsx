import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";

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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};
export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const [cartMsg, setCartMsg] = useState("");
  const [cartMsgType, setCartMsgType] = useState("success");

  async function handleAddToCart(item) {
    const result = await addToCart(Object.assign({}, item, { quantity: 1 }));

    if (result && result.ok) {
      removeFromWishlist(item.id);
    }

    if (result && result.message) {
      setCartMsg(result.message);
      setCartMsgType(result.ok ? "success" : "danger");
      setTimeout(() => setCartMsg(""), 3000);
    }
  }

  return (
    <div className="container mt-5 mb-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item active">Favourites</li>
        </ol>
      </nav>

      <motion.h1
        className="mb-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Your Favourites
      </motion.h1>

      {cartMsg && <div className={`alert alert-${cartMsgType}`}>{cartMsg}</div>}

      {wishlist.length === 0 ? (
        <motion.div
          className="alert alert-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Your favourites list is empty. Browse products and add items to your favourites.
        </motion.div>
      ) : (
        <motion.div className="row g-4" variants={gridVariants} initial="hidden" animate="visible">
          {wishlist.map((item) => {
            const stock = Number(item.stock);
            const hasStockInfo = Number.isFinite(stock);
            const isSoldOut = hasStockInfo && stock <= 0;
            const isLowStock = hasStockInfo && stock > 0 && stock <= 5;

            const price = Number(item.price || 0);
            const originalPrice = item.originalPrice ? Number(item.originalPrice) : null;
            const discountPct = originalPrice ? Math.round((1 - price / originalPrice) * 100) : null;

            return (
              <motion.div key={item.id} className="col-md-4" variants={cardVariants}>
                <div className="card h-100 shadow-sm">
                  {/* Image with sale badge */}
                  <div style={{ position: "relative" }}>
                    {item.image || item.images?.[0] ? (
                      <Link to={`/product/${item.id}`}>
                        <img src={item.image || item.images?.[0]} className="card-img-top" alt={item.name} />
                      </Link>
                    ) : null}
                    {discountPct && (
                      <span style={{
                        position: "absolute", top: 10, left: 10,
                        background: "#e53935", color: "#fff",
                        fontSize: 11, fontWeight: 700, padding: "3px 8px",
                        borderRadius: 3, letterSpacing: "0.04em",
                      }}>-{discountPct}%</span>
                    )}
                  </div>

                  <div className="card-body d-flex flex-column">
                    <Link to={`/product/${item.id}`} className="text-decoration-none">
                      <h5 className="card-title">{item.name}</h5>
                    </Link>

                    {/* Price — sale or normal */}
                    <div style={{ marginBottom: 8 }}>
                      {originalPrice ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ color: "#888", fontSize: 13, textDecoration: "line-through" }}>
                            £{originalPrice.toFixed(2)}
                          </span>
                          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                            £{price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <p className="card-text fw-bold mb-0">£{price.toFixed(2)}</p>
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

                    <div className="mt-auto d-grid gap-2">
                      <button className="btn btn-dark" onClick={() => handleAddToCart(item)} disabled={isSoldOut}>
                        {isSoldOut ? "Sold Out" : "Add to Basket"}
                      </button>
                      <button className="btn btn-outline-danger" onClick={() => removeFromWishlist(item.id)}>
                        Remove
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
  );
}
