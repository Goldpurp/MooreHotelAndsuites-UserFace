import React from "react";

interface AestheticLoaderProps {
  message?: string;
  subtext?: string;
  isFullPage?: boolean;
}

const AestheticLoader: React.FC<AestheticLoaderProps> = ({
  message = "Decrypting Registry",
  subtext = "Establishing Secure Link...",
  isFullPage = true,
}) => {
  const containerClass = isFullPage
    ? "fixed inset-0 z-[500] bg-background-dark flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500"
    : "w-full min-h-[400px] flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500";

  return (
    <div className={containerClass}>
      {/* Loader Animation */}
      <div className="relative w-24 h-24 md:w-32 md:h-32 mb-12">
        <div className="absolute inset-0 border border-primary/10 rounded-full scale-150 animate-pulse"></div>
        <div className="absolute inset-0 border-2 border-primary/10 rounded-full animate-[spin_12s_linear_infinite]"></div>
        <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-[spin_1.5s_linear_infinite]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-sm flex items-center justify-center text-black font-black text-2xl md:text-3xl shadow-[0_0_60px_rgba(234,179,8,0.5)] animate-luxury-logo">
            <img src="https://res.cloudinary.com/diovckpyb/image/upload/v1770752301/d6qqrpcxf1cqnkm9mzm5.jpg" alt="Moore Hotels & Suites" />
          </div>
        </div>
      </div>

      {/* Loader Text */}
      <div className="space-y-6 max-w-md">
        <h2 className="serif-font text-4xl md:text-6xl text-white italic tracking-tight">
          {message}
        </h2>
        <div className="space-y-4">
          <p className="text-primary text-[10px] uppercase tracking-[0.6em] font-black animate-pulse">
            {subtext}
          </p>
          <div className="w-48 h-px bg-white/10 mx-auto relative overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-primary w-1/3 animate-[shimmer_2s_infinite_linear]"></div>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      {isFullPage && (
        <p className="text-gray-600 text-[8px] uppercase tracking-[0.3em] mt-16 font-bold opacity-30 fixed bottom-12">
          Moore Hotels & Suites • Private Registry Access
        </p>
      )}
    </div>
  );
};

export default AestheticLoader;
