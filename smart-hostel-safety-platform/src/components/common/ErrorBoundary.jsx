import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled UI Exception captured by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6 font-['Inter',system-ui,sans-serif]">
          <div className="bg-white rounded-3xl border border-red-100 shadow-xl p-8 max-w-lg w-full text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">Something went wrong</h2>
              <p className="text-gray-500 text-sm mt-2">
                An unexpected component error occurred. The system has safely isolated the issue.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-red-50/50 rounded-xl p-4 text-left border border-red-100 font-mono text-xs text-red-700 overflow-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Home size={16} /> Home
              </button>
              <button
                onClick={this.handleRetry}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} /> Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
