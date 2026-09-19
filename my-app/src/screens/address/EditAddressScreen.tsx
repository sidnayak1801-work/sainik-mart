import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { updateAddress } from "@/api/addresses";
import { ApiError } from "@/api/client";
import { AddressForm } from "@/components/AddressForm";
import { Screen } from "@/components/Screen";
import type { AddressInput } from "@/types/models";
import type { MainStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<MainStackParamList, "EditAddress">;

export function EditAddressScreen({ navigation, route }: Props) {
  const { addressId, address } = route.params;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (input: AddressInput) => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateAddress(addressId, input);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update address. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <AddressForm
        mode="edit"
        initial={address}
        submitting={submitting}
        error={error}
        onSubmit={(input) => void onSubmit(input)}
      />
    </Screen>
  );
}
