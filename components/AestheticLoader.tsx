import React from "react";

interface AestheticLoaderProps {
  message?: string;
  subtext?: string;
  isFullPage?: boolean;
}

const AestheticLoader: React.FC<AestheticLoaderProps> = ({
  message = "Preparing your stay",
  subtext = "One moment",
  isFullPage = true,
}) => (
  <div
    className={`${isFullPage ? "fixed inset-0 z-[500] min-h-dvh bg-background-dark" : "min-h-80 w-full"} flex flex-col items-center justify-center p-6 text-center`}
    role="status"
    aria-live="polite"
  >
    <div className="relative mb-7 size-16" aria-hidden="true">
      <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse" />
      <div className="absolute inset-1 rounded-full border border-white/10 border-t-primary animate-spin" />
      <div className="absolute inset-3 grid place-items-center overflow-hidden rounded-full bg-[#e4e6e8]">
        <img src="https://res.cloudinary.com/dxryndnhl/image/upload/v1777386017/slazzer-preview-w1yad_jizukz.png" alt="" className="h-full w-full object-contain" />
      </div>
    </div>
    <h2 className="font-display text-2xl italic text-white sm:text-3xl">{message}</h2>
    <p className="ui-eyebrow mt-3 animate-pulse">{subtext}</p>
  </div>
);

export default AestheticLoader;
