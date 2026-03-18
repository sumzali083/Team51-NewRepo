import { useContext, useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "./context/CartContext";
import { AuthContext } from "./context/AuthContext";
import { WishlistContext } from "./context/WishlistContext";
import Chatbot from "./components/Chatbot";

export function Layout() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = search.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const cartCtx = useContext(CartContext);
  const totalItems = cartCtx?.cart?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;

  const wishlistCtx = useContext(WishlistContext);
  const totalFav = wishlistCtx?.wishlist?.length || 0;

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <>
      <header className="osai-header" id="main-header">
        <nav className="osai-navbar">
          <div className="container-fluid osai-nav-inner">
            <NavLink className="navbar-brand osai-brand" to="/">
              <img src="/images/logo.png" alt="OSAI" />
            </NavLink>

            <ul className="osai-nav-links">
              {[
                { to: "/", label: "Home", end: true },
                { to: "/allproducts", label: "All Products" },
                { to: "/mens", label: "Mens" },
                { to: "/womens", label: "Womens" },
                { to: "/kids", label: "Kids" },
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
                  { to: "/allproducts", label: "All Products" },
                  { to: "/mens", label: "Mens" },
                  { to: "/womens", label: "Womens" },
                  { to: "/kids", label: "Kids" },
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
              <button
                type="button"
                className="osai-theme-toggle"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                <span>{theme === "dark" ? "☀ Light" : "🌙 Dark"}</span>
              </button>

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
              <NavLink
                to="/wishlist"
                className="osai-action-btn"
                aria-label={`Favourites (${totalFav} items)`}
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

              {user ? (
                <div ref={profileRef} style={{ position: "relative" }}>
                  {/* Profile trigger */}
                  <button
                    className="osai-profile-trigger"
                    onClick={() => setProfileOpen((v) => !v)}
                    aria-label="Profile menu"
                  >
                    <div className="osai-profile-avatar">
                      {user.name?.[0] || "?"}
                    </div>
                    <span className="osai-profile-trigger-name" style={{ fontSize: 12, maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name}
                    </span>
                    <i className="bi bi-chevron-down osai-profile-trigger-chevron" style={{ fontSize: 9, opacity: 0.5, transition: "transform 0.2s", transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <div style={{
                      position: "absolute",
                      top: "calc(100% + 10px)",
                      right: 0,
                      minWidth: 220,
                      background: "#0e0e0e",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      zIndex: 1000,
                      overflow: "hidden",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                    }}>
                      {/* User header */}
                      <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="osai-profile-avatar-lg">{user.name?.[0] || "?"}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                          <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>
                            {user.email || (user.is_admin ? "Administrator" : "Member")}
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div style={{ padding: "6px 0" }}>
                        <NavLink to="/account" className="osai-dropdown-item">
                          <i className="bi bi-person-lines-fill" />
                          My Details
                        </NavLink>
                        {user.is_admin && (
                          <NavLink to="/admin" className="osai-dropdown-item">
                            <i className="bi bi-speedometer2" />
                            Admin Dashboard
                          </NavLink>
                        )}
                        <NavLink to="/orders" className="osai-dropdown-item">
                          <i className="bi bi-receipt" />
                          My Orders
                        </NavLink>
                        <NavLink to="/refunds" className="osai-dropdown-item">
                          <i className="bi bi-arrow-counterclockwise" />
                          Refund Requests
                        </NavLink>
                        <NavLink to="/account/change-password" className="osai-dropdown-item">
                          <i className="bi bi-key" />
                          Change Password
                        </NavLink>

                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "6px 0" }} />

                        <button onClick={handleLogout} className="osai-dropdown-item danger">
                          <i className="bi bi-box-arrow-right" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink to="/login" className="osai-action-btn">
                  <i className="bi bi-person" />
                  <span className="osai-login-label d-none d-xl-inline">Login</span>
                </NavLink>
              )}

              <button
                className="osai-hamburger"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <span className={`osai-hamburger-icon${menuOpen ? " open" : ""}`} />
              </button>

            </div>
          </div>
        </nav>
      </header>

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
              <li><NavLink to="/allproducts">All Products</NavLink></li>
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

          <div className="osai-footer-col">
            <h5>Help & Policies</h5>
            <ul>
              <li><NavLink to="/faq">FAQs</NavLink></li>
              <li><NavLink to="/returns-policy">Returns Policy</NavLink></li>
              <li><NavLink to="/privacy-policy">Privacy Policy</NavLink></li>
              <li><NavLink to="/terms">Terms & Conditions</NavLink></li>
            </ul>
          </div>
        </div>

        <div className="osai-footer-bottom">
          <span>&copy; {new Date().getFullYear()} OSAI Fashion. All rights reserved.</span>
          <span>Birmingham, United Kingdom</span>
        </div>
      </footer>

      <Chatbot />
    </>
  );
}

