import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { Room, RoomCategory, RoomStatus } from "../types";

const Rooms: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [suggestions, setSuggestions] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived filters from URL - Defaults to empty if not provided via Home search
  const activeCategory = searchParams.get("category") || "All";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "2";

  // Local state for non-URL filters
  const [searchQuery, setSearchQuery] = useState("");
  const [budget, setBudget] = useState(3000000);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);

      try {
        let data: Room[];
        // Availability search is only triggered if BOTH dates are provided
        const isDateFiltering = checkIn !== "" && checkOut !== "";

        if (isDateFiltering || activeCategory !== "All") {
          data = await api.searchRooms({
            checkIn: isDateFiltering ? checkIn : undefined as any,
            checkOut: isDateFiltering ? checkOut : undefined as any,
            category: activeCategory === "All" ? undefined : activeCategory,
          });
        } else {
          // Default view: Show all online rooms
          data = await api.getRooms("");
        }

        const availableRooms = data.filter(
          (r) => r.isOnline && r.status !== RoomStatus.Maintenance,
        );

        setRooms(availableRooms);

        // Suggestions logic: if a date-specific search yielded nothing, show alternatives
        if (availableRooms.length === 0 && isDateFiltering) {
          const allRooms = await api.getRooms("");
          setSuggestions(allRooms.filter(r => r.isOnline).slice(0, 3));
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        setError("Unable to sync with the suite registry. Please verify connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [activeCategory, checkIn, checkOut]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch =
        room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.roomNumber.includes(searchQuery);
      const matchesBudget = room.pricePerNight <= budget;
      return matchesSearch && matchesBudget;
    });
  }, [rooms, searchQuery, budget]);

  const handleReset = () => {
    // Clear URL parameters
    setSearchParams({});
    // Clear local filter states
    setSearchQuery("");
    setBudget(3000000);
    // Trigger loading and scroll to top
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="pt-28 min-h-screen bg-background-dark pb-24">
      <div className="max-w-[1800px] mx-auto px-6 md:px-10">
        
        {/* Header Section */}
        <header className="mb-12 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.5em]">Sanctuary Registry</p>
              <h1 className="serif-font text-5xl md:text-8xl text-white italic leading-none">The Collection</h1>
            </div>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-4 rounded-sm hover:bg-white/10 transition-all group"
              >
                <span className="material-symbols-outlined text-primary text-xl">tune</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Refine Search</span>
              </button>
            </div>
          </div>

          {/* Elegant Navigation & Date Summary */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 py-6 border-y border-white/5">
            <div className="flex overflow-x-auto scrollbar-hide gap-10">
              <button
                onClick={() => updateParam("category", "All")}
                className={`text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap transition-all relative pb-2 ${
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
                  className={`text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap transition-all relative pb-2 ${
                    activeCategory === cat ? "text-primary" : "text-gray-600 hover:text-gray-300"
                  }`}
                >
                  {cat}
                  {activeCategory === cat && <span className="absolute bottom-0 left-0 w-full h-px bg-primary" />}
                </button>
              ))}
            </div>

            {checkIn && checkOut && (
              <div className="flex items-center gap-6 bg-primary/5 border border-primary/20 px-6 py-3 rounded-sm animate-in fade-in slide-in-from-right duration-500">
                <span className="material-symbols-outlined text-primary text-sm">calendar_month</span>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/80">
                  Showing available for: <span className="text-primary italic">{checkIn} — {checkOut}</span>
                </p>
                <button onClick={clearDates} className="text-gray-500 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Room Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/5] bg-white/[0.02] animate-pulse rounded-sm border border-white/5" />
            ))}
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20 lg:gap-y-32">
            {filteredRooms.map((room) => (
              <Link
                key={room.id}
                to={`/rooms/${room.id}?${searchParams.toString()}`}
                className="group flex flex-col gap-8"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface-dark border border-white/5 shadow-2xl transition-all duration-700 hover:shadow-primary/5">
                  <img
                    src={room.images?.[0]}
                    className="w-full h-full object-cover grayscale-[0.6] group-hover:grayscale-0 transition-all duration-[4000ms] group-hover:scale-110"
                    alt={room.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                  <div className="absolute bottom-10 left-10 right-10 space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                    <p className="text-primary text-[9px] uppercase tracking-[0.4em] font-black">{room.category} Tier</p>
                    <h3 className="serif-font text-4xl text-white italic leading-tight group-hover:text-primary transition-colors">{room.name}</h3>
                  </div>
                </div>
                <div className="flex justify-between items-end border-t border-white/5 px-1 pt-6">
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.4em]">NIGHTLY RATE</p>
                    <p className="text-3xl text-white font-bold tracking-tighter italic">₦{room.pricePerNight.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500">
                    <span className="material-symbols-outlined text-2xl">east</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Smart Suggestions */
          <div className="py-24 md:py-32 text-center space-y-12 md:space-y-16 max-w-6xl mx-auto animate-in fade-in duration-1000">
            <div className="space-y-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-4 md:mb-8">
                <span className="material-symbols-outlined text-3xl md:text-4xl">event_busy</span>
              </div>
              <h2 className="serif-font text-3xl md:text-6xl text-white italic">At Full Capacity.</h2>
              <p className="text-gray-500 text-[10px] md:text-sm uppercase tracking-[0.4em] font-black max-w-md mx-auto leading-relaxed px-4">
                The requested dates are currently fully booked. Explore these alternative masterpieces or adjust your calendar.
              </p>
            </div>

            {/* Fixed Suggestions Grid to prevent overlapping */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 px-4">
              {suggestions.map((room) => (
                <Link
                  key={room.id}
                  to={`/rooms/${room.id}?${searchParams.toString()}`}
                  className="group flex flex-col gap-6 text-left border border-white/5 p-4 md:p-6 rounded-sm hover:border-primary/20 transition-all bg-surface-dark/40 shadow-xl"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm bg-black">
                    <img 
                      src={room.images?.[0]} 
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-110" 
                      alt={room.name} 
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="serif-font text-xl md:text-2xl text-white italic group-hover:text-primary transition-colors">{room.name}</h4>
                    <p className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-between">
                      <span>₦{room.pricePerNight.toLocaleString()} / NIGHT</span>
                      <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <button 
              onClick={handleReset}
              className="bg-primary text-black px-10 md:px-12 py-4 md:py-5 text-[10px] font-black uppercase tracking-[0.4em] rounded-sm hover:bg-yellow-500 transition-all shadow-2xl shadow-primary/40 active:scale-95 mx-auto"
            >
              Reset Registry Filter
            </button>
          </div>
        )}

        {/* Unified Filter & Date Drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setFiltersOpen(false)} />
            <div className="relative w-full max-w-md bg-background-dark border-l border-white/10 h-full p-10 flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl">
              <div className="flex justify-between items-center mb-16">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.5em] font-black text-primary">Advanced Registry</p>
                  <p className="text-[8px] text-gray-500 uppercase tracking-widest font-black italic">Refine your sanctuary search</p>
                </div>
                <button onClick={() => setFiltersOpen(false)} className="text-white hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-12 flex-1 overflow-y-auto pr-4 custom-scrollbar">
                {/* Search */}
                <div className="space-y-4">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gray-600 font-black">Search Room Registry</p>
                  <input
                    placeholder="Room Name, Number or Tier"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 px-5 py-4 text-white focus:border-primary outline-none transition-all placeholder:text-gray-800 italic"
                  />
                </div>

                {/* Date Check - Simplified */}
                <div className="space-y-8 bg-white/[0.02] p-6 border border-white/5">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-primary font-black">Check Availability</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase tracking-widest text-gray-600 font-black">Check-in</label>
                      <input 
                        type="date" 
                        value={checkIn} 
                        onChange={(e) => updateParam("checkIn", e.target.value)} 
                        className="w-full bg-black border border-white/10 p-4 text-xs text-white outline-none focus:border-primary transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase tracking-widest text-gray-600 font-black">Check-out</label>
                      <input 
                        type="date" 
                        value={checkOut} 
                        onChange={(e) => updateParam("checkOut", e.target.value)} 
                        className="w-full bg-black border border-white/10 p-4 text-xs text-white outline-none focus:border-primary transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[8px] uppercase tracking-widest text-gray-600 font-black">Guests</label>
                      <select
                        value={guests}
                        onChange={(e) => updateParam("guests", e.target.value)}
                        className="w-full bg-black border border-white/10 p-4 text-xs text-white outline-none focus:border-primary transition-all appearance-none italic font-bold"
                      >
                        {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} {n > 1 ? 'Guests' : 'Guest'}</option>)}
                      </select>
                  </div>
                </div>

                {/* Budget */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-gray-600 font-black">Nightly Investment Max</p>
                    <p className="serif-font text-2xl text-primary italic">₦{budget.toLocaleString()}</p>
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

              <div className="pt-10 border-t border-white/5 flex gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 py-5 text-[10px] uppercase tracking-widest font-black text-gray-600 border border-white/5 hover:border-white/20 transition-all"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="flex-1 bg-primary text-black py-5 text-[10px] uppercase tracking-widest font-black shadow-xl shadow-primary/20 hover:bg-yellow-500 transition-all"
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