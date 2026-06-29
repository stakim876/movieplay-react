export type TrailerVideo = {
  type: string;
  site: string;
  key: string;
  iso_639_1?: string;
};

export function pickTrailerKey(detail: {
  videos?: { results?: TrailerVideo[] };
}) {
  const videos = detail.videos?.results || [];
  return (
    videos.find(
      (v) =>
        (v.type === "Trailer" || v.type === "Teaser") &&
        v.site === "YouTube" &&
        v.iso_639_1 === "ko"
    ) ||
    videos.find(
      (v) =>
        (v.type === "Trailer" || v.type === "Teaser") &&
        v.site === "YouTube" &&
        v.iso_639_1 === "en"
    ) ||
    videos.find(
      (v) => ["Trailer", "Teaser", "Clip"].includes(v.type) && v.site === "YouTube"
    )
  )?.key || null;
}
