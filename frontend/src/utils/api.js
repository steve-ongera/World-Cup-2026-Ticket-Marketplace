/* ═══════════════════════════════════════════════════════
   api.js — Axios instance + all API endpoint calls
   Base URL: VITE_API_BASE_URL env variable
═══════════════════════════════════════════════════════ */

import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isTokenExpired,
} from "./auth.js";

/* ─── Axios instance ─── */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

/* ─── Request interceptor — attach Bearer token ─── */

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* ─── Response interceptor — refresh on 401 ─── */

let _refreshing = false;
let _queue = [];

function processQueue(error, token = null) {
  _queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  _queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refresh = getRefreshToken();
    if (!refresh || isTokenExpired(refresh)) {
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (_refreshing) {
      return new Promise((resolve, reject) => {
        _queue.push({ resolve, reject });
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        })
        .catch((err) => Promise.reject(err));
    }

    original._retry = true;
    _refreshing = true;

    try {
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/token/refresh/`,
        { refresh }
      );
      setTokens({ access: data.access });
      processQueue(null, data.access);
      original.headers.Authorization = `Bearer ${data.access}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      _refreshing = false;
    }
  }
);

export default api;

/* ═══════════════════════════════════════════════════════
   AUTH API
═══════════════════════════════════════════════════════ */

export const authApi = {
  register: (data) => api.post("/auth/register/", data),

  login: (email, password) =>
    api.post("/auth/login/", { email, password }),

  logout: (refreshToken) =>
    api.post("/auth/logout/", { refresh: refreshToken }),

  getProfile: () => api.get("/auth/profile/"),

  updateProfile: (data) => api.put("/auth/profile/", data),

  updateAvatar: (formData) =>
    api.patch("/auth/profile/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

/* ═══════════════════════════════════════════════════════
   REFERENCE DATA API
═══════════════════════════════════════════════════════ */

export const referenceApi = {
  getConfederations: () => api.get("/confederations/"),
  getCountries: (params) => api.get("/countries/", { params }),
  getVenues: (params) => api.get("/venues/", { params }),
  getGroups: () => api.get("/groups/"),
  getSummary: () => api.get("/summary/"),
};

/* ═══════════════════════════════════════════════════════
   MATCHES API
═══════════════════════════════════════════════════════ */

export const matchesApi = {
  /**
   * List matches with optional filters.
   * @param {Object} params - stage, group, venue, search, ordering, page
   */
  list: (params = {}) => api.get("/matches/", { params }),

  /**
   * Get single match detail (includes active listings).
   */
  detail: (id) => api.get(`/matches/${id}/`),
};

/* ═══════════════════════════════════════════════════════
   TICKET LISTINGS API
═══════════════════════════════════════════════════════ */

export const listingsApi = {
  list: (params = {}) => api.get("/listings/", { params }),

  detail: (id) => api.get(`/listings/${id}/`),

  /**
   * Create a new listing (seller).
   * @param {Object} data - match, category, quantity, price_per_ticket, ...
   */
  create: (data) => api.post("/listings/", data),

  update: (id, data) => api.put(`/listings/${id}/`, data),

  patch: (id, data) => api.patch(`/listings/${id}/`, data),

  delete: (id) => api.delete(`/listings/${id}/`),

  /** My listings (seller view) */
  myListings: (params = {}) =>
    api.get("/listings/", { params: { ...params, my: true } }),
};

/* ═══════════════════════════════════════════════════════
   ORDERS API
═══════════════════════════════════════════════════════ */

export const ordersApi = {
  list: (params = {}) => api.get("/orders/", { params }),

  detail: (id) => api.get(`/orders/${id}/`),

  /**
   * Place an order.
   * @param {Object} data - listing_id, quantity, fifa_ticketing_email
   */
  create: (data) => api.post("/orders/", data),

  updateStatus: (id, data) => api.patch(`/orders/${id}/`, data),
};

/* ═══════════════════════════════════════════════════════
   REVIEWS API
═══════════════════════════════════════════════════════ */

export const reviewsApi = {
  list: (params = {}) => api.get("/reviews/", { params }),

  create: (data) => api.post("/reviews/", data),

  userReviews: (userId) =>
    api.get("/reviews/", { params: { reviewed_user: userId } }),
};

/* ═══════════════════════════════════════════════════════
   WISHLIST API
═══════════════════════════════════════════════════════ */

export const wishlistApi = {
  list: () => api.get("/wishlist/"),

  add: (matchId) => api.post("/wishlist/", { match_id: matchId }),

  remove: (wishlistId) => api.delete(`/wishlist/${wishlistId}/`),

  /** Check if a match is wishlisted — returns item or null */
  check: async (matchId) => {
    const { data } = await api.get("/wishlist/");
    const results = data.results ?? data;
    return results.find((w) => w.match?.id === matchId) ?? null;
  },
};

/* ═══════════════════════════════════════════════════════
   PRICE ALERTS API
═══════════════════════════════════════════════════════ */

export const alertsApi = {
  list: () => api.get("/alerts/"),

  create: (data) => api.post("/alerts/", data),

  update: (id, data) => api.patch(`/alerts/${id}/`, data),

  delete: (id) => api.delete(`/alerts/${id}/`),

  toggle: (id, isActive) => api.patch(`/alerts/${id}/`, { is_active: isActive }),
};

/* ═══════════════════════════════════════════════════════
   USER PUBLIC PROFILE API
═══════════════════════════════════════════════════════ */

export const usersApi = {
  publicProfile: (userId) => api.get(`/users/${userId}/`),
};