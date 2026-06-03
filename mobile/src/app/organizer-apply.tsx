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

export default function OrganizerApplyScreen() {
  const [organizerName, setOrganizerName] = useState("");
  const [organizerType, setOrganizerType] = useState("Individual");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleApply() {
    if (
      !organizerName.trim() ||
      !organizerType.trim() ||
      !description.trim() ||
      !phoneNumber.trim() ||
      !city.trim() ||
      !district.trim()
    ) {
      Alert.alert("Uyarı", "Instagram hariç tüm alanları doldurmalısınız.");
      return;
    }

    try {
      setSaving(true);

      const token = await getAuthToken();

      if (!token) {
        router.replace("/login" as any);
        return;
      }

      await apiFetch("/api/Organizer/apply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          organizerName,
          organizerType,
          description,
          phoneNumber,
          instagramUrl,
          city,
          district,
        }),
      });

      Alert.alert(
        "Başvuru Alındı",
        "Organizatör başvurunuz alındı. Admin onayından sonra organizatör işlemlerini kullanabilirsiniz."
      );

      router.back();
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Başvuru Hatası", err.message);
      } else {
        Alert.alert("Başvuru Hatası", "Başvuru yapılırken hata oluştu.");
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

        <Text style={styles.title}>Organizatör Başvurusu</Text>
        <Text style={styles.subtitle}>
          Etkinlik oluşturabilmek için organizatör başvurusu yap
        </Text>

        <View style={styles.card}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Organizatör Adı</Text>
            <TextInput
              style={styles.input}
              value={organizerName}
              onChangeText={setOrganizerName}
              placeholder="Örn: Ömer Organizasyon"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Organizatör Tipi</Text>
            <TextInput
              style={styles.input}
              value={organizerType}
              onChangeText={setOrganizerType}
              placeholder="Individual / Company"
            />
            <Text style={styles.helpText}>
              Bireysel için Individual, şirket/kurum için Company yazabilirsin.
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Kendinizi veya organizasyonunuzu açıklayın"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Telefon</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="05555555555"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Instagram URL</Text>
            <TextInput
              style={styles.input}
              value={instagramUrl}
              onChangeText={setInstagramUrl}
              placeholder="https://instagram.com/..."
              autoCapitalize="none"
            />
            <Text style={styles.helpText}>Zorunlu değil.</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Şehir</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Aydın"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>İlçe</Text>
            <TextInput
              style={styles.input}
              value={district}
              onChangeText={setDistrict}
              placeholder="Nazilli"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleApply}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Başvuru Yap</Text>
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
  textArea: {
    minHeight: 100,
  },
  helpText: {
    marginTop: 6,
    fontSize: 12,
    color: "#9CA3AF",
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