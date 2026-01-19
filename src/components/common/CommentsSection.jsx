import { useState, useEffect, useMemo } from "react";
import { db } from "@/services/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { FaThumbsUp, FaThumbsDown, FaFlag, FaEdit, FaReply, FaTimes, FaCheck, FaStar } from "react-icons/fa";
import "@/styles/components/comments.css";

export default function CommentsSection({ movieId }) {
  const { user } = useAuth();
  const { success: showSuccess, error: showError, info: showInfo } = useToast();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [sortBy, setSortBy] = useState("latest"); // latest, likes, rating
  const [showSpoilers, setShowSpoilers] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const commentsRef = collection(db, "comments", String(movieId), "items");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const q = query(commentsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const commentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          likes: doc.data().likes || [],
          likesCount: doc.data().likesCount || 0,
          reports: doc.data().reports || [],
          replies: doc.data().replies || [],
          isSpoiler: doc.data().isSpoiler || false,
        }));
        setComments(commentsData);
      } catch (error) {
        console.error("댓글 불러오기 실패:", error);
      }
    };

    if (movieId) fetchComments();
  }, [movieId]);

  const ratingStats = useMemo(() => {
    const ratings = comments
      .filter((c) => c.rating && c.rating > 0)
      .map((c) => c.rating);

    if (ratings.length === 0) {
      return {
        average: 0,
        count: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((r) => {
      distribution[r] = (distribution[r] || 0) + 1;
    });

    return {
      average: average.toFixed(1),
      count: ratings.length,
      distribution,
    };
  }, [comments]);

  const sortedComments = useMemo(() => {
    let filtered = [...comments];

    if (!showSpoilers) {
      filtered = filtered.filter((c) => !c.isSpoiler);
    }

    switch (sortBy) {
      case "likes":
        filtered.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "latest":
      default:
        filtered.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return bTime - aTime;
        });
        break;
    }

    return filtered;
  }, [comments, sortBy, showSpoilers]);

  const handleAddComment = async () => {
    if (!user) {
      showError("로그인이 필요합니다.");
      return;
    }
    if (!newComment.trim()) {
      showInfo("댓글을 입력해주세요.");
      return;
    }

    try {
      const spoilerKeywords = ["스포일러", "스포", "결말", "반전", "끝", "마지막"];
      const isSpoiler = spoilerKeywords.some((keyword) =>
        newComment.toLowerCase().includes(keyword)
      );

      await addDoc(commentsRef, {
        userId: user.uid,
        userName: user.displayName || user.email.split("@")[0],
        userEmail: user.email,
        text: newComment,
        rating,
        isSpoiler,
        likes: [],
        likesCount: 0,
        reports: [],
        replies: [],
        createdAt: serverTimestamp(),
      });

      setNewComment("");
      setRating(0);
      showSuccess("댓글이 등록되었습니다.");

      const q = query(commentsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setComments(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          likes: doc.data().likes || [],
          likesCount: doc.data().likesCount || 0,
          reports: doc.data().reports || [],
          replies: doc.data().replies || [],
          isSpoiler: doc.data().isSpoiler || false,
        }))
      );
    } catch (error) {
      console.error("댓글 등록 실패:", error);
      showError("댓글 등록에 실패했습니다.");
    }
  };

  const handleLike = async (commentId, currentLikes) => {
    if (!user) {
      showError("로그인이 필요합니다.");
      return;
    }

    try {
      const commentRef = doc(commentsRef, commentId);
      const isLiked = currentLikes.includes(user.uid);

      if (isLiked) {
        await updateDoc(commentRef, {
          likes: arrayRemove(user.uid),
          likesCount: increment(-1),
        });
        showInfo("좋아요를 취소했습니다.");
      } else {
        await updateDoc(commentRef, {
          likes: arrayUnion(user.uid),
          likesCount: increment(1),
        });
        showSuccess("좋아요를 눌렀습니다.");
      }

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            const newLikes = isLiked
              ? currentLikes.filter((id) => id !== user.uid)
              : [...currentLikes, user.uid];
            return {
              ...c,
              likes: newLikes,
              likesCount: isLiked ? (c.likesCount || 0) - 1 : (c.likesCount || 0) + 1,
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error("좋아요 실패:", error);
      showError("좋아요 처리에 실패했습니다.");
    }
  };

  const handleReport = async (commentId) => {
    if (!user) {
      showError("로그인이 필요합니다.");
      return;
    }

    if (!confirm("이 댓글을 신고하시겠습니까?")) {
      return;
    }

    try {
      const commentRef = doc(commentsRef, commentId);
      await updateDoc(commentRef, {
        reports: arrayUnion(user.uid),
      });

      showSuccess("신고가 접수되었습니다.");
    } catch (error) {
      console.error("신고 실패:", error);
      showError("신고 처리에 실패했습니다.");
    }
  };

  const handleEdit = async (commentId) => {
    if (!editText.trim()) {
      showInfo("수정할 내용을 입력해주세요.");
      return;
    }

    try {
      const commentRef = doc(commentsRef, commentId);
      await updateDoc(commentRef, {
        text: editText,
        editedAt: serverTimestamp(),
      });

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, text: editText, editedAt: new Date() } : c))
      );
      setEditingId(null);
      setEditText("");
      showSuccess("댓글이 수정되었습니다.");
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      showError("댓글 수정에 실패했습니다.");
    }
  };

  const handleReply = async (commentId) => {
    if (!user) {
      showError("로그인이 필요합니다.");
      return;
    }
    if (!replyText.trim()) {
      showInfo("답글을 입력해주세요.");
      return;
    }

    try {
      const commentRef = doc(commentsRef, commentId);
      const reply = {
        userId: user.uid,
        userName: user.displayName || user.email.split("@")[0],
        text: replyText,
        createdAt: serverTimestamp(),
      };

      await updateDoc(commentRef, {
        replies: arrayUnion(reply),
      });

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [...(c.replies || []), { ...reply, createdAt: new Date() }],
            };
          }
          return c;
        })
      );

      setReplyText("");
      setReplyingTo(null);
      showSuccess("답글이 등록되었습니다.");
    } catch (error) {
      console.error("답글 등록 실패:", error);
      showError("답글 등록에 실패했습니다.");
    }
  };

  const handleDelete = async (id, userId) => {
    if (user?.uid !== userId) {
      showError("본인 댓글만 삭제할 수 있습니다.");
      return;
    }

    if (!confirm("댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "comments", String(movieId), "items", id));
      setComments((prev) => prev.filter((c) => c.id !== id));
      showSuccess("댓글이 삭제되었습니다.");
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      showError("댓글 삭제에 실패했습니다.");
    }
  };

  const getUserAvatar = (userEmail) => {
    const initial = userEmail?.charAt(0).toUpperCase() || "?";
    return (
      <div className="comment-avatar" title={userEmail}>
        {initial}
      </div>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3>💬 댓글 & 평점</h3>
        {ratingStats.count > 0 && (
          <div className="rating-summary">
            <div className="rating-average">
              <FaStar className="star-icon" />
              <span className="rating-value">{ratingStats.average}</span>
              <span className="rating-count">({ratingStats.count}명)</span>
            </div>
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingStats.distribution[star] || 0;
                const percentage = ratingStats.count > 0 ? (count / ratingStats.count) * 100 : 0;
                return (
                  <div key={star} className="rating-bar-item">
                    <span className="rating-star-label">{star}점</span>
                    <div className="rating-bar">
                      <div
                        className="rating-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="rating-bar-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="comment-form">
        <div className="rating-input">
          <span className="rating-label">평점:</span>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                className={`rating-star ${star <= rating ? "active" : ""}`}
              >
                <FaStar />
              </span>
            ))}
          </div>
        </div>

        <div className="comment-input-wrapper">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요... (스포일러가 포함되어 있으면 자동으로 태그됩니다)"
            className="comment-input"
            rows={4}
          />
          <label className="spoiler-checkbox">
            <input
              type="checkbox"
              checked={false}
              readOnly
              style={{ display: "none" }}
            />
            <span className="spoiler-hint">
              💡 "스포일러", "결말", "반전" 등의 단어가 포함되면 자동으로 스포일러 태그가 추가됩니다
            </span>
          </label>
        </div>

        <button onClick={handleAddComment} className="comment-submit-btn">
          등록
        </button>
      </div>

      <div className="comments-controls">
        <div className="sort-options">
          <span className="sort-label">정렬:</span>
          <button
            className={`sort-btn ${sortBy === "latest" ? "active" : ""}`}
            onClick={() => setSortBy("latest")}
          >
            최신순
          </button>
          <button
            className={`sort-btn ${sortBy === "likes" ? "active" : ""}`}
            onClick={() => setSortBy("likes")}
          >
            좋아요순
          </button>
          <button
            className={`sort-btn ${sortBy === "rating" ? "active" : ""}`}
            onClick={() => setSortBy("rating")}
          >
            평점순
          </button>
        </div>
        <label className="spoiler-filter">
          <input
            type="checkbox"
            checked={showSpoilers}
            onChange={(e) => setShowSpoilers(e.target.checked)}
          />
          <span>스포일러 표시</span>
        </label>
      </div>

      <div className="comment-list">
        {sortedComments.length === 0 ? (
          <p className="no-comments">아직 등록된 댓글이 없습니다.</p>
        ) : (
          sortedComments.map((c) => {
            const isLiked = c.likes?.includes(user?.uid);
            const isEditing = editingId === c.id;
            const isReplying = replyingTo === c.id;

            return (
              <div
                key={c.id}
                className={`comment-item ${c.isSpoiler ? "spoiler" : ""}`}
              >
                {c.isSpoiler && (
                  <div className="spoiler-warning">
                    ⚠️ 스포일러가 포함된 댓글입니다
                  </div>
                )}
                <div className="comment-header">
                  <div className="comment-user">
                    {getUserAvatar(c.userEmail)}
                    <div className="comment-user-info">
                      <strong className="comment-username">{c.userName}</strong>
                      <span className="comment-date">
                        {formatDate(c.createdAt)}
                        {c.editedAt && " (수정됨)"}
                      </span>
                    </div>
                  </div>
                  {c.rating > 0 && (
                    <div className="comment-rating">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`rating-star-small ${i < c.rating ? "filled" : ""}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="comment-edit-form">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="comment-edit-input"
                      rows={3}
                    />
                    <div className="comment-edit-actions">
                      <button
                        className="edit-save-btn"
                        onClick={() => handleEdit(c.id)}
                      >
                        <FaCheck /> 저장
                      </button>
                      <button
                        className="edit-cancel-btn"
                        onClick={() => {
                          setEditingId(null);
                          setEditText("");
                        }}
                      >
                        <FaTimes /> 취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="comment-text">{c.text}</p>
                )}

                <div className="comment-actions">
                  <button
                    className={`action-btn like-btn ${isLiked ? "liked" : ""}`}
                    onClick={() => handleLike(c.id, c.likes || [])}
                    title="좋아요"
                  >
                    <FaThumbsUp /> {c.likesCount || 0}
                  </button>
                  <button
                    className="action-btn reply-btn"
                    onClick={() => {
                      setReplyingTo(isReplying ? null : c.id);
                      setReplyText("");
                    }}
                    title="답글"
                  >
                    <FaReply /> 답글
                  </button>
                  {user?.uid === c.userId && (
                    <>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => {
                          setEditingId(c.id);
                          setEditText(c.text);
                        }}
                        title="수정"
                      >
                        <FaEdit /> 수정
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(c.id, c.userId)}
                        title="삭제"
                      >
                        삭제
                      </button>
                    </>
                  )}
                  {user && user.uid !== c.userId && (
                    <button
                      className="action-btn report-btn"
                      onClick={() => handleReport(c.id)}
                      title="신고"
                    >
                      <FaFlag /> 신고
                    </button>
                  )}
                </div>

                {isReplying && (
                  <div className="reply-form">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="답글을 입력하세요..."
                      className="reply-input"
                      rows={2}
                    />
                    <div className="reply-actions">
                      <button
                        className="reply-submit-btn"
                        onClick={() => handleReply(c.id)}
                      >
                        등록
                      </button>
                      <button
                        className="reply-cancel-btn"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}

                {c.replies && c.replies.length > 0 && (
                  <div className="replies-list">
                    {c.replies.map((reply, idx) => (
                      <div key={idx} className="reply-item">
                        <div className="reply-header">
                          {getUserAvatar(reply.userEmail)}
                          <strong className="reply-username">{reply.userName}</strong>
                          <span className="reply-date">{formatDate(reply.createdAt)}</span>
                        </div>
                        <p className="reply-text">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
