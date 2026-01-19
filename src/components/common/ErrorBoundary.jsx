import { Component } from "react";
import ErrorFallback from "./ErrorFallback";

class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
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

export default function ErrorBoundary({ children, fallback, onError, onReset, showDetails = false }) {
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
