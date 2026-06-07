import { router } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { appDialog } from "../components/app-dialog";
import {
  AppCard,
  AppInput,
  AppScrollCanvas,
  HeroCard,
  PrimaryButton,
  SecondaryButton,
} from "../components/app-ui";
import { AppTheme, Fonts } from "../constants/theme";
import { apiFetch } from "../services/apiService";
import { saveAuthData } from "../services/authStorage";
import type { AuthUser } from "../types/api";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
      await appDialog.showMessage({
        title: "Eksik bilgi",
        message: "Tüm alanları doldurmalısın.",
        tone: "warning",
      });
      return;
    }

    if (password.length < 6) {
      await appDialog.showMessage({
        title: "Şifre kısa",
        message: "Şifre en az 6 karakter olmalı.",
        tone: "warning",
      });
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
      })) as AuthUser;

      await saveAuthData(data.token, data);

      await appDialog.showMessage({
        title: "Hesabın hazır",
        message: "Kayıt tamamlandı. Şimdi keşfetmeye başlayabilirsin.",
        tone: "success",
      });

      router.replace("/");
    } catch (err: unknown) {
      await appDialog.showMessage({
        title: "Kayıt hatası",
        message:
          err instanceof Error ? err.message : "Kayıt olurken bir sorun oluştu.",
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScrollCanvas contentContainerStyle={styles.content}>
      <HeroCard
        eyebrow="BiKatıl’a Katıl"
        title="Şehrindeki iyi planları kaçırma."
        description="BiKatıl hesabını oluştur, etkinliklere katıl, organizer ol ve kendi topluluğunu büyüt."
      >
        <View style={styles.heroFooter}>
          <Text style={styles.heroCaption}>
            Hızlı başlangıç, sıcak topluluk ve daha canlı bir şehir akışı.
          </Text>
          <Image
            source={require("../../assets/images/logo-glow.png")}
            style={styles.heroGlow}
            contentFit="contain"
          />
        </View>
      </HeroCard>

      <AppCard style={styles.formCard}>
        <Text style={styles.formTitle}>BiKatıl hesabını oluştur</Text>
        <Text style={styles.formSubtitle}>
          Birkaç bilgiyle kaydol ve sana yakın etkinliklere kolayca bi’ katıl.
        </Text>

        <View style={styles.formStack}>
          <AppInput
            label="Ad soyad"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ömer Yaralı"
          />

          <AppInput
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@mail.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <AppInput
            label="Telefon"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="05555555555"
            keyboardType="phone-pad"
          />

          <AppInput
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            placeholder="En az 6 karakter"
            secureTextEntry
          />
        </View>

        <PrimaryButton label="Kaydı Tamamla" onPress={handleRegister} loading={loading} />
        <SecondaryButton
          label="Zaten Hesabım Var"
          onPress={() => router.push("/login" as any)}
        />
      </AppCard>
    </AppScrollCanvas>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
  },
  heroFooter: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  heroCaption: {
    flex: 1,
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  heroGlow: {
    width: 88,
    height: 88,
    opacity: 0.9,
  },
  formCard: {
    gap: 18,
  },
  formTitle: {
    color: AppTheme.colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontFamily: Fonts.display,
    fontWeight: "700",
  },
  formSubtitle: {
    marginTop: 4,
    color: AppTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: Fonts.sans,
  },
  formStack: {
    gap: 14,
  },
});
