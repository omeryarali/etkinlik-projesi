import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";

import { appDialog } from "../components/app-dialog";
import {
  AppBackButton,
  AppCard,
  AppInput,
  AppScrollCanvas,
  PrimaryButton,
  SectionHeading,
} from "../components/app-ui";
import { apiFetch } from "../services/apiService";
import { clearAuthData, getAuthToken } from "../services/authStorage";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChangePassword() {
    if (!currentPassword.trim() || !newPassword.trim() || !newPasswordAgain.trim()) {
      await appDialog.showMessage({
        title: "Eksik bilgi",
        message: "Tum alanlari doldurmalisin.",
        tone: "warning",
      });
      return;
    }

    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      await appDialog.showMessage({
        title: "Sifre yetersiz",
        message: "Yeni sifre en az 8 karakter olmali, harf ve rakam icermeli.",
        tone: "warning",
      });
      return;
    }

    if (newPassword !== newPasswordAgain) {
      await appDialog.showMessage({
        title: "Eslesme sorunu",
        message: "Yeni sifreler birbiriyle ayni olmali.",
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

      await apiFetch("/api/Auth/change-password", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      await clearAuthData();

      await appDialog.showMessage({
        title: "Sifre guncellendi",
        message: "Guvenlik icin yeniden giris yapman gerekiyor.",
        tone: "success",
      });
      router.replace("/login" as any);
    } catch (err: unknown) {
      await appDialog.showMessage({
        title: "Sifre degistirilemedi",
        message:
          err instanceof Error ? err.message : "Sifre guncellenirken bir sorun olustu.",
        tone: "danger",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppScrollCanvas contentContainerStyle={styles.content}>
      <AppBackButton onPress={() => router.back()} />

      <SectionHeading
        eyebrow="Guvenlik"
        title="Sifreni yenile"
        subtitle="Hesabini guvenli tutmak icin guclu ve kolay hatirlanir bir sifre belirle."
      />

      <AppCard style={styles.card}>
        <AppInput
          label="Mevcut sifre"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Mevcut sifren"
          secureTextEntry
        />

        <AppInput
          label="Yeni sifre"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="En az 8 karakter, harf ve rakam"
          secureTextEntry
        />

        <AppInput
          label="Yeni sifre tekrar"
          value={newPasswordAgain}
          onChangeText={setNewPasswordAgain}
          placeholder="Yeni sifreyi tekrar gir"
          secureTextEntry
        />

        <PrimaryButton
          label="Sifreyi Guncelle"
          onPress={handleChangePassword}
          loading={saving}
        />
      </AppCard>
    </AppScrollCanvas>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  card: {
    gap: 14,
  },
});
