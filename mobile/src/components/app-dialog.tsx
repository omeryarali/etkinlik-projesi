import { SymbolView } from "expo-symbols";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  View,
  type AlertButton,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";

import { AppTheme, Fonts, Shadows } from "../constants/theme";
import { DangerButton, InkButton, PrimaryButton, SecondaryButton } from "./app-ui";

type DialogTone = "info" | "success" | "warning" | "danger";
type DialogActionVariant = "primary" | "secondary" | "danger" | "ink";

type DialogAction = {
  label: string;
  value?: string;
  variant?: DialogActionVariant;
  onPress?: () => void;
};

type DialogOptions = {
  title: string;
  message: string;
  tone?: DialogTone;
  actions?: DialogAction[];
};

type ConfirmOptions = {
  title: string;
  message: string;
  tone?: DialogTone;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: DialogActionVariant;
};

type DialogContextValue = {
  openDialog: (options: DialogOptions) => Promise<string>;
  showMessage: (options: {
    title: string;
    message: string;
    tone?: DialogTone;
    buttonLabel?: string;
  }) => Promise<void>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

type DialogState = DialogOptions & {
  actions: DialogAction[];
};

const AppDialogContext = createContext<DialogContextValue | null>(null);
let dialogApi: DialogContextValue | null = null;

const toneMeta: Record<
  DialogTone,
  {
    badgeColor: string;
    label: string;
    icon: { ios: string; android: string; web: string };
  }
> = {
  info: {
    badgeColor: AppTheme.colors.surfaceStrong,
    label: "Bilgi",
    icon: { ios: "sparkles", android: "auto_awesome", web: "auto_awesome" },
  },
  success: {
    badgeColor: AppTheme.colors.successSoft,
    label: "Başarılı",
    icon: {
      ios: "checkmark.seal.fill",
      android: "check_circle",
      web: "check_circle",
    },
  },
  warning: {
    badgeColor: AppTheme.colors.warning,
    label: "Uyarı",
    icon: {
      ios: "exclamationmark.triangle.fill",
      android: "warning",
      web: "warning",
    },
  },
  danger: {
    badgeColor: AppTheme.colors.dangerSoft,
    label: "Dikkat",
    icon: {
      ios: "xmark.octagon.fill",
      android: "error",
      web: "error",
    },
  },
};

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const resolverRef = useRef<((value: string) => void) | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const closeDialog = useCallback(
    (value: string) => {
      const selectedAction = dialog?.actions.find(
        (item) => (item.value ?? item.label) === value
      );

      setDialog(null);

      const resolve = resolverRef.current;
      resolverRef.current = null;
      resolve?.(value);
      selectedAction?.onPress?.();
    },
    [dialog]
  );

  const openDialog = useCallback((options: DialogOptions) => {
    return new Promise<string>((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        ...options,
        tone: options.tone ?? "info",
        actions:
          options.actions && options.actions.length > 0
            ? options.actions
            : [{ label: "Tamam", value: "confirm", variant: "primary" }],
      });
    });
  }, []);

  const showMessage = useCallback(
    async ({
      title,
      message,
      tone = "info",
      buttonLabel = "Tamam",
    }: {
      title: string;
      message: string;
      tone?: DialogTone;
      buttonLabel?: string;
    }) => {
      await openDialog({
        title,
        message,
        tone,
        actions: [{ label: buttonLabel, value: "confirm", variant: "primary" }],
      });
    },
    [openDialog]
  );

  const confirm = useCallback(
    async ({
      title,
      message,
      tone = "warning",
      confirmLabel = "Devam Et",
      cancelLabel = "Vazgeç",
      confirmVariant = "primary",
    }: ConfirmOptions) => {
      const result = await openDialog({
        title,
        message,
        tone,
        actions: [
          { label: cancelLabel, value: "cancel", variant: "secondary" },
          { label: confirmLabel, value: "confirm", variant: confirmVariant },
        ],
      });

      return result === "confirm";
    },
    [openDialog]
  );

  const contextValue = useMemo(
    () => ({
      openDialog,
      showMessage,
      confirm,
    }),
    [confirm, openDialog, showMessage]
  );

  useEffect(() => {
    dialogApi = contextValue;

    return () => {
      if (dialogApi === contextValue) {
        dialogApi = null;
      }
    };
  }, [contextValue]);

  useEffect(() => {
    const originalAlert = Alert.alert;

    Alert.alert = (title, message, buttons) => {
      const normalizedButtons =
        buttons && buttons.length > 0 ? buttons : undefined;

      void openDialog({
        title: title || "Bilgi",
        message: message || "",
        tone: inferTone(title, normalizedButtons),
        actions: mapAlertButtons(normalizedButtons),
      });
    };

    return () => {
      Alert.alert = originalAlert;
    };
  }, [openDialog]);

  const meta = dialog ? toneMeta[dialog.tone ?? "info"] : null;

  return (
    <AppDialogContext.Provider value={contextValue}>
      {children}

      <Modal
        visible={!!dialog}
        transparent
        animationType="none"
        onRequestClose={() => closeDialog("dismiss")}
      >
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(140)}
          style={styles.scrim}
        >
          <View style={styles.glowOne} />
          <View style={styles.glowTwo} />

          {dialog && meta ? (
            <Animated.View
              entering={ZoomIn.springify().damping(17).stiffness(180)}
              exiting={ZoomOut.duration(150)}
              style={styles.card}
            >
              <View style={styles.headerRow}>
                <View
                  style={[styles.badge, { backgroundColor: meta.badgeColor }]}
                >
                  <SymbolView
                    name={meta.icon}
                    size={18}
                    tintColor={AppTheme.colors.ink}
                    weight="semibold"
                  />
                  <Text style={styles.badgeText}>{meta.label}</Text>
                </View>

                <View style={styles.headerAccent} />
              </View>

              <Text style={styles.title}>{dialog.title}</Text>
              <Text style={styles.message}>{dialog.message}</Text>

              <View
                style={[
                  styles.actions,
                  dialog.actions.length === 2 ? styles.actionsRow : null,
                ]}
              >
                {dialog.actions.map((action) => (
                  <DialogActionButton
                    key={`${action.label}-${action.value ?? action.label}`}
                    action={action}
                    compact={dialog.actions.length === 2}
                    onPress={() => closeDialog(action.value ?? action.label)}
                  />
                ))}
              </View>
            </Animated.View>
          ) : null}
        </Animated.View>
      </Modal>
    </AppDialogContext.Provider>
  );
}

