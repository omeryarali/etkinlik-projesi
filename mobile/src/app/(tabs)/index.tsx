import { router, useFocusEffect } from "expo-router";
import { useCallback, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AmbientBackdrop,
  AppCard,
  ChoicePill,
  EmptyStateCard,
  MetricTile,
  PrimaryButton,
  SecondaryButton,
  SectionHeading,
} from "../../components/app-ui";
import { EventCard } from "../../components/event-card";
import { AppTheme, Fonts } from "../../constants/theme";
import {
  formatDateTime,
  formatLocation,
  formatPrice,
  percentage,
} from "../../lib/format";
import { apiFetch } from "../../services/apiService";
import type { EventSummary, PagedResponse } from "../../types/api";

type EventFilters = {
  search: string;
  city: string;
  district: string;
  dateFilter: string;
  paidFilter: string;
  sortBy: string;
  onlyAvailable: boolean;
};

type DiscoveryPreset = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  filters: Partial<EventFilters>;
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

const discoveryPresets: DiscoveryPreset[] = [
  {
    id: "today",
    eyebrow: "Bu akşam",
    title: "Yakında başlayan planlar",
    description: "Hızlı karar verilebilecek etkinlikleri öne çıkarır.",
    accent: "rgba(214, 106, 74, 0.18)",
    filters: { dateFilter: "today", sortBy: "popular" },
  },
  {
    id: "free",
    eyebrow: "Ücretsiz",
    title: "Masrafsız keşif rotası",
    description: "Kontenjanı uygun ücretsiz etkinlikleri listeler.",
    accent: "rgba(45, 115, 85, 0.16)",
    filters: { paidFilter: "free", onlyAvailable: true },
  },
  {
    id: "week",
    eyebrow: "Bu hafta",
    title: "Haftalık hareketli akış",
    description: "Hafta içi ve hafta sonu öne çıkan etkinlikler.",
    accent: "rgba(184, 135, 60, 0.16)",
    filters: { dateFilter: "thisWeek", sortBy: "newest" },
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [pageInfo, setPageInfo] = useState<PagedResponse<EventSummary> | null>(
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

    if (filters.sortBy && filters.sortBy !== "date") {
      params.append("sortBy", filters.sortBy);
    }

    if (filters.onlyAvailable) {
      params.append("onlyAvailable", "true");
    }

    return `/api/Event/approved?${params.toString()}`;
  }

  const loadEvents = useCallback(
    async (page: number, reset = false, filters: EventFilters) => {
      try {
        if (!reset) {
          setLoadingMore(true);
        }

        const data = (await apiFetch(
          buildEventsUrl(page, filters)
        )) as PagedResponse<EventSummary>;

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
    },
    []
  );

  const loadInitialData = useCallback(
    async (filters: EventFilters) => {
      try {
        setLoading(true);
        setError("");
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
    },
    [loadEvents]
  );

  function applyFilters() {
    const filters = getCurrentFilters();
    setAppliedFilters(filters);
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
  }

  function applyPreset(preset: DiscoveryPreset) {
    const nextFilters = {
      ...defaultFilters,
      ...getCurrentFilters(),
      ...preset.filters,
    };

    setSearch(nextFilters.search);
    setCity(nextFilters.city);
    setDistrict(nextFilters.district);
    setDateFilter(nextFilters.dateFilter);
    setPaidFilter(nextFilters.paidFilter);
    setSortBy(nextFilters.sortBy);
    setOnlyAvailable(nextFilters.onlyAvailable);
    setAppliedFilters(nextFilters);
  }

  function loadMore() {
    if (!pageInfo?.hasNextPage || loadingMore) {
      return;
    }

    void loadEvents(pageInfo.page + 1, false, appliedFilters);
  }

  useFocusEffect(
    useCallback(() => {
      void loadInitialData(appliedFilters);
    }, [appliedFilters, loadInitialData])
  );

  const spotlightEvent = events[0] ?? null;
  const availableCount = events.filter(
    (item) => item.participantCount < item.capacity
  ).length;
  const almostFullEvents = [...events]
    .sort(
      (left, right) =>
        percentage(right.participantCount, right.capacity) -
        percentage(left.participantCount, left.capacity)
    )
    .slice(0, 5);
  const freeEvents = events.filter((item) => !item.isPaid).slice(0, 5);
  const newestEvents = [...events]
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    )
    .slice(0, 5);
  const topCategories = Array.from(
    new Set(events.map((item) => item.categoryName).filter(Boolean))
  ).slice(0, 4);
  const appliedFilterLabels = [
    appliedFilters.city.trim(),
    appliedFilters.district.trim(),
    appliedFilters.paidFilter === "free"
      ? "Ücretsiz"
      : appliedFilters.paidFilter === "paid"
        ? "Ücretli"
        : "",
    appliedFilters.onlyAvailable ? "Uygun kontenjan" : "",
  ].filter(Boolean);

  const listHeader = (
    <View style={styles.headerStack}>
      <SectionHeading
        eyebrow="Keşfet"
        title="Şehrindeki etkinlikleri bul"
        subtitle="Sana uyan planları filtrele, öne çıkan etkinlikleri incele ve hızlıca karar ver."
      />

      {spotlightEvent ? (
        <AppCard tone="ink" style={styles.spotlightCard}>
          <Text style={styles.spotlightEyebrow}>Öne çıkan etkinlik</Text>
          <Text style={styles.spotlightTitle}>{spotlightEvent.title}</Text>
          <Text style={styles.spotlightText} numberOfLines={3}>
            {spotlightEvent.description ||
              "Bugünün dikkat çeken etkinliği burada seni bekliyor."}
          </Text>

          <View style={styles.spotlightMetaRow}>
            <MetricTile
              label="Konum"
              value={spotlightEvent.city || "Şehir"}
              helper={spotlightEvent.district || "Merkez"}
              tone="ink"
            />
            <MetricTile
              label="Deneyim"
              value={spotlightEvent.isPaid ? "Ücretli" : "Ücretsiz"}
              helper={spotlightEvent.categoryName}
              tone="ink"
            />
          </View>

          <PrimaryButton
            label="Detayı Aç"
            style={styles.singleActionButton}
            onPress={() => router.push(`/events/${spotlightEvent.id}` as any)}
          />
        </AppCard>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetRail}
      >
        {discoveryPresets.map((preset) => (
          <Pressable
            key={preset.id}
            style={[styles.presetCard, { backgroundColor: preset.accent }]}
            onPress={() => applyPreset(preset)}
          >
            <Text style={styles.presetEyebrow}>{preset.eyebrow}</Text>
            <Text style={styles.presetTitle}>{preset.title}</Text>
            <Text style={styles.presetDescription}>{preset.description}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <CollectionStrip
        eyebrow="Hızlı dolan"
        title="Dolmak üzere olanlar"
        subtitle="İlginin yüksek olduğu planları erkenden yakala."
        events={almostFullEvents}
      />

      <CollectionStrip
        eyebrow="Ücretsiz"
        title="Ücretsiz etkinlikler"
        subtitle="Giriş bariyeri düşük sosyal planlar."
        events={freeEvents}
      />

      <CollectionStrip
        eyebrow="Yeni"
        title="Yeni eklenenler"
        subtitle="Akışa sonradan eklenen etkinlikler."
        events={newestEvents}
      />

      {topCategories.length > 0 ? (
        <AppCard tone="muted" style={styles.curatedCard}>
          <View style={styles.curatedHeading}>
            <Text style={styles.curatedEyebrow}>Kategoriler</Text>
            <Text style={styles.curatedText}>
              Bugün en çok öne çıkan alanlar
            </Text>
          </View>

          <View style={styles.tagRow}>
            {topCategories.map((category) => (
              <ChoicePill key={category} label={category} active />
            ))}
          </View>
        </AppCard>
      ) : null}

      <AppCard style={styles.filterCard}>
        <SectionHeading
          eyebrow="Filtreler"
          title="Keşfini daralt"
          subtitle="Arama, tarih, ücret ve kontenjan durumuna göre sonuçları kişiselleştir."
        />

        <View style={styles.filterStack}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Etkinlik, mekan veya organizer ara"
            placeholderTextColor={AppTheme.colors.textSoft}
            style={styles.input}
          />

          <View style={styles.inlineInputs}>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Şehir"
              placeholderTextColor={AppTheme.colors.textSoft}
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              value={district}
              onChangeText={setDistrict}
              placeholder="İlçe"
              placeholderTextColor={AppTheme.colors.textSoft}
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <FilterGroup label="Tarih">
            <ChoicePill
              label="Yaklaşan"
              active={dateFilter === "upcoming"}
              onPress={() => setDateFilter("upcoming")}
            />
            <ChoicePill
              label="Bugün"
              active={dateFilter === "today"}
              onPress={() => setDateFilter("today")}
            />
            <ChoicePill
              label="Yarın"
              active={dateFilter === "tomorrow"}
              onPress={() => setDateFilter("tomorrow")}
            />
            <ChoicePill
              label="Bu Hafta"
              active={dateFilter === "thisWeek"}
              onPress={() => setDateFilter("thisWeek")}
            />
          </FilterGroup>

          <FilterGroup label="Ücret">
            <ChoicePill
              label="Tümü"
              active={paidFilter === "all"}
              onPress={() => setPaidFilter("all")}
            />
            <ChoicePill
              label="Ücretsiz"
              active={paidFilter === "free"}
              onPress={() => setPaidFilter("free")}
            />
            <ChoicePill
              label="Ücretli"
              active={paidFilter === "paid"}
              onPress={() => setPaidFilter("paid")}
            />
          </FilterGroup>

          <FilterGroup label="Sıralama">
            <ChoicePill
              label="Tarih"
              active={sortBy === "date"}
              onPress={() => setSortBy("date")}
            />
            <ChoicePill
              label="Yeni"
              active={sortBy === "newest"}
              onPress={() => setSortBy("newest")}
            />
            <ChoicePill
              label="Popüler"
              active={sortBy === "popular"}
              onPress={() => setSortBy("popular")}
            />
          </FilterGroup>

          <Pressable
            style={[
              styles.availabilityToggle,
              onlyAvailable ? styles.availabilityToggleActive : null,
            ]}
            onPress={() => setOnlyAvailable((prev) => !prev)}
          >
            <Text
              style={[
                styles.availabilityToggleText,
                onlyAvailable ? styles.availabilityToggleTextActive : null,
              ]}
            >
              Sadece kontenjanı uygun etkinlikler
            </Text>
          </Pressable>

          <View style={styles.filterActions}>
            <PrimaryButton
              label="Filtreleri Uygula"
              style={styles.actionButton}
              onPress={applyFilters}
            />
            <SecondaryButton
              label="Temizle"
              style={styles.actionButton}
              onPress={clearFilters}
            />
          </View>
        </View>
      </AppCard>

      {appliedFilterLabels.length > 0 ? (
        <View style={styles.activeFiltersRow}>
          {appliedFilterLabels.map((label) => (
            <ChoicePill key={label} label={label} active />
          ))}
        </View>
      ) : null}

      <SectionHeading
        eyebrow="Etkinlikler"
        title="Tüm etkinlikler"
        subtitle={
          pageInfo
            ? `${pageInfo.totalCount} sonuç bulundu`
            : "Şehirdeki planlar yükleniyor"
        }
        trailing={
          <View style={styles.trailingBadge}>
            <Text style={styles.trailingBadgeText}>{availableCount} açık</Text>
          </View>
        }
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      <AmbientBackdrop />
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 36,
          },
        ]}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !loading ? (
            <EmptyStateCard
              title="Uygun etkinlik bulunamadı"
              description="Filtrelerini biraz gevşet veya başka bir şehir ve tarih seçerek yeniden dene."
            />
          ) : null
        }
        ListFooterComponent={
          <>
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={AppTheme.colors.accentDeep} />
                <Text style={styles.loadingText}>Etkinlikler hazırlanıyor...</Text>
              </View>
            ) : null}

            {loadingMore ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={AppTheme.colors.accentDeep} />
                <Text style={styles.loadingText}>Daha fazla etkinlik yükleniyor...</Text>
              </View>
            ) : null}

            {!loading && error ? (
              <AppCard tone="muted">
                <Text style={styles.errorText}>{error}</Text>
              </AppCard>
            ) : null}
          </>
        }
        renderItem={({ item, index }) => (
          <EventCard
            event={item}
            highlightLabel={
              index === 0
                ? "Öne çıkan"
                : percentage(item.participantCount, item.capacity) >= 70
                  ? "Hızlı doluyor"
                  : item.isPaid
                    ? "Ücretli"
                    : undefined
            }
            onPress={() => router.push(`/events/${item.id}` as any)}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
      />
    </View>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.groupLabel}>{label}</Text>
      <View style={styles.pillRow}>{children}</View>
    </View>
  );
}

