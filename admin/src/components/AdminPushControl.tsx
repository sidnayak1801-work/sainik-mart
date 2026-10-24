import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  disableAdminPush,
  enableAdminPush,
  PUSH_DISMISSED_KEY,
  refreshAdminPushIfGranted,
  subscribeForegroundMessages,
} from "@/firebase/messaging";
import { isFirebaseWebConfigured } from "@/firebase/config";

import styles from "./AdminLayout.module.css";

type PushState = "setup" | "prompt" | "granted" | "denied" | "unsupported" | "busy";

const readDismissed = (): boolean => {
  try {
    return localStorage.getItem(PUSH_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
};

const writeDismissed = (): void => {
  try {
    localStorage.setItem(PUSH_DISMISSED_KEY, "1");
  } catch {
    // ignore
  }
};

const initialState = (): PushState => {
  if (!isFirebaseWebConfigured()) {
    return "setup";
  }
  if (typeof Notification === "undefined" || !("serviceWorker" in navigator)) {
    return "unsupported";
  }
  if (Notification.permission === "granted") {
    return "granted";
  }
  if (Notification.permission === "denied") {
    return "denied";
  }
  return readDismissed() ? "unsupported" : "prompt";
};

export const AdminPushControl = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<PushState>(initialState);

  useEffect(() => {
    if (state !== "granted") {
      return;
    }
    void refreshAdminPushIfGranted().catch(() => undefined);
    return subscribeForegroundMessages((orderId) => {
      navigate(`/admin/orders/${orderId}`);
    });
  }, [navigate, state]);

  const onEnable = async () => {
    setState("busy");
    try {
      const result = await enableAdminPush();
      writeDismissed();
      setState(result === "granted" ? "granted" : result);
    } catch {
      setState("unsupported");
    }
  };

  const onDisable = async () => {
    setState("busy");
    try {
      await disableAdminPush();
    } finally {
      writeDismissed();
      setState("unsupported");
    }
  };

  const onDismiss = () => {
    writeDismissed();
    setState("unsupported");
  };

  if (state === "setup") {
    return <span className={styles.notifyHint}>Push setup needed</span>;
  }

  if (state === "unsupported") {
    return (
      <button type="button" className={styles.notifyButton} onClick={() => void onEnable()}>
        Enable alerts
      </button>
    );
  }

  if (state === "denied") {
    return <span className={styles.notifyHint}>Alerts blocked in browser</span>;
  }

  if (state === "granted") {
    return (
      <button type="button" className={styles.notifyButton} onClick={() => void onDisable()}>
        Disable alerts
      </button>
    );
  }

  if (state === "busy") {
    return (
      <button type="button" className={styles.notifyButton} disabled>
        Updating alerts…
      </button>
    );
  }

  return (
    <div className={styles.notifyPrompt}>
      <button type="button" className={styles.notifyButton} onClick={() => void onEnable()}>
        Enable order alerts
      </button>
      <button type="button" className={styles.notifyDismiss} onClick={onDismiss}>
        Not now
      </button>
    </div>
  );
};
