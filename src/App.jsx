import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useCallback, Suspense, lazy } from "react";

import { AuthProvider } from "@/context/AuthContext.jsx";
import { MovieProvider } from "@/context/MovieContext.jsx";
import { FavoritesProvider } from "@/context/FavoritesContext.jsx";
import { WatchHistoryProvider } from "@/context/WatchHistoryContext.jsx";
import { ConfigProvider } from "@/context/ConfigContext.jsx";
import { ToastProvider } from "@/context/ToastContext.jsx";
import { ThemeProvider } from "@/context/ThemeContext.jsx";
import { SubscriptionProvider } from "@/context/SubscriptionContext.jsx";

import Header from "@/components/layout/Header.jsx";
import Sidebar from "@/components/layout/Sidebar.jsx";
import SplashScreen from "@/components/common/SplashScreen.jsx";
import Toast from "@/components/common/Toast.jsx";
import ErrorBoundary from "@/components/common/ErrorBoundary.jsx";
import "@/styles/common/loader.css";

import PrivateRoute from "@/routes/PrivateRoute.jsx";
import AdminRoute from "@/routes/AdminRoute.jsx";

const HomePage = lazy(() => import("@/pages/content/HomePage.jsx"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage.jsx"));
const SignUpPage = lazy(() => import("@/pages/auth/SignUpPage.jsx"));
const ProfilePage = lazy(() => import("@/pages/user/ProfilePage.jsx"));
const FavoritesPage = lazy(() => import("@/pages/user/FavoritesPage.jsx"));
const SearchPage = lazy(() => import("@/pages/content/SearchPage.jsx"));
const MovieDetail = lazy(() => import("@/pages/content/MovieDetail.jsx"));
const CategoryPage = lazy(() => import("@/pages/content/CategoryPage.jsx"));
const DiscoverPage = lazy(() => import("@/pages/content/DiscoverPage.jsx"));
const WhoPage = lazy(() => import("@/pages/auth/WhoPage.jsx"));
const PlayerPage = lazy(() => import("@/pages/player/PlayerPage.jsx"));

const SubscriptionPage = lazy(() => import("@/pages/subscription/SubscriptionPage.jsx"));
const PaymentSuccessPage = lazy(() => import("@/pages/subscription/PaymentSuccessPage.jsx"));
const PaymentFailPage = lazy(() => import("@/pages/subscription/PaymentFailPage.jsx"));

const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader-content">
      <div className="page-loader-spinner"></div>
      <p className="page-loader-text">로딩 중...</p>
    </div>
  </div>
);

function MainLayout({ sidebarOpen, setSidebarOpen }) {
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>MoviePlay | 감성 무비</title>
      </Helmet>

      <ToastProvider>
        <Toast />

        <ConfigProvider>
          <SubscriptionProvider>
            <MovieProvider>
              <FavoritesProvider>
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
                        path="/search"
                        element={
                          <PrivateRoute>
                            <SearchPage />
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
              </FavoritesProvider>
            </MovieProvider>
          </SubscriptionProvider>
        </ConfigProvider>
      </ToastProvider>
    </>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <ThemeProvider>
        <AuthProvider>
          <WatchHistoryProvider>
            <AppContent />
          </WatchHistoryProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
