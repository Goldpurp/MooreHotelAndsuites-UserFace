import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Room, RoomCategory } from "../types";
import FAQ from "../components/FAQ";

const Home: React.FC = () => {
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const [searchData, setSearchData] = useState({
    category: "All",
    checkIn: "",
    checkOut: "",
    guests: "2",
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [rooms] = await Promise.all([api.getRooms("")]);

        setFeaturedRooms(rooms.filter((r) => r.isOnline).slice(0, 3));
      } catch (err) {
        console.error("Content load failed");
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    // Only add if not empty
    if (searchData.category && searchData.category !== "All") {
      params.append("category", searchData.category);
    }

    if (searchData.checkIn) {
      params.append("checkIn", searchData.checkIn);
    }

    if (searchData.checkOut) {
      params.append("checkOut", searchData.checkOut);
    }

    if (searchData.guests) {
      params.append("guests", searchData.guests);
    }

    navigate(`/rooms?${params.toString()}`);
  };

  if (error && featuredRooms.length === 0) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-center space-y-12">
        <div className="w-24 h-24 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center text-primary animate-luxury-logo">
          <span className="material-symbols-outlined text-5xl">cloud_off</span>
        </div>
        <div className="space-y-4">
          <h1 className="serif-font text-5xl md:text-7xl text-white italic">
            Gateway <span className="text-primary">Offline</span>
          </h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.5em] font-black max-w-sm mx-auto">
            {error}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-black px-12 py-5 text-[10px] font-black uppercase tracking-[0.4em] rounded-sm shadow-2xl active:scale-95 transition-all"
        >
          Re-establish Connection
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background-dark min-h-screen">
      {/* 1. Cinematic Hero */}
      <header className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div className="w-full h-full bg-surface-dark overflow-hidden">
            <img
              alt="Moore Lobby"
              className="w-full h-full object-cover opacity-70 scale-105 animate-[pulse_25s_ease-in-out_infinite]"
              src={
                "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1920"
              }
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-background-dark z-20"></div>
        </div>

        <div className="relative z-30 space-y-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-center gap-6 animate-in fade-in duration-1000">
            <span className="h-[1px] w-12 bg-primary/60"></span>
            <p className="text-[10px] uppercase tracking-[1em] text-primary font-black">
              Sanctuary Reimagined
            </p>
            <span className="h-[1px] w-12 bg-primary/60"></span>
          </div>
          <h1 className="serif-font text-5xl md:text-8xl lg:text-[10rem] font-medium leading-[0.85] text-white animate-in slide-in-from-bottom-12 duration-1000">
            The Art of
            <br />
            <span className="italic text-primary">Stillness</span>
          </h1>

          <div className="pt-12 w-full max-w-5xl mx-auto">
            <form onSubmit={handleSearch} className="w-full">
              <div className="bg-black/40 backdrop-blur-3xl border border-white/10 p-1 rounded-sm flex flex-col md:flex-row items-stretch gap-1 shadow-2xl">
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/5">
                  <div className="px-4 py-3 flex flex-col items-start gap-1">
                    <label className="text-[8px] uppercase tracking-[0.2em] text-gray-500 font-black">
                      Collection
                    </label>
                    <select
                      value={searchData.category}
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          category: e.target.value,
                        })
                      }
                      className="bg-transparent border-none p-0 text-xs focus:ring-0 cursor-pointer w-full text-white appearance-none font-bold italic"
                    >
                      <option className="bg-black" value="All">
                        All Suites
                      </option>
                      {Object.values(RoomCategory).map((cat) => (
                        <option key={cat} className="bg-black" value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="px-4 py-3 flex flex-col items-start gap-1 bg-white/[0.07] border-x border-primary/40 group focus-within:ring-2 ring-primary/60 transition-all shadow-inner">
                    <label className="text-[8px] uppercase tracking-[0.2em] text-primary font-black drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                      Check-in
                    </label>
                    <input
                      className="bg-transparent border-none p-0 text-xs focus:ring-0 w-full text-white font-bold cursor-pointer transition-colors hover:text-primary outline-none"
                      type="date"
                      value={searchData.checkIn}
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          checkIn: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="px-4 py-3 flex flex-col items-start gap-1 bg-white/[0.07] border-primary/40 group focus-within:ring-2 ring-primary/60 transition-all shadow-inner">
                    <label className="text-[8px] uppercase tracking-[0.2em] text-primary font-black drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                      Check-out
                    </label>
                    <input
                      className="bg-transparent border-none p-0 text-xs focus:ring-0 w-full text-white font-bold cursor-pointer transition-colors hover:text-primary outline-none"
                      type="date"
                      value={searchData.checkOut}
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          checkOut: e.target.value,
                        })
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
                  className="bg-primary text-black h-14 md:h-auto px-10 flex items-center justify-center rounded-sm hover:bg-yellow-500 transition-all font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-primary/20 active:scale-95"
                >
                  Reserve
                </button>
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* 2. Philosophy Section */}
      <section className="py-24 md:py-40 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 md:gap-24">
          <div className="flex-1 space-y-10 order-2 lg:order-1">
            <div className="space-y-4">
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">
                Heritage of Excellence
              </p>
              <h2 className="serif-font text-4xl md:text-7xl text-white italic leading-tight">
                Beyond Service,
                <br />A Sanctuary.
              </h2>
            </div>
            <p className="text-gray-400 text-lg md:text-2xl font-light leading-relaxed">
              Moore Hotels & Suites was founded on a singular premise: that
              luxury is defined not by excess, but by the quality of silence and
              the precision of detail.
            </p>
            <div className="pt-6">
              <Link
                to="/about"
                className="text-primary text-[10px] font-black uppercase tracking-[0.4em] border-b border-primary/30 pb-2 hover:text-white hover:border-white transition-all inline-block"
              >
                Our Full Story
              </Link>
            </div>
          </div>
          <div className="flex-1 relative order-1 lg:order-2">
            <div className="absolute -inset-4 border border-primary/20 rotate-3 z-0"></div>
            <img
              src={
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200"
              }
              className="relative z-10 rounded-sm grayscale hover:grayscale-0 transition-all duration-[2000ms] shadow-2xl"
              alt="Moore Architecture"
            />
          </div>
        </div>
      </section>

      {/* 3. Featured Anthology */}
      <section className="py-24 md:py-40 px-6 bg-surface-dark/40">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-4 text-left">
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">
                The Curated Suites
              </p>
              <h2 className="serif-font text-6xl md:text-8xl text-white italic leading-none">
                The Collection
              </h2>
            </div>
            <Link
              to="/rooms"
              className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-primary transition-all flex items-center gap-4"
            >
              Explore All{" "}
              <span className="material-symbols-outlined text-lg">
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {loading
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] bg-white/[0.02] animate-pulse rounded-sm"
                  />
                ))
              : featuredRooms.map((room) => (
                  <Link
                    key={room.id}
                    to={`/rooms/${room.id}`}
                    className="group block space-y-8"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-white/5 shadow-2xl transition-all duration-[1000ms] group-hover:-translate-y-2">
                      <img
                        src={room.images?.[0]}
                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-transform duration-[5000ms] group-hover:scale-110"
                        alt={room.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                      <div className="absolute bottom-8 left-8 right-8 flex flex-col gap-1">
                        <p className="text-primary text-[8px] font-black uppercase tracking-[0.4em]">
                          {room.category}
                        </p>
                        <h3 className="serif-font text-3xl text-white italic">
                          {room.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* 4. Video Experience Section */}
      <section className="py-24 md:py-40 bg-black relative overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Text */}
            <div className="lg:col-span-5 space-y-10">
              <div className="space-y-5">
                <p className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">
                  Moving Narrative
                </p>

                <h2 className="serif-font text-5xl md:text-7xl text-white italic leading-[1.1]">
                  The Moore
                  <br />
                  Motion
                </h2>
              </div>

              <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                Witness the transformation. A cinematic journey that captures
                the shift from the vibrant rhythm of Lagos to the calm, private
                stillness of Moore Hotels and Suites.
              </p>

              <button className="flex items-center gap-6 group">
                <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-black shadow-2xl shadow-primary/10">
                  <span className="material-symbols-outlined text-3xl">
                    play_arrow
                  </span>
                </div>

                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                  Watch Anthem
                </span>
              </button>
            </div>

            {/* Video */}
            <div className="lg:col-span-7 relative">
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

                {/* Cinematic overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Dining & Wellness Teaser */}
      <section className="py-24 md:py-40 px-6">
        <div className="max-w-7xl mx-auto space-y-32">
          {/* Dining */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="aspect-video overflow-hidden rounded-sm relative group shadow-2xl">
                <img
                  src={
                    "https://i.pinimg.com/1200x/53/c5/1d/53c51d69ed3a3c8d8a8b840d89a248c6.jpg"
                  }
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[2000ms]"
                  alt="Dining"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-1000"></div>
              </div>
            </div>
            <div className="lg:col-span-5 space-y-8">
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">
                Gastronomy
              </p>
              <h3 className="serif-font text-5xl md:text-7xl text-white italic leading-tight">
                The Horizon Grill
              </h3>
              <p className="text-gray-400 text-lg font-light leading-relaxed">
                An ethereal culinary journey curated by Michelin-starred
                masters. Served with a panoramic view of the coastline.
              </p>
              <Link
                to="/dining"
                className="inline-block bg-white/5 border border-white/10 px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-primary hover:text-black transition-all rounded-sm shadow-xl"
              >
                View Venues
              </Link>
            </div>
          </div>

          {/* Wellness */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-8 order-2 lg:order-1 lg:text-right">
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">
                Wellness
              </p>
              <h3 className="serif-font text-5xl md:text-7xl text-white italic leading-tight">
                The Meridian Spa
              </h3>
              <p className="text-gray-400 text-lg font-light leading-relaxed ml-auto">
                Rejuvenate with bespoke rituals designed by world-renowned
                therapists using indigenous organic extracts.
              </p>
              <Link
                to="/amenities"
                className="inline-block bg-white/5 border border-white/10 px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-primary hover:text-black transition-all rounded-sm shadow-xl"
              >
                Discover Serenity
              </Link>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="aspect-video overflow-hidden rounded-sm relative group shadow-2xl">
                <img
                  src={
                    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200"
                  }
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[2000ms]"
                  alt="Spa"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-1000"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Luxury Quote */}
      <section className="py-32 md:py-48 bg-black text-center px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto space-y-12">
          <span className="material-symbols-outlined text-primary/30 text-6xl md:text-8xl">
            format_quote
          </span>
          <h2 className="serif-font text-3xl md:text-6xl text-white italic leading-relaxed font-light">
            "We do not merely offer rooms; we provide the setting where the soul
            finally finds its breath."
          </h2>
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.4em] text-primary font-black">
              Ademola Moore
            </p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-700 font-bold italic">
              Founding Visionary
            </p>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <FAQ />

      {/* 8. Call to Action */}
      <section className="py-32 md:py-48 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="serif-font text-5xl md:text-9xl text-white italic leading-none">
            Become Part of <br />
            The Anthology.
          </h2>
          <p className="text-gray-500 text-lg md:text-xl font-light">
            Join the Moore Circle for exclusive invitations and bespoke stay
            curation.
          </p>
          <div className="pt-8">
            <Link
              to="/auth"
              className="bg-primary text-black px-12 py-5 text-[11px] font-black uppercase tracking-[0.4em] rounded-sm hover:bg-yellow-500 transition-all shadow-2xl shadow-primary/40 inline-block"
            >
              Request Membership
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
