import { useNavigate } from "react-router-dom";
import { useConfig } from "@/context/ConfigContext";
import "@/styles/components/components.css";

export default function CategoryCards() {
  const navigate = useNavigate();
  const { categories, loading } = useConfig();

  const handleClick = (cat) => {
    if (cat.genreId) {
      navigate(`/category/genre/${cat.genreId}`);
    } else if (cat.category) {
      navigate(`/category/${cat.type}/${cat.category}`);
    } else {
      navigate(`/category/${cat.id}`);
    }
  };

  if (loading || !categories.length) {
    return null;
  }

  return (
    <div className="category-cards-container">
      <div className="category-cards">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="category-card"
            onClick={() => handleClick(cat)}
          >
            <img src={cat.image} alt={cat.name} />

            {cat.id !== "originals" && (
              <div className="card-title">{cat.name}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
