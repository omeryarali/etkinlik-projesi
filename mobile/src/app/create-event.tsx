import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

import {
  AppBackButton,
  AppCard,
  AppInput,
  AppScrollCanvas,
  ChoicePill,
  PrimaryButton,
  SectionHeading,
} from "../components/app-ui";
import { AppTheme, Fonts } from "../constants/theme";
import { apiFetch } from "../services/apiService";
import { getAuthToken } from "../services/authStorage";

type Category = {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
};

export default function CreateEventScreen() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [eventCategoryId, setEventCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("2026-06-25T20:00:00");
  const [endDate, setEndDate] = useState("2026-06-25T23:00:00");
  const [city, setCity] = useState("Aydın");
  const [district, setDistrict] = useState("Nazilli");
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [rules, setRules] = useState("");

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadCategories() {
    try {
      setLoadingCategories(true);

      const data = (await apiFetch("/api/Category")) as Category[];
      setCategories(data || []);

      if (data && data.length > 0) {
        setEventCategoryId(data[0].id.toString());
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Kategori Hatası", err.message);
      } else {
        Alert.alert("Kategori Hatası", "Kategoriler alınamadı.");
      }
    } finally {
      setLoadingCategories(false);
    }
  }

  async function handleCreateEvent() {
    if (
      !eventCategoryId.trim() ||
      !title.trim() ||
      !description.trim() ||
      !startDate.trim() ||
      !endDate.trim() ||
      !city.trim() ||
      !district.trim() ||
      !locationName.trim() ||
      !address.trim() ||
      !capacity.trim()
    ) {
      Alert.alert("Uyarı", "Zorunlu alanları doldurmalısın.");
      return;
    }

    const parsedCategoryId = Number(eventCategoryId);
    const parsedCapacity = Number(capacity);
    const parsedPrice = isPaid ? Number(price) : null;

    if (Number.isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
      Alert.alert("Uyarı", "Geçerli bir kategori seçmelisin.");
      return;
    }

    if (Number.isNaN(parsedCapacity) || parsedCapacity <= 0) {
      Alert.alert("Uyarı", "Kontenjan pozitif bir sayı olmalı.");
      return;
    }

    if (isPaid && (parsedPrice === null || Number.isNaN(parsedPrice) || parsedPrice < 0)) {
      Alert.alert("Uyarı", "Ücretli etkinlik için geçerli fiyat girmelisin.");
      return;
    }

    try {
      setSaving(true);

      const token = await getAuthToken();

      if (!token) {
        router.replace("/login" as any);
        return;
      }

      await apiFetch("/api/Event", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventCategoryId: parsedCategoryId,
          title,
          description,
          startDate,
          endDate,
          city,
          district,
          locationName,
          address,
          latitude: null,
          longitude: null,
          capacity: parsedCapacity,
          isPaid,
          price: parsedPrice,
          coverImageUrl,
          rules,
        }),
      });

      Alert.alert(
        "Başarılı",
        "Etkinlik oluşturuldu. Admin onayından sonra yayına alınacak."
      );

      router.back();
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Etkinlik Oluşturma Hatası", err.message);
      } else {
        Alert.alert(
          "Etkinlik Oluşturma Hatası",
          "Etkinlik oluşturulurken bir sorun oluştu."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  function selectCategory(id: number) {
    setEventCategoryId(id.toString());
  }

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  return (
    <AppScrollCanvas contentContainerStyle={styles.content}>
      <AppBackButton onPress={() => router.back()} />

      <SectionHeading
        eyebrow="Organizer stüdyosu"
        title="Yeni etkinlik oluştur"
        subtitle="İyi bir başlık, net zaman ve güçlü mekan bilgisiyle etkinliğini premium bir sunuma hazırla."
      />

      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>Kategori</Text>

        {loadingCategories ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={AppTheme.colors.accentDeep} />
            <Text style={styles.helpText}>Kategoriler yükleniyor...</Text>
          </View>
        ) : (
          <View style={styles.pillRow}>
            {categories.map((category) => (
              <ChoicePill
                key={category.id}
                label={category.name}
                active={eventCategoryId === category.id.toString()}
                onPress={() => selectCategory(category.id)}
              />
            ))}
          </View>
        )}

        <View style={styles.formStack}>
          <AppInput
            label="Başlık"
            value={title}
            onChangeText={setTitle}
            placeholder="Örn: Nazilli Tavla Turnuvası"
          />

          <AppInput
            label="Açıklama"
            value={description}
            onChangeText={setDescription}
            placeholder="Etkinliğin kısa ama güçlü hikayesi"
            multiline
          />

          <AppInput
            label="Başlangıç tarihi"
            value={startDate}
            onChangeText={setStartDate}
            placeholder="2026-06-25T20:00:00"
            autoCapitalize="none"
            helpText="Format: YYYY-MM-DDTHH:mm:ss"
          />

          <AppInput
            label="Bitiş tarihi"
            value={endDate}
            onChangeText={setEndDate}
            placeholder="2026-06-25T23:00:00"
            autoCapitalize="none"
          />

          <View style={styles.inlineFields}>
            <View style={styles.inlineField}>
              <AppInput
                label="Şehir"
                value={city}
                onChangeText={setCity}
                placeholder="Aydın"
              />
            </View>
            <View style={styles.inlineField}>
              <AppInput
                label="İlçe"
                value={district}
                onChangeText={setDistrict}
                placeholder="Nazilli"
              />
            </View>
          </View>

          <AppInput
            label="Mekan adı"
            value={locationName}
            onChangeText={setLocationName}
            placeholder="Örn: Merkez Cafe"
          />

          <AppInput
            label="Adres"
            value={address}
            onChangeText={setAddress}
            placeholder="Etkinlik adresi"
            multiline
          />

          <AppInput
            label="Kontenjan"
            value={capacity}
            onChangeText={setCapacity}
            placeholder="32"
            keyboardType="numeric"
          />

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Ücret durumu</Text>
            <View style={styles.pillRow}>
              <ChoicePill
                label="Ücretsiz"
                active={!isPaid}
                onPress={() => setIsPaid(false)}
              />
              <ChoicePill
                label="Ücretli"
                active={isPaid}
                onPress={() => setIsPaid(true)}
              />
            </View>
          </View>

          {isPaid ? (
            <AppInput
              label="Fiyat"
              value={price}
              onChangeText={setPrice}
              placeholder="150"
              keyboardType="numeric"
            />
          ) : null}

          <AppInput
            label="Kapak görsel URL"
            value={coverImageUrl}
            onChangeText={setCoverImageUrl}
            placeholder="https://example.com/event.jpg"
            autoCapitalize="none"
            helpText="Zorunlu değil."
          />

          <AppInput
            label="Kurallar"
            value={rules}
            onChangeText={setRules}
            placeholder="Katılım kuralları ve özel notlar"
            multiline
          />
        </View>

        <PrimaryButton
          label="Etkinliği Oluştur"
          onPress={handleCreateEvent}
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
    gap: 18,
  },
  sectionTitle: {
    color: AppTheme.colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  loadingBox: {
    alignItems: "center",
    gap: 8,
  },
  helpText: {
    color: AppTheme.colors.textSoft,
    fontSize: 12,
    fontFamily: Fonts.sans,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  formStack: {
    gap: 14,
  },
  inlineFields: {
    flexDirection: "row",
    gap: 10,
  },
  inlineField: {
    flex: 1,
  },
  fieldBlock: {
    gap: 10,
  },
  fieldLabel: {
    color: AppTheme.colors.text,
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
  },
});
