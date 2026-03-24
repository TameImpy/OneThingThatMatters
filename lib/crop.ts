/** Base display height (px) used for the art image in both email and preview. */
export const ART_BASE_HEIGHT = 300

/**
 * Returns the visible height in pixels after cropping `cropBottom` percent
 * from the bottom of the art image.
 *
 * @param cropBottom - percentage to remove from the bottom (0–100)
 */
export function artCropHeight(cropBottom: number | undefined): number {
  if (!cropBottom || cropBottom <= 0) return ART_BASE_HEIGHT
  if (cropBottom >= 100) return 0
  return Math.round(ART_BASE_HEIGHT * (1 - cropBottom / 100))
}
