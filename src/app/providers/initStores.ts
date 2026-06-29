import { initAuthStore } from "@/stores/authStore";
import { initThemeStore } from "@/stores/themeStore";
import { initConfigStore } from "@/stores/configStore";
import { initFavoritesStore } from "@/stores/favoritesStore";
import { initSubscriptionStore } from "@/stores/subscriptionStore";
import { initWatchHistoryStore } from "@/stores/watchHistoryStore";
import { initUserFeedbackStore } from "@/stores/userFeedbackStore";
import { initNotificationsStore } from "@/stores/notificationsStore";

// [면접] bootstrapped 플래그 = "이미 초기화했으면 다시 하지 마"
// → 왜? 개발 중 핫 리로드(HMR) 때 init이 여러 번 불리면 Firebase 리스너가 중복 등록됩니다.
let bootstrapped = false;

export function bootstrapStores() {
  if (bootstrapped) return;
  bootstrapped = true;

  // [면접] auth를 가장 먼저 켭니다.
  // → 찜 목록·시청 기록 스토어가 "로그인 됐다/풀렸다" 변화를 auth 스토어 구독으로 듣기 때문입니다.
  initAuthStore();
  initThemeStore();
  initConfigStore();
  initFavoritesStore();
  initSubscriptionStore();
  initWatchHistoryStore();
  initUserFeedbackStore();
  initNotificationsStore();
}
