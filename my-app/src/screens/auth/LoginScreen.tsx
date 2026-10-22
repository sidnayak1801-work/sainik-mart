import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { resendOtp, sendOtp } from "@/api/auth";
import { AuthScreenChrome, AuthTextLink } from "@/components/AuthScreenChrome";
import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input } from "@/components/Input";
import { OtpInput } from "@/components/OtpInput";
import { toAuthErrorMessage, useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { continueAfterAuth } from "@/navigation/authRedirect";
import type { MainStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "Login">;

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

const toE164 = (digits: string): string => `+91${digits}`;

const nationalDigits = (raw: string): string => {
  const compact = raw.replace(/\D/g, "");
  if (compact.length === 12 && compact.startsWith("91")) {
    return compact.slice(2);
  }
  if (compact.length === 11 && compact.startsWith("0")) {
    return compact.slice(1);
  }
  return compact.slice(0, 10);
};

export function LoginScreen({ navigation, route }: Props) {
  const redirect = route.params?.redirect;
  const { loginWithOtp } = useAuth();
  const { syncAfterAuth } = useCart();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [otp, setOtp] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const phone = toE164(phoneDigits);

  const requestOtp = async (mode: "send" | "resend") => {
    if (submitting) return;
    const digits = nationalDigits(phoneDigits);
    if (!INDIAN_MOBILE.test(digits)) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setPhoneDigits(digits);
    setFormError(null);
    setSubmitting(true);
    try {
      if (mode === "resend") {
        await resendOtp(toE164(digits));
      } else {
        await sendOtp(toE164(digits));
      }
      setOtp("");
      setStep("otp");
    } catch (error) {
      setFormError(toAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const onVerify = async () => {
    if (submitting) return;
    if (!/^\d{6}$/.test(otp)) {
      setFormError("Please enter the 6-digit OTP.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await loginWithOtp(phone, otp);
      await syncAfterAuth();
      continueAfterAuth(navigation, redirect);
    } catch (error) {
      setFormError(toAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "otp") {
    return (
      <AuthScreenChrome
        title="Verify OTP"
        subtitle={`Enter the 6-digit code sent to +91 ${phoneDigits}`}
        logo
        onBack={() => {
          setStep("phone");
          setOtp("");
          setFormError(null);
        }}
      >
        {formError ? <ErrorMessage message={formError} /> : null}
        <OtpInput value={otp} onChange={setOtp} disabled={submitting} error={Boolean(formError)} />
        <Button title="Verify OTP" onPress={() => void onVerify()} loading={submitting} disabled={submitting} />
        <AuthTextLink
          prompt="Didn't receive it?"
          action="Resend OTP"
          disabled={submitting}
          onPress={() => void requestOtp("resend")}
        />
      </AuthScreenChrome>
    );
  }

  return (
    <AuthScreenChrome
      title="Welcome to Sainik Mart"
      subtitle="Continue with your mobile number"
      logo
      onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
    >
      {formError ? <ErrorMessage message={formError} /> : null}
      <Input
        label="Mobile number"
        placeholder="10-digit Indian mobile"
        value={phoneDigits}
        onChangeText={(text) => setPhoneDigits(nationalDigits(text))}
        keyboardType="phone-pad"
        englishOnly
        returnKeyType="done"
        onSubmitEditing={() => void requestOtp("send")}
        textContentType="telephoneNumber"
        autoComplete="tel"
      />
      <Button
        title="Send OTP"
        onPress={() => void requestOtp("send")}
        loading={submitting}
        disabled={submitting}
      />
    </AuthScreenChrome>
  );
}
