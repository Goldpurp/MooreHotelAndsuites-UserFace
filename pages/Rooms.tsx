import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { Room, RoomCategory, RoomStatus } from "../types";

const CLIENT_LIMIT = 10;

const Rooms: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get("category") || "All";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "2";

  const [searchQuery, setSearchQuery] = useState("");
  const [budget, setBudget] = useState(3000000);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(CLIENT_LIMIT);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch rooms using React Query
  const {
    data: rooms = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Room[], Error>({
    queryKey: ["rooms", activeCategory, checkIn, checkOut],
    queryFn: async () => {
      const isDateFiltering = checkIn !== "" && checkOut !== "";
      let data: Room[];
      if (isDateFiltering || activeCategory !== "All") {
        data = await api.searchRooms({
          checkIn: isDateFiltering ? checkIn : undefined as any,
          checkOut: isDateFiltering ? checkOut : undefined as any,
          category: activeCategory === "All" ? undefined : activeCategory,
        });
      } else {
        data = await api.getRooms("");
      }
      return data.filter((r) => r.isOnline && r.status !== RoomStatus.Maintenance);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Suggestions if no rooms available
  const [suggestions, setSuggestions] = useState<Room[]>([]);
  React.useEffect(() => {
    if (!isLoading && rooms.length === 0 && (checkIn && checkOut)) {
      api.getRooms("").then(allRooms => {
        setSuggestions(allRooms.filter(r => r.isOnline).slice(0, 3));
      });
    } else {
      setSuggestions([]);
    }
  }, [isLoading, rooms, checkIn, checkOut]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch =
        room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.roomNumber.includes(searchQuery);
      return matchesSearch && room.pricePerNight <= budget;
    });
  }, [rooms, searchQuery, budget]);

  // Infinite scroll effect
  useEffect(() => {
    setVisibleCount(CLIENT_LIMIT); // Reset on filter change
  }, [rooms, searchQuery, budget, activeCategory, checkIn, checkOut]);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        setVisibleCount((prev) =>
          prev + CLIENT_LIMIT > filteredRooms.length ? filteredRooms.length : prev + CLIENT_LIMIT
        );
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredRooms.length]);

  const handleReset = () => {
    setSearchParams({});
    setSearchQuery("");
    setBudget(3000000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refetch();
  };

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "All" || !value) newParams.delete(key);
    else newParams.set(key, value);
    setSearchParams(newParams);
  };

  const clearDates = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("checkIn");
    newParams.delete("checkOut");
    setSearchParams(newParams);
  };

  if (error && rooms.length === 0) {
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
    <div className="pt-28 min-h-screen bg-background-dark pb-24" ref={scrollRef}>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-10">

        {/* Header Section */}
        <header className="mb-12 space-y-8 sm:space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
            <div className="space-y-3 sm:space-y-4">
              <p className="text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-[0.5em]">Sanctuary Registry</p>
              <h1 className="serif-font text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white italic leading-tight">The Collection</h1>
            </div>
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-3 sm:gap-4 bg-white/5 border border-white/10 px-6 sm:px-8 py-3 sm:py-4 rounded-sm hover:bg-white/10 transition-all group"
            >
              <span className="material-symbols-outlined text-primary text-lg sm:text-xl">tune</span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.35em] text-white">Refine Search</span>
            </button>
          </div>

          {/* Category Navigation & Dates */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8 py-4 lg:py-6 border-y border-white/5">
            <div className="flex overflow-x-auto scrollbar-hide gap-3 sm:gap-6 md:gap-10">
              <button
                onClick={() => updateParam("category", "All")}
                className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.35em] whitespace-nowrap relative pb-2 transition-colors ${
                  activeCategory === "All" ? "text-primary" : "text-gray-600 hover:text-gray-300"
                }`}
              >
                All Tiers
                {activeCategory === "All" && <span className="absolute bottom-0 left-0 w-full h-px bg-primary" />}
              </button>
              {Object.values(RoomCategory).map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateParam("category", cat)}
                  className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.35em] whitespace-nowrap relative pb-2 transition-colors ${
                    activeCategory === cat ? "text-primary" : "text-gray-600 hover:text-gray-300"
                  }`}
                >
                  {cat}
                  {activeCategory === cat && <span className="absolute bottom-0 left-0 w-full h-px bg-primary" />}
                </button>
              ))}
            </div>

            {checkIn && checkOut && (
              <div className="flex items-center gap-3 sm:gap-6 bg-primary/5 border border-primary/20 px-4 sm:px-6 py-2 sm:py-3 rounded-sm animate-in fade-in slide-in-from-right duration-500">
                <span className="material-symbols-outlined text-primary text-xs sm:text-sm">calendar_month</span>
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white/80">
                  Showing available for: <span className="text-primary italic">{checkIn} — {checkOut}</span>
                </p>
                <button onClick={clearDates} className="text-gray-500 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xs sm:text-sm">close</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Room Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="aspect-[4/5] bg-white/[0.02] animate-pulse rounded-sm border border-white/5" />
            ))}
          </div>
        ) : filteredRooms.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 lg:gap-x-10 lg:gap-y-20">
              {filteredRooms.slice(0, visibleCount).map(room => (
                <Link
                  key={room.id}
                  to={`/rooms/${room.id}?${searchParams.toString()}`}
                  className="group flex flex-col gap-6 sm:gap-8"
                >
                  <div className="relative w-full aspect-[4/5] sm:aspect-[4/5] overflow-hidden rounded-sm bg-surface-dark border border-white/5 shadow-2xl transition-all duration-700 hover:shadow-primary/5">
                    <img
                      src={room.images?.[0]}
                      alt={room.name}
                      className="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 transition-all duration-[4000ms] group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                    <div className="absolute bottom-4 sm:bottom-10 left-4 sm:left-10 right-4 sm:right-10 space-y-2 sm:space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                      <p className="text-primary text-[8px] sm:text-[9px] uppercase tracking-[0.35em] font-black">{room.category} Tier</p>
                      <h3 className="serif-font text-2xl sm:text-3xl md:text-4xl text-white italic leading-tight group-hover:text-primary transition-colors">{room.name}</h3>
                    </div>
                  </div>
                  <div className="flex justify-between items-end border-t border-white/5 px-1 pt-4 sm:pt-6">
                    <div className="space-y-1">
                      <p className="text-[8px] sm:text-[9px] text-gray-700 font-black uppercase tracking-[0.35em]">NIGHTLY RATE</p>
                      <p className="text-2xl sm:text-3xl text-white font-bold tracking-tighter italic">₦{room.pricePerNight.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500">
                      <span className="material-symbols-outlined text-xl sm:text-2xl">east</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {visibleCount >= filteredRooms.length && (
              <div className="text-center text-primary text-xs mt-10">
                Showing all {filteredRooms.length} rooms. No more rooms to load.
              </div>
            )}
          </>
        ) : (
          /* Suggestions */
          <div className="py-16 sm:py-24 md:py-32 text-center space-y-10 sm:space-y-12 md:space-y-16 max-w-6xl mx-auto animate-in fade-in duration-1000">
            <div className="space-y-4 sm:space-y-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-2 sm:mb-4 md:mb-8">
                <span className="material-symbols-outlined text-2xl sm:text-3xl md:text-4xl">event_busy</span>
              </div>
              <h2 className="serif-font text-2xl sm:text-3xl md:text-6xl text-white italic">At Full Capacity.</h2>
              <p className="text-gray-500 text-[9px] sm:text-[10px] md:text-sm uppercase tracking-[0.35em] font-black max-w-md mx-auto leading-relaxed px-4">
                The requested dates are currently fully booked. Explore these alternative masterpieces or adjust your calendar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-10 px-4">
              {suggestions.map(room => (
                <Link
                  key={room.id}
                  to={`/rooms/${room.id}?${searchParams.toString()}`}
                  className="group flex flex-col gap-4 sm:gap-6 p-4 md:p-6 border border-white/5 rounded-sm hover:border-primary/20 transition-all bg-surface-dark/40 shadow-xl"
                >
                  <div className="relative w-full aspect-[16/10] overflow-hidden rounded-sm bg-black">
                    <img
                      src={room.images?.[0]}
                      alt={room.name}
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <h4 className="serif-font text-lg sm:text-xl md:text-2xl text-white italic group-hover:text-primary transition-colors">{room.name}</h4>
                    <p className="text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center justify-between">
                      <span>₦{room.pricePerNight.toLocaleString()} / NIGHT</span>
                      <span className="material-symbols-outlined text-xs sm:text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <button
              onClick={handleReset}
              className="bg-primary text-black px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.35em] rounded-sm hover:bg-[#B04110] transition-all shadow-2xl shadow-primary/40 active:scale-95 mx-auto"
            >
              Reset Registry Filter
            </button>
          </div>
        )}

        {/* Filter Drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setFiltersOpen(false)} />
            <div className="relative w-full sm:max-w-sm md:max-w-md bg-background-dark border-l border-white/10 h-full p-6 sm:p-8 md:p-10 flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl">
              <div className="flex justify-between items-center mb-12 sm:mb-16">
                <div className="space-y-1">
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.45em] font-black text-primary">Advanced Registry</p>
                  <p className="text-[7px] sm:text-[8px] text-gray-500 uppercase tracking-widest font-black italic">Refine your sanctuary search</p>
                </div>
                <button onClick={() => setFiltersOpen(false)} className="text-white hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-8 sm:space-y-10 flex-1 overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
                {/* Search */}
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-gray-600 font-black">Search Room Registry</p>
                  <input
                    placeholder="Room Name, Number or Tier"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 px-4 sm:px-5 py-3 sm:py-4 text-white focus:border-primary outline-none transition-all placeholder:text-gray-800 italic"
                  />
                </div>

                {/* Dates & Guests */}
                <div className="space-y-6 bg-white/[0.02] p-4 sm:p-6 border border-white/5">
                  <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-primary font-black">Check Availability</p>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-[7px] sm:text-[8px] uppercase tracking-widest text-gray-600 font-black">Check-in</label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => updateParam("checkIn", e.target.value)}
                        className="w-full bg-black border border-white/10 p-3 sm:p-4 text-xs sm:text-sm text-white outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-[7px] sm:text-[8px] uppercase tracking-widest text-gray-600 font-black">Check-out</label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => updateParam("checkOut", e.target.value)}
                        className="w-full bg-black border border-white/10 p-3 sm:p-4 text-xs sm:text-sm text-white outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-[7px] sm:text-[8px] uppercase tracking-widest text-gray-600 font-black">Guests</label>
                    <select
                      value={guests}
                      onChange={(e) => updateParam("guests", e.target.value)}
                      className="w-full bg-black border border-white/10 p-3 sm:p-4 text-xs sm:text-sm text-white outline-none focus:border-primary transition-all appearance-none italic font-bold"
                    >
                      {[1,2,3,4].map(n => <option key={n} value={n}>{n} {n>1 ? "Guests" : "Guest"}</option>)}
                    </select>
                  </div>
                </div>

                {/* Budget */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex justify-between items-end">
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-gray-600 font-black">Nightly Investment Max</p>
                    <p className="serif-font text-xl sm:text-2xl text-primary italic">₦{budget.toLocaleString()}</p>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={3000000}
                    step={50000}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full accent-primary bg-white/5 h-1 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-6 sm:pt-10 border-t border-white/5 flex gap-2 sm:gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 py-4 sm:py-5 text-[9px] sm:text-[10px] uppercase tracking-widest font-black text-gray-600 border border-white/5 hover:border-white/20 transition-all"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="flex-1 bg-primary text-black py-4 sm:py-5 text-[9px] sm:text-[10px] uppercase tracking-widest font-black shadow-xl shadow-primary/20 hover:bg-[#B04110] transition-all"
                >
                  Apply Protocol
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;