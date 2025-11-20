import { useState, useEffect } from "react";
import { db } from "@/services/firebase";

import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function CommentsSection({ movieId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);

  const commentsRef = collection(db, "comments", String(movieId), "items");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const q = query(commentsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("댓글 불러오기 실패:", error);
      }
    };

    if (movieId) fetchComments();
  }, [movieId]);

  const handleAddComment = async () => {
    if (!user) return alert("로그인이 필요합니다.");
    if (!newComment.trim()) return;

    try {
      await addDoc(commentsRef, {
        userId: user.uid,
        userName: user.email.split("@")[0],
        text: newComment,
        rating,
        createdAt: serverTimestamp(),
      });

      setNewComment("");
      setRating(0);

      const q = query(commentsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("댓글 등록 실패:", error);
    }
  };

  const handleDelete = async (id, userId) => {
    if (user?.uid !== userId) return alert("본인 댓글만 삭제할 수 있습니다.");

    try {
      await deleteDoc(doc(db, "comments", String(movieId), "items", id));
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    }
  };

  return (
    <div className="comments-section">
      <h3>💬 댓글 & 평점</h3>

      <div className="comment-form">
        <div className="rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              style={{
                cursor: "pointer",
                color: star <= rating ? "#00e0ff" : "#555",
                fontSize: "1.5rem",
              }}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="comment-input"
        />
        <button onClick={handleAddComment} className="comment-submit-btn">
          등록
        </button>
      </div>

      <div className="comment-list">
        {comments.length === 0 ? (
          <p className="no-comments">아직 등록된 댓글이 없습니다.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div className="comment-header">
                <strong>{c.userName}</strong>
                <span className="rating-display">
                  {"★".repeat(c.rating || 0)}
                </span>
                {user?.uid === c.userId && (
                  <button
                    onClick={() => handleDelete(c.id, c.userId)}
                    className="delete-btn"
                  >
                    삭제
                  </button>
                )}
              </div>
              <p className="comment-text">{c.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

