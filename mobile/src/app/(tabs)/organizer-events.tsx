import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { appDialog } from "../../components/app-dialog";
import {
  AmbientBackdrop,
  AppCard,
  EmptyStateCard,
  InkButton,
  MetricTile,
  PrimaryButton,
  SecondaryButton,
  SectionHeading,
} from "../../components/app-ui";
import { EventCard } from "../../components/event-card";
import { AppTheme, Fonts } from "../../constants/theme";
import { formatDateTime, percentage } from "../../lib/format";
import { apiFetch } from "../../services/apiService";
import { getAuthToken } from "../../services/authStorage";
import type { EventSummary, PagedResponse } from "../../types/api";

export default function OrganizerEventsScreen() {
  const insets = useSafeAreaInsets();

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [pageInfo, setPageInfo] = useState<PagedResponse<EventSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
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

      const data = (await apiFetch(`/api/Event/my-events?page=${page}&pageSize=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })) as PagedResponse<EventSummary>;

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
        setError("Organizer etkinlikleri alınamadı.");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function cancelEvent(eventId: number) {
    const confirmed = await appDialog.confirm({
      title: "Etkinliği iptal et",
      message: "Bu etkinliği akıştan çekmek istediğine emin misin?",
      tone: "danger",
      confirmLabel: "İptal Et",
      confirmVariant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      const token = await getAuthToken();

      if (!token) {
        router.replace("/login" as any);
        return;
      }

      setActionLoadingId(eventId);

      await apiFetch(`/api/Event/${eventId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await appDialog.showMessage({
        title: "Etkinlik iptal edildi",
        message: "Kayıt başarıyla güncellendi.",
        tone: "success",
      });

      await loadEvents(1, true);
    } catch (err: unknown) {
      await appDialog.showMessage({
        title: "İptal hatası",
        message:
          err instanceof Error
            ? err.message
            : "Etkinlik iptal edilirken bir sorun oluştu.",
        tone: "danger",
      });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function completeEvent(eventId: number) {
    const confirmed = await appDialog.confirm({
      title: "Etkinliği tamamla",
      message: "Bu etkinliği tamamlandı olarak işaretlemek istiyor musun?",
      tone: "warning",
      confirmLabel: "Tamamla",
      confirmVariant: "primary",
    });

    if (!confirmed) {
      return;
    }

    try {
      const token = await getAuthToken();

      if (!token) {
        router.replace("/login" as any);
        return;
      }

      setActionLoadingId(eventId);

      await apiFetch(`/api/Event/${eventId}/complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await appDialog.showMessage({
        title: "Etkinlik kapatıldı",
        message: "Kayıt tamamlandı olarak işaretlendi.",
        tone: "success",
      });

      await loadEvents(1, true);
    } catch (err: unknown) {
      await appDialog.showMessage({
        title: "Tamamlama hatası",
        message:
          err instanceof Error
            ? err.message
            : "Etkinlik güncellenirken bir sorun oluştu.",
        tone: "danger",
      });
    } finally {
      setActionLoadingId(null);
    }
  }

  function canCancel(status: string) {
    return status === "Pending" || status === "Approved";
  }

  function canComplete(status: string) {
    return status === "Approved";
  }

  function loadMore() {
    if (!pageInfo?.hasNextPage || loadingMore) {
      return;
    }

    void loadEvents(pageInfo.page + 1);
  }

  useFocusEffect(
    useCallback(() => {
      void loadEvents(1, true);
    }, [])
  );

  const pendingEvents = events.filter((item) => item.status === "Pending");
  const approvedEvents = events.filter((item) => item.status === "Approved");
  const completedEvents = events.filter((item) => item.status === "Completed");
  const participantTotal = events.reduce(
    (sum, item) => sum + item.participantCount,
    0
  );
  const capacityTotal = events.reduce((sum, item) => sum + item.capacity, 0);
  const averageFill = percentage(participantTotal, capacityTotal);
  const nextLiveEvent =
    approvedEvents
      .slice()
      .sort(
        (left, right) =>
          new Date(left.startDate).getTime() - new Date(right.startDate).getTime()
      )[0] ?? events[0] ?? null;
  const pendingSpotlight = pendingEvents[0] ?? null;

  return (
    <View style={styles.screen}>
      <AmbientBackdrop />
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 36,
          },
        ]}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <AppCard tone="ink" style={styles.heroCard}>
              <Text style={styles.heroEyebrow}>Organizer paneli</Text>
              <Text style={styles.heroTitle}>Etkinliklerini yönet</Text>
              <Text style={styles.heroText}>
                Oluşturduğun etkinlikleri takip et, katılımcıları görüntüle ve
                gerekli durum güncellemelerini buradan yap.
              </Text>

              <View style={styles.metricGrid}>
                <MetricTile
                  label="Toplam"
                  value={`${pageInfo?.totalCount ?? events.length}`}
                  helper="Oluşturduğun etkinlik"
                  tone="ink"
                />
                <MetricTile
                  label="Katılımcı"
                  value={`${participantTotal}`}
                  helper="Toplam katılım"
                  tone="ink"
                />
              </View>

              <View style={styles.metricGrid}>
                <MetricTile
                  label="Bekleyen"
                  value={`${pendingEvents.length}`}
                  helper="İşlem bekleyen etkinlik"
                  tone="ink"
                />
                <MetricTile
                  label="Doluluk"
                  value={`%${averageFill}`}
                  helper="Ortalama doluluk oranı"
                  tone="ink"
                />
              </View>

              <View style={styles.heroActions}>
                <PrimaryButton
                  label="Etkinlik Oluştur"
                  style={styles.actionButton}
                  onPress={() => router.push("/create-event" as any)}
                />
              </View>
            </AppCard>

            {nextLiveEvent ? (
              <AppCard tone="accent" style={styles.spotlightCard}>
                <Text style={styles.spotlightEyebrow}>Sıradaki etkinlik</Text>
                <Text style={styles.spotlightTitle}>{nextLiveEvent.title}</Text>
                <Text style={styles.spotlightMeta}>
                  {formatDateTime(nextLiveEvent.startDate)} · {nextLiveEvent.city} /{" "}
                  {nextLiveEvent.district}
                </Text>

                <View style={styles.spotlightActionRow}>
                  <PrimaryButton
                    label="Detayı Aç"
                    style={styles.actionButton}
                    onPress={() =>
                      router.push(`/organizer-event-detail/${nextLiveEvent.id}` as any)
                    }
                  />
                  <InkButton
                    label="Katılımcılar"
                    style={styles.actionButton}
                    onPress={() =>
                      router.push(`/event-participants/${nextLiveEvent.id}` as any)
                    }
                  />
                </View>
              </AppCard>
            ) : null}

            {pendingSpotlight ? (
              <AppCard style={styles.queueCard}>
                <SectionHeading
                  eyebrow="Bekleyenler"
                  title="Onay bekleyen etkinlik"
                  subtitle={`${pendingEvents.length} etkinlik şu anda işlem bekliyor`}
                />

                <View style={styles.queueHighlight}>
                  <Text style={styles.queueTitle}>{pendingSpotlight.title}</Text>
                  <Text style={styles.queueMeta}>
                    {pendingSpotlight.city} / {pendingSpotlight.district} ·{" "}
                    {pendingSpotlight.categoryName}
                  </Text>
                </View>
              </AppCard>
            ) : (
              <AppCard tone="muted" style={styles.queueCard}>
                <SectionHeading
                  eyebrow="Durum"
                  title="Her şey yolunda"
                  subtitle="Şu anda bekleyen kritik bir etkinlik görünmüyor."
                />
              </AppCard>
            )}

            <View style={styles.summaryRow}>
              <MetricTile
                label="Yayında"
                value={`${approvedEvents.length}`}
                helper="Aktif etkinlik"
              />
              <MetricTile
                label="Tamamlanan"
                value={`${completedEvents.length}`}
                helper="Arşivlenen etkinlik"
              />
            </View>

            <SectionHeading
              eyebrow="Etkinliklerim"
              title="Tüm etkinlikler"
              subtitle={
                pageInfo
                  ? `${pageInfo.totalCount} kayıt yönetiliyor`
                  : "Panel verileri hazırlanıyor"
              }
            />
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyStack}>
              <EmptyStateCard
                title="Henüz organizer etkinliğin yok"
                description="İlk etkinliğini oluşturarak organizer panelini kullanmaya başla."
              />
              <PrimaryButton
                label="İlk Etkinliği Oluştur"
                onPress={() => router.push("/create-event" as any)}
              />
            </View>
          ) : null
        }
        ListFooterComponent={
          <>
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={AppTheme.colors.accentDeep} />
                <Text style={styles.loadingText}>Etkinliklerin hazırlanıyor...</Text>
              </View>
            ) : null}

            {loadingMore ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={AppTheme.colors.accentDeep} />
                <Text style={styles.loadingText}>Daha fazla kayıt geliyor...</Text>
              </View>
            ) : null}

            {!loading && error ? (
              <AppCard tone="muted">
                <Text style={styles.errorText}>{error}</Text>
              </AppCard>
            ) : null}
          </>
        }
        renderItem={({ item }) => (
          <EventCard
            event={item}
            showOrganizer={false}
            statusMode
            highlightLabel={getOrganizerHighlight(item)}
            onPress={() => router.push(`/organizer-event-detail/${item.id}` as any)}
            footer={
              <View style={styles.footerStack}>
                <InkButton
                  label="Katılımcıları Gör"
                  onPress={() => router.push(`/event-participants/${item.id}` as any)}
                  style={styles.footerButton}
                />

                {canComplete(item.status) ? (
                  <PrimaryButton
                    label="Tamamlandı Yap"
                    onPress={() => completeEvent(item.id)}
                    loading={actionLoadingId === item.id}
                    style={styles.footerButton}
                  />
                ) : null}

                {canCancel(item.status) ? (
                  <SecondaryButton
                    label="Etkinliği İptal Et"
                    onPress={() => {
                      void cancelEvent(item.id);
                    }}
                    loading={actionLoadingId === item.id}
                    style={styles.footerButton}
                  />
                ) : null}
              </View>
            }
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
      />
    </View>
  );
}

function getOrganizerHighlight(event: EventSummary) {
  if (event.status === "Pending") {
    return "Onay bekliyor";
  }

  if (event.status === "Approved") {
    return percentage(event.participantCount, event.capacity) >= 70
      ? "Doluluk yükseliyor"
      : "Yayında";
  }

  if (event.status === "Completed") {
    return "Tamamlandı";
  }

  if (event.status === "Cancelled") {
    return "Akıştan kaldırıldı";
  }

  return undefined;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 14,
  },
  headerStack: {
    gap: 16,
    marginBottom: 6,
  },
  heroCard: {
    gap: 14,
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
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  heroText: {
    color: "rgba(255, 246, 242, 0.8)",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Fonts.sans,
  },
  metricGrid: {
    flexDirection: "row",
    gap: 10,
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  spotlightCard: {
    gap: 12,
  },
  spotlightEyebrow: {
    color: AppTheme.colors.accentDeep,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontFamily: Fonts.rounded,
  },
  spotlightTitle: {
    color: AppTheme.colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  spotlightMeta: {
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  spotlightActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  queueCard: {
    gap: 12,
  },
  queueHighlight: {
    borderRadius: 20,
    backgroundColor: "rgba(246, 225, 216, 0.38)",
    borderWidth: 1,
    borderColor: "rgba(168, 71, 52, 0.08)",
    padding: 16,
    gap: 6,
  },
  queueTitle: {
    color: AppTheme.colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  queueMeta: {
    color: AppTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  footerStack: {
    gap: 10,
  },
  footerButton: {
    width: "100%",
  },
  emptyStack: {
    gap: 12,
  },
  loadingBox: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    color: AppTheme.colors.textMuted,
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
  errorText: {
    color: AppTheme.colors.danger,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: Fonts.sans,
  },
});
