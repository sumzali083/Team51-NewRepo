// src/ProductPage.jsx
import React, { useContext, useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CartContext } from "./context/CartContext";
import { WishlistContext } from "./context/WishlistContext";
import { PRODUCTS, Fallback } from "./data";

// Fix: Ensure all JSX is properly closed

export function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);

  const product = PRODUCTS.find((p) => p.id === id);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(product?.sizes?.[0] || "");
  const [color, setColor] = useState(product?.colors?.[0] || "");
  const [msg, setMsg] = useState("");
  const isInWishlist = product && wishlist && wishlist.some((item) => item.id === product.id);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load reviews from localStorage
  useEffect(() => {
    if (product) {
      const stored = localStorage.getItem(`reviews-${product.id}`);
      if (stored) {
        setReviews(JSON.parse(stored));
      }
    }
  }, [product]);

  if (!product) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">Product not found.</div>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const images = product.images || [product.image];

  const handleColorSelect = (selectedColor) => {
    setColor(selectedColor);
    if (product?.colors?.length && images.length) {
      const colorIndex = product.colors.indexOf(selectedColor);
      if (colorIndex >= 0) {
        const safeIndex = Math.min(colorIndex, images.length - 1);
        setActiveImg(safeIndex);
      }
    }
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      size,
      color,
      image: images[activeImg] || product.image,
    });
    setMsg(`Added "${product.name}" to basket!`);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleToggleWishlist = () => {
    if (!product) return;

    if (isInWishlist) {
      removeFromWishlist(product.id);
      setMsg(`Removed "${product.name}" from wishlist`);
    } else {
      addToWishlist({ ...product, size, color, image: product.images?.[0] || product.image });
      setMsg(`Added "${product.name}" to wishlist`);
    }

    setTimeout(() => setMsg(""), 2000);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!comment.trim() || !reviewerName.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const newReview = {
      id: Date.now(),
      name: reviewerName,
      rating: rating,
      comment: comment,
      date: new Date().toLocaleDateString(),
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews-${product.id}`, JSON.stringify(updatedReviews));

    setComment("");
    setReviewerName("");
    setRating(5);
    setSuccessMsg("Review posted successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="container mt-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to={`/${product.cat}s`}>{product.cat}</Link></li>
          <li className="breadcrumb-item active">{product.name}</li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-md-6">
          <img
            src={images[activeImg] || Fallback}
            alt={product.name}
            className="img-fluid rounded mb-3"
            onError={(e) => { e.target.src = Fallback; }}
          />
          <div className="d-flex gap-2">
            {images.map((img, i) => (
              <img
                key={i}
                src={img || Fallback}
                alt={`${product.name} ${i + 1}`}
                className={`img-thumbnail ${i === activeImg ? 'border-primary' : ''}`}
                style={{ width: '80px', cursor: 'pointer' }}
                onClick={() => setActiveImg(i)}
                onError={(e) => { e.target.src = Fallback; }}
              />
            ))}
          </div>
        </div>

        <div className="col-md-6">
          <h1>{product.name}</h1>
          <h3 className="text-primary">£{product.price.toFixed(2)}</h3>
          <p className="mt-3">{product.desc || product.description}</p>

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-3">
              <label className="form-label fw-bold">Size:</label>
              <div className="btn-group d-flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={`btn ${size === s ? 'btn-dark' : 'btn-outline-dark'}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="mb-3">
              <label className="form-label fw-bold">Color:</label>
              <div className="btn-group d-flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    className={`btn ${color === c ? 'btn-dark' : 'btn-outline-dark'}`}
                    onClick={() => handleColorSelect(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            className="btn btn-dark btn-lg w-100 mt-3"
            onClick={handleAddToCart}
          >
            Add to Basket
          </button>

          <button
            className={`${isInWishlist ? "btn btn-danger" : "btn btn-outline-danger"} w-100 mt-2`}
            onClick={handleToggleWishlist}
          >
            {isInWishlist ? "Remove from Wishlist ❤️" : "Add to Wishlist ♡"}
          </button>

          {msg && (
            <div className="alert alert-success mt-3" role="alert">
              {msg}
            </div>
          )}

          <button
            className="btn btn-outline-secondary w-100 mt-2"
            onClick={() => navigate(-1)}
          >
            Back to Products
          </button>
        </div>
      </div>

      {/* Reviews Section Below */}
      <div className="mt-5 pt-5 border-top">
        <h2 className="mb-5 fw-bold">Customer Reviews</h2>

        <div className="row">
          {/* Reviews List */}
          <div className="col-lg-8 mb-5">
            {/* Average Rating */}
            {reviews.length > 0 && (
              <div className="mb-4 p-4 bg-light rounded-3">
                <div className="d-flex align-items-center gap-4">
                  <div>
                    <div className="display-6 fw-bold mb-1">{averageRating}</div>
                    <div className="fs-5 text-warning mb-2">
                      {"★".repeat(Math.round(averageRating))}{"☆".repeat(5 - Math.round(averageRating))}
                    </div>
                    <small className="text-muted">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</small>
                  </div>
                </div>
              </div>
            )}

            {/* Review List */}
            {reviews.length > 0 ? (
              <div>
                <h4 className="mb-4 fw-bold">All Reviews</h4>
                {reviews.map((review) => (
                  <div key={review.id} className="card mb-3 border-0 shadow-sm rounded-3 overflow-hidden">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="card-title mb-2 fw-bold">{review.name}</h5>
                          <div className="text-warning mb-2 fs-6">
                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                          </div>
                        </div>
                        <small className="text-muted">{review.date}</small>
                      </div>
                      <p className="card-text text-secondary">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info border-0 rounded-3 mb-4">
                <p className="mb-0">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-3 p-4 position-sticky" style={{ top: '120px' }}>
              <h5 className="mb-4 fw-bold">Leave a Review</h5>
              {successMsg && (
                <div className="alert alert-success mb-3 border-0 rounded-2" role="alert">
                  {successMsg}
                </div>
              )}
              <form onSubmit={handleSubmitReview}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">Your Name</label>
                  <input
                    type="text"
                    className="form-control rounded-2 border-0"
                    style={{ backgroundColor: '#f8f9fa' }}
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2">Rating</label>
                  <div className="fs-5" style={{ letterSpacing: '8px', marginBottom: '10px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          cursor: 'pointer',
                          color: star <= (hoverRating || rating) ? '#ffc107' : '#dee2e6',
                          fontSize: '2rem',
                          transition: 'color 0.2s',
                          display: 'inline-block'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">Comment</label>
                  <textarea
                    className="form-control rounded-2 border-0"
                    style={{ backgroundColor: '#f8f9fa', minHeight: '100px' }}
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                  />
                </div>

                <button type="submit" className="btn btn-dark w-100 rounded-2 fw-bold py-2">
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
