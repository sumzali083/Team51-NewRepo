import { createContext, useState, useEffect, useContext } from "react";
import api from "../api";
import { AuthContext } from "./AuthContext";
import { Fallback } from "../data";

export var CartContext = createContext();

export function CartProvider(props) {
  var children = props.children;
  const { user } = useContext(AuthContext);

  var [cart, setCart] = useState([]);
  var [loading, setLoading] = useState(true);

  function normalizeImage(url) {
    if (!url) return Fallback;
    if (/^https?:\/\//i.test(url)) return url;
    return url.startsWith("/") ? url : `/${url}`;
  }

  // Load cart on mount and when user changes
  useEffect(function() {
    async function syncCartForSession() {
      if (user) {
        await mergeGuestCartIntoBackend();
        await loadCartFromBackend();
      } else {
        // Not logged in - load from localStorage
        var saved = localStorage.getItem("cart");
        setCart(saved ? JSON.parse(saved) : []);
        setLoading(false);
      }
    }
    syncCartForSession();
  }, [user]);

  // Save to localStorage when cart changes (only if not logged in)
  useEffect(function() {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, user]);

  async function loadCartFromBackend() {
    try {
      setLoading(true);
      const res = await api.get("/api/cart");
      // Transform backend format to frontend format
      const formattedCart = res.data.map(item => ({
        id: item.product_id,
        name: item.name,
        price: parseFloat(item.price),
        image: normalizeImage(item.image_url),
        quantity: item.quantity,
        stock: Number(item.stock ?? 0),
      }));
      setCart(formattedCart);
    } catch (err) {
      console.error("Error loading cart:", err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(product) {
    const stock =
      product && product.stock !== undefined && product.stock !== null
        ? Number(product.stock)
        : null;
    const hasStockInfo = Number.isFinite(stock);

    if (hasStockInfo && stock <= 0) {
      return { ok: false, message: "This item is sold out." };
    }

    if (user) {
      // Logged in - sync to backend
      try {
        await api.post("/api/cart", {
          productId: product.id,
          quantity: 1
        });
        // Reload cart from backend
        await loadCartFromBackend();
        if (hasStockInfo && stock <= 5) {
          return { ok: true, message: `Added to basket. Only ${stock} left in stock.` };
        }
        return { ok: true, message: "Added to basket." };
      } catch (err) {
        console.error("Error adding to cart:", err);
        return {
          ok: false,
          message: err?.response?.data?.message || "Could not add item to basket.",
        };
      }
    } else {
      // Not logged in - use local state
      const existing = cart.find(function(item) {
        return item.id === product.id;
      });
      const nextQty = (existing ? Number(existing.quantity || 0) : 0) + 1;
      if (hasStockInfo && nextQty > stock) {
        return { ok: false, message: `Only ${stock} left in stock.` };
      }

      setCart(function(prev) {
        var exists = prev.find(function(item) {
          return item.id === product.id;
        });

        if (exists) {
          return prev.map(function(item) {
            if (item.id === product.id) {
              return Object.assign({}, item, { quantity: item.quantity + 1 });
            } else {
              return item;
            }
          });
        }

        return prev.concat(Object.assign({}, product, { quantity: 1 }));
      });
      if (hasStockInfo && stock <= 5) {
        return { ok: true, message: `Added to basket. Only ${stock} left in stock.` };
      }
      return { ok: true, message: "Added to basket." };
    }
  }

  async function mergeGuestCartIntoBackend() {
    var saved = localStorage.getItem("cart");
    if (!saved) return;
    var guestItems = [];
    try {
      guestItems = JSON.parse(saved) || [];
    } catch {
      guestItems = [];
    }
    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      localStorage.removeItem("cart");
      return;
    }

    for (const item of guestItems) {
      const productId = item && item.id;
      const quantity = Math.max(1, Number(item?.quantity || 1));
      if (!productId) continue;
      try {
        await api.post("/api/cart", { productId, quantity });
      } catch (err) {
        console.error("Error merging guest cart item:", err);
      }
    }
    localStorage.removeItem("cart");
  }

  async function removeFromCart(id) {
    if (user) {
      // Logged in - find the cart item ID from backend
      try {
        const res = await api.get("/api/cart");
        const item = res.data.find(i => i.product_id === id);
        if (item) {
          await api.delete(`/api/cart/${item.id}`);
          await loadCartFromBackend();
        }
      } catch (err) {
        console.error("Error removing from cart:", err);
      }
    } else {
      // Not logged in - use local state
      setCart(function(prev) {
        return prev.filter(function(item) {
          return item.id !== id;
        });
      });
    }
  }

  async function changeQuantity(id, qty) {
    if (user) {
      // Logged in - update via backend
      try {
        const res = await api.get("/api/cart");
        const item = res.data.find(i => i.product_id === id);
        if (item) {
          if (qty <= 0) {
            // Remove if quantity is 0 or less
            await api.delete(`/api/cart/${item.id}`);
          } else {
            // Update quantity using PUT
            await api.put(`/api/cart/${item.id}`, { quantity: qty });
          }
          await loadCartFromBackend();
        }
      } catch (err) {
        console.error("Error updating cart:", err);
      }
    } else {
      // Not logged in - use local state
      setCart(function(prev) {
        return prev.map(function(item) {
          if (item.id === id) {
            return Object.assign({}, item, { quantity: qty });
          } else {
            return item;
          }
        });
      });
    }
  }

  async function clearCart() {
    if (user) {
      try {
        await api.delete("/api/cart");
        await loadCartFromBackend();
      } catch (err) {
        console.error("Error clearing cart:", err);
      }
    } else {
      setCart([]);
    }
  }

  async function refreshCart() {
    if (user) {
      await loadCartFromBackend();
    } else {
      var saved = localStorage.getItem("cart");
      setCart(saved ? JSON.parse(saved) : []);
    }
  }

  return (
    <CartContext.Provider value={{ cart: cart, addToCart: addToCart, removeFromCart: removeFromCart, changeQuantity: changeQuantity, clearCart: clearCart, refreshCart: refreshCart, loading: loading }}>
      {children}
    </CartContext.Provider>
  );
}
