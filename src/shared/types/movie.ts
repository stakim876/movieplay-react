// TMDB API가 돌려주는 영화 데이터 형태를 TypeScript로 정의
// → 컴포넌트에서 movie.title 처럼 쓸 때 자동완성 + 오타를 컴파일 때 잡아줌
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  genre_ids: number[];
  adult: boolean;
}
