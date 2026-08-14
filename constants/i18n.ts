import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import de from "@/locales/de.json";
import en from "@/locales/en.json";

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    fallbackLng: "en",
    lng: "en",
    interpolation: { escapeValue: false },
    resources: {
      de: { translation: de },
      en: { translation: en },
    },
  });
}

export default i18n;
