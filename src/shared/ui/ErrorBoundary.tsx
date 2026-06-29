import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorFallback from "./ErrorFallback";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error | null, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// [면접] Error Boundary는 반드시 클래스 컴포넌트
// → React가 "자식 렌더 중 에러"를 잡는 API를 클래스에만 제공하기 때문
// → 함수 컴포넌트의 try/catch는 이벤트 핸들러 안 에러만 잡고, 렌더 에러는 못 잡음
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // [면접] 1단계: 에러 났다는 사실만 state에 기록 → 화면을 에러 UI로 바꿀 준비
  // → 여기서는 로깅 같은 부작용 하면 안 됨 (React 규칙)
  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  // [면접] 2단계: 에러 내용 저장 + 콘솔/Sentry 전송 등은 여기서
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    // [면접] "다시 시도" = 에러 state 초기화 후 children 다시 렌더
    // → 못 잡는 것: 비동기 에러, 이벤트 핸들러 안 에러, 서버 렌더 에러
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.handleReset}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: (error: Error | null, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  showDetails?: boolean;
}

// [면접] 바깥은 함수 컴포넌트, 안은 클래스 — 사용하는 쪽 API는 깔끔하게 유지
export default function ErrorBoundary({
  children,
  fallback,
  onError,
  onReset,
  showDetails = false,
}: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundaryClass
      fallback={fallback}
      onError={onError}
      onReset={onReset}
      showDetails={showDetails}
    >
      {children}
    </ErrorBoundaryClass>
  );
}
