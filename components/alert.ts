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

export const confirm = (title: string, message?: string): Promise<boolean> => {
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
          text: i18n.t("common.cancel"),
          style: "cancel",
          onPress: () => resolve(false),
        },
        { text: i18n.t("common.ok"), onPress: () => resolve(true) },
      ],
      { cancelable: true },
    );
  });
};
