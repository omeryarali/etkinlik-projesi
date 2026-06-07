import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AmbientBackdrop,
  AppBackButton,
  AppCard,
  DangerButton,
  EmptyStateCard,
  PrimaryButton,
  SectionHeading,
} from "../../components/app-ui";
import { AppTheme, Fonts } from "../../constants/theme";
import { formatDateTime, getInitial } from "../../lib/format";
import { apiFetch } from "../../services/apiService";
import { getAuthToken } from "../../services/authStorage";
import type { PagedResponse, ParticipantItem } from "../../types/api";

export default function EventParticipantsScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [pageInfo, setPageInfo] = useState<PagedResponse<ParticipantItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoadingUserId, setActionLoadingUserId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadParticipants = useCallback(async (page: number, reset = false) => {
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

      const data = (await apiFetch(`/api/Event/${id}/participants?page=${page}&pageSize=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })) as PagedResponse<ParticipantItem>;

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
  }, [id]);

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
        Alert.alert("Onay", "Katılımcı durumunu güncellemek istediğine emin misin?", [
          {
            text: "Vazgeç",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Onayla",
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

  useFocusEffect(
    useCallback(() => {
      void loadParticipants(1, true);
    }, [loadParticipants])
  );

  return (
    <View style={styles.screen}>
      <AmbientBackdrop />
      <FlatList
        data={participants}
        keyExtractor={(item) => item.userId.toString()}
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
            <AppBackButton onPress={() => router.back()} />
            <SectionHeading
              eyebrow="Katılımcı yönetimi"
              title="Katılımcılar"
              subtitle={
                pageInfo
                  ? `${pageInfo.totalCount} katılımcı bu etkinlikte görünüyor`
                  : "Yoklama ve katılım durumunu bu ekran üzerinden yönet."
              }
            />
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyStateCard
              title="Henüz katılımcı yok"
              description="Etkinlik görünür hale geldikçe katılımcı listesi burada dolacak."
            />
          ) : null
        }
        ListFooterComponent={
          <>
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={AppTheme.colors.accentDeep} />
                <Text style={styles.loadingText}>Katılımcılar yükleniyor...</Text>
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
          <AppCard style={styles.participantCard}>
            <View style={styles.topRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitial(item.fullName)}</Text>
              </View>

              <View style={styles.metaBlock}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.joinedAt}>
                  Katılım: {formatDateTime(item.joinedAt)}
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <PrimaryButton
                label="Geldi"
                onPress={() => markAttended(item.userId)}
                loading={actionLoadingUserId === item.userId}
                style={styles.actionButton}
              />
              <DangerButton
                label="Gelmedi"
                onPress={() => markNoShow(item.userId)}
                loading={actionLoadingUserId === item.userId}
                style={styles.actionButton}
              />
            </View>
          </AppCard>
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
  participantCard: {
    gap: 14,
  },
  topRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: AppTheme.colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: AppTheme.colors.white,
    fontSize: 22,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  metaBlock: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: AppTheme.colors.text,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  email: {
    color: AppTheme.colors.textMuted,
    fontSize: 13,
    fontFamily: Fonts.sans,
  },
  joinedAt: {
    color: AppTheme.colors.inkSoft,
    fontSize: 12,
    fontFamily: Fonts.sans,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
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
