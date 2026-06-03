import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiFetch } from "../services/apiService";
import { clearAuthData, getAuthUser } from "../services/authStorage";

type AuthUser = {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  token: string;
};

type EventItem = {
  id: number;
  organizerProfileId: number;
  organizerName: string;
  eventCategoryId: number;
  categoryName: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string | null;
  city: string;
  district: string;
  locationName: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  capacity: number;
  participantCount: number;
  isPaid: boolean;
  price?: number | null;
  coverImageUrl: string;
  rules: string;
  status: string;
  createdAt: string;
  approvedAt?: string | null;
};

type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export default function HomeScreen() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pageInfo, setPageInfo] = useState<PagedResponse<EventItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");

      const savedUser = await getAuthUser();
      setUser(savedUser);

      await loadEvents(1, true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Veriler alınamadı.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadEvents(page: number, reset = false) {
    try {
      if (!reset) {
        setLoadingMore(true);
      }

      const data = (await apiFetch(
        `/api/Event/approved?page=${page}&pageSize=10&dateFilter=upcoming`
      )) as PagedResponse<EventItem>;

      if (reset) {
        setEvents(data.items || []);
      } else {
        setEvents((prev) => [...prev, ...(data.items || [])]);
      }

      setPageInfo(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Etkinlikler alınamadı.");
      }
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleLogout() {
    await clearAuthData();
    setUser(null);
  }

  function loadMore() {
    if (!pageInfo?.hasNextPage || loadingMore) {
      return;
    }

    loadEvents(pageInfo.page + 1);
  }

  function formatDate(dateValue: string) {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Etkinlik Projesi</Text>

      {user ? (
        <View style={styles.userBox}>
          <View>
            <Text style={styles.userTitle}>Hoş geldin, {user.fullName}</Text>
            <Text style={styles.userText}>Rol: {user.role}</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Çıkış</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.authButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => router.push("/login" as any)}
          >
            <Text style={styles.primaryButtonText}>Giriş Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => router.push("/register" as any)}
          >
            <Text style={styles.secondaryButtonText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.subtitle}>Yaklaşan Etkinlikler</Text>

        {pageInfo && (
          <Text style={styles.countText}>{pageInfo.totalCount} etkinlik</Text>
        )}
      </View>

      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator />
          <Text style={styles.infoText}>Etkinlikler yükleniyor...</Text>
        </View>
      )}

      {!loading && error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!loading && !error && (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator />
                <Text style={styles.infoText}>Daha fazla yükleniyor...</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <Text style={styles.categoryBadge}>{item.categoryName}</Text>
                <Text style={styles.priceText}>
                  {item.isPaid ? `${item.price ?? 0} TL` : "Ücretsiz"}
                </Text>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>

              <Text style={styles.cardText} numberOfLines={2}>
                {item.description || "Açıklama yok"}
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tarih:</Text>
                <Text style={styles.infoValue}>{formatDate(item.startDate)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Konum:</Text>
                <Text style={styles.infoValue}>
                  {item.city} / {item.district}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Katılım:</Text>
                <Text style={styles.infoValue}>
                  {item.participantCount} / {item.capacity}
                </Text>
              </View>

              <Text style={styles.organizerText}>
                Organizatör: {item.organizerName}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.infoText}>Yaklaşan etkinlik bulunamadı.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 24,
    paddingTop: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  countText: {
    fontSize: 13,
    color: "#6B7280",
  },
  authButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  userBox: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  userText: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
  },
  logoutButton: {
    backgroundColor: "#DC2626",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  centerBox: {
    marginTop: 24,
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 14,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: "#DBEAFE",
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  priceText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  cardText: {
    marginTop: 6,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  infoRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  infoValue: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
  },
  organizerText: {
    marginTop: 12,
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
});