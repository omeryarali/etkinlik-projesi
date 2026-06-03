import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { apiFetch } from "../../services/apiService";
import { getAuthToken } from "../../services/authStorage";

type ParticipantItem = {
  userId: number;
  fullName: string;
  email: string;
  joinedAt: string;
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

export default function EventParticipantsScreen() {
  const { id } = useLocalSearchParams();

  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [pageInfo, setPageInfo] = useState<PagedResponse<ParticipantItem> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoadingUserId, setActionLoadingUserId] = useState<number | null>(
    null
  );
  const [error, setError] = useState("");

  async function loadParticipants(page: number, reset = false) {
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
        `/api/Event/${id}/participants?page=${page}&pageSize=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )) as PagedResponse<ParticipantItem>;

      if (reset) {
        setParticipants(data.items || []);
      } else {
        setParticipants((prev) => [...prev, ...(data.items || [])]);
      }

      setPageInfo(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Katılımcılar alınamadı.");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function markAttended(userId: number) {
    await runParticipantAction(
      userId,
      `/api/Event/${id}/participants/${userId}/attended`,
      "Katılımcı geldi olarak işaretlendi."
    );
  }

  async function markNoShow(userId: number) {
    await runParticipantAction(
      userId,
      `/api/Event/${id}/participants/${userId}/no-show`,
      "Katılımcı gelmedi olarak işaretlendi."
    );
  }

  async function runParticipantAction(
    userId: number,
    path: string,
    successMessage: string
  ) {
    try {
      const confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          "Onay",
          "Bu katılımcının durumunu güncellemek istediğinize emin misiniz?",
          [
            {
              text: "Vazgeç",
              style: "cancel",
              onPress: () => resolve(false),
            },
            {
              text: "Onayla",
              onPress: () => resolve(true),
            },
          ]
        );
      });

      if (!confirmed) {
        return;
      }

      const token = await getAuthToken();

      if (!token) {
        router.replace("/login" as any);
        return;
      }

      setActionLoadingUserId(userId);

      await apiFetch(path, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Başarılı", successMessage);

      await loadParticipants(1, true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("İşlem Hatası", err.message);
      } else {
        Alert.alert("İşlem Hatası", "Katılımcı durumu güncellenemedi.");
      }
    } finally {
      setActionLoadingUserId(null);
    }
  }

  function loadMore() {
    if (!pageInfo?.hasNextPage || loadingMore) {
      return;
    }

    loadParticipants(pageInfo.page + 1);
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
      loadParticipants(1, true);
    }, [id])
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Katılımcılar</Text>

      {pageInfo && (
        <Text style={styles.subtitle}>{pageInfo.totalCount} katılımcı</Text>
      )}

      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator />
          <Text style={styles.infoText}>Katılımcılar yükleniyor...</Text>
        </View>
      )}

      {!loading && error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!loading && !error && (
        <FlatList
          data={participants}
          keyExtractor={(item) => item.userId.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <Text style={styles.infoText}>
              Bu etkinlikte henüz katılımcı bulunmuyor.
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
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </Text>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.name}>{item.fullName}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                  <Text style={styles.joinedAt}>
                    Katılım: {formatDate(item.joinedAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.attendedButton,
                    actionLoadingUserId === item.userId && styles.buttonDisabled,
                  ]}
                  onPress={() => markAttended(item.userId)}
                  disabled={actionLoadingUserId === item.userId}
                >
                  {actionLoadingUserId === item.userId ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.attendedButtonText}>Geldi</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.noShowButton,
                    actionLoadingUserId === item.userId && styles.buttonDisabled,
                  ]}
                  onPress={() => markNoShow(item.userId)}
                  disabled={actionLoadingUserId === item.userId}
                >
                  <Text style={styles.noShowButtonText}>Gelmedi</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  email: {
    marginTop: 3,
    fontSize: 13,
    color: "#6B7280",
  },
  joinedAt: {
    marginTop: 5,
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  attendedButton: {
    flex: 1,
    backgroundColor: "#16A34A",
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
  },
  attendedButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  noShowButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#DC2626",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
  },
  noShowButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
});