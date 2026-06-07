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
import type { AuthUser } from "../types/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      await appDialog.showMessage({
        title: "Eksik bilgi",
        message: "E-posta ve şifre alanlarını doldurmalısın.",
        tone: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      const data = (await apiFetch("/api/Auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      })) as AuthUser;

      await saveAuthData(data.token, data);

      await appDialog.showMessage({
        title: "Hoş geldin",
        message: "Hesabına giriş yapıldı. Şimdi keşif akışı seni bekliyor.",
        tone: "success",
      });

      router.replace("/");
    } catch (err: unknown) {
      await appDialog.showMessage({
        title: "Giriş hatası",
        message:
          err instanceof Error ? err.message : "Giriş yapılırken bir sorun oluştu.",
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScrollCanvas contentContainerStyle={styles.content}>
      <HeroCard
        eyebrow="BiKatıl"
        title="Şehrin ritmine BiKatıl."
        description="Yakındaki turnuvaları, buluşmaları ve sosyal planları BiKatıl’ın seçkin akışında keşfet."
      >
        <View style={styles.heroFooter}>
          <View style={styles.heroTextColumn}>
            <Text style={styles.heroCaption}>
              Yerel keşif, güçlü topluluk ve tek dokunuşla katılım deneyimi.
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
        <Text style={styles.formTitle}>BiKatıl’a tekrar hoş geldin</Text>
        <Text style={styles.formSubtitle}>
          Hesabınla giriş yap, sana uygun akışı aç ve şehirde neler olduğuna hemen bak.
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
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            placeholder="Şifren"
            secureTextEntry
          />
        </View>

        <InkButton label="Giriş Yap" onPress={handleLogin} loading={loading} />
        <SecondaryButton
          label="Hesap Oluştur"
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
