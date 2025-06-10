import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, children }) => {
  const isDeveloper =
    user?.email === "wisdom.jeremiah.upti@gmail.com" && user?.password === "12345";

  if (!isDeveloper) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
