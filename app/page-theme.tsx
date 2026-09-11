import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { showMessage } from "@/components/alert";
import { persistThemeImage } from "@/components/pageTheme/persistThemeImage";
import { PageThemeScope } from "@/components/pageTheme/PageThemeScope";
import { Screen, Text, View, useThemeColors } from "@/components/Themed";
import Card from "@/components/ui/Card";
import ChipSelect from "@/components/ui/ChipSelect";
import ColorField from "@/components/ui/ColorField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import {
  isPageThemeId,
} from "@/constants/pageTheme";
import { isThemePackId, listThemePacks, pageDefaultsForPack } from "@/constants/themePack";
import { Layout, Space, Type } from "@/constants/theme";
import { useColorScheme } from "@/components/useColorScheme";
import usePageThemeStore from "@/stores/usePageThemeStore";
import useThemePackStore from "@/stores/useThemePackStore";

export default function PageThemeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const scheme = useColorScheme();
  const params = useLocalSearchParams<{ page?: string | string[] }>();
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const pageId = isPageThemeId(rawPage) ? rawPage : null;
  const theme = usePageThemeStore((state) =>
    pageId ? state.themes[pageId] : undefined,
  );
  const setPageTheme = usePageThemeStore((state) => state.setPageTheme);
  const resetPageTheme = usePageThemeStore((state) => state.resetPageTheme);
  const packId = useThemePackStore((state) => state.packId);
  const setPackId = useThemePackStore((state) => state.setPackId);
  const [picking, setPicking] = useState(false);

  const pageTitle = useMemo(() => {
    if (!pageId) return "";
    const titles: Record<typeof pageId, string> = {
      dicejob: t("tabs.jobs"),
      stock: t("tabs.stock"),
      "material-types": t("tabs.materialTypes"),
      "colour-types": t("tabs.colourTypes"),
      "production-methods": t("tabs.productionMethods"),
      "dice-number-colours": t("tabs.diceNumberColours"),
      maintenance: t("tabs.maintenance"),
    };
    return titles[pageId];
  }, [pageId, t]);

  if (!pageId || !theme) {
    return (
      <PageThemeScope pageId={pageId}>
        <Screen>
          <View style={styles.content}>
            <Text style={Type.heading}>{t("pageTheme.missingPage")}</Text>
          </View>
        </Screen>
      </PageThemeScope>
    );
  }

  if (scheme === "dark") {
    return (
      <PageThemeScope pageId={pageId}>
        <Screen>
          <View style={styles.content}>
            <Text style={Type.heading}>{t("pageTheme.nightLocked")}</Text>
            <PrimaryButton title={t("common.done")} onPress={() => router.back()} />
          </View>
        </Screen>
      </PageThemeScope>
    );
  }

  const defaults = pageDefaultsForPack(packId, pageId);

  const handlePickImage = async () => {
    setPicking(true);
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showMessage(t("common.error"), t("pageTheme.permissionDenied"));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.6,
        allowsEditing: false,
        base64: true,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset) return;

      const imageUri = await persistThemeImage(pageId, asset.uri, {
        base64: asset.base64,
        mimeType: asset.mimeType,
      });
      await setPageTheme(pageId, { imageUri });
    } catch (error) {
      console.warn(error);
      showMessage(t("common.error"), t("pageTheme.imageError"));
    } finally {
      setPicking(false);
    }
  };

  return (
    <PageThemeScope pageId={pageId}>
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <ChipSelect
          label={t("pageTheme.appTheme")}
          value={packId}
          onChange={(value) => {
            if (isThemePackId(value)) void setPackId(value);
          }}
          options={listThemePacks().map((pack) => ({
            value: pack.id,
            label: pack.name,
          }))}
        />
        <Text style={Type.heading}>
          {t("pageTheme.forPage", { page: pageTitle })}
        </Text>
        <Card>
          <View
            style={[
              styles.preview,
              { backgroundColor: theme.background ?? defaults.background },
            ]}
          >
            {theme.imageUri ? (
              <Image
                source={{ uri: theme.imageUri }}
                style={styles.previewImage}
                resizeMode={theme.imageMode === "tile" ? "repeat" : "center"}
              />
            ) : null}
            <Text
              style={[
                Type.heading,
                { color: theme.foreground ?? defaults.foreground },
              ]}
            >
              {t("pageTheme.preview")}
            </Text>
          </View>
          <ColorField
            label={t("pageTheme.foreground")}
            value={theme.foreground}
            fallback={defaults.foreground}
            onChange={(foreground) => void setPageTheme(pageId, { foreground })}
          />
          <ColorField
            label={t("pageTheme.background")}
            value={theme.background}
            fallback={defaults.background}
            onChange={(background) => void setPageTheme(pageId, { background })}
          />
          <ChipSelect
            label={t("pageTheme.imageMode")}
            value={theme.imageMode}
            onChange={(imageMode) =>
              void setPageTheme(pageId, {
                imageMode: imageMode === "tile" ? "tile" : "center",
              })
            }
            options={[
              { value: "center", label: t("pageTheme.centered") },
              { value: "tile", label: t("pageTheme.tiled") },
            ]}
          />
          <View style={styles.actions}>
            <PrimaryButton
              title={t("pageTheme.chooseImage")}
              onPress={() => void handlePickImage()}
              disabled={picking}
            />
            {theme.imageUri ? (
              <PrimaryButton
                title={t("pageTheme.removeImage")}
                onPress={() => void setPageTheme(pageId, { imageUri: null })}
                variant="destructive"
              />
            ) : null}
            <PrimaryButton
              title={t("pageTheme.reset")}
              onPress={() => void resetPageTheme(pageId)}
            />
            <PrimaryButton
              title={t("common.done")}
              onPress={() => router.back()}
            />
          </View>
        </Card>
        <Text style={[Type.hint, { color: colors.muted }]}>
          {t("pageTheme.savedHint")}
        </Text>
      </ScrollView>
    </Screen>
    </PageThemeScope>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Layout.screenGutter,
    gap: Space[4],
    paddingBottom: Layout.listBottom,
  },
  preview: {
    minHeight: 88,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Space[3],
  },
  previewImage: {
    ...StyleSheet.absoluteFill,
    opacity: 0.7,
  },
  actions: {
    gap: Space[3],
    marginTop: Space[2],
  },
});
