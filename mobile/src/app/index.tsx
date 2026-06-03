import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiFetch } from "../services/apiService";
import { clearAuthData, getAuthUser } from "../services/authStorage";

type Category = {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
};

type AuthUser = {
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

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");

      const savedUser = await getAuthUser();
      setUser(savedUser);

      const data = await apiFetch("/api/Category");
      setCategories(data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Veriler alınamadı.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await clearAuthData();
    setUser(null);
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Etkinlik Projesi</Text>

      {user ? (
        <View style={styles.userBox}>
          <Text style={styles.userTitle}>Hoş geldin, {user.fullName}</Text>
          <Text style={styles.userText}>Rol: {user.role}</Text>

          <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.authButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => router.push("/login" as any)}
          >
            <Text style={styles.primaryButtonText}>Giriş Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => router.push("/register" as any)}
          >
            <Text style={styles.secondaryButtonText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.subtitle}>Kategoriler</Text>

      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator />
          <Text style={styles.infoText}>Kategoriler yükleniyor...</Text>
        </View>
      )}

      {!loading && error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!loading && !error && (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardText}>
                {item.description || "Açıklama yok"}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.infoText}>Kategori bulunamadı.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 24,
    paddingTop: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 24,
    marginBottom: 12,
  },
  authButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  userBox: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  userTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  userText: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
  },
  logoutButton: {
    marginTop: 14,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  centerBox: {
    marginTop: 24,
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    color: "#6B7280",
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 14,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  cardText: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
  },
});