import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { AuthContext } from "./AuthContext";

export const WishlistContext = createContext();

function mapBackendWishlistItem(item) {
  const id = item.sku || String(item.product_id);
  const image = item.image_url || "/images/placeholder.jpg";
  return {
    id,
    sku: item.sku || null,
    product_id: item.product_id,
    name: item.name,
    price: Number(item.price || 0),
    originalPrice: item.original_price ? Number(item.original_price) : null,
    image,
  };
}

export function WishlistProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);

  async function loadWishlistFromBackend() {
    try {
      const res = await api.get("/api/wishlist");
      const items = Array.isArray(res.data) ? res.data.map(mapBackendWishlistItem) : [];
      setWishlist(items);
    } catch (err) {
      console.error("Error loading wishlist:", err);
      setWishlist([]);
    }
  }

  async function syncGuestWishlistToBackend() {
    const saved = localStorage.getItem("wishlist");
    const guestItems = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(guestItems) || guestItems.length === 0) return;

    for (const item of guestItems) {
      const productId = item?.id || item?.sku || item?.product_id;
      if (!productId) continue;
      try {
        await api.post("/api/wishlist", { productId });
      } catch (err) {
        console.error("Error syncing wishlist item:", err);
      }
    }
    localStorage.removeItem("wishlist");
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      if (user) {
        await syncGuestWishlistToBackend();
        if (!cancelled) {
          await loadWishlistFromBackend();
        }
      } else {
        const saved = localStorage.getItem("wishlist");
        if (!cancelled) {
          setWishlist(saved ? JSON.parse(saved) : []);
        }
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  async function addToWishlist(product) {
    if (!product) return;
    const productId = product.id || product.sku || product.product_id;
    if (!productId) return;

    if (user) {
      try {
        await api.post("/api/wishlist", { productId });
        await loadWishlistFromBackend();
      } catch (err) {
        console.error("Error adding to wishlist:", err);
      }
      return;
    }

    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === productId);
      if (exists) return prev;
      return prev.concat({
        id: productId,
        sku: product.sku || null,
        product_id: product.product_id || product.db_id || null,
        name: product.name,
        price: Number(product.price || 0),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        image: product.image || (Array.isArray(product.images) ? product.images[0] : null) || "/images/placeholder.jpg",
      });
    });
  }

  async function removeFromWishlist(id) {
    if (!id) return;
    if (user) {
      try {
        await api.delete(`/api/wishlist/${encodeURIComponent(id)}`);
        await loadWishlistFromBackend();
      } catch (err) {
        console.error("Error removing from wishlist:", err);
      }
      return;
    }

    setWishlist((prev) => prev.filter((item) => item.id !== id));
  }

  async function refreshWishlist() {
    if (user) {
      await loadWishlistFromBackend();
    } else {
      const saved = localStorage.getItem("wishlist");
      setWishlist(saved ? JSON.parse(saved) : []);
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        refreshWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
