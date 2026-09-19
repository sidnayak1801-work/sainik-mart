import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { createAddress } from "@/api/addresses";
import { ApiError } from "@/api/client";
import { AddressForm } from "@/components/AddressForm";
import { Screen } from "@/components/Screen";
import type { AddressInput } from "@/types/models";
import type { MainStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "AddAddress">;

export function AddAddressScreen({ navigation }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (input: AddressInput) => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await createAddress(input);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save address. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <AddressForm mode="create" submitting={submitting} error={error} onSubmit={(input) => void onSubmit(input)} />
    </Screen>
  );
}
