import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
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

export default function OrganizerEventDetailScreen() {
  const { id } = useLocalSearchParams();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadOrganizerEventDetail() {
    try {
      setLoading(true);
      setError("");

      const token = await getAuthToken();

      if (!token) {
        router.replace("/login" as any);
        return;
      }

      const data = (await apiFetch("/api/Event/my-events?page=1&pageSize=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })) as PagedResponse<EventDetail>;

      const selectedEvent = (data.items || []).find(
        (item) => item.id.toString() === id?.toString()
      );

      if (!selectedEvent) {
        setError("Etkinlik bulunamadı veya bu etkinliği görüntüleme yetkiniz yok.");
        return;
      }

      setEvent(selectedEvent);
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

  async function cancelEvent() {
    if (!event) return;

    try {
      const confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          "Etkinliği İptal Et",
          "Bu etkinliği iptal etmek istediğinize emin misiniz?",
          [
            {
              text: "Vazgeç",
              style: "cancel",
              onPress: () => resolve(false),
            },
            {
              text: "İptal Et",
              style: "destructive",
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

      setActionLoading(true);

      await apiFetch(`/api/Event/${event.id}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Başarılı", "Etkinlik iptal edildi.");

      await loadOrganizerEventDetail();
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("İptal Hatası", err.message);
      } else {
        Alert.alert("İptal Hatası", "Etkinlik iptal edilirken hata oluştu.");
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function completeEvent() {
    if (!event) return;

    try {
      const confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          "Etkinliği Tamamla",
          "Bu etkinliği tamamlandı olarak işaretlemek istediğinize emin misiniz?",
          [
            {
              text: "Vazgeç",
              style: "cancel",
              onPress: () => resolve(false),
            },
            {
              text: "Tamamlandı Yap",
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

      setActionLoading(true);

      await apiFetch(`/api/Event/${event.id}/complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Başarılı", "Etkinlik tamamlandı olarak işaretlendi.");

      await loadOrganizerEventDetail();
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Tamamlama Hatası", err.message);
      } else {
        Alert.alert(
          "Tamamlama Hatası",
          "Etkinlik tamamlandı yapılırken hata oluştu."
        );
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

  function canCancel(status: string) {
    return status === "Pending" || status === "Approved";
  }

  function canComplete(status: string) {
    return status === "Approved";
  }

  useFocusEffect(
    useCallback(() => {
      loadOrganizerEventDetail();
    }, [id])
  );

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
        <Text style={styles.errorText}>
          {error || "Etkinlik bulunamadı."}
        </Text>

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
          <StatusBadge status={event.status} />
        </View>

        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.description}>{event.description}</Text>

        <Text style={styles.priceText}>
          {event.isPaid ? `${event.price ?? 0} TL` : "Ücretsiz"}
        </Text>
      </View>

      <InfoCard title="Tarih">
        <InfoRow label="Başlangıç" value={formatDate(event.startDate)} />
        <InfoRow label="Bitiş" value={formatDate(event.endDate)} />
        <InfoRow label="Oluşturulma" value={formatDate(event.createdAt)} />
        <InfoRow label="Onaylanma" value={formatDate(event.approvedAt)} />
      </InfoCard>

      <InfoCard title="Konum">
        <InfoRow label="Şehir / İlçe" value={`${event.city} / ${event.district}`} />
        <InfoRow label="Mekan" value={event.locationName} />
        <InfoRow label="Adres" value={event.address} />
        <InfoRow
          label="Koordinat"
          value={
            event.latitude && event.longitude
              ? `${event.latitude}, ${event.longitude}`
              : "-"
          }
        />
      </InfoCard>

      <InfoCard title="Katılım">
        <InfoRow
          label="Kontenjan"
          value={`${event.participantCount} / ${event.capacity}`}
        />
        <InfoRow label="Organizatör" value={event.organizerName} />
      </InfoCard>

      <InfoCard title="Kurallar">
        <Text style={styles.rulesText}>
          {event.rules || "Kural belirtilmemiş."}
        </Text>
      </InfoCard>

      <TouchableOpacity
        style={styles.participantsButton}
        onPress={() => router.push(`/event-participants/${event.id}` as any)}
      >
        <Text style={styles.participantsButtonText}>Katılımcıları Gör</Text>
      </TouchableOpacity>

      {canComplete(event.status) && (
        <TouchableOpacity
          style={[styles.completeButton, actionLoading && styles.buttonDisabled]}
          onPress={completeEvent}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.completeButtonText}>Tamamlandı Yap</Text>
          )}
        </TouchableOpacity>
      )}

      {canCancel(event.status) && (
        <TouchableOpacity
          style={[styles.cancelButton, actionLoading && styles.buttonDisabled]}
          onPress={cancelEvent}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator color="#DC2626" />
          ) : (
            <Text style={styles.cancelButtonText}>Etkinliği İptal Et</Text>
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
      <Text
        style={[
          styles.statusText,
          textColorMap[status] || styles.statusTextDefault,
        ]}
      >
        {status}
      </Text>
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
  priceText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "800",
    color: "#16A34A",
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
  participantsButton: {
    marginTop: 6,
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  participantsButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  completeButton: {
    marginTop: 10,
    backgroundColor: "#16A34A",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderColor: "#DC2626",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});