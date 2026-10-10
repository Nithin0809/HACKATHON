'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ReelForge UI Error Boundary caught an exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '36px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '14px', margin: '20px' }}>
          <h3 style={{ fontSize: '18px', color: '#ef4444', margin: '0 0 8px' }}>Something went wrong rendering the workspace</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px' }}>{this.state.error?.message || 'Unexpected display error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #ef4444', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >
            Reset Workspace
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
