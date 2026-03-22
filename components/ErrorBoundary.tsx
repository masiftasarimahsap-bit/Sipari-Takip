'use client';

import React from 'react';

interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-gray-50 dark:bg-gray-950">
          <span className="text-5xl">⚠️</span>
          <p className="text-gray-700 dark:text-gray-300 font-medium">Bir hata oluştu</p>
          <p className="text-sm text-gray-500">{this.state.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold"
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
