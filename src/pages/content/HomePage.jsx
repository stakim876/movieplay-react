import { useConfig } from "@/context/ConfigContext";
import "../../styles/common.css";
import FeaturedHero from "@/components/home/FeaturedHero";
import CategoryGrid from "@/components/category/CategoryGrid";
import CategoryCards from "@/components/category/cards/CategoryCards";

import TodayTop10 from "@/components/home/TodayTop10";
import TodayRecommend from "@/components/home/TodayRecommend";
import WatchAgain from "@/components/home/WatchAgain";

export default function HomePage() {
  const { navigation, homeGenres, loading } = useConfig();

  if (loading) {
    return (
      <div className="home-page">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <FeaturedHero />

      <CategoryCards />
      <TodayTop10 />
      <WatchAgain />
      <TodayRecommend />

      {navigation?.movieCategories?.map((item) => (
        <CategoryGrid
          key={item.path}
          title={item.label}
          category={item.path.split("/").pop()}
          type="movie"
        />
      ))}

      {navigation?.tvCategories?.map((item) => (
        <CategoryGrid
          key={item.path}
          title={item.label}
          category={item.path.split("/").pop()}
          type="tv"
        />
      ))}

      {homeGenres.map((genre) => (
        <CategoryGrid
          key={genre.genreId}
          title={genre.title}
          genreId={genre.genreId}
        />
      ))}
    </div>
  );
}

