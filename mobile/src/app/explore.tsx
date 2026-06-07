import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import {
  AppBackButton,
  AppCard,
  AppScrollCanvas,
  ChoicePill,
  InkButton,
  MetricTile,
  PrimaryButton,
  SectionHeading,
} from "../components/app-ui";
import { AppTheme, Fonts } from "../constants/theme";

const discoveryGroups = [
  {
    title: "Sosyal Buluşmalar",
    description: "Kahve sohbetleri, masa oyunları ve topluluk akşamları için sıcak bir akış.",
    tags: ["Akşam planı", "Yeni insanlarla tanış", "Rahat tempo"],
    tone: "accent" as const,
  },
  {
    title: "Turnuvalar",
    description: "Rekabet duygusu güçlü, katılımı net ve enerjisi yüksek etkinlikler.",
    tags: ["Tavla", "Satranç", "Spor"],
    tone: "default" as const,
  },
  {
    title: "Mahalle Keşfi",
    description: "Şehrin farklı köşelerinde küçük ama karakterli organizasyonlar.",
    tags: ["Yerel mekanlar", "Yakın çevre", "Hafta sonu"],
    tone: "muted" as const,
  },
];

export default function ExploreScreen() {
  return (
    <AppScrollCanvas contentContainerStyle={styles.content}>
      <AppBackButton onPress={() => router.back()} />

      <SectionHeading
        eyebrow="BiKatıl Editörü"
        title="İlham veren akışlar"
        subtitle="BiKatıl’ın şehir rehberi ruhunu ve daha rafine keşif hissini aynı ekranda buluşturan katman."
      />

      <AppCard tone="ink" style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>BiKatıl Selects</Text>
        <Text style={styles.heroTitle}>Bugünün havasına göre akış seç</Text>
        <Text style={styles.heroText}>
          Bu alan, gelecekte BiKatıl’ın gerçek kategori verileri ve editoryal seçimleriyle daha da zenginleşecek.
        </Text>

        <View style={styles.heroMetrics}>
          <MetricTile label="Ritim" value="Yavaş" helper="Sakin ve sosyal planlar" tone="ink" />
          <MetricTile label="Enerji" value="Canlı" helper="Yüksek etkileşimli akış" tone="ink" />
        </View>

        <PrimaryButton label="BiKatıl akışına dön" onPress={() => router.push("/" as any)} />
      </AppCard>

      {discoveryGroups.map((group) => (
        <AppCard key={group.title} tone={group.tone} style={styles.groupCard}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <Text style={styles.groupDescription}>{group.description}</Text>

          <View style={styles.tagRow}>
            {group.tags.map((tag) => (
              <ChoicePill key={tag} label={tag} active />
            ))}
          </View>
        </AppCard>
      ))}

      <AppCard style={styles.noteCard}>
        <Text style={styles.noteTitle}>Bir sonraki katman</Text>
        <Text style={styles.noteText}>
          Burayı ilerleyen turda gerçek şehir seçkileri, kişisel öneriler ve BiKatıl’a özel editoryal bloklarla besleyebiliriz.
        </Text>
      </AppCard>

      <InkButton label="BiKatıl Ana Akışı" onPress={() => router.push("/" as any)} />
    </AppScrollCanvas>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
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
    color: "rgba(255, 246, 242, 0.78)",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Fonts.sans,
  },
  heroMetrics: {
    flexDirection: "row",
    gap: 10,
  },
  groupCard: {
    gap: 12,
  },
  groupTitle: {
    color: AppTheme.colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  groupDescription: {
    color: AppTheme.colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Fonts.sans,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  noteCard: {
    gap: 8,
  },
  noteTitle: {
    color: AppTheme.colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  noteText: {
    color: AppTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: Fonts.sans,
  },
});
