import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";

import { AppDialogProvider } from "../components/app-dialog";
import { AppTheme } from "../constants/theme";

export default function RootLayout() {
  return (
    <AppDialogProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: AppTheme.colors.background,
          },
          animation: "slide_from_right",
        }}
      />
    </AppDialogProvider>
  );
}
