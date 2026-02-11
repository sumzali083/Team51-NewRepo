import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";

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

      <h1 className="mb-4">Your Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="alert alert-info">Your wishlist is empty. Browse products and add your favourites.</div>
      ) : (
        <div className="row g-4">
          {wishlist.map((item) => (
            <div key={item.id} className="col-md-4">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
