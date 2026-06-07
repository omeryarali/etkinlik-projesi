import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";

import { appDialog } from "../components/app-dialog";
import {
  AppBackButton,
  AppCard,
  AppInput,
  AppScrollCanvas,
  ErrorStateCard,
  LoadingStateCard,
  PrimaryButton,
  SectionHeading,
  SecondaryButton,
} from "../components/app-ui";
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
        setError("Profil bilgileri alinamadi.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!fullName.trim()) {
      await appDialog.showMessage({
        title: "Eksik bilgi",
        message: "Ad soyad alani bos olamaz.",
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
      };

      await saveAuthData(token, updatedUser);

      await appDialog.showMessage({
        title: "Profil guncellendi",
        message: "Bilgilerin basariyla kaydedildi.",
        tone: "success",
      });
      router.back();
    } catch (err: unknown) {
      await appDialog.showMessage({
        title: "Guncelleme hatasi",
        message:
          err instanceof Error ? err.message : "Profil guncellenirken bir sorun olustu.",
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
        <LoadingStateCard
          title="Profil bilgilerin geliyor"
          description="Duzenleme alanlari acilmadan once mevcut hesabin hazirlaniyor."
        />
      </AppScrollCanvas>
    );
  }

  if (error) {
    return (
      <AppScrollCanvas contentContainerStyle={styles.centered}>
        <ErrorStateCard
          title="Profil duzenleme ekrani acilamadi"
          description={error}
          actionLabel="Tekrar Dene"
          onAction={() => {
            void loadProfile();
          }}
        />
        <SecondaryButton label="Geri Don" onPress={() => router.back()} />
      </AppScrollCanvas>
    );
  }

  return (
    <AppScrollCanvas contentContainerStyle={styles.content}>
      <AppBackButton onPress={() => router.back()} />

      <SectionHeading
        eyebrow="Profil duzenleme"
        title="Hesabini tazele"
        subtitle="Kendini daha iyi yansitan bilgilerle gorunumunu ve iletisim alanlarini guncelle."
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
          helpText="E-posta su an degistirilemiyor."
        />

        <AppInput
          label="Telefon"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="05555555555"
          keyboardType="phone-pad"
        />

        <AppInput
          label="Profil fotograf URL"
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
  card: {
    gap: 14,
  },
});
