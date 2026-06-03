import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
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

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !password.trim()
    ) {
      Alert.alert("Uyarı", "Tüm alanları doldurmalısınız.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Uyarı", "Şifre en az 6 karakter olmalıdır.");
      return;
    }

    try {
      setLoading(true);

      const data = (await apiFetch("/api/Auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email,
          phoneNumber,
          password,
        }),
      })) as AuthResponse;

      await saveAuthData(data.token, data);

      Alert.alert("Başarılı", "Kayıt oluşturuldu.");
      router.replace("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Kayıt Hatası", err.message);
      } else {
        Alert.alert("Kayıt Hatası", "Kayıt olurken hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Kayıt Ol</Text>
          <Text style={styles.subtitle}>
            Etkinlik Projesi hesabını oluştur
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              placeholder="Ömer Yaralı"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

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
            <Text style={styles.label}>Telefon</Text>
            <TextInput
              style={styles.input}
              placeholder="05555555555"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="En az 6 karakter"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            )}
          </Pressable>

          <Pressable onPress={() => router.push("/login" as any)}>
            <Text style={styles.linkText}>
              Zaten hesabın var mı? Giriş yap
            </Text>
          </Pressable>
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