import { useAppearanceStore } from "@/stores/useAppearanceStore";

export const useColorScheme = () =>
  useAppearanceStore((state) => state.colorScheme);
