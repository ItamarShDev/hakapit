import { Button } from "~/lib/ui/button";

export function ChatErrorNotice({ message, onRetry }: { message: string; onRetry: () => Promise<unknown> }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-2 text-red-500 text-sm text-center" dir="rtl" role="alert">
      <span>{`שגיאה: ${message || "הבקשה נכשלה"}`}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          void onRetry().catch((error: unknown) => {
            console.error("Failed to retry message:", error);
          });
        }}
        className="text-accent hover:text-accent/80"
      >
        נסה שוב
      </Button>
    </div>
  );
}
