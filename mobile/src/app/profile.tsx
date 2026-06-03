import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { apiFetch } from "../services/apiService";
import { getAuthToken } from "../services/authStorage";

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

export default function ProfileScreen() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const token = await getAuthToken();

      if (!token) {
        router.replace("/login" as any);
        return;
      }

      const data = (await apiFetch("/api/Auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })) as AuthUser;

      setUser(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Profil bilgileri alınamadı.");
      }
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateValue: string) {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator />
        <Text style={styles.infoText}>Profil yükleniyor...</Text>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Profil bulunamadı."}</Text>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButtonSmall} onPress={() => router.back()}>
        <Text style={styles.backButtonSmallText}>← Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Profilim</Text>
      <Text style={styles.subtitle}>Hesap bilgilerin</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.fullName?.charAt(0)?.toUpperCase() || "U"}
          </Text>
        </View>

        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user.role}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <InfoRow label="Ad Soyad" value={user.fullName} />
        <InfoRow label="E-posta" value={user.email} />
        <InfoRow label="Telefon" value={user.phoneNumber || "-"} />
        <InfoRow label="Rol" value={user.role} />
        <InfoRow label="Durum" value={user.isActive ? "Aktif" : "Pasif"} />
        <InfoRow label="Kayıt Tarihi" value={formatDate(user.createdAt)} />
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => router.push("/profile-edit" as any)}
      >
        <Text style={styles.editButtonText}>Profili Düzenle</Text>
      </TouchableOpacity>
        {user.role === "Participant" && (
        <TouchableOpacity
            style={styles.organizerApplyButton}
            onPress={() => router.push("/organizer-apply" as any)}
        >
            <Text style={styles.organizerApplyButtonText}>
            Organizatör Başvurusu Yap
            </Text>
        </TouchableOpacity>
        )}
      <TouchableOpacity
        style={styles.changePasswordButton}
        onPress={() => router.push("/change-password" as any)}
        >
        <Text style={styles.changePasswordButtonText}>Şifre Değiştir</Text>
       </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  content: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  infoText: {
    color: "#6B7280",
    fontSize: 14,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 15,
    textAlign: "center",
  },
  backButton: {
    marginTop: 10,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
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
  },
  profileCard: {
    marginTop: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  name: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  email: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
  },
  badge: {
    marginTop: 12,
    backgroundColor: "#DBEAFE",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "800",
  },
  infoCard: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  infoValue: {
    marginTop: 3,
    fontSize: 15,
    color: "#6B7280",
  },
  editButton: {
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  changePasswordButton: {
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    borderColor: "#2563EB",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
    changePasswordButtonText: {
        color: "#2563EB",
        fontSize: 16,
        fontWeight: "800",
    },
    organizerApplyButton: {
  marginTop: 10,
  backgroundColor: "#111827",
  borderRadius: 14,
  paddingVertical: 15,
  alignItems: "center",
},
organizerApplyButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "800",
},
});