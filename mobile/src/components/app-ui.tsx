import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AppTheme,
  Fonts,
  Shadows,
  getStatusPalette,
} from "../constants/theme";

type AppCanvasProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

type AppScrollCanvasProps = AppCanvasProps & {
  contentContainerStyle?: StyleProp<ViewStyle>;
};

type AppCardProps = AppCanvasProps & {
  tone?: "default" | "accent" | "muted" | "ink";
};

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

type ChoicePillProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

type MetricTileProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "accent" | "muted" | "ink";
  style?: StyleProp<ViewStyle>;
};

type AppInputProps = TextInputProps & {
  label: string;
  helpText?: string;
  errorText?: string;
};

export function AppCanvas({ children, style }: AppCanvasProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.canvas, style]}>
      <AmbientBackdrop />
      <View
        style={[
          styles.canvasInner,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function AppScrollCanvas({
  children,
  style,
  contentContainerStyle,
}: AppScrollCanvasProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.canvas, style]}>
      <AmbientBackdrop />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollInner,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function AmbientBackdrop() {
  return (
    <>
      <View style={styles.blobOne} />
      <View style={styles.blobTwo} />
      <View style={styles.blobThree} />
    </>
  );
}

export function AppBackButton({
  label = "Geri",
  onPress,
}: {
  label?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.backButton} onPress={onPress}>
      <Text style={styles.backButtonText}>{"\u2039"} {label}</Text>
    </Pressable>
  );
}

export function AppCard({
  children,
  tone = "default",
  style,
}: AppCardProps) {
  return <View style={[styles.card, cardTones[tone], style]}>{children}</View>;
}

