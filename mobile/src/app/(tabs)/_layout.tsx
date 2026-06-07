import { Tabs, useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppTheme, Fonts, Shadows } from "../../constants/theme";
import { apiFetch } from "../../services/apiService";
import {
  getAuthToken,
  getAuthUser,
  saveAuthData,
  subscribeAuthChange,
} from "../../services/authStorage";
import type { AuthUser } from "../../types/api";

export default function TabsLayout() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const lastSyncAtRef = useRef(0);
  const syncInFlightRef = useRef(false);

  const loadStoredUser = useCallback(async () => {
    const token = await getAuthToken();

    if (!token) {
      setCurrentUser(null);
      return { token: null, storedUser: null };
    }

    const storedUser = await getAuthUser();
    setCurrentUser(storedUser);

    return { token, storedUser };
  }, []);

  const syncCurrentUser = useCallback(async (options?: { force?: boolean }) => {
    const { force = false } = options ?? {};
    const now = Date.now();
    const { token, storedUser } = await loadStoredUser();

    if (!token) {
      return;
    }

    if (syncInFlightRef.current) {
      return;
    }

    if (!force && now - lastSyncAtRef.current < 60000) {
      return;
    }

    syncInFlightRef.current = true;

    try {
      const freshUser = (await apiFetch("/api/Auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })) as AuthUser;

      lastSyncAtRef.current = Date.now();
      setCurrentUser(freshUser);

      if (JSON.stringify(storedUser) !== JSON.stringify(freshUser)) {
        await saveAuthData(token, freshUser);
      }
    } catch {
      lastSyncAtRef.current = Date.now();
      setCurrentUser(storedUser);
    } finally {
      syncInFlightRef.current = false;
    }
  }, [loadStoredUser]);

  useFocusEffect(
    useCallback(() => {
      void syncCurrentUser({ force: true });
    }, [syncCurrentUser])
  );

  useEffect(() => {
    return subscribeAuthChange(() => {
      void loadStoredUser();
    });
  }, [loadStoredUser]);

  const showOrganizerTab = currentUser?.role === "Organizer";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: {
          backgroundColor: AppTheme.colors.background,
        },
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
        tabBarActiveTintColor: AppTheme.colors.accentDeep,
        tabBarInactiveTintColor: AppTheme.colors.textSoft,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Keşfet",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              label="Keşfet"
              focused={focused}
              color={color}
              iconName={{
                ios: "safari.fill",
                android: "travel_explore",
                web: "travel_explore",
              }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="my-events"
        options={{
          title: "Etkinliklerim",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              label="Etkinliklerim"
              focused={focused}
              color={color}
              iconName={{
                ios: "calendar.badge.clock",
                android: "event_note",
                web: "event_note",
              }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="organizer-events"
        options={{
          title: "Organizer",
          href: showOrganizerTab ? "/organizer-events" : null,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              label="Organizer"
              focused={focused}
              color={color}
              iconName={{
                ios: "sparkles.rectangle.stack.fill",
                android: "dashboard_customize",
                web: "dashboard_customize",
              }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profilim",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              label="Profilim"
              focused={focused}
              color={color}
              iconName={{
                ios: "person.crop.circle.fill",
                android: "account_circle",
                web: "account_circle",
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  label,
  focused,
  color,
  iconName,
}: {
  label: string;
  focused: boolean;
  color: string;
  iconName: { ios: string; android: string; web: string };
}) {
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.iconShell, focused ? styles.iconShellFocused : null]}>
        <SymbolView
          name={iconName}
          size={20}
          tintColor={focused ? AppTheme.colors.white : color}
          weight="semibold"
        />
      </View>
      <Text style={[styles.iconLabel, focused ? styles.iconLabelFocused : null]}>
        {label}
      </Text>
      <View style={[styles.iconDot, focused ? styles.iconDotFocused : null]} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 98,
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderTopWidth: 0,
    backgroundColor: "transparent",
    elevation: 0,
  },
  tabBarBackground: {
    flex: 1,
    marginHorizontal: 10,
    marginBottom: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(168, 71, 52, 0.12)",
    backgroundColor: "rgba(255, 249, 242, 0.96)",
    ...Shadows.floating,
  },
  tabItem: {
    paddingTop: 2,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    minWidth: 74,
  },
  iconShell: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(246, 225, 216, 0.38)",
    borderWidth: 1,
    borderColor: "rgba(168, 71, 52, 0.08)",
  },
  iconShellFocused: {
    backgroundColor: AppTheme.colors.accent,
    borderColor: "rgba(168, 71, 52, 0.16)",
    transform: [{ translateY: -2 }, { scale: 1.04 }],
    ...Shadows.soft,
  },
  iconLabel: {
    color: AppTheme.colors.textSoft,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: Fonts.rounded,
  },
  iconLabelFocused: {
    color: AppTheme.colors.accentDeep,
  },
  iconDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "transparent",
  },
  iconDotFocused: {
    backgroundColor: AppTheme.colors.gold,
  },
});
