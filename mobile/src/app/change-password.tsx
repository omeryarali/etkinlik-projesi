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
import { getAuthToken } from "../services/authStorage";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChangePassword() {
    if (!currentPassword.trim() || !newPassword.trim() || !newPasswordAgain.trim()) {
      await appDialog.showMessage({
        title: "Eksik bilgi",
        message: "Tüm alanları doldurmalısın.",
        tone: "warning",
      });
      return;
    }

    if (newPassword.length < 6) {
      await appDialog.showMessage({
        title: "Şifre kısa",
        message: "Yeni şifre en az 6 karakter olmalı.",
        tone: "warning",
      });
      return;
    }

    if (newPassword !== newPasswordAgain) {
      await appDialog.showMessage({
        title: "Eşleşme sorunu",
        message: "Yeni şifreler birbiriyle aynı olmalı.",
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

      await appDialog.showMessage({
        title: "Şifre güncellendi",
        message: "Yeni şifren artık aktif.",
        tone: "success",
      });
      router.back();
    } catch (err: unknown) {
      await appDialog.showMessage({
        title: "Şifre değiştirilemedi",
        message:
          err instanceof Error ? err.message : "Şifre güncellenirken bir sorun oluştu.",
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
        eyebrow="Güvenlik"
        title="Şifreni yenile"
        subtitle="Hesabını güvenli tutmak için güçlü ve kolay hatırlanır bir şifre belirle."
      />

      <AppCard style={styles.card}>
        <AppInput
          label="Mevcut şifre"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Mevcut şifren"
          secureTextEntry
        />

        <AppInput
          label="Yeni şifre"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="En az 6 karakter"
          secureTextEntry
        />

        <AppInput
          label="Yeni şifre tekrar"
          value={newPasswordAgain}
          onChangeText={setNewPasswordAgain}
          placeholder="Yeni şifreyi tekrar gir"
          secureTextEntry
        />

        <PrimaryButton
          label="Şifreyi Güncelle"
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
