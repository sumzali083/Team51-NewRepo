import React, { useContext } from "react";
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

  function handleAddToCart(item) {
    addToCart(Object.assign({}, item, { quantity: 1 }));
    removeFromWishlist(item.id);
  }

  return (
    <div className="container mt-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item active">Wishlist</li>
        </ol>
      </nav>

      <motion.h1
        className="mb-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Your Wishlist
      </motion.h1>

      {wishlist.length === 0 ? (
        <motion.div
          className="alert alert-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Your wishlist is empty. Browse products and add your favourites.
        </motion.div>
      ) : (
        <motion.div
          className="row g-4"
          variants={gridVariants}
          initial="hidden"
          animate="visible"
        >
          {wishlist.map((item) => (
            <motion.div key={item.id} className="col-md-4" variants={cardVariants}>
              <div className="card h-100 shadow-sm">
                {item.image || item.images?.[0] ? (
                  <img src={item.image || item.images?.[0]} className="card-img-top" alt={item.name} />
                ) : null}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{item.name}</h5>
                  <p className="card-text fw-bold">£{Number(item.price || 0).toFixed(2)}</p>

                  <div className="mt-auto d-grid gap-2">
                    <button className="btn btn-dark" onClick={() => handleAddToCart(item)}>
                      Add to Basket
                    </button>
                    <button className="btn btn-outline-danger" onClick={() => removeFromWishlist(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
