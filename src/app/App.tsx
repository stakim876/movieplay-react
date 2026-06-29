import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import { StoreBootstrap } from "@/app/providers/StoreBootstrap";
import { QueryProvider } from "@/app/providers/QueryProvider";
import Header from "@/shared/layout/Header";
import Sidebar from "@/shared/layout/Sidebar";
import Toast from "@/shared/ui/Toast";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";
import AppRoutes from "@/app/routes/AppRoutes";
import "@/styles/common/loader.css";

function MainLayout({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        본문 바로가기
      </a>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main id="main-content" className="main-content" tabIndex={-1}>
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
        <title>MoviePlay | 영화 탐색 클라이언트</title>
      </Helmet>
      <Toast />
      <AppRoutes layout={<MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <QueryProvider>
        <StoreBootstrap>
          <AppContent />
        </StoreBootstrap>
      </QueryProvider>
    </ErrorBoundary>
  );
}
