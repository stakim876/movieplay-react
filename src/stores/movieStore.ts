import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface MovieState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useMovieStore = create<MovieState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

export function useMovie() {
  return useMovieStore(
    useShallow((s) => ({
      searchQuery: s.searchQuery,
      setSearchQuery: s.setSearchQuery,
    }))
  );
}
