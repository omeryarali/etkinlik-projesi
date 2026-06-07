import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AmbientBackdrop,
  AppBackButton,
  AppCard,
  DetailRow,
  MetricTile,
  PrimaryButton,
  ProgressTrack,
  SecondaryButton,
  SectionHeading,
} from "../../components/app-ui";
import { AppTheme, Fonts } from "../../constants/theme";
import {
  formatDateTime,
  formatLocation,
  formatPrice,
  percentage,
} from "../../lib/format";
import { apiFetch } from "../../services/apiService";
import { getAuthToken } from "../../services/authStorage";
import type { EventSummary, PagedResponse } from "../../types/api";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [event, setEvent] = useState<EventSummary | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const checkJoinedStatus = useCallback(async (eventId: number) => {
    try {
      const token = await getAuthToken();

      if (!token) {
        setHasJoined(false);
        return;
      }

      const data = (await apiFetch("/api/Event/my-joined-events?page=1&pageSize=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })) as PagedResponse<EventSummary>;

      setHasJoined((data.items || []).some((item) => item.id === eventId));
    } catch {
      setHasJoined(false);
    }
  }, []);

  const loadEventDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = (await apiFetch(`/api/Event/${id}`)) as EventSummary;
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
  }, [checkJoinedStatus, id]);

  async function handleJoinEvent() {
    try {
      const token = await getAuthToken();

      if (!token) {
        Alert.alert("Giriş Gerekli", "Etkinliğe katılmak için önce giriş yapmalısın.", [
          {
            text: "Vazgeç",
            style: "cancel",
          },
          {
            text: "Giriş Yap",
            onPress: () => router.push("/login" as any),
          },
        ]);
        return;
      }

      setActionLoading(true);

      await apiFetch(`/api/Event/${id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Başarılı", "Etkinliğe katıldın.");
      setHasJoined(true);
      await loadEventDetail();
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Katılım Hatası", err.message);
      } else {
        Alert.alert("Katılım Hatası", "Etkinliğe katılırken bir sorun oluştu.");
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
          "Etkinlikten ayrılmak için önce giriş yapmalısın.",
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
          "Bu planı listenden çıkarmak istediğine emin misin?",
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

      Alert.alert("Tamam", "Etkinlikten ayrıldın.");
      setHasJoined(false);
      await loadEventDetail();
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Ayrılma Hatası", err.message);
      } else {
        Alert.alert("Ayrılma Hatası", "Etkinlikten ayrılırken bir sorun oluştu.");
      }
    } finally {
      setActionLoading(false);
    }
  }

  function isFull() {
    if (!event) {
      return false;
    }

    return event.participantCount >= event.capacity;
  }

  useFocusEffect(
    useCallback(() => {
      void loadEventDetail();
    }, [loadEventDetail])
  );

  if (loading) {
    return (
      <View style={styles.screen}>
        <AmbientBackdrop />
        <View style={[styles.centered, { paddingTop: insets.top + 20 }]}>
          <ActivityIndicator color={AppTheme.colors.accentDeep} />
          <Text style={styles.infoText}>Etkinlik detayı hazırlanıyor...</Text>
        </View>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.screen}>
        <AmbientBackdrop />
        <View style={[styles.centered, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.errorText}>{error || "Etkinlik bulunamadı."}</Text>
          <SecondaryButton label="Geri Dön" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const occupancyRate = percentage(event.participantCount, event.capacity);
  const seatsLeft = Math.max(event.capacity - event.participantCount, 0);
  const availabilityText = getAvailabilityText(seatsLeft, occupancyRate, hasJoined);
  const experienceMode = event.isPaid ? "Premium deneyim" : "Topluluk buluşması";

  return (
    <View style={styles.screen}>
      <AmbientBackdrop />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 132,
          },
        ]}
      >
        <AppBackButton onPress={() => router.back()} />

        <AppCard tone="ink" style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{event.categoryName}</Text>
            </View>
            <View style={styles.heroPriceBadge}>
              <Text style={styles.heroPriceText}>
                {formatPrice(event.isPaid, event.price)}
              </Text>
            </View>
          </View>

          <Text style={styles.heroEyebrow}>{experienceMode}</Text>
          <Text style={styles.heroTitle}>{event.title}</Text>
          <Text style={styles.heroDescription}>
            {event.description || "Bu etkinlik için açıklama yakında eklenecek."}
          </Text>

          <View style={styles.heroMetrics}>
            <MetricTile
              label="Konum"
              value={event.city || "Şehir"}
              helper={event.district || event.locationName || "Buluşma noktası"}
              tone="ink"
            />
            <MetricTile
              label="Katılım"
              value={`${event.participantCount}/${event.capacity}`}
              helper={availabilityText}
              tone="ink"
            />
          </View>

          <View style={styles.progressBlock}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Doluluk oranı</Text>
              <Text style={styles.progressValue}>%{occupancyRate}</Text>
            </View>
            <ProgressTrack value={event.participantCount} total={event.capacity} />
          </View>
        </AppCard>

        <SectionHeading
          eyebrow="Akış özeti"
          title="Etkinlik sahnesi"
          subtitle="Tarih, mekan, katılım ve kurallar tek bir akışta toplandı."
        />

        <View style={styles.summaryRow}>
          <MetricTile
            label="Başlangıç"
            value={formatDateTime(event.startDate)}
            helper="Planlanan ilk buluşma"
          />
          <MetricTile
            label="Kalan yer"
            value={`${seatsLeft}`}
            helper={seatsLeft > 0 ? "Açık kontenjan" : "Yeni yer yok"}
          />
        </View>

        <AppCard>
          <Text style={styles.cardTitle}>Zaman</Text>
          <DetailRow label="Başlangıç" value={formatDateTime(event.startDate)} />
          <DetailRow label="Bitiş" value={formatDateTime(event.endDate)} />
        </AppCard>

        <AppCard>
          <Text style={styles.cardTitle}>Mekan bilgisi</Text>
          <DetailRow label="Mekan" value={event.locationName} />
          <DetailRow label="Adres" value={event.address || "-"} />
          <DetailRow label="Şehir / ilçe" value={formatLocation(event.city, event.district)} />
        </AppCard>

        <AppCard tone="muted">
          <Text style={styles.cardTitle}>Katılım ve organizer</Text>
          <DetailRow label="Organizer" value={event.organizerName} />
          <DetailRow
            label="Katılım durumu"
            value={`${event.participantCount} / ${event.capacity}`}
          />
          <DetailRow label="Deneyim tipi" value={experienceMode} />
        </AppCard>

        <AppCard>
          <Text style={styles.cardTitle}>Kurallar</Text>
          <Text style={styles.rulesText}>
            {event.rules || "Bu etkinlik için özel kural belirtilmedi."}
          </Text>
        </AppCard>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomBarContent}>
          <View style={styles.bottomMeta}>
            <Text style={styles.bottomMetaEyebrow}>
              {hasJoined ? "Planına eklendi" : availabilityText}
            </Text>
            <Text style={styles.bottomMetaTitle}>
              {formatLocation(event.city, event.district)}
            </Text>
          </View>

          <View style={styles.bottomAction}>
            {hasJoined ? (
              <SecondaryButton
                label="Etkinlikten Ayrıl"
                onPress={handleLeaveEvent}
                loading={actionLoading}
              />
            ) : (
              <PrimaryButton
                label={isFull() ? "Kontenjan Dolu" : "Etkinliğe Katıl"}
                onPress={handleJoinEvent}
                loading={actionLoading}
                disabled={isFull()}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

function getAvailabilityText(
  seatsLeft: number,
  occupancyRate: number,
  hasJoined: boolean
) {
  if (hasJoined) {
    return "Katılımın onaylı";
  }

  if (seatsLeft <= 0) {
    return "Kontenjan dolu";
  }

  if (occupancyRate >= 85) {
    return `${seatsLeft} kişilik yer kaldı`;
  }

  if (occupancyRate >= 60) {
    return "İlgi yüksek";
  }

  return "Rahat katılım";
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 12,
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
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: AppTheme.radii.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  heroBadgeText: {
    color: AppTheme.colors.white,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: Fonts.rounded,
  },
  heroPriceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: AppTheme.radii.pill,
    backgroundColor: "rgba(214, 106, 74, 0.2)",
  },
  heroPriceText: {
    color: AppTheme.colors.accentContrast,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: Fonts.rounded,
  },
  heroEyebrow: {
    color: "rgba(255, 246, 242, 0.72)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: Fonts.rounded,
  },
  heroTitle: {
    color: AppTheme.colors.white,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  heroDescription: {
    color: "rgba(255, 246, 242, 0.78)",
    fontSize: 15,
    lineHeight: 23,
    fontFamily: Fonts.sans,
  },
  heroMetrics: {
    flexDirection: "row",
    gap: 10,
  },
  progressBlock: {
    gap: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    color: "rgba(255, 246, 242, 0.7)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontFamily: Fonts.rounded,
  },
  progressValue: {
    color: AppTheme.colors.white,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  cardTitle: {
    color: AppTheme.colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    fontFamily: Fonts.display,
    marginBottom: 6,
  },
  rulesText: {
    color: AppTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Fonts.sans,
  },
  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    paddingTop: 12,
    backgroundColor: "rgba(246, 239, 230, 0.96)",
  },
  bottomBarContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: AppTheme.radii.lg,
    borderWidth: 1,
    borderColor: "rgba(168, 71, 52, 0.1)",
    backgroundColor: "rgba(255, 249, 242, 0.92)",
    padding: 12,
  },
  bottomMeta: {
    flex: 1,
    gap: 4,
  },
  bottomMetaEyebrow: {
    color: AppTheme.colors.accentDeep,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontFamily: Fonts.rounded,
  },
  bottomMetaTitle: {
    color: AppTheme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  bottomAction: {
    minWidth: 170,
    flexShrink: 0,
  },
});
