import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiFetch } from "../../services/apiService";
import { getAuthToken } from "../../services/authStorage";

type EventDetail = {
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

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadEventDetail() {
    try {
      setLoading(true);
      setError("");

      const data = (await apiFetch(`/api/Event/${id}`)) as EventDetail;
      setEvent(data);

      await checkJoinedStatus(data.id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Etkinlik detayı alınamadı.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function checkJoinedStatus(eventId: number) {
    try {
      const token = await getAuthToken();

      if (!token) {
        setHasJoined(false);
        return;
      }

      const data = (await apiFetch(
        "/api/Event/my-joined-events?page=1&pageSize=100",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )) as PagedResponse<EventDetail>;

      const joined = (data.items || []).some((item) => item.id === eventId);
      setHasJoined(joined);
    } catch {
      setHasJoined(false);
    }
  }

  async function handleJoinEvent() {
    try {
      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          "Giriş Gerekli",
          "Etkinliğe katılmak için giriş yapmalısınız.",
          [
            {
              text: "Vazgeç",
              style: "cancel",
            },
            {
              text: "Giriş Yap",
              onPress: () => router.push("/login" as any),
            },
          ]
        );

        return;
      }

      setActionLoading(true);

      await apiFetch(`/api/Event/${id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Başarılı", "Etkinliğe katıldınız.");

      setHasJoined(true);
      await loadEventDetail();
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Katılım Hatası", err.message);
      } else {
        Alert.alert("Katılım Hatası", "Etkinliğe katılırken hata oluştu.");
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLeaveEvent() {
    try {
      const token = await getAuthToken();

      if (!token) {
        Alert.alert(
          "Giriş Gerekli",
          "Etkinlikten ayrılmak için giriş yapmalısınız.",
          [
            {
              text: "Vazgeç",
              style: "cancel",
            },
            {
              text: "Giriş Yap",
              onPress: () => router.push("/login" as any),
            },
          ]
        );

        return;
      }

      const confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          "Etkinlikten Ayrıl",
          "Bu etkinlikten ayrılmak istediğinize emin misiniz?",
          [
            {
              text: "Vazgeç",
              style: "cancel",
              onPress: () => resolve(false),
            },
            {
              text: "Ayrıl",
              style: "destructive",
              onPress: () => resolve(true),
            },
          ]
        );
      });

      if (!confirmed) {
        return;
      }

      setActionLoading(true);

      await apiFetch(`/api/Event/${id}/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Başarılı", "Etkinlikten ayrıldınız.");

      setHasJoined(false);
      await loadEventDetail();
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Ayrılma Hatası", err.message);
      } else {
        Alert.alert("Ayrılma Hatası", "Etkinlikten ayrılırken hata oluştu.");
      }
    } finally {
      setActionLoading(false);
    }
  }

  function formatDate(dateValue?: string | null) {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function isFull() {
    if (!event) return false;

    return event.participantCount >= event.capacity;
  }

  useEffect(() => {
    loadEventDetail();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator />
        <Text style={styles.infoText}>Etkinlik detayı yükleniyor...</Text>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Etkinlik bulunamadı."}</Text>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButtonSmall} onPress={() => router.back()}>
        <Text style={styles.backButtonSmallText}>← Geri</Text>
      </TouchableOpacity>

      <View style={styles.headerCard}>
        <View style={styles.topRow}>
          <Text style={styles.categoryBadge}>{event.categoryName}</Text>
          <Text style={styles.priceText}>
            {event.isPaid ? `${event.price ?? 0} TL` : "Ücretsiz"}
          </Text>
        </View>

        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.description}>{event.description}</Text>
      </View>

      <InfoCard title="Tarih">
        <InfoRow label="Başlangıç" value={formatDate(event.startDate)} />
        <InfoRow label="Bitiş" value={formatDate(event.endDate)} />
      </InfoCard>

      <InfoCard title="Konum">
        <InfoRow label="Şehir / İlçe" value={`${event.city} / ${event.district}`} />
        <InfoRow label="Mekan" value={event.locationName} />
        <InfoRow label="Adres" value={event.address} />
      </InfoCard>

      <InfoCard title="Katılım">
        <InfoRow
          label="Kontenjan"
          value={`${event.participantCount} / ${event.capacity}`}
        />
        <InfoRow label="Organizatör" value={event.organizerName} />
      </InfoCard>

      <InfoCard title="Kurallar">
        <Text style={styles.rulesText}>{event.rules || "Kural belirtilmemiş."}</Text>
      </InfoCard>

      {hasJoined ? (
        <TouchableOpacity
          style={[styles.leaveButton, actionLoading && styles.buttonDisabled]}
          onPress={handleLeaveEvent}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator color="#DC2626" />
          ) : (
            <Text style={styles.leaveButtonText}>Etkinlikten Ayrıl</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.joinButton,
            (actionLoading || isFull()) && styles.buttonDisabled,
          ]}
          onPress={handleJoinEvent}
          disabled={actionLoading || isFull()}
        >
          {actionLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.joinButtonText}>
              {isFull() ? "Kontenjan Doldu" : "Etkinliğe Katıl"}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  content: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  infoText: {
    color: "#6B7280",
    fontSize: 14,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 15,
    textAlign: "center",
  },
  backButton: {
    marginTop: 10,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  backButtonSmall: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backButtonSmallText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "700",
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
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
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  description: {
    marginTop: 10,
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },
  infoCardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  infoRow: {
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  infoValue: {
    marginTop: 2,
    fontSize: 14,
    color: "#6B7280",
  },
  rulesText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 21,
  },
  joinButton: {
    marginTop: 6,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  leaveButton: {
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderColor: "#DC2626",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  leaveButtonText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
});