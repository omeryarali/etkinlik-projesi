import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { apiFetch } from "../services/apiService";
import { saveAuthData } from "../services/authStorage";

type AuthResponse = {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  token: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Uyarı", "E-posta ve şifre alanları zorunludur.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiFetch("/api/Auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      }) as AuthResponse;

      await saveAuthData(data.token, data);

      Alert.alert("Başarılı", "Giriş yapıldı.");
      router.replace("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Giriş Hatası", err.message);
      } else {
        Alert.alert("Giriş Hatası", "Giriş yapılırken hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Giriş Yap</Text>
        <Text style={styles.subtitle}>Etkinlik Projesi hesabına giriş yap</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            placeholder="ornek@mail.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            placeholder="Şifreniz"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Giriş Yap</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push("/register" as any)}>
          <Text style={styles.linkText}>
            Hesabın yok mu? Kayıt ol
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
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
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  linkText: {
    marginTop: 18,
    textAlign: "center",
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
});