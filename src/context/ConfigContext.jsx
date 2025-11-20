import { createContext, useContext, useEffect, useState } from "react";
import {
  getProfiles,
  getCategories,
  getGenres,
  getNavigation,
  getHomeGenres,
} from "@/api/config";

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const [profiles, setProfiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [genres, setGenres] = useState([]);
  const [navigation, setNavigation] = useState(null);
  const [homeGenres, setHomeGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      try {
        const [profilesData, categoriesData, genresData, navigationData, homeGenresData] =
          await Promise.all([
            getProfiles(),
            getCategories(),
            getGenres(),
            getNavigation(),
            getHomeGenres(),
          ]);

        setProfiles(profilesData);
        setCategories(categoriesData);
        setGenres(genresData);
        setNavigation(navigationData);
        setHomeGenres(homeGenresData);
      } catch (error) {
        console.error("설정 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        profiles,
        categories,
        genres,
        navigation,
        homeGenres,
        loading,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within ConfigProvider");
  }
  return context;
}

