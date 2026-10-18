import type { ComponentType } from "react";

type DefaultWidgetProps = {
  visible: boolean;
  onClose: () => void;
  onCompletion?: (result: { success: boolean; identifier?: string; message?: string }) => void;
  widgetId: string;
  tokenAuth: string;
  defaultCountry?: {
    name: string;
    code: string;
    dial_code: string;
    flag: string;
  };
  defaultVerificationType?: "mobile" | "email";
  theme?: "light" | "dark" | "system";
  primaryColor?: string;
  primaryButtonTextColor?: string;
  matchBorderToPrimaryColor?: boolean;
  autoFocus?: boolean;
};

const loaded = require("@msg91comm/sendotp-react-native") as {
  DefaultWidget: ComponentType<DefaultWidgetProps>;
};

export const DefaultWidget = loaded.DefaultWidget;
