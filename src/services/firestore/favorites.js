import { db } from "@/services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function toggleFavorite(userId, movie) {
  const ref = doc(db, "favorites", userId);
  const snap = await getDoc(ref);

  let movies = [];
  if (snap.exists()) {
    movies = snap.data().movies || [];
  }

  if (movies.some((m) => m.id === movie.id)) {
    movies = movies.filter((m) => m.id !== movie.id);
  } else {
    movies.push(movie);
  }

  await setDoc(ref, { movies });
  return movies;
}

