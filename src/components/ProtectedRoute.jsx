import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user")); // or from context

  const isAdmin =
    user?.username === "wisdom256" &&
    user?.email === "wisdom.jeremiah.upti@gmail.com" &&
    user?.password === "12345";

  if (!isAdmin) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
