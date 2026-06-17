import { initAuthStore } from "@/stores/authStore";
import { initThemeStore } from "@/stores/themeStore";
import { initConfigStore } from "@/stores/configStore";
import { initFavoritesStore } from "@/stores/favoritesStore";
import { initSubscriptionStore } from "@/stores/subscriptionStore";
import { initWatchHistoryStore } from "@/stores/watchHistoryStore";
import { initUserFeedbackStore } from "@/stores/userFeedbackStore";
import { initNotificationsStore } from "@/stores/notificationsStore";

let bootstrapped = false;

export function bootstrapStores() {
  if (bootstrapped) return;
  bootstrapped = true;

  initAuthStore();
  initThemeStore();
  initConfigStore();
  initFavoritesStore();
  initSubscriptionStore();
  initWatchHistoryStore();
  initUserFeedbackStore();
  initNotificationsStore();
}
