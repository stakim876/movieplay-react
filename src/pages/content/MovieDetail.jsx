import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";   
import LikeButton from "@/components/common/LikeButton";
import TMDBImage from "@/components/common/TMDBImage"; 
import "../../styles/common.css";
import CommentsSection from "@/components/common/CommentsSection";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();  

  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [recommend, setRecommend] = useState([]);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;

        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=ko-KR&append_to_response=videos,credits,recommendations`
        );
        const data = await res.json();

        const blockKeywords = [
          "porn","pornographic","xvideo","xhamster","zwinger","fetish","hardcore",
          "nude","erotic","explicit sex","adult video","pornstar",
          "야동","에로","성인","음란","포르노","19금","노골적",
        ];
        const text = `${data.title || ""} ${data.overview || ""}`.toLowerCase();
        if (data.adult || blockKeywords.some((kw) => text.includes(kw))) {
          setMovie(null);
          return;
        }

        setMovie(data);

        const trailerData = data.videos?.results.find(
          (v) =>
            ["Trailer", "Teaser", "Clip"].includes(v.type) &&
            v.site === "YouTube"
        );
        setTrailer(trailerData?.key || null);

        const castData =
          data.credits?.cast
            ?.filter((c) => c.name && c.character)
            ?.slice(0, 12) || [];
        setCast(castData);

        const filteredRecommend = (data.recommendations?.results || []).filter(
          (item) => {
            const t = `${item.title || item.name || ""} ${
              item.overview || ""
            }`.toLowerCase();
            return !item.adult && !blockKeywords.some((kw) => t.includes(kw));
          }
        );
        setRecommend(filteredRecommend);

        const similarRes = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${apiKey}&language=ko-KR&page=1`
        );
        const similarData = await similarRes.json();
        const filteredSimilar = (similarData.results || []).filter((item) => {
          const t = `${item.title || item.name || ""} ${
            item.overview || ""
          }`.toLowerCase();
          return !item.adult && !blockKeywords.some((kw) => t.includes(kw));
        });
        setSimilar(filteredSimilar);
      } catch (err) {
        console.error("영화 상세 불러오기 실패:", err);
      }
    };
    fetchData();
  }, [id]);

  if (!movie) return <p style={{ color: "#fff" }}>로딩 중...</p>;

  const fallbackPoster =
    "https://via.placeholder.com/300x450.png?text=No+Image";
  const fallbackRec = "https://placehold.co/140x210?text=No+Image";

  return (
    <div className="movie-detail">
      <div className="detail-header">
        <img
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : fallbackPoster
          }
          alt={movie.title}
          className="detail-poster"
        />
        <div className="detail-info">
          <h1>{movie.title}</h1>
          <LikeButton movie={movie} />
          <p className="overview">{movie.overview || "줄거리가 없습니다."}</p>
          <p>
            <strong>개봉일:</strong> {movie.release_date || "정보 없음"}
          </p>
          <p>
            <strong>장르:</strong>{" "}
            {movie.genres?.map((g) => g.name).join(", ") || "정보 없음"}
          </p>
        </div>
      </div>

      {cast.length > 0 && (
        <div className="detail-cast">
          <h2>출연진</h2>
          <div className="cast-list">
            {cast.map((c) => (
              <div key={c.cast_id || c.credit_id} className="cast-card">
                <TMDBImage
                  path={c.profile_path}
                  alt={c.name}
                  size="w200"
                />
                <p className="actor-name">{c.name}</p>
                <p className="character">{c.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="detail-trailer">
        <h2>예고편</h2>
        <div className="trailer-wrapper">
          {trailer ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailer}?autoplay=1&mute=1&controls=1`}
              title="Trailer"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <p className="no-trailer">등록된 예고편이 없습니다.</p>
          )}
        </div>
      </div>

      {recommend.length > 0 && (
        <div className="detail-recommend">
          <h2>추천작</h2>
          <div className="recommend-list">
            {recommend.map((r) => (
              <div
                key={r.id}
                className="recommend-card"
                onClick={() => navigate(`/movie/${r.id}`)}   
                style={{ cursor: "pointer" }}
              >
                <img
                  src={
                    r.poster_path
                      ? `https://image.tmdb.org/t/p/w200${r.poster_path}`
                      : fallbackRec
                  }
                  alt={r.title}
                />
                <p className="rec-title">{r.title || "제목 없음"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <div className="detail-similar">
          <h2>이 영화와 비슷한 콘텐츠</h2>
          <div className="similar-list">
            {similar.map((s) => (
              <div
                key={s.id}
                className="similar-card"
                onClick={() => navigate(`/movie/${s.id}`)}   
                style={{ cursor: "pointer" }}
              >
                <img
                  src={
                    s.poster_path
                      ? `https://image.tmdb.org/t/p/w200${s.poster_path}`
                      : fallbackRec
                  }
                  alt={s.title}
                />
                <p className="similar-title">{s.title || "제목 없음"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {movie?.id && <CommentsSection movieId={String(movie.id)} />}
    </div>
  );
}

