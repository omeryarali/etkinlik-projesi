import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
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

type EventFilters = {
  search: string;
  city: string;
  district: string;
  dateFilter: string;
  paidFilter: string;
  sortBy: string;
  onlyAvailable: boolean;
};

const defaultFilters: EventFilters = {
  search: "",
  city: "",
  district: "",
  dateFilter: "upcoming",
  paidFilter: "all",
  sortBy: "date",
  onlyAvailable: false,
};

export default function HomeScreen() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pageInfo, setPageInfo] = useState<PagedResponse<EventItem> | null>(
    null
  );

  const [search, setSearch] = useState(defaultFilters.search);
  const [city, setCity] = useState(defaultFilters.city);
  const [district, setDistrict] = useState(defaultFilters.district);
  const [dateFilter, setDateFilter] = useState(defaultFilters.dateFilter);
  const [paidFilter, setPaidFilter] = useState(defaultFilters.paidFilter);
  const [sortBy, setSortBy] = useState(defaultFilters.sortBy);
  const [onlyAvailable, setOnlyAvailable] = useState(
    defaultFilters.onlyAvailable
  );

  const [appliedFilters, setAppliedFilters] =
    useState<EventFilters>(defaultFilters);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  function getCurrentFilters(): EventFilters {
    return {
      search,
      city,
      district,
      dateFilter,
      paidFilter,
      sortBy,
      onlyAvailable,
    };
  }

  function buildEventsUrl(page: number, filters: EventFilters) {
    const params = new URLSearchParams();

    params.append("page", page.toString());
    params.append("pageSize", "10");

    if (filters.search.trim()) {
      params.append("search", filters.search.trim());
    }

    if (filters.city.trim()) {
      params.append("city", filters.city.trim());
    }

    if (filters.district.trim()) {
      params.append("district", filters.district.trim());
    }

    if (filters.dateFilter) {
      params.append("dateFilter", filters.dateFilter);
    }

    if (filters.paidFilter === "free") {
      params.append("isPaid", "false");
    }

    if (filters.paidFilter === "paid") {
      params.append("isPaid", "true");
    }

    if (filters.sortBy) {
      params.append("sortBy", filters.sortBy);
    }

    if (filters.onlyAvailable) {
      params.append("onlyAvailable", "true");
    }

    return `/api/Event/approved?${params.toString()}`;
  }

  async function loadInitialData(filters = appliedFilters) {
    try {
      setLoading(true);
      setError("");

      const savedUser = await getAuthUser();
      setUser(savedUser);

      await loadEvents(1, true, filters);
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

  async function loadEvents(
    page: number,
    reset = false,
    filters = appliedFilters
  ) {
    try {
      if (!reset) {
        setLoadingMore(true);
      }

      const data = (await apiFetch(buildEventsUrl(page, filters))) as PagedResponse<EventItem>;

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

  function applyFilters() {
    const filters = getCurrentFilters();
    setAppliedFilters(filters);
    loadInitialData(filters);
  }

  function clearFilters() {
    setSearch(defaultFilters.search);
    setCity(defaultFilters.city);
    setDistrict(defaultFilters.district);
    setDateFilter(defaultFilters.dateFilter);
    setPaidFilter(defaultFilters.paidFilter);
    setSortBy(defaultFilters.sortBy);
    setOnlyAvailable(defaultFilters.onlyAvailable);

    setAppliedFilters(defaultFilters);
    loadInitialData(defaultFilters);
  }

  function loadMore() {
    if (!pageInfo?.hasNextPage || loadingMore) {
      return;
    }

    loadEvents(pageInfo.page + 1, false, appliedFilters);
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

  useFocusEffect(
    useCallback(() => {
      loadInitialData(appliedFilters);
    }, [appliedFilters])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Etkinlik Projesi</Text>

      {user ? (
        <>
          <View style={styles.userBox}>
            <View style={styles.userInfo}>
              <Text style={styles.userTitle}>Hoş geldin, {user.fullName}</Text>
              <Text style={styles.userText}>Rol: {user.role}</Text>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Çıkış</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.myEventsButton}
            onPress={() => router.push("/my-events" as any)}
          >
            <Text style={styles.myEventsButtonText}>
              Katıldığım Etkinlikler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/profile" as any)}
          >
            <Text style={styles.profileButtonText}>Profilim</Text>
          </TouchableOpacity>
        </>
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

      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>Etkinlik Ara / Filtrele</Text>

        <TextInput
          style={styles.input}
          value={search}
          onChangeText={setSearch}
          placeholder="Etkinlik ara"
        />

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.inputHalf]}
            value={city}
            onChangeText={setCity}
            placeholder="Şehir"
          />

          <TextInput
            style={[styles.input, styles.inputHalf]}
            value={district}
            onChangeText={setDistrict}
            placeholder="İlçe"
          />
        </View>

        <Text style={styles.filterLabel}>Tarih</Text>
        <View style={styles.optionRow}>
          <FilterOption
            label="Yaklaşan"
            active={dateFilter === "upcoming"}
            onPress={() => setDateFilter("upcoming")}
          />
          <FilterOption
            label="Bugün"
            active={dateFilter === "today"}
            onPress={() => setDateFilter("today")}
          />
          <FilterOption
            label="Yarın"
            active={dateFilter === "tomorrow"}
            onPress={() => setDateFilter("tomorrow")}
          />
          <FilterOption
            label="Bu Hafta"
            active={dateFilter === "thisWeek"}
            onPress={() => setDateFilter("thisWeek")}
          />
        </View>

        <Text style={styles.filterLabel}>Ücret</Text>
        <View style={styles.optionRow}>
          <FilterOption
            label="Tümü"
            active={paidFilter === "all"}
            onPress={() => setPaidFilter("all")}
          />
          <FilterOption
            label="Ücretsiz"
            active={paidFilter === "free"}
            onPress={() => setPaidFilter("free")}
          />
          <FilterOption
            label="Ücretli"
            active={paidFilter === "paid"}
            onPress={() => setPaidFilter("paid")}
          />
        </View>

        <Text style={styles.filterLabel}>Sıralama</Text>
        <View style={styles.optionRow}>
          <FilterOption
            label="Tarih"
            active={sortBy === "date"}
            onPress={() => setSortBy("date")}
          />
          <FilterOption
            label="Yeni"
            active={sortBy === "newest"}
            onPress={() => setSortBy("newest")}
          />
          <FilterOption
            label="Popüler"
            active={sortBy === "popular"}
            onPress={() => setSortBy("popular")}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.availableButton,
            onlyAvailable && styles.availableButtonActive,
          ]}
          onPress={() => setOnlyAvailable((prev) => !prev)}
        >
          <Text
            style={[
              styles.availableButtonText,
              onlyAvailable && styles.availableButtonTextActive,
            ]}
          >
            Sadece kontenjanı uygun etkinlikler
          </Text>
        </TouchableOpacity>

        <View style={styles.filterActions}>
          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <Text style={styles.applyButtonText}>Filtrele</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Temizle</Text>
          </TouchableOpacity>
        </View>
      </View>

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
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(`/events/${item.id}` as any)}
            >
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
                <Text style={styles.infoValue}>
                  {formatDate(item.startDate)}
                </Text>
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
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.infoText}>Filtreye uygun etkinlik bulunamadı.</Text>
          }
        />
      )}
    </View>
  );
}

function FilterOption({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.optionButton, active && styles.optionButtonActive]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.optionButtonText,
          active && styles.optionButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20,
    paddingTop: 56,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  sectionHeader: {
    marginTop: 18,
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
  userInfo: {
    flex: 1,
    paddingRight: 12,
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
  myEventsButton: {
    marginTop: 12,
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  myEventsButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  profileButton: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderColor: "#2563EB",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  profileButtonText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
  filterCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
  },
  inputHalf: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 8,
    marginTop: 4,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  optionButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  optionButtonText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "700",
  },
  optionButtonTextActive: {
    color: "#FFFFFF",
  },
  availableButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    marginBottom: 10,
  },
  availableButtonActive: {
    backgroundColor: "#DCFCE7",
    borderColor: "#16A34A",
  },
  availableButtonText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
  },
  availableButtonTextActive: {
    color: "#166534",
  },
  filterActions: {
    flexDirection: "row",
    gap: 10,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "800",
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