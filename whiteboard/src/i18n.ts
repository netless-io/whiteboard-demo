import i18n, { Resource } from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import zhCN from "./locales/zh-CN.json";

const messages: Resource = {
  en: { translation: en },
  "zh-CN": { translation: zhCN },
};

i18n
  .use(I18nextBrowserLanguageDetector)
  .use(initReactI18next)
  .init({
    resources: messages,
    fallbackLng: "en",
    supportedLngs: ["en", "zh-CN"],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

export const languages = Object.keys(messages);

export const languagesWithName = Object.freeze([
  { lang: "en", name: "English" },
  { lang: "zh-CN", name: "简体中文" },
]);

// dirty fix: force correct i18nextLng
if (window.localStorage) {
  const value = localStorage.getItem('i18nextLng') ?? '';
  if (!(value in messages)) {
    localStorage.setItem('i18nextLng', 'en');
  }
}
