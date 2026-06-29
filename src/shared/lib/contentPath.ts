import { ROUTES } from "@/core/config/routes";

export type MediaType = "movie" | "tv";

type ContentItem = {
  id: number | string;
  media_type?: string;
  first_air_date?: string;
  title?: string;
  name?: string;
};

export function resolveMediaType(item: ContentItem): MediaType {
  if (item.media_type === "tv" || item.media_type === "movie") {
    return item.media_type;
  }
  if (item.first_air_date && !item.title) return "tv";
  if (item.name && !item.title) return "tv";
  return "movie";
}

export function getContentPath(item: ContentItem): string {
  const type = resolveMediaType(item);
  return type === "tv" ? ROUTES.tv(item.id) : ROUTES.movie(item.id);
}

export function getPlayerPath(item: ContentItem, season = 1, episode = 1): string {
  const type = resolveMediaType(item);
  if (type === "tv") {
    return `${ROUTES.player("tv", item.id)}?season=${season}&episode=${episode}`;
  }
  return `/player/${item.id}`;
}
