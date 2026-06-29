type TMDBImageProps = {
  path?: string | null;
  alt?: string;
  size?: string;
  className?: string;
};

export default function TMDBImage({ path, alt, size = "w500", className = "" }: TMDBImageProps) {
  const fallbackImage = `/assets/humen.png?v=${Date.now()}`;

  const imageUrl = path ? `https://image.tmdb.org/t/p/${size}${path}` : fallbackImage;

  return (
    <img
      src={imageUrl}
      alt={alt || "이미지 없음"}
      loading="lazy"
      className={className}
      style={{
        width: "100%",
        objectFit: "cover",
        backgroundColor: "#111a24",
      }}
      onError={(e) => {
        const img = e.currentTarget;
        img.onerror = null;
        img.src = fallbackImage;
      }}
    />
  );
}
