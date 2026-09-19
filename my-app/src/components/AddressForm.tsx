import { useState } from "react";

import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input } from "@/components/Input";
import type { Address, AddressInput } from "@/types/models";

type FieldErrors = {
  addressLine?: string;
  city?: string;
  pincode?: string;
};

type AddressFormProps = {
  mode: "create" | "edit";
  initial?: Address;
  submitting: boolean;
  error?: string | null;
  onSubmit: (input: AddressInput) => void;
};

const PINCODE = /^\d{6}$/;

const validate = (input: AddressInput): FieldErrors => {
  const next: FieldErrors = {};
  if (!input.addressLine.trim()) next.addressLine = "Address is required.";
  if (!input.city.trim()) next.city = "City is required.";
  if (!input.pincode.trim()) next.pincode = "Pincode is required.";
  else if (!PINCODE.test(input.pincode.trim())) next.pincode = "Enter a valid 6-digit pincode.";
  return next;
};

export function AddressForm({ mode, initial, submitting, error, onSubmit }: AddressFormProps) {
  const [addressLine, setAddressLine] = useState(initial?.addressLine ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [pincode, setPincode] = useState(initial?.pincode ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const submit = () => {
    if (submitting) return;
    const input: AddressInput = {
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
