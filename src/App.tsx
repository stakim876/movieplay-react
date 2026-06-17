import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useCallback, Suspense, lazy } from "react";

import { StoreBootstrap } from "@/stores/StoreBootstrap";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import SplashScreen from "@/components/common/SplashScreen";
import Toast from "@/components/common/Toast";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import "@/styles/common/loader.css";

import PrivateRoute from "@/routes/PrivateRoute";
import AdminRoute from "@/routes/AdminRoute";

const HomePage = lazy(() => import("@/pages/content/HomePage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const SignUpPage = lazy(() => import("@/pages/auth/SignUpPage"));
const ProfilePage = lazy(() => import("@/pages/user/ProfilePage"));
const FavoritesPage = lazy(() => import("@/pages/user/FavoritesPage"));
const SearchPage = lazy(() => import("@/pages/content/SearchPage"));
const MovieDetail = lazy(() => import("@/pages/content/MovieDetail"));
const CategoryPage = lazy(() => import("@/pages/content/CategoryPage"));
const DiscoverPage = lazy(() => import("@/pages/content/DiscoverPage"));
const NewHotPage = lazy(() => import("@/pages/content/NewHotPage"));
const PersonPage = lazy(() => import("@/pages/content/PersonPage"));
const WhoPage = lazy(() => import("@/pages/auth/WhoPage"));
const PlayerPage = lazy(() => import("@/pages/player/PlayerPage"));

const SubscriptionPage = lazy(() => import("@/pages/subscription/SubscriptionPage"));
const PaymentSuccessPage = lazy(() => import("@/pages/subscription/PaymentSuccessPage"));
const PaymentFailPage = lazy(() => import("@/pages/subscription/PaymentFailPage"));

const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader-content">
      <div className="page-loader-spinner"></div>
      <p className="page-loader-text">로딩 중...</p>
    </div>
  </div>
);

function MainLayout({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  return (
    <div className="app-layout">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <>
      <Helmet>
        <title>MoviePlay | 감성 무비</title>
      </Helmet>

      <Toast />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          <Route
            path="/subscription"
            element={
              <PrivateRoute>
                <SubscriptionPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/subscription/payment/success"
            element={
              <PrivateRoute>
                <PaymentSuccessPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/subscription/payment/fail"
            element={
              <PrivateRoute>
                <PaymentFailPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/who"
            element={
              <PrivateRoute>
                <WhoPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          <Route
            element={
              <MainLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          >
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />

            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />

            <Route
              path="/search"
              element={
                <PrivateRoute>
                  <SearchPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/person/:id"
              element={
                <PrivateRoute>
                  <PersonPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/movie/:id"
              element={
                <PrivateRoute>
                  <MovieDetail />
                </PrivateRoute>
              }
            />

            <Route
              path="/tv/:id"
              element={
                <PrivateRoute>
                  <MovieDetail />
                </PrivateRoute>
              }
            />

            <Route
              path="/category/:type/:category"
              element={
                <PrivateRoute>
                  <CategoryPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/category/genre/:genreId"
              element={
                <PrivateRoute>
                  <CategoryPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/discover"
              element={
                <PrivateRoute>
                  <DiscoverPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/new-hot"
              element={
                <PrivateRoute>
                  <NewHotPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/favorites"
              element={
                <PrivateRoute>
                  <FavoritesPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/player"
              element={
                <PrivateRoute>
                  <PlayerPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/player/:id"
              element={
                <PrivateRoute>
                  <PlayerPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/player/:type/:id"
              element={
                <PrivateRoute>
                  <PlayerPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <h1>관리자 페이지</h1>
                </AdminRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <StoreBootstrap>
        <AppContent />
      </StoreBootstrap>
    </ErrorBoundary>
  );
}
