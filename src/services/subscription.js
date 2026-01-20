import { doc, setDoc, updateDoc, collection, addDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { getPlanById } from "@/constants/subscriptionPlans";

/**
 * 구독 생성 (무료 체험 시작)
 */
export async function createSubscription(userId, planId, isYearly = false) {
  try {
    const plan = getPlanById(planId, isYearly);
    if (!plan) {
      throw new Error('유효하지 않은 플랜입니다.');
    }

    // 무료 체험 종료일 계산 (14일 후)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    // 구독 종료일 계산
    const endDate = new Date();
    if (isYearly) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscriptionData = {
      planId: plan.id,
      status: 'trial', // 무료 체험 시작
      startDate: serverTimestamp(),
      endDate: Timestamp.fromDate(endDate),
      trialEndDate: Timestamp.fromDate(trialEndDate),
      nextBillingDate: Timestamp.fromDate(endDate),
      isYearly,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // 구독 정보 저장
    await setDoc(
      doc(db, "users", userId, "subscription", "current"),
      subscriptionData
    );

    // 구독 이력 저장
    await addDoc(
      collection(db, "users", userId, "subscriptionHistory"),
      {
        action: 'trial_started',
        planId: plan.id,
        amount: 0,
        date: serverTimestamp(),
      }
    );

    return subscriptionData;
  } catch (error) {
    console.error('구독 생성 실패:', error);
    throw error;
  }
}

/**
 * 구독 활성화 (결제 완료 후)
 */
export async function activateSubscription(userId, paymentData) {
  try {
    const subscriptionRef = doc(db, "users", userId, "subscription", "current");
    
    await updateDoc(subscriptionRef, {
      status: 'active',
      paymentMethod: {
        type: paymentData.type || 'card',
        last4: paymentData.last4,
        brand: paymentData.brand,
      },
      updatedAt: serverTimestamp(),
    });

    // 결제 내역 저장
    await addDoc(
      collection(db, "users", userId, "payments"),
      {
        amount: paymentData.amount,
        currency: paymentData.currency || 'KRW',
        status: 'succeeded',
        planId: paymentData.planId,
        paymentDate: serverTimestamp(),
        billingPeriod: {
          start: Timestamp.fromDate(new Date()),
          end: paymentData.billingPeriodEnd 
            ? Timestamp.fromDate(paymentData.billingPeriodEnd)
            : null,
        },
        transactionId: paymentData.transactionId,
        receiptUrl: paymentData.receiptUrl,
      }
    );

    // 구독 이력 저장
    await addDoc(
      collection(db, "users", userId, "subscriptionHistory"),
      {
        action: 'subscribed',
        planId: paymentData.planId,
        amount: paymentData.amount,
        date: serverTimestamp(),
      }
    );
  } catch (error) {
    console.error('구독 활성화 실패:', error);
    throw error;
  }
}

/**
 * 구독 취소
 */
export async function cancelSubscription(userId, cancelAtPeriodEnd = true) {
  try {
    const subscriptionRef = doc(db, "users", userId, "subscription", "current");
    
    await updateDoc(subscriptionRef, {
      cancelAtPeriodEnd,
      canceledAt: cancelAtPeriodEnd ? null : serverTimestamp(),
      status: cancelAtPeriodEnd ? 'active' : 'canceled',
      updatedAt: serverTimestamp(),
    });

    // 구독 이력 저장
    await addDoc(
      collection(db, "users", userId, "subscriptionHistory"),
      {
        action: cancelAtPeriodEnd ? 'cancel_scheduled' : 'canceled',
        date: serverTimestamp(),
      }
    );
  } catch (error) {
    console.error('구독 취소 실패:', error);
    throw error;
  }
}

/**
 * 구독 재개
 */
export async function resumeSubscription(userId) {
  try {
    const subscriptionRef = doc(db, "users", userId, "subscription", "current");
    
    await updateDoc(subscriptionRef, {
      cancelAtPeriodEnd: false,
      canceledAt: null,
      status: 'active',
      updatedAt: serverTimestamp(),
    });

    // 구독 이력 저장
    await addDoc(
      collection(db, "users", userId, "subscriptionHistory"),
      {
        action: 'resumed',
        date: serverTimestamp(),
      }
    );
  } catch (error) {
    console.error('구독 재개 실패:', error);
    throw error;
  }
}

/**
 * 구독 플랜 변경
 */
export async function updateSubscriptionPlan(userId, newPlanId, isYearly = false) {
  try {
    const newPlan = getPlanById(newPlanId, isYearly);
    if (!newPlan) {
      throw new Error('유효하지 않은 플랜입니다.');
    }

    const subscriptionRef = doc(db, "users", userId, "subscription", "current");
    const subscriptionDoc = await subscriptionRef.get();
    
    if (!subscriptionDoc.exists()) {
      throw new Error('구독 정보를 찾을 수 없습니다.');
    }

    const currentData = subscriptionDoc.data();
    const oldPlanId = currentData.planId;

    // 구독 종료일 계산
    const endDate = new Date();
    if (isYearly) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    await updateDoc(subscriptionRef, {
      planId: newPlan.id,
      isYearly,
      endDate: Timestamp.fromDate(endDate),
      nextBillingDate: Timestamp.fromDate(endDate),
      updatedAt: serverTimestamp(),
    });

    // 구독 이력 저장
    await addDoc(
      collection(db, "users", userId, "subscriptionHistory"),
      {
        action: 'plan_changed',
        oldPlanId,
        newPlanId: newPlan.id,
        date: serverTimestamp(),
      }
    );
  } catch (error) {
    console.error('구독 플랜 변경 실패:', error);
    throw error;
  }
}

/**
 * 결제 실패 처리
 */
export async function handlePaymentFailure(userId) {
  try {
    const subscriptionRef = doc(db, "users", userId, "subscription", "current");
    
    await updateDoc(subscriptionRef, {
      status: 'past_due',
      updatedAt: serverTimestamp(),
    });

    // 구독 이력 저장
    await addDoc(
      collection(db, "users", userId, "subscriptionHistory"),
      {
        action: 'payment_failed',
        date: serverTimestamp(),
      }
    );
  } catch (error) {
    console.error('결제 실패 처리 실패:', error);
    throw error;
  }
}

/**
 * 구독 갱신
 */
export async function renewSubscription(userId, paymentData) {
  try {
    const subscriptionRef = doc(db, "users", userId, "subscription", "current");
    const subscriptionDoc = await subscriptionRef.get();
    
    if (!subscriptionDoc.exists()) {
      throw new Error('구독 정보를 찾을 수 없습니다.');
    }

    const currentData = subscriptionDoc.data();
    const plan = getPlanById(currentData.planId, currentData.isYearly);
    
    // 구독 종료일 연장
    const endDate = new Date();
    if (currentData.isYearly) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    await updateDoc(subscriptionRef, {
      status: 'active',
      endDate: Timestamp.fromDate(endDate),
      nextBillingDate: Timestamp.fromDate(endDate),
      updatedAt: serverTimestamp(),
    });

    // 결제 내역 저장
    await addDoc(
      collection(db, "users", userId, "payments"),
      {
        amount: paymentData.amount,
        currency: paymentData.currency || 'KRW',
        status: 'succeeded',
        planId: currentData.planId,
        paymentDate: serverTimestamp(),
        billingPeriod: {
          start: Timestamp.fromDate(new Date()),
          end: Timestamp.fromDate(endDate),
        },
        transactionId: paymentData.transactionId,
        receiptUrl: paymentData.receiptUrl,
      }
    );

    // 구독 이력 저장
    await addDoc(
      collection(db, "users", userId, "subscriptionHistory"),
      {
        action: 'renewed',
        planId: currentData.planId,
        amount: paymentData.amount,
        date: serverTimestamp(),
      }
    );
  } catch (error) {
    console.error('구독 갱신 실패:', error);
    throw error;
  }
}
