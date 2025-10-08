import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks.js";
import { selectToken } from "../features/auth/authSlice.js";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const tokenFromStore = useAppSelector(selectToken);
  const token = tokenFromStore || localStorage.getItem("token"); // geçici fallback

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
