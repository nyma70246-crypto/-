import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation resources
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import de from './locales/de.json';

const resources = {
  ar: { translation: ar },
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  de: { translation: de },
};

// Get device language
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Load saved language preference
export const loadLanguagePreference = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('app_language');
    if (savedLanguage && Object.keys(resources).includes(savedLanguage)) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error('[i18n] Failed to load language preference:', error);
  }
};

// Save language preference
export const setLanguage = async (language: string) => {
  try {
    if (Object.keys(resources).includes(language)) {
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem('app_language', language);
    }
  } catch (error) {
    console.error('[i18n] Failed to set language:', error);
  }
};

// Get current language
export const getCurrentLanguage = () => i18n.language;

// Get available languages
export const getAvailableLanguages = () => Object.keys(resources);

// Check if current language is RTL
export const isRTL = () => {
  const rtlLanguages = ['ar', 'he', 'ur'];
  return rtlLanguages.includes(i18n.language);
};

export default i18n;
