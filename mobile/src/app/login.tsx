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
  InkButton,
  SecondaryButton,
} from "../components/app-ui";
import { AppTheme, Fonts } from "../constants/theme";
import { apiFetch } from "../services/apiService";
import { saveAuthData } from "../services/authStorage";
import type { AuthResponse } from "../types/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      await appDialog.showMessage({
        title: "Eksik bilgi",
        message: "E-posta ve sifre alanlarini doldurmalisin.",
        tone: "warning",
      });
      return;
    }

    try
    {
      setLoading(true);

      const data = (await apiFetch("/api/Auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      })) as AuthResponse;

      await saveAuthData(data.token, data);

      await appDialog.showMessage({
        title: "Hos geldin",
        message: "Hesabina giris yapildi. Simdi kesif akisina gecebilirsin.",
        tone: "success",
      });

      router.replace("/");
    }
    catch (err: unknown)
    {
      await appDialog.showMessage({
        title: "Giris hatasi",
        message:
          err instanceof Error ? err.message : "Giris yapilirken bir sorun olustu.",
        tone: "danger",
      });
    }
    finally
    {
      setLoading(false);
    }
  }

  return (
    <AppScrollCanvas contentContainerStyle={styles.content}>
      <HeroCard
        eyebrow="BiKatil"
        title="Sehrin ritmine BiKatil."
        description="Yakindaki turnuvalari, bulusmalari ve sosyal planlari BiKatil akisi icinde kesfet."
      >
        <View style={styles.heroFooter}>
          <View style={styles.heroTextColumn}>
            <Text style={styles.heroCaption}>
              Yerel kesif, guclu topluluk ve tek dokunusla katilim deneyimi.
            </Text>
          </View>
          <Image
            source={require("../../assets/images/logo-glow.png")}
            style={styles.heroGlow}
            contentFit="contain"
          />
        </View>
      </HeroCard>

      <AppCard style={styles.formCard}>
        <Text style={styles.formTitle}>BiKatile tekrar hos geldin</Text>
        <Text style={styles.formSubtitle}>
          Hesabinla giris yap, sana uygun akisi ac ve sehirde neler olduguna hemen bak.
        </Text>

        <View style={styles.formStack}>
          <AppInput
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@mail.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <AppInput
            label="Sifre"
            value={password}
            onChangeText={setPassword}
            placeholder="Sifren"
            secureTextEntry
          />
        </View>

        <InkButton label="Giris Yap" onPress={handleLogin} loading={loading} />
        <SecondaryButton
          label="Hesap Olustur"
          onPress={() => router.push("/register" as any)}
        />
      </AppCard>
    </AppScrollCanvas>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    justifyContent: "center",
    flexGrow: 1,
  },
  heroFooter: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  heroTextColumn: {
    flex: 1,
  },
  heroCaption: {
    color: AppTheme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  heroGlow: {
    width: 92,
    height: 92,
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
