import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  retry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Failed to load data from server. Please check your connection and try again.",
  retry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-destructive/20 bg-destructive/5 my-4">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3 text-destructive">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-1">{message}</p>
      {retry && (
        <Button onClick={retry} variant="outline" size="sm" className="mt-4 gap-2">
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
      )}
    </div>
  );
}
