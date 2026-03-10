<<<<<<< HEAD
import React, { useContext } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "./context/CartContext";
import Chatbot from "./components/Chatbot";
import ThemeToggle from "./components/ThemeToggle";

export function Layout() {
  const [search, setSearch] = React.useState("");
  const location = useLocation();
  const navigate = useNavigate();
=======
import { useContext, useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "./context/CartContext";
import { AuthContext } from "./context/AuthContext";
import { WishlistContext } from "./context/WishlistContext";
import Chatbot from "./components/Chatbot";

export function Layout() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
>>>>>>> deploy-branch

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = search.trim();
    if (!term) return;
<<<<<<< HEAD

    // Always navigate to the global search page with query param
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  // cart context — show total items in navbar
  const cartCtx = useContext(CartContext);
  const totalItems = cartCtx?.cart?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;

  return (
    <>
      <header id="main-header">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
            <NavLink className="navbar-brand" to="/">
              <img width="100" src="/images/logo.png" alt="OSAI Logo" />
            </NavLink>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/">
                    Home
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink id="nav-men" className="nav-link" to="/mens">
                    Mens
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink id="nav-women" className="nav-link" to="/womens">
                    Womens
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink id="nav-kids" className="nav-link" to="/kids">
                    Kids
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/contact">
                    Contact
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/about">
                    About Us
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/feedback">
                    Send Us Feedback
                  </NavLink>
                </li>
              </ul>

              {/* NAV SEARCH */}
              <form className="nav-search d-flex me-3" onSubmit={handleSearchSubmit}>
                <input
                  className="form-control"
                  type="search"
                  placeholder="Search products…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn profile-btn ms-2" type="submit">
                  Search
                </button>
              </form>

              <div className="d-flex align-items-center gap-3">
                <ThemeToggle />
                <NavLink to="/login" className="btn btn-outline-light profile-btn">
                  <i className="bi bi-person-circle" /> Login / Profile
                </NavLink>
                <NavLink to="/cart" className="btn btn-outline-light cart-btn position-relative">
                  <i className="bi bi-cart3" />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {totalItems}
                  </span>
                </NavLink>
              </div>
=======
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const cartCtx = useContext(CartContext);
  const totalItems = cartCtx?.cart?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;

  const wishlistCtx = useContext(WishlistContext);
  const totalFav = wishlistCtx?.wishlist?.length || 0;

  return (
    <>
      <header className="osai-header" id="main-header">
        <nav className="osai-navbar">
          <div className="container-fluid osai-nav-inner">
            <NavLink className="navbar-brand osai-brand" to="/">
              <img src="/images/logo.png" alt="OSAI" />
            </NavLink>

            <button
              className="osai-hamburger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className={`osai-hamburger-icon${menuOpen ? " open" : ""}`} />
            </button>

            <ul className="osai-nav-links">
              {[
                { to: "/", label: "Home", end: true },
                { to: "/mens", label: "Mens" },
                { to: "/womens", label: "Womens" },
                { to: "/kids", label: "Kids" },
                { to: "/newarrivals", label: "New Arrivals" },
                { to: "/sale", label: "Sale" },
                { to: "/contact", label: "Contact" },
                { to: "/about", label: "About" },
              ].map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink
                    className={({ isActive }) => `osai-link${isActive ? " active" : ""}`}
                    to={to}
                    end={end}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {menuOpen && (
              <ul className="osai-mobile-menu">
                {[
                  { to: "/", label: "Home", end: true },
                  { to: "/mens", label: "Mens" },
                  { to: "/womens", label: "Womens" },
                  { to: "/kids", label: "Kids" },
                  { to: "/newarrivals", label: "New Arrivals" },
                  { to: "/sale", label: "Sale" },
                  { to: "/contact", label: "Contact" },
                  { to: "/about", label: "About" },
                ].map(({ to, label, end }) => (
                  <li key={to}>
                    <NavLink
                      className={({ isActive }) => `osai-mobile-link${isActive ? " active" : ""}`}
                      to={to}
                      end={end}
                    >
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}

            <div className="osai-nav-actions">
              <form className="osai-search" onSubmit={handleSearchSubmit}>
                <input
                  type="search"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search products"
                />
                <button type="submit" aria-label="Submit search">
                  <i className="bi bi-search" />
                </button>
              </form>

              {user ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    onClick={user.is_admin ? () => navigate("/admin") : undefined}
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.8)",
                      fontFamily: "var(--font-body)",
                      maxWidth: 100,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      cursor: user.is_admin ? "pointer" : "default",
                    }}
                  >
                    {user.name}
                  </span>
                  {user.is_admin && (
                    <NavLink to="/admin" className="osai-action-btn" title="Admin">
                      <i className="bi bi-speedometer2" />
                    </NavLink>
                  )}
                  <NavLink
                    to="/account/change-password"
                    className="osai-action-btn"
                    title="Change password"
                  >
                    <i className="bi bi-key" />
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="osai-action-btn"
                    style={{ border: "none", cursor: "pointer", background: "transparent" }}
                    aria-label="Logout"
                    title="Logout"
                  >
                    <i className="bi bi-box-arrow-right" />
                  </button>
                </div>
              ) : (
                <NavLink to="/login" className="osai-action-btn">
                  <i className="bi bi-person" />
                  <span className="d-none d-xl-inline">Login</span>
                </NavLink>
              )}

              <NavLink
                to="/wishlist"
                className="osai-action-btn"
                aria-label={`Wishlist (${totalFav} items)`}
              >
                <i className="bi bi-heart" />
                {totalFav > 0 && <span className="osai-badge">{totalFav}</span>}
              </NavLink>

              <NavLink
                to="/cart"
                className="osai-action-btn"
                aria-label={`Cart (${totalItems} items)`}
              >
                <i className="bi bi-bag" />
                {totalItems > 0 && <span className="osai-badge">{totalItems}</span>}
              </NavLink>
>>>>>>> deploy-branch
            </div>
          </div>
        </nav>
      </header>

<<<<<<< HEAD
      <main className="container my-5" aria-live="polite">
        <Outlet />
      </main>

      <footer className="bg-dark text-light mt-5 pt-4 pb-4 text-center">
        <h4>Contact Us</h4>
        <p>Bringing authentic and stylish clothing to your wardrobe.</p>
        <p>Find us at 134a Aston Road, Birmingham, United Kingdom</p>
        <p>
          Email:{" "}
          <a className="text-warning" href="mailto:240365581@aston.ac.uk">
            OSAI@aston.ac.uk
          </a>
        </p>

        <hr className="border-light" />
        <p className="mb-0">
          &copy; {new Date().getFullYear()} OSAI Fashion. All Rights Reserved.
        </p>
=======
      <main aria-live="polite">
        <Outlet />
      </main>

      <footer className="osai-footer">
        <div className="osai-footer-inner">
          <div className="osai-footer-brand">
            <img src="/images/logo.png" alt="OSAI" />
            <p>
              Bringing authentic and stylish clothing to your wardrobe.
              Pure fashion crafted from the finest materials.
            </p>
          </div>

          <div className="osai-footer-col">
            <h5>Shop</h5>
            <ul>
              <li><NavLink to="/mens">Mens</NavLink></li>
              <li><NavLink to="/womens">Womens</NavLink></li>
              <li><NavLink to="/kids">Kids</NavLink></li>
              <li><NavLink to="/newarrivals">New Arrivals</NavLink></li>
              <li><NavLink to="/sale">Sale</NavLink></li>
            </ul>
          </div>

          <div className="osai-footer-col">
            <h5>Info</h5>
            <ul>
              <li><NavLink to="/about">About Us</NavLink></li>
              <li><NavLink to="/contact">Contact</NavLink></li>
              <li><NavLink to="/feedback">Feedback</NavLink></li>
              <li>
                <a href="mailto:OSAI@aston.ac.uk">OSAI@aston.ac.uk</a>
              </li>
              <li>134a Aston Road, Birmingham, UK</li>
            </ul>
          </div>
        </div>

        <div className="osai-footer-bottom">
          <span>&copy; {new Date().getFullYear()} OSAI Fashion. All rights reserved.</span>
          <span>Birmingham, United Kingdom</span>
        </div>
>>>>>>> deploy-branch
      </footer>

      <Chatbot />
    </>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> deploy-branch
