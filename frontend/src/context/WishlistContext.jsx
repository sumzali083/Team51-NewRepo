import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import api from "../api";

export var WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);

  // Sync wishlist whenever auth state resolves or user changes
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      syncWithServer();
    } else {
      const saved = localStorage.getItem("wishlist");
      setWishlist(saved ? JSON.parse(saved) : []);
    }
  }, [user, authLoading]);

  // Persist to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  async function syncWithServer() {
    try {
      // Fetch user's saved wishlist from DB
      const res = await api.get("/api/wishlist");
      const dbItems = res.data; // [{ id, product_id, name, price, sku, image_url }]

      // Grab any items the guest added before logging in
      const localRaw = localStorage.getItem("wishlist");
      const localItems = localRaw ? JSON.parse(localRaw) : [];

      // Push guest items that aren't already in the DB wishlist
      const dbSkus = new Set(dbItems.map(i => String(i.sku)));
      const dbProductIds = new Set(dbItems.map(i => String(i.product_id)));
      const newLocalItems = localItems.filter(
        i => !dbSkus.has(String(i.id)) && !dbProductIds.has(String(i.id))
      );

      for (const item of newLocalItems) {
        try {
          await api.post("/api/wishlist", { productId: item.id });
        } catch (_) {
          // skip items that fail (e.g. product deleted)
        }
      }

      // Re-fetch if we pushed new items, otherwise use what we have
      const finalRes = newLocalItems.length > 0 ? (await api.get("/api/wishlist")).data : dbItems;

      setWishlist(
        finalRes.map(i => ({
          id: i.sku || String(i.product_id),
          name: i.name,
          price: i.price,
          image: i.image_url,
          _dbProductId: i.product_id,
        }))
      );

      // Clear guest localStorage wishlist — it's now persisted in the DB
      localStorage.removeItem("wishlist");
    } catch (err) {
      console.error("Wishlist sync failed:", err);
      // Fallback to localStorage if API is unreachable
      const saved = localStorage.getItem("wishlist");
      setWishlist(saved ? JSON.parse(saved) : []);
    }
  }

  async function addToWishlist(product) {
    if (wishlist.find(i => i.id === product.id)) return;

    if (user) {
      try {
        await api.post("/api/wishlist", { productId: product.id });
        setWishlist(prev => [...prev, { ...product }]);
      } catch (err) {
        console.error("Failed to add to wishlist:", err);
      }
    } else {
      setWishlist(prev => [...prev, { ...product }]);
    }
  }

  async function removeFromWishlist(id) {
    if (user) {
      try {
        await api.delete(`/api/wishlist/${id}`);
        setWishlist(prev => prev.filter(i => i.id !== id));
      } catch (err) {
        console.error("Failed to remove from wishlist:", err);
      }
    } else {
      setWishlist(prev => prev.filter(i => i.id !== id));
    }
  }

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
