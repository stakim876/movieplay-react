import { create } from "zustand";
import { useMemo } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/core/firebase";
import { getPlanFeatures } from "@/shared/constants/subscriptionPlans";
import { useAuthStore } from "@/stores/authStore";

interface SubscriptionState {
  subscription: any;
  loading: boolean;
}

export const useSubscriptionStore = create<SubscriptionState>(() => ({
  subscription: null,
  loading: true,
}));

let subscriptionUnsubscribe: (() => void) | null = null;
let authSubUnsubscribe: (() => void) | null = null;

function subscribeToSubscription(user: { uid: string } | null) {
  if (subscriptionUnsubscribe) {
    subscriptionUnsubscribe();
    subscriptionUnsubscribe = null;
  }

  if (!user || !db) {
    useSubscriptionStore.setState({ subscription: null, loading: false });
    return;
  }

  useSubscriptionStore.setState({ loading: true });

  subscriptionUnsubscribe = onSnapshot(
    doc(db, "users", user.uid, "subscription", "current"),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        useSubscriptionStore.setState({
          subscription: {
            id: snapshot.id,
            ...data,
            startDate: data.startDate?.toDate?.() || data.startDate,
            endDate: data.endDate?.toDate?.() || data.endDate,
            nextBillingDate: data.nextBillingDate?.toDate?.() || data.nextBillingDate,
            trialEndDate: data.trialEndDate?.toDate?.() || data.trialEndDate,
            canceledAt: data.canceledAt?.toDate?.() || data.canceledAt,
          },
          loading: false,
        });
      } else {
        useSubscriptionStore.setState({ subscription: null, loading: false });
      }
    },
    (error: any) => {
      if (error.code === "permission-denied" || error.code === "not-found") {
        useSubscriptionStore.setState({ subscription: null, loading: false });
      } else {
        if (import.meta.env.DEV) {
          console.error("구독 정보 로드 실패:", error);
        }
        useSubscriptionStore.setState({ subscription: null, loading: false });
      }
    }
  );
}

export function initSubscriptionStore() {
  if (authSubUnsubscribe) return;

  subscribeToSubscription(useAuthStore.getState().user);

  authSubUnsubscribe = useAuthStore.subscribe((state, prev) => {
    if (state.user?.uid !== prev.user?.uid) {
      subscribeToSubscription(state.user);
    }
  });
}

export function useSubscription() {
  const subscription = useSubscriptionStore((s) => s.subscription);
  const loading = useSubscriptionStore((s) => s.loading);

  return useMemo(() => {
    const isSubscribed = subscription?.status === "active" || subscription?.status === "trial";
    const isTrial = subscription?.status === "trial";
    const isPremium = subscription?.planId === "premium";
    const isStandard = subscription?.planId === "standard";
    const isBasic = subscription?.planId === "basic";

    const planFeatures = subscription ? getPlanFeatures(subscription.planId) : null;
    const canDownload = planFeatures?.downloads > 0 || false;
    const maxQuality = planFeatures?.maxQuality || "480p";
    const maxProfiles = planFeatures?.profiles || 0;
    const hasAds = planFeatures?.ads !== false;
    const canAccessOriginalContent = planFeatures?.originalContent || false;
    const maxSimultaneousStreams = planFeatures?.simultaneousStreams || 1;

    const isExpired =
      subscription?.status === "expired" ||
      (subscription?.endDate && new Date(subscription.endDate) < new Date());

    const daysUntilExpiry = subscription?.endDate
      ? Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    const daysUntilTrialEnd = subscription?.trialEndDate
      ? Math.ceil((new Date(subscription.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      subscription,
      loading,
      isSubscribed,
      isTrial,
      isPremium,
      isStandard,
      isBasic,
      isExpired,
      canDownload,
      maxQuality,
      maxProfiles,
      hasAds,
      canAccessOriginalContent,
      maxSimultaneousStreams,
      planFeatures,
      daysUntilExpiry,
      daysUntilTrialEnd,
    };
  }, [subscription, loading]);
}
