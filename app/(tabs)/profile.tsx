import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View, Pressable, ScrollView, Image, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { pickImageFromCamera, pickImageFromLibrary } from '@/lib/image-service';
import type { ImageAsset } from '@/lib/image-service';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<ImageAsset[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Mock user data
  const mockProfile = {
    name: user?.name || 'المستخدم',
    email: user?.email || 'user@example.com',
    phone: '+966501234567',
    profession: 'كهربائي',
    bio: 'كهربائي محترف مع 10 سنوات خبرة',
    rating: 4.8,
    reviewCount: 45,
    hourlyRate: 100,
  };

  const handlePickProfileImage = async () => {
    Alert.alert('اختر صورة', 'من أين تريد اختيار الصورة؟', [
      {
        text: 'الكاميرا',
        onPress: async () => {
          const image = await pickImageFromCamera();
          if (image) {
            setProfileImage(image.uri);
          }
        },
      },
      {
        text: 'المعرض',
        onPress: async () => {
          const image = await pickImageFromLibrary();
          if (image) {
            setProfileImage(image.uri);
          }
        },
      },
      { text: 'إلغاء', onPress: () => {} },
    ]);
  };

  const handleAddPortfolioImage = async () => {
    const images = await pickImageFromLibrary();
    if (images) {
      setPortfolio([...portfolio, images]);
    }
  };

  const handleRemovePortfolioImage = (index: number) => {
    setPortfolio(portfolio.filter((_, i) => i !== index));
  };
  const handleOpenSettings = () => router.push('/settings');
  const handleLogout = () => {
    if (loggingOut) return;
    Alert.alert('تسجيل الخروج', 'هل تريد تسجيل الخروج من الحساب؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تسجيل الخروج',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
            router.replace('/');
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const renderPortfolioItem = ({ item, index }: { item: ImageAsset; index: number }) => (
    <View style={styles.portfolioItemContainer}>
      <Image
        source={{ uri: item.uri }}
        style={styles.portfolioImage}
      />
      <Pressable
        onPress={() => handleRemovePortfolioImage(index)}
        style={[styles.removeButton, { backgroundColor: colors.error }]}
      >
        <ThemedText style={styles.removeButtonText}>✕</ThemedText>
      </Pressable>
    </View>
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
    >
      <ThemedView style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Pressable
            onPress={handlePickProfileImage}
            style={[
              styles.profileImageContainer,
              { backgroundColor: colors.surface },
            ]}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <ThemedText style={styles.profileImagePlaceholder}>
                📷
              </ThemedText>
            )}
            <View
              style={[
                styles.editBadge,
                { backgroundColor: colors.tint },
              ]}
            >
              <ThemedText style={styles.editBadgeText}>✎</ThemedText>
            </View>
          </Pressable>

          <View style={styles.profileInfo}>
            <ThemedText type="title" style={styles.name}>
              {mockProfile.name}
            </ThemedText>
            <ThemedText style={styles.profession}>
              {mockProfile.profession}
            </ThemedText>
            <View style={styles.ratingContainer}>
              <ThemedText style={styles.rating}>
                ⭐ {mockProfile.rating} ({mockProfile.reviewCount} تقييم)
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            معلومات التواصل
          </ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>البريد الإلكتروني:</ThemedText>
            <ThemedText style={styles.value}>{mockProfile.email}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>رقم الهاتف:</ThemedText>
            <ThemedText style={styles.value}>{mockProfile.phone}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>السعر:</ThemedText>
            <ThemedText style={styles.value}>
              {mockProfile.hourlyRate} ريال/ساعة
            </ThemedText>
          </View>
        </View>

        {/* Bio */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            نبذة شخصية
          </ThemedText>
          <ThemedText style={styles.bio}>{mockProfile.bio}</ThemedText>
          {isEditing && (
            <Pressable
              style={[styles.button, { backgroundColor: colors.tint }]}
            >
              <ThemedText style={styles.buttonText}>تحديث النبذة</ThemedText>
            </Pressable>
          )}
        </View>

        {/* Portfolio */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              معرض الأعمال
            </ThemedText>
            <Pressable
              onPress={handleAddPortfolioImage}
              style={[styles.addButton, { backgroundColor: colors.tint }]}
            >
              <ThemedText style={styles.addButtonText}>+ إضافة</ThemedText>
            </Pressable>
          </View>

          {portfolio.length > 0 ? (
            <FlatList
              data={portfolio}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderPortfolioItem}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={styles.portfolioRow}
              contentContainerStyle={styles.portfolioGrid}
            />
          ) : (
            <ThemedText style={styles.emptyPortfolio}>
              لم تضف أي صور بعد
            </ThemedText>
          )}
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Pressable
            onPress={handleOpenSettings}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="فتح الإعدادات"
            style={[styles.button, { backgroundColor: colors.surface }]}
          >
            <ThemedText style={styles.buttonTextDark}>⚙️ الإعدادات</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="تسجيل الخروج"
            style={[styles.button, { backgroundColor: colors.error }, loggingOut && styles.disabled]}
          >
            <ThemedText style={styles.buttonText}>{loggingOut ? 'جارٍ تسجيل الخروج...' : 'تسجيل الخروج'}</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: Spacing.lg,
    alignItems: 'flex-start',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    fontSize: 40,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    gap: Spacing.sm,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profession: {
    fontSize: 14,
    opacity: 0.7,
  },
  ratingContainer: {
    marginTop: Spacing.sm,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.small,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    opacity: 0.7,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
  },
  portfolioGrid: {
    gap: Spacing.md,
  },
  portfolioRow: {
    gap: Spacing.md,
  },
  portfolioItemContainer: {
    flex: 1,
    aspectRatio: 1,
    position: 'relative',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.medium,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyPortfolio: {
    textAlign: 'center',
    opacity: 0.6,
    paddingVertical: Spacing.lg,
  },
  settingsSection: {
    gap: Spacing.md,
  },
  button: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDark: {
    fontSize: 16,
    fontWeight: '600',
  },
});
