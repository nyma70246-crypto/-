import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Pressable, View, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentLocation, calculateDistance } from '@/lib/location-service';
import type { WorkerProfile } from '@/lib/types';

// Mock data for workers
const MOCK_WORKERS: WorkerProfile[] = [
  {
    id: '1',
    openId: 'worker1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '+966501234567',
    role: 'worker',
    profileImage: 'https://via.placeholder.com/150',
    createdAt: new Date(),
    updatedAt: new Date(),
    profession: 'كهربائي',
    bio: 'كهربائي محترف مع 10 سنوات خبرة',
    rating: 4.8,
    reviewCount: 45,
    hourlyRate: 100,
    location: {
      latitude: 24.7136,
      longitude: 46.6753,
      address: 'الرياض',
    },
    portfolio: [],
    isAvailable: true,
    tags: ['كهربائي', 'صيانة', 'تركيب'],
  },
  {
    id: '2',
    openId: 'worker2',
    name: 'فاطمة علي',
    email: 'fatima@example.com',
    phone: '+966501234568',
    role: 'worker',
    profileImage: 'https://via.placeholder.com/150',
    createdAt: new Date(),
    updatedAt: new Date(),
    profession: 'مصفف شعر',
    bio: 'مصففة شعر متخصصة في التسريحات الحديثة',
    rating: 4.9,
    reviewCount: 120,
    hourlyRate: 80,
    location: {
      latitude: 24.7245,
      longitude: 46.6881,
      address: 'الرياض',
    },
    portfolio: [],
    isAvailable: true,
    tags: ['تصفيف', 'عناية', 'تلوين'],
  },
];

const PROFESSIONS = [
  'كهربائي',
  'سباك',
  'نجار',
  'مصفف شعر',
  'طاهي',
  'مدرس',
  'مهندس',
  'ميكانيكي',
];

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState(50);
  const [workers, setWorkers] = useState<WorkerProfile[]>(MOCK_WORKERS);
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerProfile[]>(MOCK_WORKERS);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user location on mount
  useEffect(() => {
    const loadLocation = async () => {
      try {
        const location = await getCurrentLocation();
        if (location) {
          setUserLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          });
        }
      } catch (error) {
        console.error('Failed to get location:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLocation();
  }, []);

  // Filter workers based on search criteria
  useEffect(() => {
    let filtered = workers;

    // Filter by profession
    if (selectedProfession) {
      filtered = filtered.filter((w) => w.profession === selectedProfession);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (w) =>
          w.name.includes(searchQuery) ||
          w.profession.includes(searchQuery) ||
          w.tags.some((tag) => tag.includes(searchQuery))
      );
    }

    // Filter by distance
    if (userLocation) {
      filtered = filtered.filter((w) => {
        const distance = calculateDistance(userLocation, w.location);
        return distance <= maxDistance;
      });
    }

    setFilteredWorkers(filtered);
  }, [searchQuery, selectedProfession, maxDistance, userLocation, workers]);

  const renderWorkerCard = ({ item }: { item: WorkerProfile }) => {
    const distance = userLocation
      ? calculateDistance(userLocation, item.location)
      : null;

    return (
      <Pressable
        onPress={() => router.push(`/modal`)}
        style={({ pressed }) => [
          styles.workerCard,
          {
            backgroundColor: colors.surface,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View style={styles.workerHeader}>
          <View>
            <ThemedText type="defaultSemiBold" style={styles.workerName}>
              {item.name}
            </ThemedText>
            <ThemedText style={styles.profession}>{item.profession}</ThemedText>
          </View>
          <View style={styles.ratingBadge}>
            <ThemedText style={styles.ratingText}>⭐ {item.rating}</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.bio}>{item.bio}</ThemedText>

        <View style={styles.workerFooter}>
          {distance !== null && (
            <ThemedText style={styles.distance}>📍 {distance} كم</ThemedText>
          )}
          {item.hourlyRate && (
            <ThemedText style={styles.rate}>💰 {item.hourlyRate} ريال/ساعة</ThemedText>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, Spacing.lg),
          paddingBottom: Math.max(insets.bottom, Spacing.lg),
        },
      ]}
    >
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="ابحث عن مهنة أو عامل..."
          placeholderTextColor={colors.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Profession Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={PROFESSIONS}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              setSelectedProfession(selectedProfession === item ? null : item)
            }
            style={[
              styles.professionTag,
              {
                backgroundColor:
                  selectedProfession === item ? colors.tint : colors.surface,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.professionTagText,
                {
                  color:
                    selectedProfession === item ? '#fff' : colors.text,
                },
              ]}
            >
              {item}
            </ThemedText>
          </Pressable>
        )}
        contentContainerStyle={styles.professionList}
      />

      {/* Distance Slider */}
      <View style={styles.filterSection}>
        <ThemedText type="defaultSemiBold">المسافة: {maxDistance} كم</ThemedText>
        <View style={styles.sliderContainer}>
          {/* Simple distance buttons for now */}
          {[10, 25, 50, 100].map((distance) => (
            <Pressable
              key={distance}
              onPress={() => setMaxDistance(distance)}
              style={[
                styles.distanceButton,
                {
                  backgroundColor:
                    maxDistance === distance ? colors.tint : colors.surface,
                },
              ]}
            >
              <ThemedText
                style={{
                  color: maxDistance === distance ? '#fff' : colors.text,
                }}
              >
                {distance}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Workers List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={filteredWorkers}
          keyExtractor={(item) => item.id}
          renderItem={renderWorkerCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText type="subtitle">لا توجد نتائج</ThemedText>
              <ThemedText style={styles.emptyText}>
                حاول تغيير معايير البحث
              </ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    paddingVertical: Spacing.md,
    fontSize: 16,
    textAlign: 'right',
  },
  professionList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  professionTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.medium,
  },
  professionTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  distanceButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.small,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },
  workerCard: {
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workerName: {
    fontSize: 18,
    marginBottom: Spacing.xs,
  },
  profession: {
    fontSize: 14,
    opacity: 0.7,
  },
  ratingBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.small,
    backgroundColor: '#FFF3CD',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
  },
  workerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  distance: {
    fontSize: 12,
    opacity: 0.7,
  },
  rate: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
  },
});
