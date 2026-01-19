import { useToast } from "@/context/ToastContext";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import "@/styles/components/toast.css";

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle />;
      case "error":
        return <FaTimesCircle />;
      case "warning":
        return <FaExclamationTriangle />;
      case "info":
      default:
        return <FaInfoCircle />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="toast-icon">{getIcon(toast.type)}</div>
          <div className="toast-message">{toast.message}</div>
          <button
            className="toast-close"
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            aria-label="닫기"
          >
            <FaTimes />
          </button>
          <div className="toast-progress">
            <div
              className="toast-progress-bar"
              style={{
                animationDuration: `${toast.duration}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
