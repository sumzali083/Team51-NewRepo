import { createContext, useState, useEffect } from "react";

export var WishlistContext = createContext();

export function WishlistProvider(props) {
  var children = props.children;

  var [wishlist, setWishlist] = useState(function () {
    var saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(
    function () {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    },
    [wishlist]
  );

  function addToWishlist(product) {
    setWishlist(function (prev) {
      var exists = prev.find(function (item) {
        return item.id === product.id;
      });

      if (exists) return prev;

      return prev.concat(Object.assign({}, product));
    });
  }

  function removeFromWishlist(id) {
    setWishlist(function (prev) {
      return prev.filter(function (item) {
        return item.id !== id;
      });
    });
  }

  return (
    <WishlistContext.Provider value={{ wishlist: wishlist, addToWishlist: addToWishlist, removeFromWishlist: removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
