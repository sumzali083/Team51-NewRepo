// frontend/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./Layout";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { MensPage } from "./pages/MensPage";
import { WomensPage } from "./pages/WomensPage";
import { KidsPage } from "./pages/KidsPage";
<<<<<<< HEAD
=======
import { NewArrivalsPage } from "./pages/NewArrivalsPage";
import { SalePage } from "./pages/SalePage";
>>>>>>> deploy-branch
import { ProductPage } from "./ProductPage";
import { SearchPage } from "./pages/SearchPage";
import Contact from "./pages/Contact";
import LoginPage from "./pages/LoginPage";
<<<<<<< HEAD
import FeedbackPage from "./pages/FeedbackPage";

import { CartProvider } from "./context/CartContext";
import Cart from "./pages/cart";          // ✅ match filename
import CheckoutPage from "./pages/CheckoutPage";
=======

import FeedbackPage from "./pages/FeedbackPage";
import WishlistPage from "./pages/WishlistPage";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import Cart from "./pages/cart";
import CheckoutPage from "./pages/CheckoutPage";
import { ForgotPassword } from "./components/ForgotPassword";
import { ResetPassword } from "./components/ResetPassword";
import { ChangePassword } from "./components/ChangePassword";
import { RequireAdmin } from "./components/RequireAdmin";
import AdminPage from "./pages/AdminPage";
>>>>>>> deploy-branch

export default function App() {
  console.log("DEBUG: App.jsx is rendering");
  return (
<<<<<<< HEAD
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Home */}
            <Route index element={<HomePage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />

            {/* Categories */}
            <Route path="/mens" element={<MensPage />} />
            <Route path="/womens" element={<WomensPage />} />
            <Route path="/kids" element={<KidsPage />} />

            {/* Product + search */}
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/search" element={<SearchPage />} />

            {/* Static pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/feedback" element={<FeedbackPage />} />

            {/* Cart / checkout */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* 🔁 Redirect /products to home */}
            <Route path="/products" element={<Navigate to="/" replace />} />

            {/* 🔁 Catch-all: any unknown path -> home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
=======
    <AuthProvider>
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
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/account/change-password"
                  element={<ChangePassword />}
                />
                <Route
                  path="/admin"
                  element={
                    <RequireAdmin>
                      <AdminPage />
                    </RequireAdmin>
                  }
                />
                <Route path="/feedback" element={<FeedbackPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
>>>>>>> deploy-branch
  );
}
