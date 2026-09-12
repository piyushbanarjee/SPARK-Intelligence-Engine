import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught a fatal render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-gray-900 border border-red-800 rounded-lg p-6 m-4 text-left overflow-auto max-h-[500px]">
          <h2 className="text-red-500 text-lg font-black uppercase tracking-wider mb-2">
            ⚠ Component Render Crash
          </h2>
          <p className="text-red-400 font-mono text-sm mb-4">
            {this.state.error?.toString()}
          </p>
          <details className="cursor-pointer">
            <summary className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              Stack Trace
            </summary>
            <pre className="text-xs text-red-300 whitespace-pre-wrap break-words bg-gray-950 p-3 rounded border border-gray-800">
              {this.state.error?.stack}
            </pre>
            {this.state.errorInfo && (
              <pre className="text-xs text-orange-300 whitespace-pre-wrap break-words bg-gray-950 p-3 rounded border border-gray-800 mt-2">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="mt-4 bg-red-900 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm uppercase tracking-wider transition-colors"
          >
            Attempt Recovery
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

