import React, { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-6 bg-background text-center">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4 text-destructive">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">An unexpected error occurred</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            {this.state.error?.message || "A client-side error interrupted this view."}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="mt-6 gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
