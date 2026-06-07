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
import type { AuthResponse } from "../types/api";

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
        message: "Tum alanlari doldurmalisin.",
        tone: "warning",
      });
      return;
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      await appDialog.showMessage({
        title: "Sifre yetersiz",
        message: "Sifre en az 8 karakter olmali, harf ve rakam icermeli.",
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
      })) as AuthResponse;

      await saveAuthData(data.token, data);

      await appDialog.showMessage({
        title: "Hesabin hazir",
        message: "Kayit tamamlandi. Simdi kesfetmeye baslayabilirsin.",
        tone: "success",
      });

      router.replace("/");
    } catch (err: unknown) {
      await appDialog.showMessage({
        title: "Kayit hatasi",
        message:
          err instanceof Error ? err.message : "Kayit olurken bir sorun olustu.",
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScrollCanvas contentContainerStyle={styles.content}>
      <HeroCard
        eyebrow="BiKatile Katil"
        title="Sehrindeki iyi planlari kacirma."
        description="BiKatil hesabini olustur, etkinliklere katil, organizer ol ve kendi toplulugunu buyut."
      >
        <View style={styles.heroFooter}>
          <Text style={styles.heroCaption}>
            Hizli baslangic, sicak topluluk ve daha canli bir sehir akisi.
          </Text>
          <Image
            source={require("../../assets/images/logo-glow.png")}
            style={styles.heroGlow}
            contentFit="contain"
          />
        </View>
      </HeroCard>

      <AppCard style={styles.formCard}>
        <Text style={styles.formTitle}>BiKatil hesabini olustur</Text>
        <Text style={styles.formSubtitle}>
          Birkac bilgiyle kaydol ve sana yakin etkinliklere kolayca katil.
        </Text>

        <View style={styles.formStack}>
          <AppInput
            label="Ad soyad"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Omer Yarali"
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
            label="Sifre"
            value={password}
            onChangeText={setPassword}
            placeholder="En az 8 karakter, harf ve rakam"
            secureTextEntry
          />
        </View>

        <PrimaryButton label="Kaydi Tamamla" onPress={handleRegister} loading={loading} />
        <SecondaryButton
          label="Zaten Hesabim Var"
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
