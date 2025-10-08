import axios from "axios";

// .env: VITE_API_BASE_URL=https://readjourney.b.goit.study/api
const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "https://readjourney.b.goit.study/api";
const BASE_URL = RAW_BASE.replace(/\/+$/, ""); // sondaki / işaretlerini temizle

// localStorage -> persist edilen token'ı oku
export function getPersistedToken() {
  try {
    const raw = localStorage.getItem("auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token) return parsed.token;
    }
  } catch {
    // ignore
  }
  // eski test fallback'i (gerekirse)
  return localStorage.getItem("token");
}

// Tek axios instance
export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// İstek interceptor: Authorization ekle
http.interceptors.request.use(
  (config) => {
    const token = getPersistedToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Yanıt interceptor: hata mesajını normalize et
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    // Okunabilir bir mesaj türet
    let message =
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.message ||
      error?.message ||
      "Unexpected error";

    // Kullanışlı alan ekleyelim (yakında toast/modal göstermek için)
    error.normalizedMessage = message;
    error.status = status || 0;

    // 401 gibi durumlar için ileride global handler bağlayabiliriz
    return Promise.reject(error);
  }
);
