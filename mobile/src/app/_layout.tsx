import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Etkinlik Projesi",
        }}
      />

      <Stack.Screen
        name="login"
        options={{
          title: "Giriş Yap",
        }}
      />

      <Stack.Screen
        name="register"
        options={{
          title: "Kayıt Ol",
        }}
      />
    </Stack>
  );
}