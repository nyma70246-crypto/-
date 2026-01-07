import { Image } from "expo-image";
import { useRouter, Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, FlatList } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getLoginUrl } from "@/constants/oauth";
import { useAuth } from "@/hooks/use-auth";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Mock data for nearby workers
const NEARBY_WORKERS = [
  {
    id: "1",
    name: "أحمد محمد",
    profession: "كهربائي",
    rating: 4.8,
    distance: "2.5 كم",
    image: "https://via.placeholder.com/100",
  },
  {
    id: "2",
    name: "فاطمة علي",
    profession: "مصفف شعر",
    rating: 4.9,
    distance: "3.1 كم",
    image: "https://via.placeholder.com/100",
  },
];

export default function HomeScreen() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    console.log("[HomeScreen] Auth state:", {
      hasUser: !!user,
      loading,
      isAuthenticated,
      user: user ? { id: user.id, openId: user.openId, name: user.name, email: user.email } : null,
    });
  }, [user, loading, isAuthenticated]);

  const handleLogin = async () => {
    try {
      console.log("[Auth] Login button clicked");
      setIsLoggingIn(true);
      const loginUrl = getLoginUrl();
      console.log("[Auth] Generated login URL:", loginUrl);

      if (Platform.OS === "web") {
        console.log("[Auth] Web platform: redirecting to OAuth in same tab...");
        window.location.href = loginUrl;
        return;
      }

      console.log("[Auth] Opening OAuth URL in browser...");
      const result = await WebBrowser.openAuthSessionAsync(
        loginUrl,
        undefined,
        {
          preferEphemeralSession: false,
          showInRecents: true,
        },
      );

      console.log("[Auth] WebBrowser result:", result);
      if (result.type === "cancel") {
        console.log("[Auth] OAuth cancelled by user");
      } else if (result.type === "dismiss") {
        console.log("[Auth] OAuth dismissed");
      } else if (result.type === "success" && result.url) {
        console.log("[Auth] OAuth session successful, navigating to callback:", result.url);
        try {
          let url: URL;
          if (result.url.startsWith("exp://") || result.url.startsWith("exps://")) {
            const urlStr = result.url.replace(/^exp(s)?:\/\//, "http://");
            url = new URL(urlStr);
          } else {
            url = new URL(result.url);
          }

          const code = url.searchParams.get("code");
          const state = url.searchParams.get("state");
          const error = url.searchParams.get("error");

          console.log("[Auth] Extracted params from callback URL:", {
            code: code?.substring(0, 20) + "...",
            state: state?.substring(0, 20) + "...",
            error,
          });

          if (error) {
            console.error("[Auth] OAuth error in callback:", error);
            return;
          }

          if (code && state) {
            console.log("[Auth] Navigating to callback route with params...");
            router.push({
              pathname: "/oauth/callback" as any,
              params: { code, state },
            });
          } else {
            console.error("[Auth] Missing code or state in callback URL");
          }
        } catch (err) {
          console.error("[Auth] Failed to parse callback URL:", err, result.url);
          const codeMatch = result.url.match(/[?&]code=([^&]+)/);
          const stateMatch = result.url.match(/[?&]state=([^&]+)/);

          if (codeMatch && stateMatch) {
            const code = decodeURIComponent(codeMatch[1]);
            const state = decodeURIComponent(stateMatch[1]);
            console.log("[Auth] Fallback: extracted params via regex, navigating...");
            router.push({
              pathname: "/oauth/callback" as any,
              params: { code, state },
            });
          } else {
            console.error("[Auth] Could not extract code/state from URL");
          }
        }
      }
    } catch (error) {
      console.error("[Auth] Login error:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const renderWorkerCard = ({ item }: { item: typeof NEARBY_WORKERS[0] }) => (
    <View style={[styles.workerCard, { backgroundColor: colors.surface }]}>
      <View style={styles.workerHeader}>
        <View>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText style={styles.profession}>{item.profession}</ThemedText>
        </View>
        <ThemedText style={styles.distance}>{item.distance}</ThemedText>
      </View>
      <View style={styles.ratingRow}>
        <ThemedText style={styles.rating}>⭐ {item.rating}</ThemedText>
        <Pressable style={[styles.contactButton, { backgroundColor: colors.tint }]}>
          <ThemedText style={styles.contactButtonText}>تواصل</ThemedText>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">أهلاً بك!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.authContainer}>
        {loading ? (
          <ActivityIndicator />
        ) : isAuthenticated && user ? (
          <ThemedView style={styles.userInfo}>
            <ThemedText type="subtitle">مرحباً</ThemedText>
            <ThemedText type="defaultSemiBold">{user.name || user.email || user.openId}</ThemedText>
            <Pressable onPress={logout} style={styles.logoutButton}>
              <ThemedText style={styles.logoutText}>تسجيل الخروج</ThemedText>
            </Pressable>
          </ThemedView>
        ) : (
          <Pressable
            onPress={handleLogin}
            disabled={isLoggingIn}
            style={[styles.loginButton, isLoggingIn && styles.loginButtonDisabled]}
          >
            {isLoggingIn ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.loginText}>تسجيل الدخول</ThemedText>
            )}
          </Pressable>
        )}
      </ThemedView>

      {isAuthenticated && (
        <>
          <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">العمال القريبين منك</ThemedText>
            <ThemedText>اكتشف العمال المحترفين بالقرب منك واختر الأفضل لاحتياجاتك</ThemedText>
          </ThemedView>

          <FlatList
            data={NEARBY_WORKERS}
            keyExtractor={(item) => item.id}
            renderItem={renderWorkerCard}
            scrollEnabled={false}
            contentContainerStyle={styles.workersList}
          />

          <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">الميزات الرئيسية</ThemedText>
            <ThemedText>
              • البحث عن العمال حسب المهنة والموقع{"\n"}
              • التواصل المباشر والآمن{"\n"}
              • عرض معرض الأعمال السابقة{"\n"}
              • تقييم وتقديم آراء عن الخدمات
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">ابدأ الآن</ThemedText>
            <ThemedText>
              انتقل إلى تبويب البحث لاستكشاف المزيد من العمال والخدمات المتاحة
            </ThemedText>
          </ThemedView>
        </>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  authContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  userInfo: {
    gap: 8,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "500",
  },
  workersList: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  workerCard: {
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  workerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  profession: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  distance: {
    fontSize: 12,
    opacity: 0.6,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
  },
  contactButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.small,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
