import { Component } from "react";

/**
 * Prevents a single render error from blanking the entire app.
 * Displays a recovery screen and lets the user retry the failed view.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full border-2 border-[var(--line)] rounded-2xl p-8 text-center shadow-[6px_6px_0px_0px_var(--line)]">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-sm opacity-70 mb-6">
              This view hit an unexpected error. Try again, or reload the page if the problem persists.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-5 py-2.5 rounded-xl border-2 border-[var(--line)] font-semibold hover:opacity-80 transition-opacity"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
