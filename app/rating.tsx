import { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Rating } from '@/lib/types';

// Mock reviews data
const MOCK_REVIEWS: Rating[] = [
  {
    id: '1',
    workerId: 'worker1',
    customerId: 'user2',
    score: 5,
    comment: 'عمل رائع جداً، أنصح به بشدة!',
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: '2',
    workerId: 'worker1',
    customerId: 'user3',
    score: 4,
    comment: 'خدمة جيدة جداً، لكن استغرق وقتاً أطول من المتوقع',
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: '3',
    workerId: 'worker1',
    customerId: 'user4',
    score: 5,
    comment: 'محترف جداً وسريع في العمل',
    createdAt: new Date(Date.now() - 259200000),
  },
];

export default function RatingScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<Rating[]>(MOCK_REVIEWS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length).toFixed(1)
      : 0;

  const handleSubmitRating = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newReview: Rating = {
        id: `review-${Date.now()}`,
        workerId: 'worker1',
        customerId: 'user1',
        score: rating,
        comment: comment || undefined,
        createdAt: new Date(),
      };

      setReviews((prev) => [newReview, ...prev]);
      setRating(0);
      setComment('');
      setIsSubmitting(false);
    }, 1000);
  };

  const renderStars = (count: number, onPress?: (index: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((index) => (
          <Pressable
            key={index}
            onPress={() => onPress?.(index)}
            style={styles.starButton}
          >
            <ThemedText style={styles.star}>
              {index <= count ? '⭐' : '☆'}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: Rating }) => (
    <View style={[styles.reviewCard, { backgroundColor: colors.surface }]}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewStars}>
          {renderStars(item.score)}
        </View>
        <ThemedText style={styles.reviewDate}>
          {item.createdAt.toLocaleDateString('ar-SA')}
        </ThemedText>
      </View>
      {item.comment && (
        <ThemedText style={styles.reviewComment}>{item.comment}</ThemedText>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, Spacing.lg),
          paddingBottom: Math.max(insets.bottom, Spacing.lg),
        },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ThemedText style={styles.backButton}>←</ThemedText>
          </Pressable>
          <ThemedText type="title">{t('ratings.title')}</ThemedText>
        </View>

        {/* Average Rating */}
        <View style={[styles.averageSection, { backgroundColor: colors.surface }]}>
          <ThemedText type="subtitle">{t('ratings.average')}</ThemedText>
          <View style={styles.averageContainer}>
            <ThemedText style={styles.averageScore}>{averageRating}</ThemedText>
            <ThemedText style={styles.reviewCount}>
              ({reviews.length} {t('ratings.reviews')})
            </ThemedText>
          </View>
          {renderStars(Math.round(Number(averageRating)))}
        </View>

        {/* Add Rating Form */}
        <View style={[styles.formSection, { backgroundColor: colors.surface }]}>
          <ThemedText type="subtitle">{t('ratings.addRating')}</ThemedText>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>{t('ratings.rating')}</ThemedText>
            {renderStars(rating, setRating)}
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>{t('ratings.comment')}</ThemedText>
            <TextInput
              style={[
                styles.commentInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder={t('ratings.comment')}
              placeholderTextColor={colors.icon}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlign="right"
            />
          </View>

          <Pressable
            onPress={handleSubmitRating}
            disabled={rating === 0 || isSubmitting}
            style={[
              styles.submitButton,
              {
                backgroundColor:
                  rating === 0 || isSubmitting ? colors.border : colors.tint,
              },
            ]}
          >
            <ThemedText style={styles.submitButtonText}>
              {t('ratings.submit')}
            </ThemedText>
          </Pressable>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsSection}>
          <ThemedText type="subtitle" style={styles.reviewsTitle}>
            {t('ratings.reviews')}
          </ThemedText>
          {reviews.length > 0 ? (
            <FlatList
              data={reviews}
              keyExtractor={(item) => item.id}
              renderItem={renderReviewItem}
              scrollEnabled={false}
              contentContainerStyle={styles.reviewsList}
            />
          ) : (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                {t('ratings.noReviews')}
              </ThemedText>
            </ThemedView>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  averageSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.large,
    alignItems: 'center',
    gap: Spacing.md,
  },
  averageContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.md,
  },
  averageScore: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  reviewCount: {
    fontSize: 14,
    opacity: 0.6,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  starButton: {
    padding: Spacing.sm,
  },
  star: {
    fontSize: 24,
  },
  formSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.large,
    gap: Spacing.lg,
  },
  formGroup: {
    gap: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  submitButton: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  reviewsTitle: {
    marginBottom: Spacing.lg,
  },
  reviewsList: {
    gap: Spacing.md,
  },
  reviewCard: {
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    opacity: 0.6,
  },
});
