import { db } from "@/services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function getMoviesFromFirestore(category) {
  const q = query(collection(db, "movies"), where("category", "==", category));
  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

