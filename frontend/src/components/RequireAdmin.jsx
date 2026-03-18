import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export function RequireAdmin({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="container mt-5">Checking admin access...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.must_change_password) return <Navigate to="/account/change-password" replace />;
  if (!user.is_admin) return <Navigate to="/" replace />;

  return children;
}

