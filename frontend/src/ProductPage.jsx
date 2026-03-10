// src/ProductPage.jsx
import React, { useContext, useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CartContext } from "./context/CartContext";
<<<<<<< HEAD
import { PRODUCTS } from "./data";      // local demo products
import api from "./api";                // your axios instance for backend
=======
import { WishlistContext } from "./context/WishlistContext";
import { AuthContext } from "./context/AuthContext";
import api from "./api";
import { PRODUCTS, Fallback } from "./data";
>>>>>>> deploy-branch

export function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
<<<<<<< HEAD

  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        // 1) Try to load from backend API using DB id (works for category pages)
        const res = await api.get(`/api/products/${id}`);
        if (cancelled) return;

        const row = res.data;

        // try to find matching local product by name (for sizes/images)
        const localMatch =
          PRODUCTS.find((p) => p.name === row.name) ||
          PRODUCTS.find((p) => String(p.id) === String(id));

        const combined = {
          id: String(row.id),
          name: row.name,
          price: Number(row.price),
          description: row.description,
          desc: row.description,
          // images: use local images if we have them, otherwise DB image_url
          images:
            (localMatch && localMatch.images && localMatch.images.length > 0
              ? localMatch.images
              : row.image_url
              ? [row.image_url]
              : []),
          image: row.image_url,
          // category: try to map to the "cat" used in your frontend (men/women/kids)
          cat: localMatch?.cat
            ? localMatch.cat
            : row.category_name
            ? row.category_name.toLowerCase().includes("men")
              ? "men"
              : row.category_name.toLowerCase().includes("women")
              ? "women"
              : "kids"
            : "men",
          // sizes from local demo data if available, otherwise a simple default
          sizes:
            (localMatch && localMatch.sizes && localMatch.sizes.length > 0
              ? localMatch.sizes
              : ["S", "M", "L", "XL"]),
        };

        setProduct(combined);
        setActiveImg(0);
        setSize(combined.sizes[0] || "");
      } catch (err) {
        console.error("Error loading product from API, falling back to local:", err);

        // 2) Fallback: use local PRODUCTS (this is what search is already using)
        const local = PRODUCTS.find((p) => String(p.id) === String(id));
        if (!local) {
          setError("Product not found.");
        } else {
          setProduct(local);
          setActiveImg(0);
          setSize(local.sizes?.[0] || "");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const images =
      product.images && product.images.length > 0
        ? product.images
        : product.image
        ? [product.image]
        : [];

    addToCart({
      ...product,
      size,
      image: images[0],
    });
    setMsg(`Added "${product.name}" to basket!`);
    setTimeout(() => setMsg(""), 3000);
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <p>Loading product...</p>
=======
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [msg, setMsg] = useState("");
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
>>>>>>> deploy-branch
      </div>
    );
  }

<<<<<<< HEAD
  if (error || !product) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">{error || "Product not found."}</div>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
=======
  if (!product) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">Product not found.</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
>>>>>>> deploy-branch
          Go Back
        </button>
      </div>
    );
  }

<<<<<<< HEAD
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  return (
    <div className="container mt-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          {product.cat && (
            <li className="breadcrumb-item">
              <Link to={`/${product.cat}s`}>{product.cat}</Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
=======
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

  return (
    <div className="container mt-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to={`/${product.cat}s`}>{product.cat}</Link></li>
          <li className="breadcrumb-item active">{product.name}</li>
>>>>>>> deploy-branch
        </ol>
      </nav>

      <div className="row">
<<<<<<< HEAD
        {/* Images */}
        <div className="col-md-6">
          {images[activeImg] && (
            <img
              src={images[activeImg]}
              alt={product.name}
              className="img-fluid rounded mb-3"
            />
          )}
=======
        <div className="col-md-6">
          <img
            src={images[activeImg] || Fallback}
            alt={product.name}
            className="img-fluid rounded mb-3"
            onError={(e) => { e.target.src = Fallback; }}
          />
>>>>>>> deploy-branch
          <div className="d-flex gap-2">
            {images.map((img, i) => (
              <img
                key={i}
<<<<<<< HEAD
                src={img}
                alt={`${product.name} ${i + 1}`}
                className={`img-thumbnail ${
                  i === activeImg ? "border-primary" : ""
                }`}
                style={{ width: "80px", cursor: "pointer" }}
                onClick={() => setActiveImg(i)}
=======
                src={img || Fallback}
                alt={`${product.name} ${i + 1}`}
                className={`img-thumbnail ${i === activeImg ? 'border-primary' : ''}`}
                style={{ width: '80px', cursor: 'pointer' }}
                onClick={() => setActiveImg(i)}
                onError={(e) => { e.target.src = Fallback; }}
>>>>>>> deploy-branch
              />
            ))}
          </div>
        </div>

<<<<<<< HEAD
        {/* Details */}
        <div className="col-md-6">
          <h1>{product.name}</h1>
          <h3 className="text-primary">£{product.price.toFixed(2)}</h3>
          <p className="mt-3">{product.desc || product.description}</p>

          {/* Size options ONLY */}
=======
        <div className="col-md-6">
          <h1>{product.name}</h1>
          <h3 style={{ color: '#fff', fontWeight: 700 }}>£{product.price.toFixed(2)}</h3>
          <p className="mt-3">{product.desc || product.description}</p>

>>>>>>> deploy-branch
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-3">
              <label className="form-label fw-bold">Size:</label>
              <div className="btn-group d-flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
<<<<<<< HEAD
                    className={`btn ${
                      size === s ? "btn-dark" : "btn-outline-dark"
                    }`}
                    onClick={() => setSize(s)}
=======
                    className={`btn ${size === s ? 'btn-dark' : 'btn-outline-dark'}`}
                    onClick={() => setSize(s)}
                    style={{ minWidth: 48 }}
>>>>>>> deploy-branch
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

<<<<<<< HEAD
=======
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

>>>>>>> deploy-branch
          <button
            className="btn btn-dark btn-lg w-100 mt-3"
            onClick={handleAddToCart}
          >
            Add to Basket
          </button>

<<<<<<< HEAD
=======
          <button
            className={`${isInWishlist ? "btn btn-danger" : "btn btn-outline-danger"} w-100 mt-2`}
            onClick={handleToggleWishlist}
          >
            {isInWishlist ? "Remove from Wishlist ❤️" : "Add to Wishlist ♡"}
          </button>

>>>>>>> deploy-branch
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
<<<<<<< HEAD
=======

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
>>>>>>> deploy-branch
    </div>
  );
}

export default ProductPage;
