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
      await appDialog.showMessage({
        title: "Eksik bilgi",
        message: "Instagram hariç tüm alanları doldurmalısın.",
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

      await appDialog.showMessage({
        title: "Başvuru alındı",
        message:
          "Organizer başvurun alındı. Onaydan sonra kendi etkinliklerini paylaşabileceksin.",
        tone: "success",
      });

      router.back();
    } catch (err: unknown) {
      await appDialog.showMessage({
        title: "Başvuru hatası",
        message:
          err instanceof Error ? err.message : "Başvuru yapılırken bir sorun oluştu.",
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
        eyebrow="Organizer başvurusu"
        title="Topluluğunu sahneye çıkar"
        subtitle="Kendini iyi anlat, güven ver ve yerel etkinliklerini profesyonel bir şekilde yayınlamaya başla."
      />

      <AppCard style={styles.card}>
        <AppInput
          label="Organizer adı"
          value={organizerName}
          onChangeText={setOrganizerName}
          placeholder="Örn: Ömer Organizasyon"
        />

        <AppInput
          label="Organizer tipi"
          value={organizerType}
          onChangeText={setOrganizerType}
          placeholder="Individual / Club / Venue"
          helpText="Bireysel, kulüp veya mekan tipi gibi kısa bir tanım kullanabilirsin."
        />

        <AppInput
          label="Açıklama"
          value={description}
          onChangeText={setDescription}
          placeholder="Kim olduğunu ve nasıl etkinlikler düzenlediğini anlat"
          multiline
        />

        <AppInput
          label="Telefon"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="05555555555"
          keyboardType="phone-pad"
        />

        <AppInput
          label="Instagram URL"
          value={instagramUrl}
          onChangeText={setInstagramUrl}
          placeholder="https://instagram.com/..."
          autoCapitalize="none"
          helpText="Zorunlu değil, ama güven için faydalı."
        />

        <AppInput label="Şehir" value={city} onChangeText={setCity} placeholder="Aydın" />

        <AppInput label="İlçe" value={district} onChangeText={setDistrict} placeholder="Nazilli" />

        <PrimaryButton label="Başvuruyu Gönder" onPress={handleApply} loading={saving} />
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
