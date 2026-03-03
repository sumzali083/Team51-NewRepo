import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { products } from "../data/products";

export default function Products() {
  var cartContext = useContext(CartContext);
  var addToCart = cartContext.addToCart;
  const [hoveredProductId, setHoveredProductId] = useState(null);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Our Products</h2>
      <div className="row g-4">
        {products.map(function(product) {
          const primaryImage = product.image || (product.images && product.images[0]) || "";
          const secondaryImage = (product.images && product.images[1]) || primaryImage;
          const isHovered = hoveredProductId === product.id;

          return (
            <div key={product.id} className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div
                  className="card-img-top"
                  style={{ position: "relative", overflow: "hidden" }}
                  onMouseEnter={function() { setHoveredProductId(product.id); }}
                  onMouseLeave={function() { setHoveredProductId(null); }}
                >
                  <img
                    src={primaryImage}
                    alt={product.name}
                    style={{
                      width: "100%",
                      display: "block",
                      opacity: isHovered ? 0 : 1,
                      transition: "opacity 0.45s ease",
                    }}
                  />
                  <img
                    src={secondaryImage}
                    alt={`${product.name} alternate view`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: isHovered ? 1 : 0,
                      transition: "opacity 0.45s ease",
                    }}
                  />
                </div>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text fw-bold">£{product.price.toFixed(2)}</p>
                  <button
                    className="btn btn-primary mt-auto"
                    onClick={function() { addToCart(product); }}
                  >
                    Add to Basket
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



