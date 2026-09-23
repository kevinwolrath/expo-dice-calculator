/** Stack Add / Save / Cancel below this inner width (points). */
export const FORM_ACTION_STACK_MAX_WIDTH = 380;

/** Minimum width a labelled action keeps before the row wraps or stacks. */
export const FORM_ACTION_MIN_WIDTH = 112;

export const shouldStackFormActions = (width: number) =>
  width > 0 && width < FORM_ACTION_STACK_MAX_WIDTH;

/** Action labels must wrap or reflow — never ellipsis. */
export const ACTION_LABEL_NUMBER_OF_LINES = undefined;
