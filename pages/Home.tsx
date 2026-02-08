import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { Room, RoomCategory } from "../types";
import FAQ from "../components/FAQ";
import NotificationModal from "../components/NotificationModal";

const Home: React.FC = () => {
  const [searching, setSearching] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, title: "", message: "", type: "info" });

  const navigate = useNavigate();

  const [searchData, setSearchData] = useState({
    category: "All",
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    guests: "2",
  });

  // Fetch featured rooms using React Query
  const {
    data: featuredRooms = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Room[], Error>({
    queryKey: ["featuredRooms"],
    queryFn: async () => {
      const rooms = await api.getRooms("");
      return rooms.filter((r) => r.isOnline).slice(0, 4);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setTimeout(() => {
      const params = new URLSearchParams();
      if (searchData.category && searchData.category !== "All")
        params.append("category", searchData.category);
      if (searchData.checkIn) params.append("checkIn", searchData.checkIn);
      if (searchData.checkOut) params.append("checkOut", searchData.checkOut);
      if (searchData.guests) params.append("guests", searchData.guests);
      navigate(`/rooms?${params.toString()}`);
    }, 400);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !/\S+@\S+\.\S+/.test(newsletterEmail)) {
      setEmailError("Valid email required.");
      return;
    }
    setEmailError("");
    setSubscribing(true);
    setTimeout(() => {
      setModal({
        show: true,
        title: "Membership Requested",
        message:
          "Welcome to the Moore Circle. Your request is being reviewed by our membership board.",
        type: "success",
      });
      setSubscribing(false);
      setNewsletterEmail("");
    }, 1500);
  };

  const getSearchQuery = () => {
    const params = new URLSearchParams();
    if (searchData.checkIn) params.append("checkIn", searchData.checkIn);
    if (searchData.checkOut) params.append("checkOut", searchData.checkOut);
    if (searchData.guests) params.append("guests", searchData.guests);
    return params.toString();
  };

  if (error && featuredRooms.length === 0) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-center space-y-12">
        <div className="w-24 h-24 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center text-primary animate-luxury-logo">
          <span className="material-symbols-outlined text-5xl">cloud_off</span>
        </div>
        <div className="space-y-4">
          <h1 className="serif-font text-5xl md:text-7xl text-white italic">
            Connection <span className="text-primary">Offline</span>
          </h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.5em] font-black max-w-sm mx-auto">
            Unable to establish connection to the hotel registry.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="bg-primary text-black px-12 py-5 text-[10px] font-black uppercase tracking-[0.4em] rounded-sm shadow-2xl active:scale-95 transition-all"
        >
          Reconnect
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background-dark min-h-screen">
      <NotificationModal
        isOpen={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      {/* HERO SECTION */}
      <header className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div className="w-full h-full bg-surface-dark overflow-hidden">
            <img
              alt="Moore Lobby"
              className="w-full h-full object-cover opacity-70 scale-105 animate-[pulse_25s_ease-in-out_infinite]"
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-background-dark z-20"></div>
        </div>

        <div className="relative z-30 space-y-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-wrap justify-center items-center gap-6 animate-in fade-in duration-1000">
            <span className="h-[1px] w-12 bg-primary/60"></span>
            <p className="text-[10px] md:text-[12px] lg:text-[14px] uppercase tracking-[1em] text-primary font-black">
              4-Star Hospitality Excellence
            </p>
            <span className="h-[1px] w-12 bg-primary/60"></span>
          </div>
          <h1 className="serif-font text-5xl md:text-8xl lg:text-[5rem] font-medium leading-[0.85] text-white animate-in slide-in-from-bottom-12 duration-1000">
            The Standard of
            <br />
            <span className="italic text-primary">Luxury</span>
          </h1>

          <div className="pt-12 w-full max-w-5xl mx-auto">
            <form onSubmit={handleSearch} className="w-full">
              <div className="bg-black/40 backdrop-blur-3xl border border-white/10 p-1 rounded-sm flex flex-col md:flex-row items-stretch gap-1 shadow-2xl">
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/5">
                  <div className="px-4 py-3 flex flex-col items-start gap-1">
                    <label className="text-[8px] uppercase tracking-[0.2em] text-gray-500 font-black">
                      Room Tier
                    </label>
                    <select
                      value={searchData.category}
                      onChange={(e) =>
                        setSearchData({ ...searchData, category: e.target.value })
                      }
                      className="bg-transparent border-none p-0 text-xs focus:ring-0 cursor-pointer w-full text-white appearance-none font-bold italic"
                    >
                      <option className="bg-black" value="All">
                        All Suites
                      </option>
                      {Object.values(RoomCategory).map((cat) => (
                        <option key={cat} className="bg-black" value={cat}>
                          {cat} Tier
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="px-4 py-3 flex flex-col items-start gap-1 bg-white/[0.07] border-x border-primary/40 group focus-within:ring-2 ring-primary/60 transition-all shadow-inner">
                    <label className="text-[8px] uppercase tracking-[0.2em] text-primary font-black">
                      Check-in
                    </label>
                    <input
                      className="bg-transparent border-none p-0 text-xs focus:ring-0 w-full text-white font-bold cursor-pointer outline-none"
                      type="date"
                      value={searchData.checkIn}
                      onChange={(e) =>
                        setSearchData({ ...searchData, checkIn: e.target.value })
                      }
                    />
                  </div>
                  <div className="px-4 py-3 flex flex-col items-start gap-1 bg-white/[0.07] border-primary/40 group focus-within:ring-2 ring-primary/60 transition-all shadow-inner">
                    <label className="text-[8px] uppercase tracking-[0.2em] text-primary font-black">
                      Check-out
                    </label>
                    <input
                      className="bg-transparent border-none p-0 text-xs focus:ring-0 w-full text-white font-bold cursor-pointer outline-none"
                      type="date"
                      value={searchData.checkOut}
                      onChange={(e) =>
                        setSearchData({ ...searchData, checkOut: e.target.value })
                      }
                    />
                  </div>
                  <div className="px-4 py-3 flex flex-col items-start gap-1">
                    <label className="text-[8px] uppercase tracking-[0.2em] text-gray-500 font-black">
                      Guests
                    </label>
                    <select
                      value={searchData.guests}
                      onChange={(e) =>
                        setSearchData({ ...searchData, guests: e.target.value })
                      }
                      className="bg-transparent border-none p-0 text-xs focus:ring-0 cursor-pointer w-full text-white appearance-none font-bold italic"
                    >
                      {[1, 2, 3, 4].map((num) => (
                        <option key={num} className="bg-black" value={num}>
                          {num} {num > 1 ? "Guests" : "Guest"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="bg-primary text-black h-14 md:h-auto px-10 flex items-center justify-center rounded-sm hover:bg-yellow-500 transition-all font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-70 gap-3"
                >
                  {searching && (
                    <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  )}
                  {searching ? "Verifying..." : "Reserve Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* All sections below now fully fluid/responsive */}
      <section className="py-24 md:py-40 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 md:gap-24">
          <div className="flex-1 space-y-8 lg:space-y-10 order-2 lg:order-1">
            <div className="space-y-4">
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">
                Nigerian Professionalism
              </p>
              <h2 className="serif-font text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-white italic leading-tight">
                Refined Hotel Service,
                <br />
                At Every Touchpoint.
              </h2>
            </div>
            <p className="text-gray-400 text-base sm:text-lg md:text-xl lg:text-2xl font-light leading-relaxed">
              At Moore Hotels & Suites, we redefine hospitality by blending modern
              professionalism with the warmth of Nigerian culture. Every
              detail is crafted to make your stay efficient, memorable, and
              unquestionably high-end.
            </p>
            <div className="pt-4 md:pt-6">
              <Link
                to="/about"
                className="text-primary text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] border-b border-primary/30 pb-2 hover:text-white hover:border-white transition-all inline-block"
              >
                Our 4-Star Legacy
              </Link>
            </div>
          </div>
          <div className="flex-1 relative order-1 lg:order-2 w-full max-w-lg lg:max-w-full mx-auto">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200"
              className="relative z-10 rounded-sm grayscale hover:grayscale-0 transition-all duration-[2000ms] shadow-2xl w-full h-auto object-cover"
              alt="Moore Hotel Lagos"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* EXECUTIVE ROOM COLLECTION */}
      <section className="py-24 md:py-40 px-6 bg-surface-dark/40">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-6 md:gap-8">
            <div className="space-y-2 md:space-y-4 text-left">
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">
                Executive Room Collection
              </p>
              <h2 className="serif-font text-4xl sm:text-5xl md:text-6xl lg:text-8xl text-white italic leading-none">
                The Registry
              </h2>
            </div>
            <Link
              to="/rooms"
              className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-primary transition-all flex items-center gap-2 md:gap-4"
            >
              View All Accommodations <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
            {isLoading
              ? [1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-white/[0.02] animate-pulse rounded-sm" />
                ))
              : featuredRooms.map((room) => (
                  <Link
                    key={room.id}
                    to={`/rooms/${room.id}?${getSearchQuery()}`}
                    className="group block space-y-6 sm:space-y-8"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-transform duration-700 group-hover:-translate-y-1 sm:group-hover:-translate-y-2">
                      <img
                        src={room.images?.[0]}
                        alt={room.name}
                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-transform duration-[2500ms] group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                      <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-1 sm:gap-2">
                        <p className="text-primary text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em]">
                          {room.category} Tier
                        </p>
                        <h3 className="serif-font text-lg sm:text-2xl md:text-3xl text-white italic">
                          {room.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* HOTEL PERSPECTIVE */}
      <section className="py-24 md:py-40 bg-black relative overflow-hidden px-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5 space-y-8 md:space-y-10">
              <div className="space-y-4 md:space-y-5">
                <p className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">
                  Hotel Perspective
                </p>
                <h2 className="serif-font text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white italic leading-[1.1]">
                  The Moore Experience
                </h2>
              </div>
              <p className="text-gray-400 text-base sm:text-lg md:text-xl lg:text-xl font-light leading-relaxed max-w-full lg:max-w-xl">
                Experience the transition from Lagos' energetic business streets to
                the calm, professional luxury of Moore Hotels.
              </p>
              <button className="flex items-center gap-4 md:gap-6 group mt-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-primary/30 flex items-center justify-center text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-black shadow-2xl shadow-primary/10">
                  <span className="material-symbols-outlined text-2xl md:text-3xl">play_arrow</span>
                </div>
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-white">
                  Watch Anthem
                </span>
              </button>
            </div>
            <div className="lg:col-span-7 relative mt-8 lg:mt-0">
              <div className="relative aspect-video rounded-sm overflow-hidden group border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
                <video
                  src="https://media.istockphoto.com/id/2164324479/video/calm-summer-evening-in-luxury-hotel-woman-lying-on-lounger-put-hands-back-silhouette-of-lady.mp4?s=mp4-640x640-is&k=20&c=mmsIo19OMUfPZ-wUsNdTNZXzVOCY524vS-3Ek9zLPGI="
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover grayscale-[0.35] transition-all duration-[1800ms] group-hover:grayscale-0 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="py-24 md:py-32 bg-black text-center px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
          <span className="material-symbols-outlined text-primary/30 text-6xl md:text-8xl">format_quote</span>
          <h2 className="serif-font text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-white italic leading-relaxed font-light">
            "At Moore Hotels, every guest experience is handled with professional precision and Nigerian warmth."
          </h2>
          <p className="text-[11px] uppercase tracking-[0.4em] text-primary font-black">Alase Moore</p>
        </div>
      </section>

      <FAQ />

      {/* NEWSLETTER */}
      <section className="py-32 md:py-48 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
          <h2 className="serif-font text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white italic leading-none">
            Join Moore Circle.
          </h2>
          <p className="text-gray-500 text-base sm:text-lg md:text-xl lg:text-2xl font-light">
            Receive exclusive invitations, corporate rates, and priority guest services.
          </p>
          <div className="pt-8 max-w-md mx-auto">
            <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
              <div className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="Business Email Address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className={`w-full bg-white/[0.03] border ${
                    emailError ? "border-red-500/50" : "border-white/10"
                  } p-5 text-white outline-none focus:border-primary transition-all font-light italic`}
                />
                {emailError && (
                  <p className="text-red-500 text-[8px] uppercase font-black tracking-widest text-left ml-1">
                    {emailError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={subscribing}
                className="bg-primary text-black px-12 py-5 text-[11px] font-black uppercase tracking-[0.4em] rounded-sm hover:bg-yellow-500 transition-all shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {subscribing && (
                  <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                )}
                {subscribing ? "SUBSCRIBING..." : "Request Membership"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;