import { db } from "@/services/firebase";
import { doc, getDoc } from "firebase/firestore";

let cachedKeywords = null;

export async function getAdultKeywords() {
  try {
    if (cachedKeywords) return cachedKeywords;

    const ref = doc(db, "adultFilters", "default");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      cachedKeywords = snap.data().bannedKeywords || [];
      return cachedKeywords;
    }

    return [];
  } catch (err) {
    console.error("성인 필터 불러오기 실패:", err);
    return [];
  }
}
