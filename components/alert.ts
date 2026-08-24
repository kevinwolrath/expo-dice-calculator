import { Alert, Platform } from "react-native";

import i18n from "@/constants/i18n";

export const showMessage = (title: string, message?: string) => {
  if (Platform.OS === "web") {
    // Use a simple browser alert on web
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
};

export const confirm = (
  title: string,
  message?: string,
  labels?: { confirm?: string; cancel?: string },
): Promise<boolean> => {
  const confirmText = labels?.confirm ?? i18n.t("common.ok");
  const cancelText = labels?.cancel ?? i18n.t("common.cancel");

  if (Platform.OS === "web") {
    return Promise.resolve(
      window.confirm(message ? `${title}\n\n${message}` : title),
    );
  }

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: cancelText,
          style: "cancel",
          onPress: () => resolve(false),
        },
        { text: confirmText, onPress: () => resolve(true) },
      ],
      { cancelable: true },
    );
  });
};
