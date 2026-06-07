import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  AppCard,
  AppScrollCanvas,
  DangerButton,
  DetailRow,
  ErrorStateCard,
  InkButton,
  LoadingStateCard,
  MetricTile,
  PrimaryButton,
  SecondaryButton,
  SectionHeading,
} from "../../components/app-ui";
import { appDialog } from "../../components/app-dialog";
import { AppTheme, Fonts } from "../../constants/theme";
import { formatDateTime, getInitial } from "../../lib/format";
import { apiFetch } from "../../services/apiService";
import { clearAuthData, getAuthToken } from "../../services/authStorage";
import type { AuthUser, OrganizerProfile } from "../../types/api";

export default function ProfileScreen() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organizerProfile, setOrganizerProfile] =
    useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const token = await getAuthToken();

      if (!token) {
        router.replace("/login" as any);
        return;
      }

      const userData = (await apiFetch("/api/Auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })) as AuthUser;

      setUser(userData);

      try {
        const organizerData = (await apiFetch("/api/Organizer/my-profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })) as OrganizerProfile;

        setOrganizerProfile(organizerData);
      } catch {
        setOrganizerProfile(null);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Profil bilgileri alınamadı.");
      }
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [])
  );

  async function handleLogout() {
    const confirmed = await appDialog.confirm({
      title: "Çıkış yap",
      message: "BiKatıl hesabından çıkmak istediğine emin misin?",
      tone: "warning",
      confirmLabel: "Çıkış Yap",
      confirmVariant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      setLogoutLoading(true);
      await clearAuthData();
      router.replace("/login" as any);
    } finally {
      setLogoutLoading(false);
    }
  }

  if (loading) {
    return (
      <AppScrollCanvas contentContainerStyle={styles.centered}>
        <LoadingStateCard
          title="Profilin hazırlanıyor"
          description="Hesap bilgilerin ve organizer durumun senin için yükleniyor."
        />
      </AppScrollCanvas>
    );
  }

  if (error || !user) {
    return (
      <AppScrollCanvas contentContainerStyle={styles.centered}>
        <ErrorStateCard
          title="Profil şu anda açılamadı"
          description={error || "Profil bilgilerine şu anda ulaşılamıyor."}
          actionLabel="Tekrar Dene"
          onAction={() => {
            void loadProfile();
          }}
        />
        <SecondaryButton label="Geri Dön" onPress={() => router.back()} />
      </AppScrollCanvas>
    );
  }

  const isOrganizer = user.role === "Organizer";
  const hasOrganizerApplication = organizerProfile !== null;
  const canApplyOrganizer =
    user.role === "Participant" && !hasOrganizerApplication;

  return (
    <AppScrollCanvas contentContainerStyle={styles.content}>
      <SectionHeading
        eyebrow="Profilim"
        title="Hesap ayarları"
        subtitle="Kişisel bilgilerini ve organizer sürecini buradan yönet."
      />

      <AppCard tone="accent" style={styles.profileHero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitial(user.fullName)}</Text>
        </View>

        <View style={styles.heroTextBlock}>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>{getRoleLabel(user.role)}</Text>
          </View>
        </View>
      </AppCard>

      <View style={styles.metricRow}>
        <MetricTile
          label="Üyelik"
          value={user.isActive ? "Aktif" : "Pasif"}
          helper={formatDateTime(user.createdAt)}
          tone="accent"
        />
        <MetricTile
          label="Organizer"
          value={getOrganizerMetricLabel(user.role, organizerProfile?.status)}
          helper={getOrganizerMetricHelper(isOrganizer, organizerProfile)}
          tone="accent"
        />
      </View>

      <AppCard>
        <Text style={styles.cardTitle}>Hesap bilgileri</Text>
        <DetailRow label="Ad soyad" value={user.fullName} />
        <DetailRow label="E-posta" value={user.email} />
        <DetailRow label="Telefon" value={user.phoneNumber || "-"} />
        <DetailRow label="Rol" value={getRoleLabel(user.role)} />
        <DetailRow label="Durum" value={user.isActive ? "Aktif" : "Pasif"} />
        <DetailRow label="Kayıt tarihi" value={formatDateTime(user.createdAt)} />
      </AppCard>

      {organizerProfile ? (
        <AppCard tone="muted" style={styles.organizerCard}>
          <Text style={styles.cardTitle}>Organizer durumu</Text>
          <Text style={styles.organizerStatus}>
            {getOrganizerStatusText(organizerProfile)}
          </Text>
          <DetailRow
            label="Durum"
            value={getOrganizerStatusLabel(organizerProfile.status)}
          />
          <DetailRow label="Organizer adı" value={organizerProfile.organizerName} />
          <DetailRow label="Tip" value={organizerProfile.organizerType} />
          <DetailRow
            label="Bölge"
            value={`${organizerProfile.city} / ${organizerProfile.district}`}
          />
        </AppCard>
      ) : null}

      <View style={styles.actionStack}>
        <PrimaryButton
          label="Profili Düzenle"
          onPress={() => router.push("/profile-edit" as any)}
        />

        {canApplyOrganizer ? (
          <InkButton
            label="Organizer Başvurusu Yap"
            onPress={() => router.push("/organizer-apply" as any)}
          />
        ) : null}

        <SecondaryButton
          label="Şifre Değiştir"
          onPress={() => router.push("/change-password" as any)}
        />

        <DangerButton
          label="Çıkış Yap"
          onPress={() => {
            void handleLogout();
          }}
          loading={logoutLoading}
        />
      </View>
    </AppScrollCanvas>
  );
}

function getRoleLabel(role: string) {
  if (role === "Organizer") {
    return "Organizer";
  }

  if (role === "Participant") {
    return "Katılımcı";
  }

  return role;
}

function getOrganizerStatusLabel(status?: string) {
  if (status === "Approved") {
    return "Aktif";
  }

  if (status === "Pending") {
    return "Bekliyor";
  }

  if (status === "Rejected") {
    return "Reddedildi";
  }

  if (status === "Suspended") {
    return "Askıda";
  }

  return "Yok";
}

function getOrganizerMetricLabel(role: string, status?: string) {
  if (role === "Organizer") {
    return "Aktif";
  }

  return getOrganizerStatusLabel(status);
}

function getOrganizerMetricHelper(
  isOrganizer: boolean,
  organizerProfile: OrganizerProfile | null
) {
  if (isOrganizer) {
    return "Organizer panelin hazır";
  }

  if (!organizerProfile) {
    return "İstersen başvuru yapabilirsin";
  }

  return getOrganizerStatusLabel(organizerProfile.status);
}

function getOrganizerStatusText(organizerProfile: OrganizerProfile) {
  if (organizerProfile.status === "Pending") {
    return "Başvurun inceleniyor. Sonuçlandığında organizer araçların açılacak.";
  }

  if (organizerProfile.status === "Rejected") {
    return organizerProfile.rejectionReason
      ? `Başvurun reddedildi. Sebep: ${organizerProfile.rejectionReason}`
      : "Başvurun reddedildi.";
  }

  if (organizerProfile.status === "Suspended") {
    return "Organizer hesabın şu anda askıda görünüyor.";
  }

  if (organizerProfile.status === "Approved") {
    return "Organizer hesabın aktif. Etkinliklerini organizer sekmesinden yönetebilirsin.";
  }

  return "Organizer durumun güncelleniyor.";
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    flexGrow: 1,
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
  profileHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: AppTheme.colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: AppTheme.colors.white,
    fontSize: 34,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  heroTextBlock: {
    flex: 1,
    gap: 6,
  },
  name: {
    color: AppTheme.colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontFamily: Fonts.display,
    fontWeight: "700",
  },
  email: {
    color: AppTheme.colors.inkSoft,
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
  rolePill: {
    alignSelf: "flex-start",
    marginTop: 6,
    backgroundColor: "rgba(255, 249, 242, 0.65)",
    borderRadius: AppTheme.radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(168, 71, 52, 0.12)",
  },
  rolePillText: {
    color: AppTheme.colors.accentDeep,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontFamily: Fonts.rounded,
  },
  metricRow: {
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
  organizerCard: {
    gap: 2,
  },
  organizerStatus: {
    color: AppTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Fonts.sans,
    marginBottom: 8,
  },
  actionStack: {
    gap: 10,
  },
});
