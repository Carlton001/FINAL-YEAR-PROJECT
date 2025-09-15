// src/locales/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import tw from './tw.json';
import ew from './ewe.json';
import ga from './ga.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: 'en', // default language
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      tw: { translation: tw },
      ew: { translation: ew },
      ga: { translation: ga },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
