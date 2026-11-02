import { appConfig } from "../config/appConfig";
import { isSameOriginApk } from "../lib/install";
import { useInstall } from "./InstallProvider";

type InstallButtonProps = {
  label?: string;
  variant?: "primary" | "light" | "nav";
  className?: string;
  onNavigate?: () => void;
};

const variantClass: Record<NonNullable<InstallButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-dark hover:shadow-md",
  light:
    "bg-white text-primary-dark shadow-sm hover:bg-wash",
  nav: "bg-primary text-white shadow-sm hover:bg-primary-dark",
};

const baseClass =
  "inline-flex min-h-12 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition duration-200";

export default function InstallButton({
  label = appConfig.downloadLabel,
  variant = "primary",
  className = "",
  onNavigate,
}: InstallButtonProps) {
  const { intent, openInstall } = useInstall();
  const classes = `${baseClass} ${variantClass[variant]} ${className}`;

  if (intent.kind === "download" || intent.kind === "playstore") {
    const sameOriginApk = intent.kind === "download" && isSameOriginApk(intent.url);

    return (
      <a
        href={intent.url}
        rel="noopener"
        className={classes}
        download={sameOriginApk ? "sainik-mart.apk" : undefined}
        onClick={onNavigate}
      >
        {label}
      </a>
    );
  }

  return (
    <button type="button" onClick={openInstall} className={classes}>
      {label}
    </button>
  );
}
