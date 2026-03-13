import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

export default function OrderHistoryPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    async function fetchOrderHistory() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/orders/history");
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setError("Could not load order history right now.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrderHistory();
  }, [authLoading, user, navigate]);

  if (authLoading || loading) {
    return <div className="container mt-4">Loading order history...</div>;
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">Order History</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {!error && orders.length === 0 && (
        <div className="alert alert-info">
          You have not placed any orders yet. <Link to="/mens">Start shopping</Link>.
        </div>
      )}

      {orders.map((order) => (
        <div key={order.id} className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0">
              Order #{order.id} - GBP {Number(order.total_price || 0).toFixed(2)}
            </h5>
            <Link to="/refunds" className="btn btn-sm btn-outline-light">
              Request refund
            </Link>
          </div>

          <div className="row g-4">
            {(order.items || []).map((item, index) => {
              const image =
                item.image ||
                (Array.isArray(item.images) ? item.images[0] : null) ||
                "/images/placeholder.jpg";
              return (
                <div key={`${order.id}-${item.product_id}-${index}`} className="col-md-4">
                  <div className="card h-100 shadow-sm">
                    <img src={image} className="card-img-top" alt={item.name} />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{item.name}</h5>
                      <p className="card-text fw-bold">
                        GBP {Number(item.price_each || 0).toFixed(2)}
                      </p>
                      <p className="mb-0 text-muted">Qty: {item.quantity}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
