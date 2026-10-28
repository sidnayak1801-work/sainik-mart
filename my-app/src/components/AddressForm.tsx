import { useState } from "react";

import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input } from "@/components/Input";
import type { Address, AddressInput } from "@/types/models";

type FieldErrors = {
  fullName?: string;
  mobile?: string;
  addressLine?: string;
  city?: string;
  pincode?: string;
};

type AddressFormProps = {
  mode: "create" | "edit";
  initial?: Partial<Address>;
  submitting: boolean;
  error?: string | null;
  onSubmit: (input: AddressInput) => void;
};

const PINCODE = /^\d{6}$/;
const INDIAN_MOBILE = /^[6-9]\d{9}$/;

const isIndianMobile = (raw: string): boolean => {
  const compact = raw.trim().replace(/[\s()-]/g, "");
  const digits = compact.replace(/^\+/, "").replace(/\D/g, "");
  const national =
    digits.length === 10
      ? digits
      : digits.length === 12 && digits.startsWith("91")
        ? digits.slice(2)
        : null;
  return Boolean(national && INDIAN_MOBILE.test(national));
};

const validate = (input: AddressInput): FieldErrors => {
  const next: FieldErrors = {};
  if (!input.fullName.trim()) next.fullName = "Full name is required.";
  if (!input.mobile.trim()) next.mobile = "Please enter a valid mobile number.";
  else if (!isIndianMobile(input.mobile)) next.mobile = "Please enter a valid mobile number.";
  if (!input.addressLine.trim()) next.addressLine = "Address is required.";
  if (!input.city.trim()) next.city = "City is required.";
  if (!input.pincode.trim()) next.pincode = "Pincode is required.";
  else if (!PINCODE.test(input.pincode.trim())) next.pincode = "Enter a valid 6-digit pincode.";
  return next;
};

export function AddressForm({ mode, initial, submitting, error, onSubmit }: AddressFormProps) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [mobile, setMobile] = useState(initial?.mobile ?? "");
  const [addressLine, setAddressLine] = useState(initial?.addressLine ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [pincode, setPincode] = useState(initial?.pincode ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const submit = () => {
    if (submitting) return;
    const input: AddressInput = {
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
    };
    const next = validate(input);
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit(input);
  };

  return (
    <>
      <Input
        label="Full Name"
        placeholder="Receiver's full name"
        value={fullName}
        onChangeText={setFullName}
        error={fieldErrors.fullName}
        autoCapitalize="words"
        englishOnly
        returnKeyType="next"
        textContentType="name"
        autoComplete="name"
      />
      <Input
        label="Mobile number"
        placeholder="10-digit mobile number"
        value={mobile}
        onChangeText={setMobile}
        error={fieldErrors.mobile}
        keyboardType="phone-pad"
        englishOnly
        returnKeyType="next"
        textContentType="telephoneNumber"
        autoComplete="tel"
      />
      <Input
        label="Address"
        placeholder="House / street / area"
        value={addressLine}
        onChangeText={setAddressLine}
        error={fieldErrors.addressLine}
        autoCapitalize="words"
        englishOnly
        returnKeyType="next"
      />
      <Input
        label="City"
        placeholder="City"
        value={city}
        onChangeText={setCity}
        error={fieldErrors.city}
        autoCapitalize="words"
        englishOnly
        returnKeyType="next"
      />
      <Input
        label="Pincode"
        placeholder="6-digit pincode"
        value={pincode}
        onChangeText={setPincode}
        error={fieldErrors.pincode}
        keyboardType="number-pad"
        englishOnly
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      {error ? <ErrorMessage message={error} /> : null}
      <Button
        title={mode === "create" ? "Save Address" : "Update Address"}
        onPress={submit}
        loading={submitting}
        disabled={submitting}
      />
    </>
  );
}