function CollectionStrip({
  eyebrow,
  title,
  subtitle,
  events,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  events: EventSummary[];
}) {
  if (events.length === 0) {
    return null;
  }

  return (
    <View style={styles.collectionSection}>
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.collectionRail}
      >
        {events.map((event) => (
          <Pressable
            key={event.id}
            style={styles.collectionCard}
            onPress={() => router.push(`/events/${event.id}` as any)}
          >
            <View style={styles.collectionTopRow}>
              <ChoicePill label={event.categoryName} active />
              <Text style={styles.collectionPrice}>
                {formatPrice(event.isPaid, event.price)}
              </Text>
            </View>

            <Text style={styles.collectionTitle} numberOfLines={2}>
              {event.title}
            </Text>

            <Text style={styles.collectionDescription} numberOfLines={2}>
              {event.description || "Açıklama yakında eklenecek."}
            </Text>

            <View style={styles.collectionMetaStack}>
              <Text style={styles.collectionMeta}>
                {formatDateTime(event.startDate)}
              </Text>
              <Text style={styles.collectionMeta}>
                {formatLocation(event.city, event.district)}
              </Text>
            </View>

            <View style={styles.collectionFooter}>
              <Text style={styles.collectionFooterText}>
                {getCollectionNote(event)}
              </Text>
              <Text style={styles.collectionFooterLink}>Detay</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function getCollectionNote(event: EventSummary) {
  const fillRate = percentage(event.participantCount, event.capacity);

  if (fillRate >= 85) {
    return "Yerler hızla tükeniyor";
  }

  if (event.isPaid) {
    return "Ücretli etkinlik";
  }

  return "Topluluk odaklı plan";
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  headerStack: {
    gap: 18,
    marginBottom: 6,
  },
  spotlightCard: {
    gap: 14,
  },
  spotlightEyebrow: {
    color: "rgba(255, 246, 242, 0.72)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: Fonts.rounded,
  },
  spotlightTitle: {
    color: AppTheme.colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  spotlightText: {
    color: "rgba(255, 246, 242, 0.8)",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Fonts.sans,
  },
  spotlightMetaRow: {
    flexDirection: "row",
    gap: 10,
  },
  singleActionButton: {
    width: "100%",
  },
  presetRail: {
    gap: 12,
    paddingRight: 20,
  },
  presetCard: {
    width: 236,
    minHeight: 144,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(168, 71, 52, 0.08)",
    justifyContent: "space-between",
  },
  presetEyebrow: {
    color: AppTheme.colors.accentDeep,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontFamily: Fonts.rounded,
  },
  presetTitle: {
    marginTop: 10,
    color: AppTheme.colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  presetDescription: {
    marginTop: 8,
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  collectionSection: {
    gap: 12,
  },
  collectionRail: {
    gap: 12,
    paddingRight: 20,
  },
  collectionCard: {
    width: 252,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(168, 71, 52, 0.09)",
    backgroundColor: AppTheme.colors.surface,
    padding: 16,
    gap: 12,
  },
  collectionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  collectionPrice: {
    color: AppTheme.colors.success,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: Fonts.rounded,
  },
  collectionTitle: {
    color: AppTheme.colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  collectionDescription: {
    color: AppTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  collectionMetaStack: {
    gap: 5,
  },
  collectionMeta: {
    color: AppTheme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Fonts.rounded,
  },
  collectionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  collectionFooterText: {
    flex: 1,
    color: AppTheme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Fonts.sans,
  },
  collectionFooterLink: {
    color: AppTheme.colors.accentDeep,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: Fonts.rounded,
  },
  curatedCard: {
    gap: 14,
  },
  curatedHeading: {
    gap: 4,
  },
  curatedEyebrow: {
    color: AppTheme.colors.accentDeep,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: Fonts.rounded,
  },
  curatedText: {
    color: AppTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: Fonts.sans,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterCard: {
    gap: 16,
  },
  filterStack: {
    gap: 14,
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: AppTheme.colors.text,
    fontSize: 15,
    fontFamily: Fonts.sans,
  },
  inlineInputs: {
    flexDirection: "row",
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  filterGroup: {
    gap: 10,
  },
  groupLabel: {
    color: AppTheme.colors.text,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontFamily: Fonts.rounded,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  availabilityToggle: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.surface,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  availabilityToggleActive: {
    backgroundColor: AppTheme.colors.successSoft,
    borderColor: "#BFD9CA",
  },
  availabilityToggleText: {
    color: AppTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  availabilityToggleTextActive: {
    color: AppTheme.colors.success,
  },
  filterActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  activeFiltersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  trailingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: AppTheme.radii.pill,
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  trailingBadgeText: {
    color: AppTheme.colors.accentDeep,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: Fonts.rounded,
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
