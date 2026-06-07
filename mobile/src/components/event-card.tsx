import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppTheme, Fonts, Shadows } from "../constants/theme";
import {
  formatDateTime,
  formatLocation,
  formatPrice,
  percentage,
} from "../lib/format";
import type { EventSummary } from "../types/api";
import { ChoicePill, ProgressTrack, StatusPill } from "./app-ui";

type EventCardProps = {
  event: EventSummary;
  onPress?: () => void;
  footer?: ReactNode;
  showOrganizer?: boolean;
  statusMode?: boolean;
  highlightLabel?: string;
};

export function EventCard({
  event,
  onPress,
  footer,
  showOrganizer = true,
  statusMode = false,
  highlightLabel,
}: EventCardProps) {
  const occupancyRate = percentage(event.participantCount, event.capacity);
  const seatsLeft = Math.max(event.capacity - event.participantCount, 0);

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.card} onPress={onPress}>
        <View style={styles.cardGlow} />

        <View style={styles.topRow}>
          <ChoicePill label={event.categoryName} active />
          {statusMode ? (
            <StatusPill status={event.status} />
          ) : (
            <Text style={styles.price}>{formatPrice(event.isPaid, event.price)}</Text>
          )}
        </View>

        {highlightLabel ? <Text style={styles.highlight}>{highlightLabel}</Text> : null}

        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {event.description || "Açıklama yakında eklenecek."}
        </Text>

        <View style={styles.metricGrid}>
          <MetricTile label="Tarih" value={formatDateTime(event.startDate)} />
          <MetricTile label="Konum" value={formatLocation(event.city, event.district)} />
        </View>

        <View style={styles.capacityBlock}>
          <View style={styles.capacityHeader}>
            <Text style={styles.capacityLabel}>Katılım seviyesi</Text>
            <Text style={styles.capacityNote}>
              {getCapacityMessage(occupancyRate, seatsLeft)}
            </Text>
          </View>
          <ProgressTrack value={event.participantCount} total={event.capacity} />
        </View>

        <View style={styles.bottomRow}>
          {showOrganizer ? (
            <Text style={styles.organizer}>Organizatör: {event.organizerName}</Text>
          ) : (
            <Text style={styles.organizer}>
              {event.participantCount} / {event.capacity} katılımcı
            </Text>
          )}

          {onPress ? <Text style={styles.ctaHint}>Detayı aç</Text> : null}
        </View>
      </Pressable>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function getCapacityMessage(occupancyRate: number, seatsLeft: number) {
  if (seatsLeft <= 0) {
    return "Kontenjan doldu";
  }

  if (occupancyRate >= 85) {
    return `${seatsLeft} kişilik yer kaldı`;
  }

  if (occupancyRate >= 55) {
    return "İlgi yüksek";
  }

  return "Rahat katılım";
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  card: {
    overflow: "hidden",
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.radii.lg,
    padding: 18,
    gap: 14,
    ...Shadows.card,
  },
  cardGlow: {
    position: "absolute",
    top: -22,
    right: -10,
    width: 112,
    height: 112,
    borderRadius: 999,
    backgroundColor: "rgba(214, 106, 74, 0.12)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  highlight: {
    color: AppTheme.colors.gold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: Fonts.rounded,
  },
  title: {
    color: AppTheme.colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  description: {
    color: AppTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Fonts.sans,
  },
  metricGrid: {
    flexDirection: "row",
    gap: 10,
  },
  metricTile: {
    flex: 1,
    minHeight: 92,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(168, 71, 52, 0.09)",
    backgroundColor: "rgba(246, 225, 216, 0.38)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metricLabel: {
    color: AppTheme.colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontFamily: Fonts.rounded,
  },
  metricValue: {
    marginTop: 10,
    color: AppTheme.colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
  capacityBlock: {
    gap: 10,
  },
  capacityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  capacityLabel: {
    color: AppTheme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontFamily: Fonts.rounded,
  },
  capacityNote: {
    color: AppTheme.colors.accentDeep,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  organizer: {
    flex: 1,
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
  ctaHint: {
    color: AppTheme.colors.accentDeep,
    fontSize: 13,
    fontWeight: "800",
    fontFamily: Fonts.rounded,
  },
  price: {
    color: AppTheme.colors.success,
    fontSize: 13,
    fontWeight: "800",
    fontFamily: Fonts.rounded,
  },
  footer: {
    gap: 10,
  },
});
