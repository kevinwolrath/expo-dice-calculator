/** Stack the lock accessory under the field below this card width. */
export const LOCK_FIELD_STACK_MAX_WIDTH = 330;

export const shouldStackLockField = (width: number) =>
  width > 0 && width < LOCK_FIELD_STACK_MAX_WIDTH;
