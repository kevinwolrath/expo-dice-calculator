/** Native pixel size of theme `banner.jpg` (2048×558). */
export const BANNER_IMAGE_SIZE = { width: 2048, height: 558 } as const;

export const BANNER_ASPECT_RATIO =
  BANNER_IMAGE_SIZE.width / BANNER_IMAGE_SIZE.height;

/** Inner wooden sign, as fractions of the banner (not the viewport). */
export const SIGN_INSET = {
  left: "25.5%",
  right: "25.5%",
  top: "22%",
  bottom: "33%",
} as const;
