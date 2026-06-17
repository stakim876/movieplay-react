export default function TMDBImage({ path, alt, size = "w500" }) {
  const fallbackImage = `/assets/humen.png?v=${Date.now()}`;

  const imageUrl = path
    ? `https://image.tmdb.org/t/p/${size}${path}`
    : fallbackImage;

  return (
    <img
      src={imageUrl}
      alt={alt || "이미지 없음"}
      loading="lazy"
      style={{
        width: "100%",
        objectFit: "cover",
        backgroundColor: "#111a24",
        borderRadius: "8px",
      }}
      onError={(e) => {
        const img = e.currentTarget;
        img.onerror = null;
        img.src = fallbackImage;
      }}
    />
  );
}

