import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AmbientBackdrop,
  AppBackButton,
  AppCard,
  DangerButton,
  DetailRow,
  ErrorStateCard,
  InkButton,
  LoadingStateCard,
  PrimaryButton,
  ProgressTrack,
  SectionHeading,
  StatusPill,
} from "../../components/app-ui";
import { AppTheme, Fonts } from "../../constants/theme";
import { formatDateTime, formatLocation, formatPrice } from "../../lib/format";
import { apiFetch } from "../../services/apiService";
import { getAuthToken } from "../../services/authStorage";
import type { EventSummary, PagedResponse } from "../../types/api";

export default function OrganizerEventDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [event, setEvent] = useState<EventSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOrganizerEventDetail = useCallback(async () => {
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
      })) as PagedResponse<EventSummary>;

      const selectedEvent = (data.items || []).find(
        (item) => item.id.toString() === id?.toString()
      );

      if (!selectedEvent) {
        setError("Etkinlik bulunamadı veya bu kaydı görüntüleme yetkin yok.");
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
  }, [id]);

  async function cancelEvent() {
    if (!event) {
      return;
    }

    try {
      const confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert("Etkinliği İptal Et", "Bu etkinliği iptal etmek istediğine emin misin?", [
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
        ]);
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
        Alert.alert("İptal Hatası", "Etkinlik iptal edilirken bir sorun oluştu.");
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function completeEvent() {
    if (!event) {
      return;
    }

    try {
      const confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert("Etkinliği Tamamla", "Bu etkinliği tamamlandı olarak işaretlemek istediğine emin misin?", [
          {
            text: "Vazgeç",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Tamamla",
            onPress: () => resolve(true),
          },
        ]);
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
        Alert.alert("Tamamlama Hatası", "Etkinlik güncellenirken bir sorun oluştu.");
      }
    } finally {
      setActionLoading(false);
    }
  }

  function canCancel(status: string) {
    return status === "Pending" || status === "Approved";
  }

  function canComplete(status: string) {
    return status === "Approved";
  }

  useFocusEffect(
    useCallback(() => {
      void loadOrganizerEventDetail();
    }, [loadOrganizerEventDetail])
  );

  if (loading) {
    return (
      <View style={styles.screen}>
        <AmbientBackdrop />
        <View style={[styles.centered, { paddingTop: insets.top + 20 }]}>
          <LoadingStateCard
            title="Organizer detay hazırlanıyor"
            description="Etkinliğin yönetim bilgileri ve son durumu yükleniyor."
          />
        </View>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.screen}>
        <AmbientBackdrop />
        <View style={[styles.centered, { paddingTop: insets.top + 20 }]}>
          <ErrorStateCard
            title="Organizer ekranı açılamadı"
            description={error || "Bu etkinliğin yönetim bilgileri getirilemedi."}
            actionLabel="Tekrar Dene"
            onAction={() => {
              void loadOrganizerEventDetail();
            }}
          />
          <DangerButton label="Geri Dön" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AmbientBackdrop />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 28,
          },
        ]}
      >
        <AppBackButton onPress={() => router.back()} />

        <SectionHeading
          eyebrow="Organizer görünümü"
          title={event.title}
          subtitle={`${event.categoryName} · ${formatPrice(event.isPaid, event.price)}`}
          trailing={<StatusPill status={event.status} />}
        />

        <AppCard tone="accent" style={styles.heroCard}>
          <Text style={styles.heroDescription}>
            {event.description || "Bu etkinlik için açıklama eklenmedi."}
          </Text>

          <View style={styles.metricPanel}>
            <Text style={styles.metricLabel}>Doluluk</Text>
            <Text style={styles.metricValue}>
              {event.participantCount} / {event.capacity}
            </Text>
            <ProgressTrack value={event.participantCount} total={event.capacity} />
          </View>
        </AppCard>

        <AppCard>
          <Text style={styles.cardTitle}>Tarih bilgisi</Text>
          <DetailRow label="Başlangıç" value={formatDateTime(event.startDate)} />
          <DetailRow label="Bitiş" value={formatDateTime(event.endDate)} />
          <DetailRow label="Oluşturulma" value={formatDateTime(event.createdAt)} />
          <DetailRow label="Onaylanma" value={formatDateTime(event.approvedAt)} />
        </AppCard>

        <AppCard>
          <Text style={styles.cardTitle}>Mekan bilgisi</Text>
          <DetailRow label="Mekan" value={event.locationName} />
          <DetailRow label="Adres" value={event.address || "-"} />
          <DetailRow label="Konum" value={formatLocation(event.city, event.district)} />
        </AppCard>

        <AppCard>
          <Text style={styles.cardTitle}>Organizer görünümü</Text>
          <DetailRow label="Organizer" value={event.organizerName} />
          <DetailRow label="Ücret" value={formatPrice(event.isPaid, event.price)} />
          <DetailRow label="Kurallar" value={event.rules || "Kural belirtilmedi."} />
        </AppCard>

        <View style={styles.actionStack}>
          <InkButton
            label="Katılımcıları Gör"
            onPress={() => router.push(`/event-participants/${event.id}` as any)}
          />

          {canComplete(event.status) ? (
            <PrimaryButton
              label="Tamamlandı Yap"
              onPress={completeEvent}
              loading={actionLoading}
            />
          ) : null}

          {canCancel(event.status) ? (
            <DangerButton
              label="Etkinliği İptal Et"
              onPress={cancelEvent}
              loading={actionLoading}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  infoText: {
    color: AppTheme.colors.textMuted,
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
  errorText: {
    color: AppTheme.colors.danger,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    fontFamily: Fonts.sans,
  },
  heroCard: {
    gap: 16,
  },
  heroDescription: {
    color: AppTheme.colors.inkSoft,
    fontSize: 15,
    lineHeight: 23,
    fontFamily: Fonts.sans,
  },
  metricPanel: {
    gap: 8,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255, 249, 242, 0.52)",
    borderWidth: 1,
    borderColor: "rgba(168, 71, 52, 0.12)",
  },
  metricLabel: {
    color: AppTheme.colors.accentDeep,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontFamily: Fonts.rounded,
  },
  metricValue: {
    color: AppTheme.colors.text,
    fontSize: 19,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  cardTitle: {
    color: AppTheme.colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    fontFamily: Fonts.display,
    marginBottom: 6,
  },
  actionStack: {
    gap: 10,
  },
});
