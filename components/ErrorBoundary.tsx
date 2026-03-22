import React from 'react';
import ServerError500 from '../pages/ServerError500';

interface State { hasError: boolean; }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in dev; swap for Sentry / logging service in production
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return <ServerError500 onReset={() => this.setState({ hasError: false })} />;
    return this.props.children;
  }
}
