import { http } from "./http";

/**
 * Register
 * @param {{name:string, email:string, password:string}} payload
 * @returns {Promise<any>} response.data
 *
 * Not: Endpoint adları yaygın kalıplara göre verilmiştir.
 * Gerekirse /api-docs’a göre ileride güncelleriz.
 */
export async function registerApi(payload) {
  const { data } = await http.post("/users/signup", payload);
  return data;
}

/**
 * Login
 * @param {{email:string, password:string}} payload
 * @returns {Promise<any>} response.data
 */
export async function loginApi(payload) {
  const { data } = await http.post("/users/signin", payload);
  return data;
}
export async function getCurrentUserApi() {
  const { data } = await http.get("/users/current");
  return data;
}
/**
 * Logout
 * @returns {Promise<void>}
 */
export async function logoutApi() {
  await http.post("/users/logout");
}
