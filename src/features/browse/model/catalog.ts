export type CatalogRowParams = {
  category?: string;
  type?: string;
  genreId?: number;
  endpoint?: string;
};

export type CatalogItem = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  adult?: boolean;
  vote_average?: number;
  media_type?: string;
  first_air_date?: string;
  original_title?: string;
};

export type MovieDetailMediaType = "movie" | "tv";
