import { Component } from "react";

import type { ReactNode } from "react";

type RetryableFallback = ReactNode | ((retry: () => void) => ReactNode);
type Props = { children: ReactNode; fallback?: RetryableFallback };
type State = { failed: boolean };

export class ConvexBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Convex query failed, hiding live section", error);
  }

  retry = () => {
    this.setState({ failed: false });
  };

  render() {
    if (!this.state.failed) return this.props.children;
    const fallback = this.props.fallback;
    return typeof fallback === "function" ? fallback(this.retry) : (fallback ?? null);
  }
}
