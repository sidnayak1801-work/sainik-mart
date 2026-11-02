import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { detectDevice, type DeviceKind } from "../lib/device";
import { resolveInstallIntent, type InstallIntent } from "../lib/install";
import InstallDialog from "./InstallDialog";

type InstallContextValue = {
  device: DeviceKind;
  intent: InstallIntent;
  openInstall: () => void;
};

const InstallContext = createContext<InstallContextValue | null>(null);

export const useInstall = (): InstallContextValue => {
  const value = useContext(InstallContext);
  if (!value) {
    throw new Error("useInstall must be used within InstallProvider");
  }
  return value;
};

export default function InstallProvider({ children }: { children: ReactNode }) {
  const device = useMemo(() => detectDevice(), []);
  const intent = useMemo(() => resolveInstallIntent(device), [device]);
  const [open, setOpen] = useState(false);

  const openInstall = useCallback(() => {
    if (intent.kind === "download" || intent.kind === "playstore") {
      return;
    }
    setOpen(true);
  }, [intent]);

  const value = useMemo(
    () => ({ device, intent, openInstall }),
    [device, intent, openInstall],
  );

  return (
    <InstallContext.Provider value={value}>
      {children}
      <InstallDialog open={open} intent={intent} onClose={() => setOpen(false)} />
    </InstallContext.Provider>
  );
}
