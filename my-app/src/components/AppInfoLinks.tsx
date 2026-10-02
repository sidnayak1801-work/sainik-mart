import type { ComponentProps } from "react";

import { MenuRow } from "@/components/MenuRow";
import { promptRateApp } from "@/utils/rateApp";

type InfoScreenName = "About" | "Terms" | "Privacy" | "Contact";

type AppInfoLinksProps = {
  onOpen: (screen: InfoScreenName) => void;
};

export function AppInfoLinks({ onOpen }: AppInfoLinksProps) {
  const rows: { label: string; icon: ComponentProps<typeof MenuRow>["icon"]; onPress: () => void }[] = [
    { label: "About Sainik Mart", icon: "information-circle-outline", onPress: () => onOpen("About") },
    { label: "Terms and Conditions", icon: "document-text-outline", onPress: () => onOpen("Terms") },
    { label: "Privacy Policy", icon: "shield-checkmark-outline", onPress: () => onOpen("Privacy") },
    { label: "Rate App", icon: "star-outline", onPress: promptRateApp },
    { label: "Contact Us", icon: "call-outline", onPress: () => onOpen("Contact") },
  ];

  return (
    <>
      {rows.map((row) => (
        <MenuRow key={row.label} icon={row.icon} label={row.label} onPress={row.onPress} />
      ))}
    </>
  );
}