export function useAppDialog() {
  const context = useContext(AppDialogContext);

  if (!context) {
    throw new Error("useAppDialog must be used within AppDialogProvider.");
  }

  return context;
}

export const appDialog = {
  openDialog(options: DialogOptions) {
    if (!dialogApi) {
      return Promise.reject(new Error("Dialog provider is not ready."));
    }

    return dialogApi.openDialog(options);
  },
  showMessage(options: {
    title: string;
    message: string;
    tone?: DialogTone;
    buttonLabel?: string;
  }) {
    if (!dialogApi) {
      return Promise.reject(new Error("Dialog provider is not ready."));
    }

    return dialogApi.showMessage(options);
  },
  confirm(options: ConfirmOptions) {
    if (!dialogApi) {
      return Promise.reject(new Error("Dialog provider is not ready."));
    }

    return dialogApi.confirm(options);
  },
};

function mapAlertButtons(buttons?: AlertButton[]) {
  if (!buttons || buttons.length === 0) {
    return [{ label: "Tamam", value: "confirm", variant: "primary" as const }];
  }

  return buttons.map((button, index) => ({
    label: button.text || `Seçenek ${index + 1}`,
    value: button.text || `option-${index + 1}`,
    variant:
      button.style === "destructive"
        ? ("danger" as const)
        : button.style === "cancel"
          ? ("secondary" as const)
          : ("primary" as const),
    onPress: button.onPress,
  }));
}

function inferTone(title?: string, buttons?: AlertButton[]): DialogTone {
  const normalizedTitle = title?.toLocaleLowerCase("tr-TR") ?? "";

  if (buttons?.some((button) => button.style === "destructive")) {
    return "danger";
  }

  if (
    normalizedTitle.includes("başarılı") ||
    normalizedTitle.includes("hoş geldin") ||
    normalizedTitle.includes("tamam")
  ) {
    return "success";
  }

  if (
    normalizedTitle.includes("hata") ||
    normalizedTitle.includes("iptal") ||
    normalizedTitle.includes("dikkat")
  ) {
    return "danger";
  }

  if (
    normalizedTitle.includes("uyarı") ||
    normalizedTitle.includes("gerekli") ||
    normalizedTitle.includes("onay")
  ) {
    return "warning";
  }

  if (buttons && buttons.length > 1) {
    return "warning";
  }

  return "info";
}

function DialogActionButton({
  action,
  compact,
  onPress,
}: {
  action: DialogAction;
  compact: boolean;
  onPress: () => void;
}) {
  const style = compact ? styles.compactAction : undefined;

  switch (action.variant) {
    case "secondary":
      return <SecondaryButton label={action.label} onPress={onPress} style={style} />;
    case "danger":
      return <DangerButton label={action.label} onPress={onPress} style={style} />;
    case "ink":
      return <InkButton label={action.label} onPress={onPress} style={style} />;
    default:
      return <PrimaryButton label={action.label} onPress={onPress} style={style} />;
  }
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(36, 27, 24, 0.54)",
  },
  glowOne: {
    position: "absolute",
    top: "24%",
    left: 10,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(214, 106, 74, 0.16)",
  },
  glowTwo: {
    position: "absolute",
    bottom: "22%",
    right: 18,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: "rgba(184, 135, 60, 0.12)",
  },
  card: {
    borderRadius: AppTheme.radii.xl,
    borderWidth: 1,
    borderColor: "rgba(168, 71, 52, 0.14)",
    backgroundColor: AppTheme.colors.surface,
    padding: 20,
    gap: 14,
    ...Shadows.floating,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: AppTheme.radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: AppTheme.colors.ink,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    fontFamily: Fonts.rounded,
  },
  headerAccent: {
    width: 42,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(214, 106, 74, 0.18)",
  },
  title: {
    color: AppTheme.colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    fontFamily: Fonts.display,
  },
  message: {
    color: AppTheme.colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    fontFamily: Fonts.sans,
  },
  actions: {
    gap: 10,
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: "row",
  },
  compactAction: {
    flex: 1,
  },
});
