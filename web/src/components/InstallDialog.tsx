import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { appConfig } from "../config/appConfig";
import { hasApkDownload, hasPlayStoreListing, type InstallIntent } from "../lib/install";
import { createQrDataUrl } from "../lib/qr";

type InstallDialogProps = {
  open: boolean;
  intent: InstallIntent;
  onClose: () => void;
};

type DialogCopy = {
  title: string;
  body: string;
  showQr: boolean;
};

const copyForIntent = (intent: InstallIntent): DialogCopy => {
  switch (intent.kind) {
    case "ios":
      return {
        title: "Available on Android first",
        body: "Sainik Mart is on Android first. iOS will be announced here when it is ready. You can still browse this website from any device.",
        showQr: false,
      };
    case "coming_soon":
      return {
        title: "Installation coming soon",
        body: "The Sainik Mart Android app is not available to install yet. Check back on this page — we will enable download here as soon as a public build is ready.",
        showQr: false,
      };
    case "download":
      return {
        title: "Download started",
        body: "Your Android package should appear in Chrome’s download tray. Open the file to install. If Android asks, allow installs from this browser. We never send you to Google’s Chrome download page.",
        showQr: false,
      };
    case "playstore":
      return {
        title: "Open Google Play",
        body: "Continue to the official Sainik Mart listing on Google Play to install the app.",
        showQr: false,
      };
    case "desktop":
      return {
        title: "Open this page on Android",
        body: hasApkDownload() || hasPlayStoreListing()
          ? "Scan the code or open this website on your Android phone to install Sainik Mart."
          : "Installation will be available soon. Scan the code or open sainikmartapp.in on your Android phone when the app is ready to install.",
        showQr: true,
      };
  }
};

export default function InstallDialog({ open, intent, onClose }: InstallDialogProps) {
  const copy = copyForIntent(intent);
  const [qrSrc, setQrSrc] = useState<string>("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || intent.kind !== "desktop") {
      setQrSrc("");
      return;
    }

    let cancelled = false;
    void createQrDataUrl(intent.qrUrl).then((url) => {
      if (!cancelled) {
        setQrSrc(url);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open, intent]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-primary-dark/50 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-dialog-title"
        className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="install-dialog-title" className="text-xl font-semibold tracking-tight text-ink">
            {copy.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted transition hover:bg-wash hover:text-ink"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{copy.body}</p>
        {copy.showQr ? (
          <div className="mt-6 flex flex-col items-center gap-3">
            {qrSrc ? (
              <img
                src={qrSrc}
                alt="QR code to open Sainik Mart on an Android phone"
                width={180}
                height={180}
                className="rounded-2xl border border-line bg-white p-2"
              />
            ) : (
              <div className="h-[180px] w-[180px] rounded-2xl border border-line bg-wash" />
            )}
            <p className="text-center text-sm text-muted">{appConfig.siteUrl.replace("https://", "")}</p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Close
        </button>
      </div>
    </div>
  );
}
