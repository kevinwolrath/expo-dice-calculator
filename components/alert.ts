import { Alert, Platform } from "react-native";

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
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        { text: "OK", onPress: () => resolve(true) },
      ],
      { cancelable: true },
    );
  });
};
