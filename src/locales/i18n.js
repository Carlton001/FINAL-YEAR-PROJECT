// src/locales/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import tw from './tw.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      tw: { translation: tw },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;