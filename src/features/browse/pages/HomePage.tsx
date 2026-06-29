import { useMemo } from "react";
import { useConfig } from "@/stores/configStore";
import { getActiveProfileDisplayName, isKidsProfileActive } from "@/shared/lib/activeProfile";
import ErrorBoundary from "@/shared/ui/ErrorBoundary";
import "@/styles/common/common.css";
import FeaturedHero from "@/features/browse/components/home/FeaturedHero";
import CategoryGrid from "@/features/browse/components/category/CategoryGrid";
import CategoryCards from "@/features/browse/components/category/cards/CategoryCards";
import { CategoryGridSkeleton } from "@/shared/ui/Skeleton";

import TodayTop10 from "@/features/browse/components/home/TodayTop10";
import TodayRecommend from "@/features/browse/components/home/TodayRecommend";
import WatchAgain from "@/features/browse/components/home/WatchAgain";
import PersonalizedSection from "@/features/browse/components/home/PersonalizedSection";
import MyListRow from "@/features/browse/components/home/MyListRow";
import ProjectCharter from "@/shared/ui/ProjectCharter";

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

  const profileName = getActiveProfileDisplayName();
  const kidsMode = isKidsProfileActive();

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <div className="home-page">
        <ProjectCharter />
        <div className="home-greeting">
          <h1 className="home-greeting-title">{profileName}님, 오늘 뭐 볼까요?</h1>
          {kidsMode && (
            <p className="home-kids-notice">
              키즈 프로필 — 안전한 콘텐츠만 보여드려요
            </p>
          )}
        </div>
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
            <MyListRow />
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

