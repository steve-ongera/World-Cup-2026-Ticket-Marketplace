import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

// Layout
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";

// Pages
import HomePage from "./pages/HomePage.jsx";
import MatchListPage from "./pages/MatchListPage.jsx";
import MatchDetailPage from "./pages/MatchDetailPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrderConfirmPage from "./pages/OrderConfirmPage.jsx";
import SellTicketsPage from "./pages/SellTicketsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

/* ─── Scroll to top on route change ─── */
function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

/* ─── NProgress page loader ─── */
function PageProgress() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.NProgress) {
      window.NProgress.start();
      const t = setTimeout(() => window.NProgress.done(), 300);
      return () => clearTimeout(t);
    }
  }, [pathname]);
  return null;
}

/* ─── Protected route wrapper ─── */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-success" role="status" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/* ─── Guest-only route (redirect if already logged in) ─── */
function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

/* ─── Main layout wrapper ─── */
function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="page-wrapper">{children}</main>
      <Footer />
    </>
  );
}

/* ─── App Routes ─── */
function AppRoutes() {
  return (
    <>
      <ScrollReset />
      <PageProgress />
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/matches"
          element={
            <Layout>
              <MatchListPage />
            </Layout>
          }
        />
        <Route
          path="/matches/:id"
          element={
            <Layout>
              <MatchDetailPage />
            </Layout>
          }
        />

        {/* Guest only */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        {/* Protected */}
        <Route
          path="/checkout/:listingId"
          element={
            <ProtectedRoute>
              <Layout>
                <CheckoutPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId/confirm"
          element={
            <ProtectedRoute>
              <Layout>
                <OrderConfirmPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <Layout>
                <SellTicketsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Layout>
                <WishlistPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <Layout>
              <NotFoundPage />
            </Layout>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}