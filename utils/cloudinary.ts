const transformCloudinary = (url: string | null | undefined, resourceType: "image" | "video", transform: string) => {
  if (!url) return "";
  const marker = `/${resourceType}/upload/`;
  return url.includes(marker) ? url.replace(marker, `${marker}${transform}/`) : url;
};

export const cloudinaryImage = (url: string | null | undefined, width: number) =>
  transformCloudinary(url, "image", `f_auto,q_auto:good,c_limit,w_${width}`);

export const cloudinaryImageSrcSet = (url: string | null | undefined, widths: number[]) =>
  url?.includes("/image/upload/")
    ? widths.map((width) => `${cloudinaryImage(url, width)} ${width}w`).join(", ")
    : "";

export const cloudinaryVideo = (url: string | null | undefined, width: number) =>
  transformCloudinary(url, "video", `f_auto,q_auto:eco,c_limit,w_${width}`);
