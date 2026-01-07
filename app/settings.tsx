import { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, ScrollView, Switch, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLanguage } from '@/hooks/use-language';
import i18n from '@/lib/i18n';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: Language[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentLanguage, changeLanguage } = useLanguage();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleLanguageChange = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    await changeLanguage(languageCode);
  };

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <Pressable
      onPress={() => handleLanguageChange(item.code)}
      style={[
        styles.languageItem,
        {
          backgroundColor: selectedLanguage === item.code ? colors.tint : colors.surface,
        },
      ]}
    >
      <View style={styles.languageInfo}>
        <ThemedText
          style={[
            styles.languageName,
            selectedLanguage === item.code && { color: '#fff' },
          ]}
        >
          {item.nativeName}
        </ThemedText>
        <ThemedText
          style={[
            styles.languageCode,
            selectedLanguage === item.code && { color: 'rgba(255,255,255,0.7)' },
          ]}
        >
          {item.name}
        </ThemedText>
      </View>
      {selectedLanguage === item.code && (
        <ThemedText style={styles.checkmark}>✓</ThemedText>
      )}
    </Pressable>
  );

  return (
    <ScrollView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, Spacing.lg),
          paddingBottom: Math.max(insets.bottom, Spacing.lg),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ThemedText style={styles.backButton}>←</ThemedText>
        </Pressable>
        <ThemedText type="title">{t('profile.settings')}</ThemedText>
      </View>

      {/* Language Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t('profile.language')}
        </ThemedText>
        <FlatList
          data={LANGUAGES}
          keyExtractor={(item) => item.code}
          renderItem={renderLanguageItem}
          scrollEnabled={false}
          contentContainerStyle={styles.languagesList}
        />
      </View>

      {/* Notifications Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t('profile.notifications')}
        </ThemedText>
        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <ThemedText>{t('profile.notifications')}</ThemedText>
            <ThemedText style={styles.settingDescription}>
              تلقي إشعارات الرسائل والعروض
            </ThemedText>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: colors.border, true: colors.tint }}
          />
        </View>
      </View>

      {/* Appearance Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          المظهر
        </ThemedText>
        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <ThemedText>الوضع الليلي</ThemedText>
            <ThemedText style={styles.settingDescription}>
              تفعيل الوضع الليلي
            </ThemedText>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: colors.border, true: colors.tint }}
          />
        </View>
      </View>

      {/* Privacy Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t('profile.privacy')}
        </ThemedText>
        <Pressable style={styles.settingButton}>
          <ThemedText>{t('profile.privacy')}</ThemedText>
          <ThemedText style={styles.arrow}>›</ThemedText>
        </Pressable>
      </View>

      {/* About Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t('profile.about')}
        </ThemedText>
        <Pressable style={styles.settingButton}>
          <ThemedText>{t('profile.about')}</ThemedText>
          <ThemedText style={styles.arrow}>›</ThemedText>
        </Pressable>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <ThemedText style={styles.versionText}>
          Workers Connect v1.0.0
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  backButton: {
    fontSize: 24,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  languagesList: {
    gap: Spacing.md,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
  },
  languageInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  languageName: {
    fontSize: 14,
    fontWeight: '600',
  },
  languageCode: {
    fontSize: 12,
    opacity: 0.6,
  },
  checkmark: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  settingLabel: {
    flex: 1,
    gap: Spacing.xs,
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.6,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  arrow: {
    fontSize: 20,
    opacity: 0.5,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  versionText: {
    fontSize: 12,
    opacity: 0.5,
  },
});
