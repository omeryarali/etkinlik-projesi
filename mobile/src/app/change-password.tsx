import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { apiFetch } from "../services/apiService";
import { getAuthToken } from "../services/authStorage";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChangePassword() {
    if (!currentPassword.trim() || !newPassword.trim() || !newPasswordAgain.trim()) {
      Alert.alert("Uyarı", "Tüm alanları doldurmalısınız.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Uyarı", "Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (newPassword !== newPasswordAgain) {
      Alert.alert("Uyarı", "Yeni şifreler eşleşmiyor.");
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

      Alert.alert("Başarılı", "Şifreniz güncellendi.");

      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordAgain("");

      router.back();
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Şifre Değiştirme Hatası", err.message);
      } else {
        Alert.alert(
          "Şifre Değiştirme Hatası",
          "Şifre değiştirilirken hata oluştu."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButtonSmall} onPress={() => router.back()}>
          <Text style={styles.backButtonSmallText}>← Geri</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Şifre Değiştir</Text>
        <Text style={styles.subtitle}>
          Hesabın için yeni bir şifre belirle
        </Text>

        <View style={styles.card}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mevcut Şifre</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Mevcut şifreniz"
              secureTextEntry
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Yeni Şifre</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="En az 6 karakter"
              secureTextEntry
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Yeni Şifre Tekrar</Text>
            <TextInput
              style={styles.input}
              value={newPasswordAgain}
              onChangeText={setNewPasswordAgain}
              placeholder="Yeni şifre tekrar"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Şifreyi Güncelle</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  backButtonSmall: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backButtonSmallText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "700",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 15,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});