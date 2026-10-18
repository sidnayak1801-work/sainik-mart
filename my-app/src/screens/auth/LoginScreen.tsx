import { useState } from "react";
import { DefaultWidget } from "@/vendor/msg91DefaultWidget";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/Button";
import { AuthScreenChrome } from "@/components/AuthScreenChrome";
import { ErrorMessage } from "@/components/ErrorMessage";
import { toAuthErrorMessage, useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { continueAfterAuth } from "@/navigation/authRedirect";
import { theme } from "@/theme";
import type { MainStackParamList } from "@/types/navigation";
import { MSG91_WIDGET_AUTH_TOKEN, MSG91_WIDGET_ID } from "@/utils/constants";

type Props = NativeStackScreenProps<MainStackParamList, "Login">;

const INDIA = {
  name: "India",
  code: "IN",
  dial_code: "+91",
  flag: "🇮🇳",
} as const;

export function LoginScreen({ navigation, route }: Props) {
  const redirect = route.params?.redirect;
  const { loginWithWidgetToken } = useAuth();
  const { syncAfterAuth } = useCart();
  const [showWidget, setShowWidget] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onContinue = () => {
    if (submitting) return;
    setFormError(null);
    if (!MSG91_WIDGET_ID || !MSG91_WIDGET_AUTH_TOKEN) {
      setFormError("MSG91 widget is not configured. Add EXPO_PUBLIC_MSG91_WIDGET_AUTH_TOKEN and rebuild the app.");
      return;
    }
    setShowWidget(true);
  };

  const onCompletion = async (result: { success: boolean; message?: string }) => {
    setShowWidget(false);
    if (!result.success || !result.message) {
      setFormError(result.message || "We couldn't send the OTP. Please try again.");
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      await loginWithWidgetToken(result.message);
      await syncAfterAuth();
      continueAfterAuth(navigation, redirect);
    } catch (error) {
      setFormError(toAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreenChrome
      title="Welcome to Sainik Mart"
      subtitle="Continue with your mobile number"
      logo
      onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
    >
      {formError ? <ErrorMessage message={formError} /> : null}
      <Button title="Continue" onPress={onContinue} loading={submitting} disabled={submitting} />
      {MSG91_WIDGET_ID && MSG91_WIDGET_AUTH_TOKEN ? (
        <DefaultWidget
          visible={showWidget}
          onClose={() => setShowWidget(false)}
          onCompletion={(result) => void onCompletion(result)}
          widgetId={MSG91_WIDGET_ID}
          tokenAuth={MSG91_WIDGET_AUTH_TOKEN}
          defaultCountry={INDIA}
          defaultVerificationType="mobile"
          theme="light"
          primaryColor={theme.colors.primary}
          primaryButtonTextColor={theme.colors.primaryText}
        />
      ) : null}
    </AuthScreenChrome>
  );
}
