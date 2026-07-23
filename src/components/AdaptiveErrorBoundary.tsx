import { Component, type ReactNode } from "react";
import { Navigate } from "react-router-dom";

type State = { hasError: boolean };

export class AdaptiveErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: unknown) { console.error("Adaptive route failed:", error); }
  render() {
    if (this.state.hasError) return <Navigate to="/fallback" replace />;
    return this.props.children;
  }
}
