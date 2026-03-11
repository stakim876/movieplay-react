import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "@/styles/index.css";
import "@/styles/themes/theme.css";

// index.html의 #root에 React 앱을 마운트
ReactDOM.createRoot(document.getElementById("root")).render(
  /* 개발 모드에서 잠재적 문제 감지 (이중 렌더 등) */
  <React.StrictMode>
    {/* 페이지 title/meta 태그 제어 (SEO, 공유 시 미리보기) */}
    <HelmetProvider>
      {/* URL 기반 라우팅 (/login, /movie/123 등) */}
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
