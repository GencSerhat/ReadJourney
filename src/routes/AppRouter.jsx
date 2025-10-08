import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx"; // AppRouter ile aynı klasörde
import NotFound from "../pages/NotFound/NotFound.jsx";
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ilk açılışta /login'e yönlendir */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/register" element={<div>Register</div>} />
        </Route>

        {/* PRIVATE (Protected) */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/recommended"
            element={<div>Recommended (Private)</div>}
          />
          <Route path="/library" element={<div>My Library (Private)</div>} />
          <Route
            path="/reading/:bookId"
            element={<div>Reading (Private)</div>}
          />
        </Route>

        {/* NOT FOUND */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