export function HeroCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <AppCard tone="accent" style={styles.heroCard}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.heroTitle}>{title}</Text>
      {description ? <Text style={styles.heroDescription}>{description}</Text> : null}
      {children}
    </AppCard>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  trailing,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingText}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {trailing}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.primaryButton, style, disabledOrLoading(disabled, loading)]}
    >
      {loading ? (
        <ActivityIndicator color={AppTheme.colors.white} />
      ) : (
        <Text style={styles.primaryButtonText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
  loading,
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.secondaryButton, style, disabledOrLoading(disabled, loading)]}
    >
      {loading ? (
        <ActivityIndicator color={AppTheme.colors.accentDeep} />
      ) : (
        <Text style={styles.secondaryButtonText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function InkButton({
  label,
  onPress,
  disabled,
  loading,
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.inkButton, style, disabledOrLoading(disabled, loading)]}
    >
      {loading ? (
        <ActivityIndicator color={AppTheme.colors.white} />
      ) : (
        <Text style={styles.inkButtonText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function DangerButton({
  label,
  onPress,
  disabled,
  loading,
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.dangerButton, style, disabledOrLoading(disabled, loading)]}
    >
      {loading ? (
        <ActivityIndicator color={AppTheme.colors.danger} />
      ) : (
        <Text style={styles.dangerButtonText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function ChoicePill({ label, active, onPress }: ChoicePillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.choicePill, active ? styles.choicePillActive : null]}
    >
      <Text style={[styles.choicePillText, active ? styles.choicePillTextActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function MetricTile({
  label,
  value,
  helper,
  tone = "default",
  style,
}: MetricTileProps) {
  return (
    <View style={[styles.metricTile, metricTileTones[tone], style]}>
      <Text style={[styles.metricTileLabel, tone === "ink" ? styles.metricTileLabelInk : null]}>
        {label}
      </Text>
      <Text style={[styles.metricTileValue, tone === "ink" ? styles.metricTileValueInk : null]}>
        {value}
      </Text>
      {helper ? (
        <Text style={[styles.metricTileHelper, tone === "ink" ? styles.metricTileHelperInk : null]}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

export function StatusPill({ status }: { status: string }) {
  const palette = getStatusPalette(status);

  return (
    <View style={[styles.statusPill, { backgroundColor: palette.backgroundColor }]}>
      <Text style={[styles.statusPillText, { color: palette.color }]}>{status}</Text>
    </View>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "-"}</Text>
    </View>
  );
}

export function ProgressTrack({
  value,
  total,
}: {
  value: number;
  total: number;
}) {
  const width =
    total > 0 ? `${Math.max(0, Math.min(100, Math.round((value / total) * 100)))}%` : "0%";

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width }]} />
    </View>
  );
}

export function AppInput({
  label,
  helpText,
  errorText,
  multiline,
  style,
  ...props
}: AppInputProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor={AppTheme.colors.textSoft}
        style={[
          styles.fieldInput,
          multiline ? styles.fieldInputMultiline : null,
          style,
        ]}
      />
      {helpText ? <Text style={styles.fieldHelp}>{helpText}</Text> : null}
      {errorText ? <Text style={styles.fieldError}>{errorText}</Text> : null}
    </View>
  );
}

export function EmptyStateCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <AppCard tone="muted" style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </AppCard>
  );
}

export function InlineMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.inlineMeta}>
      <Text style={styles.inlineMetaLabel}>{label}</Text>
      <Text style={styles.inlineMetaValue}>{value}</Text>
    </View>
  );
}

const cardTones = StyleSheet.create({
  default: {
    backgroundColor: AppTheme.colors.surface,
    borderColor: AppTheme.colors.border,
  },
  accent: {
    backgroundColor: AppTheme.colors.accentSoft,
    borderColor: "#E9C2B4",
  },
  muted: {
    backgroundColor: AppTheme.colors.surfaceMuted,
    borderColor: AppTheme.colors.border,
  },
  ink: {
    backgroundColor: AppTheme.colors.ink,
    borderColor: AppTheme.colors.ink,
  },
});

const metricTileTones = StyleSheet.create({
  default: {
    backgroundColor: "rgba(255, 249, 242, 0.92)",
    borderColor: AppTheme.colors.border,
  },
  accent: {
    backgroundColor: "rgba(255, 249, 242, 0.58)",
    borderColor: "rgba(168, 71, 52, 0.12)",
  },
  muted: {
    backgroundColor: "rgba(247, 235, 221, 0.88)",
    borderColor: AppTheme.colors.border,
  },
  ink: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
});

function disabledOrLoading(disabled?: boolean, loading?: boolean) {
  return disabled || loading ? styles.disabledState : null;
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  canvasInner: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollInner: {
    paddingHorizontal: 20,
    gap: 16,
  },
  blobOne: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(214, 106, 74, 0.14)",
  },
  blobTwo: {
    position: "absolute",
    top: 110,
    left: -90,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(184, 135, 60, 0.11)",
  },
  blobThree: {
    position: "absolute",
    bottom: -40,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(74, 58, 52, 0.06)",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 249, 242, 0.9)",
    borderRadius: AppTheme.radii.pill,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  backButtonText: {
    color: AppTheme.colors.accentDeep,
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  card: {
    borderWidth: 1,
    borderRadius: AppTheme.radii.lg,
    padding: 18,
    ...Shadows.card,
  },
  heroCard: {
    overflow: "hidden",
  },
  eyebrow: {
    color: AppTheme.colors.accentDeep,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: Fonts.rounded,
  },
  heroTitle: {
    marginTop: 8,
    color: AppTheme.colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  heroDescription: {
    marginTop: 10,
    color: AppTheme.colors.inkSoft,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Fonts.sans,
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
  },
  sectionHeadingText: {
    flex: 1,
  },
  sectionTitle: {
    color: AppTheme.colors.text,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  sectionSubtitle: {
    marginTop: 4,
    color: AppTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: AppTheme.radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppTheme.colors.accent,
    ...Shadows.soft,
  },
  primaryButtonText: {
    color: AppTheme.colors.white,
    fontSize: 15,
    fontWeight: "800",
    fontFamily: Fonts.rounded,
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: AppTheme.radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.borderStrong,
  },
  secondaryButtonText: {
    color: AppTheme.colors.accentDeep,
    fontSize: 15,
    fontWeight: "800",
    fontFamily: Fonts.rounded,
  },
  inkButton: {
    minHeight: 54,
    borderRadius: AppTheme.radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppTheme.colors.ink,
    ...Shadows.soft,
  },
  inkButtonText: {
    color: AppTheme.colors.white,
    fontSize: 15,
    fontWeight: "800",
    fontFamily: Fonts.rounded,
  },
  dangerButton: {
    minHeight: 54,
    borderRadius: AppTheme.radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: "#E2B2A5",
  },
  dangerButtonText: {
    color: AppTheme.colors.danger,
    fontSize: 15,
    fontWeight: "800",
    fontFamily: Fonts.rounded,
  },
  disabledState: {
    opacity: 0.65,
  },
  choicePill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: AppTheme.radii.pill,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: "rgba(255, 249, 242, 0.88)",
  },
  choicePillActive: {
    backgroundColor: AppTheme.colors.ink,
    borderColor: AppTheme.colors.ink,
  },
  choicePillText: {
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  choicePillTextActive: {
    color: AppTheme.colors.white,
  },
  metricTile: {
    flex: 1,
    minHeight: 84,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  metricTileLabel: {
    color: AppTheme.colors.textSoft,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontFamily: Fonts.rounded,
  },
  metricTileLabelInk: {
    color: "rgba(255, 246, 242, 0.75)",
  },
  metricTileValue: {
    marginTop: 8,
    color: AppTheme.colors.text,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  metricTileValueInk: {
    color: AppTheme.colors.white,
  },
  metricTileHelper: {
    marginTop: 8,
    color: AppTheme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Fonts.sans,
  },
  metricTileHelperInk: {
    color: "rgba(255, 246, 242, 0.72)",
  },
  statusPill: {
    borderRadius: AppTheme.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: Fonts.rounded,
  },
  detailRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(231, 216, 198, 0.7)",
  },
  detailLabel: {
    color: AppTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: Fonts.rounded,
  },
  detailValue: {
    marginTop: 4,
    color: AppTheme.colors.text,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: Fonts.sans,
  },
  progressTrack: {
    height: 10,
    borderRadius: AppTheme.radii.pill,
    backgroundColor: "rgba(214, 106, 74, 0.14)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: AppTheme.radii.pill,
    backgroundColor: AppTheme.colors.accent,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    color: AppTheme.colors.text,
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
  fieldInput: {
    minHeight: 54,
    borderRadius: AppTheme.radii.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    backgroundColor: AppTheme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: AppTheme.colors.text,
    fontSize: 15,
    fontFamily: Fonts.sans,
  },
  fieldInputMultiline: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  fieldHelp: {
    color: AppTheme.colors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Fonts.sans,
  },
  fieldError: {
    color: AppTheme.colors.danger,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Fonts.sans,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyTitle: {
    color: AppTheme.colors.text,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: Fonts.display,
    textAlign: "center",
  },
  emptyDescription: {
    marginTop: 8,
    color: AppTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    fontFamily: Fonts.sans,
  },
  inlineMeta: {
    gap: 4,
  },
  inlineMetaLabel: {
    color: AppTheme.colors.textSoft,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontFamily: Fonts.rounded,
  },
  inlineMetaValue: {
    color: AppTheme.colors.text,
    fontSize: 15,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
});
