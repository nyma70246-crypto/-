import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageHook {
  currentLanguage: string;
  availableLanguages: string[];
  changeLanguage: (language: string) => Promise<void>;
  isRTL: boolean;
  t: (key: string) => string;
}

export const useLanguage = (): LanguageHook => {
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isRTL, setIsRTL] = useState(false);

  const availableLanguages = ['ar', 'en', 'fr', 'es', 'de'];

  useEffect(() => {
    // Load saved language preference
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('app_language');
        if (savedLanguage && availableLanguages.includes(savedLanguage)) {
          await i18n.changeLanguage(savedLanguage);
          setCurrentLanguage(savedLanguage);
          updateRTL(savedLanguage);
        } else {
          updateRTL(i18n.language);
        }
      } catch (error) {
        console.error('[useLanguage] Failed to load language:', error);
      }
    };

    loadLanguage();
  }, [availableLanguages]);

  const updateRTL = (language: string) => {
    const rtlLanguages = ['ar', 'he', 'ur'];
    setIsRTL(rtlLanguages.includes(language));
  };

  const changeLanguage = async (language: string) => {
    try {
      if (availableLanguages.includes(language)) {
        await i18n.changeLanguage(language);
        await AsyncStorage.setItem('app_language', language);
        setCurrentLanguage(language);
        updateRTL(language);
      }
    } catch (error) {
      console.error('[useLanguage] Failed to change language:', error);
    }
  };

  return {
    currentLanguage,
    availableLanguages,
    changeLanguage,
    isRTL,
    t,
  };
};
