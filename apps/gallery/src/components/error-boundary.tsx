import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  fallback: (error: Error) => ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Keeps a render error inside its subtree instead of unmounting the whole app. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override render() {
    return this.state.error ? this.props.fallback(this.state.error) : this.props.children;
  }
}

/** What a preview shows when its visual throws. */
export function PreviewError({ error }: { error: Error }) {
  return (
    <div
      role="alert"
      data-preview-error=""
      className="m-auto max-w-xs rounded-lg border border-destructive/40 bg-background p-3 text-center text-xs text-destructive"
    >
      This visual failed to render.
      <span className="mt-1 block font-mono break-words text-muted-foreground">
        {error.message}
      </span>
    </div>
  );
}
