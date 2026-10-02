import { AlertBanner } from "@/components/AlertBanner";
import { Button } from "@/components/Button";

type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <AlertBanner message={message} tone="danger">
      {onRetry ? <Button title="Retry" onPress={onRetry} /> : null}
    </AlertBanner>
  );
}
