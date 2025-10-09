import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx"; // AppRouter ile aynı klasörde
import NotFound from "../pages/NotFound/NotFound.jsx";
import LoginPage from "../pages/Auth/LoginPage.jsx";
import RegisterPage from "../pages/Auth/RegisterPage.jsx";
import RecommendedPage from "../pages/Recommended/RecommendedPage.jsx";
import MyLibraryPage from "../pages/Library/MyLibraryPage.jsx";
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ilk açılışta /login'e yönlendir */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* PRIVATE (Protected) */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/recommended" element={<RecommendedPage />} />
            <Route path="/library" element={<MyLibraryPage />} />
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
