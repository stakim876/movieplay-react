import { useMemo } from "react";
import { useConfig } from "@/context/ConfigContext";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import "../../styles/common/common.css";
import FeaturedHero from "@/components/home/FeaturedHero";
import CategoryGrid from "@/components/category/CategoryGrid";
import CategoryCards from "@/components/category/cards/CategoryCards";
import { CategoryGridSkeleton } from "@/components/common/Skeleton";

import TodayTop10 from "@/components/home/TodayTop10";
import TodayRecommend from "@/components/home/TodayRecommend";
import WatchAgain from "@/components/home/WatchAgain";
import PersonalizedSection from "@/components/home/PersonalizedSection";

export default function HomePage() {
  const { navigation, homeGenres, loading } = useConfig();

  const movieCategories = useMemo(() => {
    return navigation?.movieCategories || [];
  }, [navigation?.movieCategories]);

  const tvCategories = useMemo(() => {
    return navigation?.tvCategories || [];
  }, [navigation?.tvCategories]);

  const genres = useMemo(() => {
    return homeGenres || [];
  }, [homeGenres]);

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <div className="home-page">
        <FeaturedHero />

        {loading ? (
          <>
            <CategoryGridSkeleton />
            <CategoryGridSkeleton />
            <CategoryGridSkeleton />
          </>
        ) : (
          <>
            <CategoryCards />
            <TodayTop10 />
            <WatchAgain />
            <TodayRecommend />
            
            <PersonalizedSection
              title="🎯 당신을 위한 추천"
              endpoint="/movie/popular?language=ko-KR&page=1"
            />
            <PersonalizedSection
              title="⭐ 당신이 좋아할 만한 작품"
              endpoint="/movie/top_rated?language=ko-KR&page=1"
            />

            {movieCategories.map((item) => (
              <CategoryGrid
                key={item.path}
                title={item.label}
                category={item.path.split("/").pop()}
                type="movie"
              />
            ))}

            {tvCategories.map((item) => (
              <CategoryGrid
                key={item.path}
                title={item.label}
                category={item.path.split("/").pop()}
                type="tv"
              />
            ))}

            {genres.map((genre) => (
              <CategoryGrid
                key={genre.genreId}
                title={genre.title}
                genreId={genre.genreId}
              />
            ))}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

