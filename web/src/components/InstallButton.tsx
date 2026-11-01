import { appConfig } from "../config/appConfig";
import { useInstall } from "./InstallProvider";

type InstallButtonProps = {
  label?: string;
  variant?: "primary" | "light" | "nav";
  className?: string;
};

const variantClass: Record<NonNullable<InstallButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-dark hover:shadow-md",
  light:
    "bg-white text-primary-dark shadow-sm hover:bg-wash",
  nav: "bg-primary text-white shadow-sm hover:bg-primary-dark",
};

export default function InstallButton({
  label = appConfig.downloadLabel,
  variant = "primary",
  className = "",
}: InstallButtonProps) {
  const { openInstall } = useInstall();

  return (
    <button
      type="button"
      onClick={openInstall}
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition duration-200 ${variantClass[variant]} ${className}`}
    >
      {label}
    </button>
  );
}
