
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 border border-red-200 dark:border-red-900">
            <h1 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <span className="material-symbols-rounded">error</span>
              Something went wrong
            </h1>
            <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-md overflow-auto mb-4 border border-gray-200 dark:border-gray-700">
              <p className="font-mono text-sm text-red-500 break-words mb-2">
                {this.state.error?.message}
              </p>
              {this.state.errorInfo && (
                <pre className="text-xs text-gray-500 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              Crasher les dés (Reload)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
