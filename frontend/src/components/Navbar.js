import { Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import osaiLogo from "/images/logo.png"; // adjust if your logo path differs

export default function Navbar() {
  const { cart } = useContext(CartContext);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={osaiLogo} alt="OSAI Logo" height="45" className="me-2" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/mens">Mens</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/womens">Womens</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/kids">Kids</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">Contact</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">About Us</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/feedback">Send Us Feedback</Link>
            </li>
          </ul>

          {/* Search + Login + Cart */}
          <form className="d-flex me-3">
            <input
              className="form-control form-control-sm"
              type="search"
              placeholder="Search products..."
            />
            <button className="btn btn-outline-light btn-sm ms-2" type="submit">
              Search
            </button>
          </form>

          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="btn btn-outline-light btn-sm me-3" to="/login">
                Login / Profile
              </Link>
            </li>
            <li className="nav-item"> 
              <Link className="nav-link" to="/orders">
                My Orders
              </Link>
            </li>
            <li className="nav-item">
              <Link className="btn btn-outline-light position-relative" to="/cart">
                🛒
                {totalItems > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {totalItems}
                  </span>
                )}
              </Link>
            </li>
          </ul>

        </div>
      </div>
    </nav>
  );
}
