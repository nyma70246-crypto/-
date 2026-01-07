import { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentLocation } from '@/lib/location-service';
interface Worker {
  id: string;
  name: string;
  profession: string;
  rating: number;
  location: { latitude: number; longitude: number };
  distance: number;
  image?: string;
}

// Mock workers data with coordinates
const MOCK_WORKERS: Worker[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    profession: 'كهربائي',
    rating: 4.8,
    location: { latitude: 24.7136, longitude: 46.6753 },
    distance: 2.5,
    image: 'https://via.placeholder.com/100',
  },
  {
    id: '2',
    name: 'فاطمة علي',
    profession: 'مصفف شعر',
    rating: 4.9,
    location: { latitude: 24.7200, longitude: 46.6800 },
    distance: 3.1,
    image: 'https://via.placeholder.com/100',
  },
  {
    id: '3',
    name: 'محمد سالم',
    profession: 'سباك',
    rating: 4.6,
    location: { latitude: 24.7100, longitude: 46.6700 },
    distance: 1.8,
    image: 'https://via.placeholder.com/100',
  },
];

export default function MapScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme as 'light' | 'dark' ?? 'light'];
  const insets = useSafeAreaInsets();

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [workers, setWorkers] = useState<Worker[]>(MOCK_WORKERS);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const location = await getCurrentLocation();
        if (location) {
          setUserLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          });
        } else {
          // Default to Riyadh if location not available
          setUserLocation({
            latitude: 24.7136,
            longitude: 46.6753,
          });
        }
      } catch (error) {
        console.error('[Map] Failed to get location:', error);
        // Default to Riyadh
        setUserLocation({
          latitude: 24.7136,
          longitude: 46.6753,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLocation();
  }, []);

  if (isLoading || !userLocation) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>{t('common.loading')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, Spacing.lg),
          paddingBottom: Math.max(insets.bottom, Spacing.lg),
        },
      ]}
    >
      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* User Location Marker */}
        <Marker
          coordinate={userLocation}
          title={t('map.nearbyWorkers')}
          pinColor="blue"
        />

        {/* Workers Markers */}
        {workers.map((worker) => (
          <Marker
            key={worker.id}
            coordinate={{
              latitude: worker.location.latitude,
              longitude: worker.location.longitude,
            }}
            title={worker.name}
            description={worker.profession}
            pinColor="red"
            onPress={() => setSelectedWorker(worker)}
          />
        ))}
      </MapView>

      {/* Selected Worker Card */}
      {selectedWorker && (
        <View
          style={[
            styles.workerCard,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <ThemedText type="defaultSemiBold">
                {selectedWorker.name}
              </ThemedText>
              <ThemedText style={styles.profession}>
                {selectedWorker.profession}
              </ThemedText>
              <ThemedText style={styles.rating}>
                ⭐ {selectedWorker.rating} • {selectedWorker.distance} كم
              </ThemedText>
            </View>
            <Pressable
              onPress={() => setSelectedWorker(null)}
              style={styles.closeButton}
            >
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </Pressable>
          </View>

          <View style={styles.cardActions}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.tint }]}
            >
              <ThemedText style={styles.actionButtonText}>
                {t('map.viewProfile')}
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.actionButton,
                { backgroundColor: colors.tint, opacity: 0.8 },
              ]}
            >
              <ThemedText style={styles.actionButtonText}>
                {t('map.contact')}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      )}

      {/* Workers List */}
      <View
        style={[
          styles.workersList,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <ThemedText type="subtitle" style={styles.listTitle}>
          {t('map.nearbyWorkers')} ({workers.length})
        </ThemedText>
        {workers.map((worker) => (
          <Pressable
            key={worker.id}
            onPress={() => setSelectedWorker(worker)}
            style={[
              styles.workerItem,
              selectedWorker?.id === worker.id && {
                backgroundColor: colors.tint,
                opacity: 0.1,
              },
            ]}
          >
            <View style={styles.workerItemInfo}>
              <ThemedText style={styles.workerItemName}>
                {worker.name}
              </ThemedText>
              <ThemedText style={styles.workerItemProfession}>
                {worker.profession} • {worker.distance} كم
              </ThemedText>
            </View>
            <ThemedText style={styles.workerItemRating}>
              ⭐ {worker.rating}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
  },
  map: {
    flex: 1,
  },
  workerCard: {
    position: 'absolute',
    bottom: 200,
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    gap: Spacing.sm,
  },
  profession: {
    fontSize: 12,
    opacity: 0.7,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  closeButtonText: {
    fontSize: 18,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  workersList: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 200,
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  listTitle: {
    marginBottom: Spacing.md,
  },
  workerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
    marginBottom: Spacing.sm,
  },
  workerItemInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  workerItemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  workerItemProfession: {
    fontSize: 12,
    opacity: 0.6,
  },
  workerItemRating: {
    fontSize: 12,
    fontWeight: '600',
  },
});
