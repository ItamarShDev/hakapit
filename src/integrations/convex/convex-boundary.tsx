import { Component } from "react";

import type { ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { failed: boolean };

export class ConvexBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Convex query failed, hiding live section", error);
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
