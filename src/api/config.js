import { db } from "@/services/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export async function getProfiles() {
  try {
    const snapshot = await getDocs(collection(db, "config", "app", "profiles"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("프로필 목록 불러오기 실패:", error);

    return [
      { id: "1", name: "김승태", avatar: "/assets/mickey.png" },
      { id: "2", name: "가족 계정", avatar: "https://i.pravatar.cc/150?img=2" },
      { id: "3", name: "게스트", avatar: "https://i.pravatar.cc/150?img=3" },
    ];
  }
}

export async function getCategories() {
  try {
    const snapshot = await getDocs(collection(db, "config", "app", "categories"));
    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error("카테고리 목록 불러오기 실패:", error);

    return [
      {
        id: "originals",
        name: "MoviePlay Originals",
        image: "/assets/MoviePlayOriginals.png",
        order: 0,
      },
      {
        id: "popular-movies",
        name: "인기 영화",
        image: "/assets/인기영화.png",
        type: "movie",
        category: "popular",
        order: 1,
      },
      {
        id: "popular-tv",
        name: "인기 드라마",
        image: "/assets/인기드라마.png",
        type: "tv",
        category: "popular",
        order: 2,
      },
      {
        id: "recommend",
        name: "추천작",
        image: "/assets/추천작.png",
        type: "movie",
        category: "top_rated",
        order: 3,
      },
      {
        id: "new",
        name: "최신작",
        image: "/assets/최신작.png",
        type: "movie",
        category: "upcoming",
        order: 4,
      },
    ];
  }
}

export async function getGenres() {
  try {
    const snapshot = await getDocs(collection(db, "config", "app", "genres"));
    const genres = snapshot.docs.map((doc) => ({
      id: doc.id,
      genreId: parseInt(doc.id),
      ...doc.data(),
    }));
    return genres.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error("장르 목록 불러오기 실패:", error);
    return [
      { id: "28", genreId: 28, name: "액션", order: 0 },
      { id: "12", genreId: 12, name: "모험", order: 1 },
      { id: "16", genreId: 16, name: "애니메이션", order: 2 },
      { id: "35", genreId: 35, name: "코미디", order: 3 },
      { id: "80", genreId: 80, name: "범죄", order: 4 },
      { id: "99", genreId: 99, name: "다큐멘터리", order: 5 },
      { id: "18", genreId: 18, name: "드라마", order: 6 },
      { id: "10751", genreId: 10751, name: "가족", order: 7 },
      { id: "14", genreId: 14, name: "판타지", order: 8 },
      { id: "36", genreId: 36, name: "역사", order: 9 },
      { id: "27", genreId: 27, name: "공포", order: 10 },
      { id: "10402", genreId: 10402, name: "음악", order: 11 },
      { id: "9648", genreId: 9648, name: "미스터리", order: 12 },
      { id: "10749", genreId: 10749, name: "로맨스", order: 13 },
      { id: "878", genreId: 878, name: "SF", order: 14 },
      { id: "10770", genreId: 10770, name: "TV 영화", order: 15 },
      { id: "53", genreId: 53, name: "스릴러", order: 16 },
      { id: "10752", genreId: 10752, name: "전쟁", order: 17 },
      { id: "37", genreId: 37, name: "서부", order: 18 },
    ];
  }
}

export async function getNavigation() {
  try {
    const docRef = doc(db, "config", "app");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().navigation || getDefaultNavigation();
    }
    return getDefaultNavigation();
  } catch (error) {
    console.error("네비게이션 불러오기 실패:", error);
    return getDefaultNavigation();
  }
}

function getDefaultNavigation() {
  return {
    movieCategories: [
      { label: "인기 영화", path: "/category/movie/popular", order: 0 },
      { label: "현재 상영작", path: "/category/movie/now_playing", order: 1 },
      { label: "평점 높은 영화", path: "/category/movie/top_rated", order: 2 },
      { label: "개봉 예정작", path: "/category/movie/upcoming", order: 3 },
    ],
    tvCategories: [
      { label: "인기 드라마", path: "/category/tv/popular", order: 0 },
      { label: "방영 중 드라마", path: "/category/tv/on_the_air", order: 1 },
      { label: "평점 높은 드라마", path: "/category/tv/top_rated", order: 2 },
    ],
  };
}

export async function getHomeGenres() {
  try {
    const docRef = doc(db, "config", "app");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const homeGenres = docSnap.data().homeGenres;
      if (homeGenres && Array.isArray(homeGenres)) {
        return homeGenres;
      }
    }

    const genres = await getGenres();
    return genres.map((g) => ({
      title: g.name,
      genreId: g.genreId,
    }));
  } catch (error) {
    console.error("홈페이지 장르 불러오기 실패:", error);

    const genres = await getGenres();
    return genres.map((g) => ({
      title: g.name,
      genreId: g.genreId,
    }));
  }
}
