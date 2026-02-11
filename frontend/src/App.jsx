// frontend/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./Layout";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { MensPage } from "./pages/MensPage";
import { WomensPage } from "./pages/WomensPage";
import { KidsPage } from "./pages/KidsPage";
import { NewArrivalsPage } from "./pages/NewArrivalsPage";
import { SalePage } from "./pages/SalePage";
import { ProductPage } from "./ProductPage";
import { SearchPage } from "./pages/SearchPage";
import Contact from "./pages/Contact";
//import { Login } from "./components/Login";   // <- we use this
import LoginPage from "./pages/LoginPage";

import FeedbackPage from "./pages/FeedbackPage";
import WishlistPage from "./pages/WishlistPage";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import Cart from "./pages/cart";
import CheckoutPage from "./pages/CheckoutPage";

export default function App() {
  console.log("DEBUG: App.jsx is rendering");
  return (
    <CartProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/mens" element={<MensPage />} />
              <Route path="/womens" element={<WomensPage />} />
              <Route path="/kids" element={<KidsPage />} />
              <Route path="/newarrivals" element={<NewArrivalsPage />} />
              <Route path="/sale" element={<SalePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />

              <Route path="/feedback" element={<FeedbackPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
  );
}
