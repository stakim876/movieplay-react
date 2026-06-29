import { lazy, Suspense, type ReactNode } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { ROUTES } from "@/core/config/routes";
import PrivateRoute from "@/app/routes/PrivateRoute";
import AdminRoute from "@/app/routes/AdminRoute";
import PageLoader from "@/shared/ui/PageLoader";

const HomePage = lazy(() => import("@/features/browse/pages/HomePage"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const SignUpPage = lazy(() => import("@/features/auth/pages/SignUpPage"));
const ProfilePage = lazy(() => import("@/features/account/pages/ProfilePage"));
const FavoritesPage = lazy(() => import("@/features/watchlist/pages/FavoritesPage"));
const SearchPage = lazy(() => import("@/features/browse/pages/SearchPage"));
const MovieDetail = lazy(() => import("@/features/browse/pages/MovieDetail"));
const CategoryPage = lazy(() => import("@/features/browse/pages/CategoryPage"));
const BrowsePage = lazy(() => import("@/features/browse/pages/BrowsePage"));
const DiscoverPage = lazy(() => import("@/features/browse/pages/DiscoverPage"));
const NewHotPage = lazy(() => import("@/features/browse/pages/NewHotPage"));
const PersonPage = lazy(() => import("@/features/browse/pages/PersonPage"));
const WhoPage = lazy(() => import("@/features/auth/pages/WhoPage"));
const PlayerPage = lazy(() => import("@/features/playback/pages/PlayerPage"));
const SubscriptionPage = lazy(() => import("@/features/subscription/pages/SubscriptionPage"));
const PaymentSuccessPage = lazy(() => import("@/features/subscription/pages/PaymentSuccessPage"));
const PaymentFailPage = lazy(() => import("@/features/subscription/pages/PaymentFailPage"));
const NotFoundPage = lazy(() => import("@/shared/ui/NotFoundPage"));

function withAuth(page: ReactNode) {
  return <PrivateRoute>{page}</PrivateRoute>;
}

type AppRoutesProps = {
  layout: ReactNode;
};

export default function AppRoutes({ layout }: AppRoutesProps) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.signup} element={<SignUpPage />} />

        <Route path={ROUTES.subscription} element={withAuth(<SubscriptionPage />)} />
        <Route path={ROUTES.paymentSuccess} element={withAuth(<PaymentSuccessPage />)} />
        <Route path={ROUTES.paymentFail} element={withAuth(<PaymentFailPage />)} />
        <Route path={ROUTES.who} element={withAuth(<WhoPage />)} />
        <Route path={ROUTES.profile} element={withAuth(<ProfilePage />)} />

        <Route element={layout}>
          <Route path="/" element={withAuth(<HomePage />)} />
          <Route path={ROUTES.home} element={withAuth(<HomePage />)} />
          <Route path={ROUTES.search} element={withAuth(<SearchPage />)} />
          <Route path="/person/:id" element={withAuth(<PersonPage />)} />
          <Route path="/movie/:id" element={withAuth(<MovieDetail />)} />
          <Route path="/tv/:id" element={withAuth(<MovieDetail />)} />
          <Route path="/category/:type/:category" element={withAuth(<CategoryPage />)} />
          <Route path="/category/genre/:genreId" element={withAuth(<CategoryPage />)} />
          <Route path={ROUTES.browse} element={withAuth(<BrowsePage />)} />
          <Route path={ROUTES.discover} element={withAuth(<DiscoverPage />)} />
          <Route path={ROUTES.newHot} element={withAuth(<NewHotPage />)} />
          <Route path={ROUTES.favorites} element={withAuth(<FavoritesPage />)} />
          <Route path="/player" element={withAuth(<PlayerPage />)} />
          <Route path="/player/:id" element={withAuth(<PlayerPage />)} />
          <Route path="/player/:type/:id" element={withAuth(<PlayerPage />)} />
          <Route
            path={ROUTES.admin}
            element={
              <AdminRoute>
                <h1>관리자 페이지</h1>
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export { Outlet };
