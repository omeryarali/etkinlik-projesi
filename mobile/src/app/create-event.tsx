import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
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
      Alert.alert("Uyarı", "Zorunlu alanları doldurmalısınız.");
      return;
    }

    const parsedCategoryId = Number(eventCategoryId);
    const parsedCapacity = Number(capacity);
    const parsedPrice = isPaid ? Number(price) : null;

    if (Number.isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
      Alert.alert("Uyarı", "Geçerli bir kategori seçmelisiniz.");
      return;
    }

    if (Number.isNaN(parsedCapacity) || parsedCapacity <= 0) {
      Alert.alert("Uyarı", "Kontenjan pozitif bir sayı olmalıdır.");
      return;
    }

    if (isPaid && (parsedPrice === null || Number.isNaN(parsedPrice) || parsedPrice < 0)) {
      Alert.alert("Uyarı", "Ücretli etkinlik için geçerli fiyat girmelisiniz.");
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
        "Etkinlik oluşturuldu. Admin onayından sonra yayına çıkacaktır."
      );

      router.back();
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Etkinlik Oluşturma Hatası", err.message);
      } else {
        Alert.alert(
          "Etkinlik Oluşturma Hatası",
          "Etkinlik oluşturulurken hata oluştu."
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
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButtonSmall} onPress={() => router.back()}>
          <Text style={styles.backButtonSmallText}>← Geri</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Etkinlik Oluştur</Text>
        <Text style={styles.subtitle}>
          Oluşturulan etkinlik admin onayından sonra yayınlanır
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Kategori</Text>

          {loadingCategories ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator />
              <Text style={styles.helpText}>Kategoriler yükleniyor...</Text>
            </View>
          ) : (
            <View style={styles.categoryList}>
              {categories.map((category) => {
                const selected = eventCategoryId === category.id.toString();

                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selected && styles.categoryButtonSelected,
                    ]}
                    onPress={() => selectCategory(category.id)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selected && styles.categoryButtonTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Başlık</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Örn: Nazilli Tavla Turnuvası"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Etkinlik açıklaması"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Başlangıç Tarihi</Text>
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="2026-06-25T20:00:00"
              autoCapitalize="none"
            />
            <Text style={styles.helpText}>Format: YYYY-MM-DDTHH:mm:ss</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Bitiş Tarihi</Text>
            <TextInput
              style={styles.input}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="2026-06-25T23:00:00"
              autoCapitalize="none"
            />
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Mekan Adı</Text>
            <TextInput
              style={styles.input}
              value={locationName}
              onChangeText={setLocationName}
              placeholder="Örn: Merkez Cafe"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Adres</Text>
            <TextInput
              style={[styles.input, styles.textAreaSmall]}
              value={address}
              onChangeText={setAddress}
              placeholder="Etkinlik adresi"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kontenjan</Text>
            <TextInput
              style={styles.input}
              value={capacity}
              onChangeText={setCapacity}
              placeholder="32"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ücret Durumu</Text>

            <View style={styles.paidRow}>
              <TouchableOpacity
                style={[
                  styles.paidButton,
                  !isPaid && styles.paidButtonSelected,
                ]}
                onPress={() => setIsPaid(false)}
              >
                <Text
                  style={[
                    styles.paidButtonText,
                    !isPaid && styles.paidButtonTextSelected,
                  ]}
                >
                  Ücretsiz
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paidButton,
                  isPaid && styles.paidButtonSelected,
                ]}
                onPress={() => setIsPaid(true)}
              >
                <Text
                  style={[
                    styles.paidButtonText,
                    isPaid && styles.paidButtonTextSelected,
                  ]}
                >
                  Ücretli
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {isPaid && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Fiyat</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="150"
                keyboardType="numeric"
              />
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kapak Görsel URL</Text>
            <TextInput
              style={styles.input}
              value={coverImageUrl}
              onChangeText={setCoverImageUrl}
              placeholder="https://example.com/event.jpg"
              autoCapitalize="none"
            />
            <Text style={styles.helpText}>Zorunlu değil.</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kurallar</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={rules}
              onChangeText={setRules}
              placeholder="Etkinlik kuralları"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleCreateEvent}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Etkinlik Oluştur</Text>
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  loadingBox: {
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  categoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryButtonSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  categoryButtonText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
  },
  categoryButtonTextSelected: {
    color: "#FFFFFF",
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
  textAreaSmall: {
    minHeight: 76,
  },
  helpText: {
    marginTop: 6,
    fontSize: 12,
    color: "#9CA3AF",
  },
  paidRow: {
    flexDirection: "row",
    gap: 10,
  },
  paidButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  paidButtonSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  paidButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
  },
  paidButtonTextSelected: {
    color: "#FFFFFF",
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