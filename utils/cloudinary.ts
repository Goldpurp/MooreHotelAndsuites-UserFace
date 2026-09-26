const transformCloudinary = (url: string | null | undefined, resourceType: "image" | "video", transform: string) => {
  if (!url) return "";
  const marker = `/${resourceType}/upload/`;
  return url.includes(marker) ? url.replace(marker, `${marker}${transform}/`) : url;
};

// Images stored in Cloudflare R2 are pre-generated at upload time as
// "<key>-thumb.webp" (400px), "-medium.webp" (800px) and "-large.webp" (1600px).
const R2_VARIANT = /-(thumb|medium|large)\.webp$/;
const R2_VARIANTS = [
  { name: "thumb", width: 400 },
  { name: "medium", width: 800 },
  { name: "large", width: 1600 },
] as const;

const isR2Image = (url: string | null | undefined) => !!url && R2_VARIANT.test(url);

const r2Variant = (url: string, width: number) => {
  const variant = R2_VARIANTS.find((item) => width <= item.width) ?? R2_VARIANTS[R2_VARIANTS.length - 1];
  return url.replace(R2_VARIANT, `-${variant.name}.webp`);
};

export const cloudinaryImage = (url: string | null | undefined, width: number) =>
  isR2Image(url) ? r2Variant(url as string, width) : transformCloudinary(url, "image", `f_auto,q_auto:good,c_limit,w_${width}`);

export const cloudinaryImageSrcSet = (url: string | null | undefined, widths: number[]) => {
  if (isR2Image(url)) {
    return R2_VARIANTS.map((item) => `${(url as string).replace(R2_VARIANT, `-${item.name}.webp`)} ${item.width}w`).join(", ");
  }
  return url?.includes("/image/upload/")
    ? widths.map((width) => `${cloudinaryImage(url, width)} ${width}w`).join(", ")
    : "";
};

export const cloudinaryVideo = (url: string | null | undefined, width: number) =>
  transformCloudinary(url, "video", `f_auto,q_auto:eco,c_limit,w_${width}`);
