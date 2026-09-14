import {
  createContext,
  useCallback,
  useContext,
  useImperativeHandle,
  useRef,
  type Ref,
  type RefObject,
} from "react";
import { Platform, type View } from "react-native";

import { firstErrorKey } from "@/components/ui/fieldFocusOrder";

export type FieldFocusable = {
  focus: () => void;
};

export { firstErrorKey };

export const FormScrollContext = createContext<(host: View | null) => void>(
  () => {},
);

export const useFormScrollIntoView = () => useContext(FormScrollContext);

export const focusFirstError = <K extends string>(
  errors: Partial<Record<K, string | undefined>>,
  order: readonly K[],
  refs: Partial<Record<K, FieldFocusable | null>>,
) => {
  const key = firstErrorKey(errors, order);
  if (!key) return;
  const field = refs[key];
  const run = () => field?.focus();
  requestAnimationFrame(() => requestAnimationFrame(run));
};

export const useFormFieldRefs = <K extends string>() => {
  const refs = useRef<Partial<Record<K, FieldFocusable | null>>>({});
  const binders = useRef<
    Partial<Record<K, (handle: FieldFocusable | null) => void>>
  >({});
  const bind = useCallback((key: K) => {
    const existing = binders.current[key];
    if (existing) return existing;
    const binder = (handle: FieldFocusable | null) => {
      refs.current[key] = handle;
    };
    binders.current[key] = binder;
    return binder;
  }, []);
  const focusError = useCallback(
    (
      errors: Partial<Record<K, string | undefined>>,
      order: readonly K[],
    ) => focusFirstError(errors, order, refs.current),
    [],
  );
  return { bind, focusError };
};

const asElement = (host: View): HTMLElement | null => {
  const node = host as unknown as HTMLElement;
  return node && typeof node.scrollIntoView === "function" ? node : null;
};

const scrollWebHost = (host: View) => {
  asElement(host)?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};

export const useFieldFocus = (
  focusRef: Ref<FieldFocusable> | undefined,
  hostRef: RefObject<View | null>,
  activate: () => void,
) => {
  const scrollNative = useFormScrollIntoView();
  useImperativeHandle(
    focusRef,
    () => ({
      focus: () => {
        const host = hostRef.current;
        try {
          if (host) {
            if (Platform.OS === "web") scrollWebHost(host);
            else scrollNative(host);
          }
        } finally {
          activate();
        }
      },
    }),
    [activate, scrollNative],
  );
};
