import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { apiFetch } from "../services/apiService";
import { getAuthToken } from "../services/authStorage";

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

export default function OrganizerEventsScreen() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [pageInfo, setPageInfo] = useState<PagedResponse<EventItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  async function loadEvents(page: number, reset = false) {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError("");

      const token = await getAuthToken();

      if (!token) {
        router.replace("/login" as any);
        return;
      }

      const data = (await apiFetch(
        `/api/Event/my-events?page=${page}&pageSize=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
        setError("Etkinlikleriniz alınamadı.");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
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

  useFocusEffect(
    useCallback(() => {
      loadEvents(1, true);
    }, [])
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Oluşturduğum Etkinlikler</Text>

      {pageInfo && (
        <Text style={styles.subtitle}>{pageInfo.totalCount} etkinlik</Text>
      )}

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
          ListEmptyComponent={
            <Text style={styles.infoText}>
              Henüz oluşturduğunuz etkinlik bulunmuyor.
            </Text>
          }
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
                <StatusBadge status={item.status} />
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

              <Text style={styles.priceText}>
                {item.isPaid ? `${item.price ?? 0} TL` : "Ücretsiz"}
              </Text>
              <TouchableOpacity
                style={styles.participantsButton}
                onPress={() => router.push(`/event-participants/${item.id}` as any)}
                >
                <Text style={styles.participantsButtonText}>Katılımcıları Gör</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styleMap: Record<string, object> = {
    Pending: {
      backgroundColor: "#FEF3C7",
    },
    Approved: {
      backgroundColor: "#DCFCE7",
    },
    Rejected: {
      backgroundColor: "#FEE2E2",
    },
    Cancelled: {
      backgroundColor: "#E5E7EB",
    },
    Completed: {
      backgroundColor: "#DBEAFE",
    },
  };

  const textColorMap: Record<string, object> = {
    Pending: {
      color: "#92400E",
    },
    Approved: {
      color: "#166534",
    },
    Rejected: {
      color: "#991B1B",
    },
    Cancelled: {
      color: "#374151",
    },
    Completed: {
      color: "#1D4ED8",
    },
  };

  return (
    <View style={[styles.statusBadge, styleMap[status] || styles.statusDefault]}>
      <Text style={[styles.statusText, textColorMap[status] || styles.statusTextDefault]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 24,
    paddingTop: 56,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backButtonText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "700",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 18,
    color: "#6B7280",
    fontSize: 14,
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
    marginTop: 24,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 14,
  },
  list: {
    flex: 1,
    marginTop: 18,
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
    alignItems: "center",
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
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDefault: {
    backgroundColor: "#E5E7EB",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },
  statusTextDefault: {
    color: "#374151",
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
  priceText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
  participantsButton: {
  marginTop: 12,
  backgroundColor: "#111827",
  borderRadius: 12,
  paddingVertical: 11,
  alignItems: "center",
},
participantsButtonText: {
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: "800",
},
});