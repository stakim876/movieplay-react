import CategoryGrid from "@/components/category/CategoryGrid";

export default function NewHotPage() {
  return (
    <div className="discover-page">
      <h1 className="page-title">🔥 New & Hot</h1>

      <CategoryGrid
        title="📈 오늘의 트렌딩"
        endpoint="/trending/all/day?language=ko-KR&include_adult=false&page=1"
      />

      <CategoryGrid
        title="🎬 현재 상영작"
        endpoint="/movie/now_playing?language=ko-KR&include_adult=false&page=1"
      />

      <CategoryGrid
        title="🗓️ 개봉 예정"
        endpoint="/movie/upcoming?language=ko-KR&include_adult=false&page=1"
      />

      <CategoryGrid
        title="📺 TV 트렌딩"
        endpoint="/trending/tv/day?language=ko-KR&include_adult=false&page=1"
      />
    </div>
  );
}

