import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import App from "@/app/App";
import { bootstrapStores } from "@/app/providers/initStores";
import "@/styles/index.css";
import "@/styles/common/scrollbars.css";
import "@/styles/themes/theme.css";
import "@/styles/themes/buttons.css";

// [면접] 앱이 그려지기 전에 스토어를 먼저 켭니다.
// → 왜? Firebase 로그인 상태 감시(onAuthStateChanged)는 컴포넌트마다 useEffect로 걸면
//   중복 등록되거나, 첫 렌더 때 user가 아직 null이라 로그인 페이지로 잠깐 튕길 수 있습니다.
// → 말하기: "전역 상태 구독은 render 전에 한 번만 등록하도록 main에서 bootstrap 했습니다."
bootstrapStores();

// [면접] React 18의 createRoot로 앱을 마운트합니다.
// → 예전 ReactDOM.render와 달리 동시성(Concurrent) 기능을 쓸 수 있습니다.
ReactDOM.createRoot(document.getElementById("root")!).render(
  // [면접] StrictMode는 개발 모드에서만 effect를 두 번 돌려봅니다.
  // → 왜? cleanup(정리 함수)을 빼먹었는지 미리 잡으려고요. 배포 빌드에는 영향 없습니다.
  // → 말하기: "개발 중 사이드이펙트 누수를 조기에 찾기 위해 StrictMode를 씁니다."
  <React.StrictMode>
    {/* [면접] HelmetProvider로 페이지별 <title> 등을 관리합니다.
        Provider 없이 <Helmet>만 쓰면 여러 페이지가 head를 동시에 건드려 충돌할 수 있습니다. */}
    <HelmetProvider>
      {/* [면접] BrowserRouter = 주소창 URL로 페이지를 바꿉니다 (새로고침 없이).
          future 옵션은 react-router v7 동작을 미리 켜 둔 것입니다. */}
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
