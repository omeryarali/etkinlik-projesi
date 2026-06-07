import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AmbientBackdrop,
  AppCard,
  EmptyStateCard,
  SectionHeading,
} from "../../components/app-ui";
import { EventCard } from "../../components/event-card";
import { AppTheme, Fonts } from "../../constants/theme";
import { apiFetch } from "../../services/apiService";
import { getAuthToken } from "../../services/authStorage";
import type { EventSummary, PagedResponse } from "../../types/api";

export default function MyEventsScreen() {
  const insets = useSafeAreaInsets();

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [pageInfo, setPageInfo] = useState<PagedResponse<EventSummary> | null>(null);
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

      const data = (await apiFetch(`/api/Event/my-joined-events?page=${page}&pageSize=10`, {
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
        setError("Katıldığın etkinlikler alınamadı.");
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

  useFocusEffect(
    useCallback(() => {
      loadEvents(1, true);
    }, [])
  );

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
            paddingBottom: insets.bottom + 28,
          },
        ]}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <SectionHeading
              eyebrow="Takip ettiğin planlar"
              title="Katıldığım etkinlikler"
              subtitle={
                pageInfo
                  ? `${pageInfo.totalCount} etkinlik senin listende`
                  : "Geçmiş ve yaklaşan katılımlarını burada görürsün."
              }
            />
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyStateCard
              title="Henüz katıldığın etkinlik yok"
              description="Ana akıştan ilgini çeken bir etkinliğe katıl ve burada takibini yap."
            />
          ) : null
        }
        ListFooterComponent={
          <>
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={AppTheme.colors.accentDeep} />
                <Text style={styles.loadingText}>Etkinliklerin yükleniyor...</Text>
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
            onPress={() => router.push(`/events/${item.id}` as any)}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
      />
    </View>
  );
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
