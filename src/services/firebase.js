import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// 환경 변수 검증
const hasValidConfig = firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "your_firebase_api_key_here" &&
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== "your_project_id";

if (!hasValidConfig) {
  console.error("❌ Firebase 설정이 완료되지 않았습니다.");
  console.error("📝 .env 파일에 다음 변수들을 설정해주세요:");
  console.error("   - VITE_FIREBASE_API_KEY");
  console.error("   - VITE_FIREBASE_AUTH_DOMAIN");
  console.error("   - VITE_FIREBASE_PROJECT_ID");
  console.error("   - VITE_FIREBASE_STORAGE_BUCKET");
  console.error("   - VITE_FIREBASE_MESSAGING_SENDER_ID");
  console.error("   - VITE_FIREBASE_APP_ID");
  console.error("   - VITE_FIREBASE_MEASUREMENT_ID");
  console.error("🔗 Firebase Console: https://console.firebase.google.com/");
}

let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  if (hasValidConfig) {
    console.log("🔥 Firebase 연결 성공 - projectId:", firebaseConfig.projectId);
  }
} catch (error) {
  console.error("❌ Firebase 초기화 실패:", error);
  console.error("💡 .env 파일의 Firebase 설정을 확인하고 개발 서버를 재시작해주세요.");
  // 앱이 완전히 크래시되지 않도록 더미 객체 반환
  auth = null;
  db = null;
}

export { auth, db };