// src/ProductPage.jsx
import React, { useContext, useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CartContext } from "./context/CartContext";
import { WishlistContext } from "./context/WishlistContext";
import { AuthContext } from "./context/AuthContext";
import api from "./api";
import { PRODUCTS, Fallback } from "./data";

export function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const isInWishlist = product && wishlist && wishlist.some((item) => item.id === product.id);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Fetch product from API, fall back to local data for legacy products
  useEffect(() => {
    setLoadingProduct(true);
    setActiveImg(0);
    api.get(`/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(PRODUCTS.find((p) => p.id === id) || null))
      .finally(() => setLoadingProduct(false));
  }, [id]);

  // Set default size/color once product is available
  useEffect(() => {
    if (product) {
      setSize(product.sizes?.[0] || "");
      setColor(product.colors?.[0] || "");
    }
  }, [product]);

  // Load reviews from backend API
  useEffect(() => {
    if (product) {
      loadReviews();
    }
  }, [product]);

  const loadReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const response = await api.get(`/api/reviews/${product.id}`);
      setReviews(response.data || []);
    } catch (err) {
      console.error("Error loading reviews:", err);
      // Fallback to empty reviews if API is not available
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="container mt-5 text-center" style={{ color: "var(--sub)" }}>
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">Product not found.</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
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
    }).then((result) => {
      if (result && result.message) {
        setMsg(result.message);
        setMsgType(result.ok ? "success" : "danger");
      } else {
        setMsg(`Added "${product.name}" to basket!`);
        setMsgType("success");
      }
      setTimeout(() => setMsg(""), 3000);
    });
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

  const canReview = Boolean(user);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!canReview) {
      setErrorMsg("You must be logged in to post a review. Please log in and try again.");
      setTimeout(() => setErrorMsg(""), 4000);
      return;
    }

    if (!comment.trim() || !reviewerName.trim()) {
      setErrorMsg("Please fill in all fields");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    setIsSubmittingReview(true);
    setErrorMsg("");

    try {
      const response = await api.post(
        `/api/reviews/${product.id}`,
        {
          rating: rating,
          comment: comment.trim(),
          reviewer_name: reviewerName.trim(),
        },
      );
      const newReview = response.data;

      // Add new review to the list
      setReviews([newReview.review || { ...newReview, id: Date.now() }, ...reviews]);

      // Clear form
      setComment("");
      setReviewerName("");
      setRating(5);

      // Show success message
      setSuccessMsg("Review posted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error submitting review:", err);
      setErrorMsg(err?.response?.data?.message || "Error posting review. Please try again.");
      setTimeout(() => setErrorMsg(""), 4000);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  const stock = Number(product.stock);
  const hasStockInfo = Number.isFinite(stock);
  const isSoldOut = hasStockInfo && stock <= 0;
  const isLowStock = hasStockInfo && stock > 0 && stock <= 5;

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
          {product.originalPrice ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ color: '#888', fontSize: 16, textDecoration: 'line-through' }}>
                £{Number(product.originalPrice).toFixed(2)}
              </span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 26 }}>
                £{product.price.toFixed(2)}
              </span>
              <span style={{
                background: '#e53935',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.06em',
                padding: '3px 9px',
                borderRadius: 3,
              }}>
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            </div>
          ) : (
            <h3 style={{ color: '#fff', fontWeight: 700 }}>£{product.price.toFixed(2)}</h3>
          )}
          <p className="mt-3">{product.desc || product.description}</p>
          {hasStockInfo && (isSoldOut || isLowStock) && (
            <div className="mb-2">
              {isSoldOut ? (
                <span className="osai-stock-pill osai-stock-pill-soldout">Sold out</span>
              ) : isLowStock ? (
                <span className="osai-stock-pill osai-stock-pill-low">Low stock: {stock} left</span>
              ) : null}
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-3">
              <label className="form-label fw-bold">Size:</label>
              <div className="btn-group d-flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={`btn ${size === s ? 'btn-dark' : 'btn-outline-dark'}`}
                    onClick={() => setSize(s)}
                    style={{ minWidth: 48 }}
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
            disabled={isSoldOut}
          >
            {isSoldOut ? "Sold Out" : "Add to Basket"}
          </button>

          <button
            className={`${isInWishlist ? "btn btn-danger" : "btn btn-outline-danger"} w-100 mt-2`}
            onClick={handleToggleWishlist}
          >
            {isInWishlist ? "Remove from Wishlist ❤️" : "Add to Wishlist ♡"}
          </button>

          {msg && (
            <div className={`alert alert-${msgType} mt-3`} role="alert">
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
            <div className={canReview ? "col-lg-8 mb-5" : "col-12 mb-5"}>
            {/* Average Rating */}
            {reviews.length > 0 && (
              <div className="mb-4 p-4 rounded-3" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="d-flex align-items-center gap-4">
                  <div>
                    <div className="display-6 fw-bold mb-1" style={{ color: '#fff' }}>{averageRating}</div>
                    <div className="fs-5 text-warning mb-2">
                      {"★".repeat(Math.round(averageRating))}{"☆".repeat(5 - Math.round(averageRating))}
                    </div>
                    <small style={{ color: '#888' }}>Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</small>
                  </div>
                </div>
              </div>
            )}

            {/* Review List */}
            {isLoadingReviews ? (
              <div className="alert alert-info border-0 rounded-3">
                <p className="mb-0">Loading reviews...</p>
              </div>
            ) : reviews.length > 0 ? (
              <div>
                <h4 className="mb-4 fw-bold">All Reviews</h4>
                {reviews.map((review) => (
                  <div key={review.id} className="card mb-3 rounded-3 overflow-hidden" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="card-body p-4" style={{ background: 'transparent' }}>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="card-title mb-2 fw-bold">{review.reviewer_name || review.name}</h5>
                          <div className="text-warning mb-2 fs-6">
                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                          </div>
                        </div>
                        <small className="text-muted">
                          {review.created_at
                            ? new Date(review.created_at).toLocaleDateString()
                            : review.date || ""}
                        </small>
                      </div>
                      <p className="card-text text-secondary">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info border-0 rounded-3 mb-4">
                <p className="mb-0">No reviews yet. {canReview ? "Be the first to share your experience!" : "Login to be the first to share your experience!"}</p>
              </div>
            )}
          </div>

          {/* Review Form - Only show if user is logged in */}
          {canReview && (
            <div className="col-lg-4">
              <div className="card rounded-3 p-4 position-sticky" style={{ top: '120px', background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h5 className="mb-4 fw-bold" style={{ color: '#fff' }}>Leave a Review</h5>

                <div className="mb-3 p-2 rounded-2" style={{ background: 'rgba(255,255,255,0.05)', fontSize: 13, color: '#888' }}>
                  Logged in as: <strong style={{ color: '#fff' }}>{user.name}</strong>
                </div>

                {successMsg && (
                  <div className="alert alert-success mb-3 border-0 rounded-2" role="alert">
                    {successMsg}
                  </div>
                )}

                {errorMsg && (
                  <div className="alert alert-danger mb-3 border-0 rounded-2" role="alert">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmitReview}>
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{ color: '#aaa' }}>Your Name</label>
                    <input
                      type="text"
                      className="form-control rounded-2"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold mb-2" style={{ color: '#aaa' }}>Rating</label>
                    <div className="fs-5" style={{ letterSpacing: '8px', marginBottom: '10px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{
                            cursor: 'pointer',
                            color: star <= (hoverRating || rating) ? '#ffc107' : '#333',
                            fontSize: '2rem',
                            transition: 'color 0.2s',
                            display: 'inline-block',
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold" style={{ color: '#aaa' }}>Comment</label>
                    <textarea
                      className="form-control rounded-2"
                      style={{ minHeight: '100px' }}
                      rows="4"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-dark w-100 rounded-2 fw-bold py-2"
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? "Posting..." : "Submit Review"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
