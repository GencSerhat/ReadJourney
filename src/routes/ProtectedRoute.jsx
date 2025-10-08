import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks.js";
import { selectToken } from "../features/auth/authSlice.js";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const tokenFromStore = useAppSelector(selectToken);

  // Yeni persist yapısına uygun fallback:
  let tokenFromStorage = null;
  try {
    const raw = localStorage.getItem("auth");
    tokenFromStorage = raw ? JSON.parse(raw)?.token : null;
  } catch {
    tokenFromStorage = localStorage.getItem("token"); // çok eski geçici test için
  }

  const token = tokenFromStore || tokenFromStorage;

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
