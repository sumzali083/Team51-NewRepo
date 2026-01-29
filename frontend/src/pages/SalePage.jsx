import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { PRODUCTS, Fallback } from "../data";
import "../styles.css";

export function SalePage() {
    const { addToCart } = useContext(CartContext);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sortBy, setSortBy] = useState("featured");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        // Get different products from each category (indices 2-3) for variety
        const menProducts = PRODUCTS.filter(p => p.cat === "men").slice(2, 4);
        const womenProducts = PRODUCTS.filter(p => p.cat === "women").slice(2, 4);
        const kidsProducts = PRODUCTS.filter(p => p.cat === "kids").slice(2, 4);

        // Mix products: women[0], men[0], kids[0], women[1], kids[1], men[1]
        const mixed = [
            womenProducts[0],
            menProducts[0],
            kidsProducts[0],
            womenProducts[1],
            kidsProducts[1],
            menProducts[1],
        ].filter(Boolean);

        setProducts(mixed);
    }, []);

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
        // "featured" keeps original order

        setFilteredProducts(sorted);
    }, [products, sortBy]);

    const handleSortSelect = (option) => {
        setSortBy(option);
        setIsDropdownOpen(false);
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h2 className="mb-0 fw-bold">Sale</h2>

                {/* Filter Section with Dropdown */}
                <div className="d-flex align-items-center gap-2 position-relative">
                    <i className="bi bi-funnel text-secondary" style={{ fontSize: '1.2rem' }}></i>

                    <div className="dropdown">
                        <button
                            className="btn btn-outline-dark dropdown-toggle"
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            aria-expanded={isDropdownOpen}
                            style={{
                                textDecoration: 'none',
                                padding: '8px 16px',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                border: '1px solid #dee2e6'
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
                                    borderRadius: '8px',
                                    border: '1px solid #dee2e6',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    padding: '8px 0'
                                }}
                            >
                                <button
                                    className="dropdown-item"
                                    onClick={() => handleSortSelect('featured')}
                                    style={{
                                        textAlign: 'left',
                                        background: sortBy === 'featured' ? '#f8f9fa' : 'white',
                                        border: 'none',
                                        padding: '10px 16px',
                                        cursor: 'pointer',
                                        color: '#111',
                                        fontWeight: sortBy === 'featured' ? '600' : '400',
                                        fontSize: '0.95rem',
                                        width: '100%'
                                    }}
                                >
                                    Featured
                                </button>
                                <button
                                    className="dropdown-item"
                                    onClick={() => handleSortSelect('newest')}
                                    style={{
                                        textAlign: 'left',
                                        background: sortBy === 'newest' ? '#f8f9fa' : 'white',
                                        border: 'none',
                                        padding: '10px 16px',
                                        cursor: 'pointer',
                                        color: '#111',
                                        fontWeight: sortBy === 'newest' ? '600' : '400',
                                        fontSize: '0.95rem',
                                        width: '100%'
                                    }}
                                >
                                    Newest
                                </button>
                                <button
                                    className="dropdown-item"
                                    onClick={() => handleSortSelect('price-low-high')}
                                    style={{
                                        textAlign: 'left',
                                        background: sortBy === 'price-low-high' ? '#f8f9fa' : 'white',
                                        border: 'none',
                                        padding: '10px 16px',
                                        cursor: 'pointer',
                                        color: '#111',
                                        fontWeight: sortBy === 'price-low-high' ? '600' : '400',
                                        fontSize: '0.95rem',
                                        width: '100%'
                                    }}
                                >
                                    Price: Low to High
                                </button>
                                <button
                                    className="dropdown-item"
                                    onClick={() => handleSortSelect('price-high-low')}
                                    style={{
                                        textAlign: 'left',
                                        background: sortBy === 'price-high-low' ? '#f8f9fa' : 'white',
                                        border: 'none',
                                        padding: '10px 16px',
                                        cursor: 'pointer',
                                        color: '#111',
                                        fontWeight: sortBy === 'price-high-low' ? '600' : '400',
                                        fontSize: '0.95rem',
                                        width: '100%'
                                    }}
                                >
                                    Price: High to Low
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {filteredProducts.map((product) => {
                    const img = product.image || product.image_url || (product.images && product.images[0]) || Fallback;
                    const price = Number(product.price || 0);

                    return (
                        <div key={product.id} className="col-md-4">
                            <div className="card h-100 shadow-sm">
                                <Link to={`/product/${product.id}`} className="text-decoration-none">
                                    <img
                                        src={img}
                                        className="card-img-top"
                                        alt={product.name}
                                        style={{ cursor: 'pointer' }}
                                        onError={(e) => { e.target.src = Fallback; }}
                                    />
                                </Link>

                                <div className="card-body d-flex flex-column">
                                    <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                                        <h5 className="card-title">{product.name}</h5>
                                    </Link>
                                    <p className="card-text fw-bold">
                                        £{price.toFixed(2)}
                                    </p>
                                    <button
                                        className="btn btn-dark mt-auto"
                                        onClick={() => addToCart(product)}
                                    >
                                        Add to Basket
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {!filteredProducts.length && (
                    <p>No products found.</p>
                )}
            </div>
        </div>
    );
}
