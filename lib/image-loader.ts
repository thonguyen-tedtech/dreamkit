import type { ImageLoaderProps } from "next/image";

interface LocalImageVariant {
  readonly width: number;
  readonly height: number;
}

/**
 * Pre-generated resolutions that actually exist in public/images for each
 * local image this app references (a WordPress media export), sorted
 * ascending by width. Keep in sync with the files on disk.
 */
const LOCAL_IMAGE_VARIANTS: Readonly<Record<string, readonly LocalImageVariant[]>> = {
  "9231-1": [
    { width: 600, height: 400 },
    { width: 768, height: 512 },
    { width: 1200, height: 800 },
    { width: 1536, height: 1024 },
  ],
  "752-1": [
    { width: 600, height: 400 },
    { width: 768, height: 512 },
    { width: 1200, height: 800 },
    { width: 1536, height: 1024 },
  ],
  DSC01414: [
    { width: 600, height: 400 },
    { width: 768, height: 512 },
    { width: 1200, height: 800 },
  ],
  DSC00250: [
    { width: 600, height: 400 },
    { width: 768, height: 512 },
    { width: 1200, height: 800 },
  ],
  que: [
    { width: 600, height: 400 },
    { width: 768, height: 512 },
    { width: 1200, height: 800 },
  ],
  CHAUCAM18569: [
    { width: 559, height: 400 },
    { width: 600, height: 429 },
    { width: 768, height: 550 },
    { width: 1118, height: 800 },
    { width: 1536, height: 1099 },
    { width: 2048, height: 1466 },
  ],
  DSC_5276: [
    { width: 599, height: 400 },
    { width: 600, height: 400 },
    { width: 768, height: 513 },
    { width: 1199, height: 800 },
    { width: 1536, height: 1025 },
    { width: 2048, height: 1367 },
  ],
  CAHN: [
    { width: 370, height: 400 },
    { width: 600, height: 649 },
  ],
  z7004268926018_7106951106858b4aa62b4753c704e19f: [
    { width: 600, height: 337 },
    { width: 712, height: 400 },
    { width: 768, height: 431 },
    { width: 1400, height: 786 },
    { width: 1536, height: 863 },
  ],
};

const LOCAL_IMAGE_PATTERN = /^\/images\/(.+?)(?:-\d+x\d+)?\.jpg$/;

/** Picks the smallest available variant that still covers `targetWidth`. */
export function pickLocalImageVariant(
  basename: string,
  targetWidth: number,
): LocalImageVariant | null {
  const variants = LOCAL_IMAGE_VARIANTS[basename];
  if (!variants || variants.length === 0) {
    return null;
  }
  return variants.find((variant) => variant.width >= targetWidth) ?? variants[variants.length - 1];
}

/**
 * Custom next/image loader. Local images in public/images already ship with
 * several pre-generated resolutions (a WordPress export); rather than always
 * serving the largest file or requiring a live image-optimization server,
 * this maps each width Next.js requests to the smallest on-disk variant that
 * still covers it. Anything that isn't a known local image (e.g. the
 * remaining dreamkit.vn product photos) is returned unchanged.
 */
export default function localImageLoader({ src, width }: ImageLoaderProps): string {
  const match = LOCAL_IMAGE_PATTERN.exec(src);
  const basename = match?.[1];
  if (!basename) {
    return src;
  }

  const variant = pickLocalImageVariant(basename, width);
  if (!variant) {
    return src;
  }

  return `/images/${basename}-${variant.width}x${variant.height}.jpg`;
}
