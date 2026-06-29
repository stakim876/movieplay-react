import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import {
  getProfiles,
  getCategories,
  getGenres,
  getNavigation,
  getHomeGenres,
} from "@/core/api/firestore/config";

interface ConfigState {
  profiles: any[];
  categories: any[];
  genres: any[];
  navigation: any;
  homeGenres: any[];
  loading: boolean;
}

export const useConfigStore = create<ConfigState>(() => ({
  profiles: [],
  categories: [],
  genres: [],
  navigation: null,
  homeGenres: [],
  loading: true,
}));

let configLoaded = false;

export async function initConfigStore() {
  if (configLoaded) return;
  configLoaded = true;

  try {
    const [profilesData, categoriesData, genresData, navigationData, homeGenresData] =
      await Promise.all([
        getProfiles(),
        getCategories(),
        getGenres(),
        getNavigation(),
        getHomeGenres(),
      ]);

    useConfigStore.setState({
      profiles: profilesData,
      categories: categoriesData,
      genres: genresData,
      navigation: navigationData,
      homeGenres: homeGenresData,
      loading: false,
    });
  } catch (error) {
    console.error("설정 데이터 로드 실패:", error);
    useConfigStore.setState({ loading: false });
  }
}

export function useConfig() {
  return useConfigStore(
    useShallow((s) => ({
      profiles: s.profiles,
      categories: s.categories,
      genres: s.genres,
      navigation: s.navigation,
      homeGenres: s.homeGenres,
      loading: s.loading,
    }))
  );
}
