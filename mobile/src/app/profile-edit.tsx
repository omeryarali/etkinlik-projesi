import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";

import { appDialog } from "../components/app-dialog";
import {
  AppBackButton,
  AppCard,
  AppInput,
  AppScrollCanvas,
  PrimaryButton,
  SectionHeading,
  SecondaryButton,
} from "../components/app-ui";
import { AppTheme, Fonts } from "../constants/theme";
import { apiFetch } from "../services/apiService";
import { getAuthToken, saveAuthData } from "../services/authStorage";
import type { AuthUser } from "../types/api";

type UpdateProfileResponse = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export default function ProfileEditScreen() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

      const data = (await apiFetch("/api/Auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })) as AuthUser;

      setFullName(data.fullName || "");
      setPhoneNumber(data.phoneNumber || "");
      setProfileImageUrl(data.profileImageUrl || "");
      setEmail(data.email || "");
      setRole(data.role || "");
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

  async function handleSave() {
    if (!fullName.trim()) {
      await appDialog.showMessage({
        title: "Eksik bilgi",
        message: "Ad soyad alanı boş olamaz.",
        tone: "warning",
      });
      return;
    }

    try {
      setSaving(true);

      const token = await getAuthToken();

      if (!token) {
        router.replace("/login" as any);
        return;
      }

      const data = (await apiFetch("/api/Auth/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          profileImageUrl,
        }),
      })) as UpdateProfileResponse;

      const updatedUser: AuthUser = {
        userId: data.id,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        profileImageUrl: data.profileImageUrl,
        role: data.role,
        isActive: data.isActive,
        createdAt: data.createdAt,
        token,
      };

      await saveAuthData(token, updatedUser);

      await appDialog.showMessage({
        title: "Profil güncellendi",
        message: "Bilgilerin başarıyla kaydedildi.",
        tone: "success",
      });
      router.back();
    } catch (err: unknown) {
      await appDialog.showMessage({
        title: "Güncelleme hatası",
        message:
          err instanceof Error ? err.message : "Profil güncellenirken bir sorun oluştu.",
        tone: "danger",
      });
    } finally {
      setSaving(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [])
  );

  if (loading) {
    return (
      <AppScrollCanvas contentContainerStyle={styles.centered}>
        <ActivityIndicator color={AppTheme.colors.accentDeep} />
        <Text style={styles.infoText}>Profil bilgileri yükleniyor...</Text>
      </AppScrollCanvas>
    );
  }

  if (error) {
    return (
      <AppScrollCanvas contentContainerStyle={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <SecondaryButton label="Geri Dön" onPress={() => router.back()} />
      </AppScrollCanvas>
    );
  }

  return (
    <AppScrollCanvas contentContainerStyle={styles.content}>
      <AppBackButton onPress={() => router.back()} />

      <SectionHeading
        eyebrow="Profil düzenleme"
        title="Hesabını tazele"
        subtitle="Kendini daha iyi yansıtan bilgilerle görünümünü ve iletişim alanlarını güncelle."
      />

      <AppCard style={styles.card}>
        <AppInput
          label="Ad soyad"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Ad soyad"
        />

        <AppInput
          label="E-posta"
          value={email}
          editable={false}
          helpText="E-posta şu an değiştirilemiyor."
        />

        <AppInput
          label="Telefon"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="05555555555"
          keyboardType="phone-pad"
        />

        <AppInput
          label="Profil fotoğraf URL"
          value={profileImageUrl}
          onChangeText={setProfileImageUrl}
          placeholder="https://example.com/profile.jpg"
          autoCapitalize="none"
        />

        <AppInput label="Rol" value={role} editable={false} />

        <PrimaryButton label="Kaydet" onPress={handleSave} loading={saving} />
      </AppCard>
    </AppScrollCanvas>
  );
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
  card: {
    gap: 14,
  },
});
