import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { Room, RoomCategory, RoomStatus } from "../types";

const Rooms: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [budget, setBudget] = useState(3000000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCategory = searchParams.get("category") || "All";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);

      try {
        let data: Room[];

        const shouldSearch =
          (checkIn && checkOut) || activeCategory !== "All";

        if (shouldSearch) {
          data = await api.searchRooms({
            checkIn,
            checkOut,
            category: activeCategory === "All" ? undefined : activeCategory,
          });
        } else {
          data = await api.getRooms("");
        }

        const availableRooms = data.filter(
          (r) => r.isOnline && r.status !== RoomStatus.Maintenance,
        );

        setRooms(availableRooms);
      } catch {
        setError("Failed to load rooms. Please try again.");
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

      const matchesAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((a) => room.amenities.includes(a));

      return matchesSearch && matchesBudget && matchesAmenities;
    });
  }, [rooms, searchQuery, budget, selectedAmenities]);

  const handleCategoryChange = (cat: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === "All") newParams.delete("category");
    else newParams.set("category", cat);
    setSearchParams(newParams);
  };

  return (
    <div className="pt-28 min-h-screen bg-background-dark pb-24">
      <div className="max-w-[1800px] mx-auto px-6 md:px-10">

        {/* Category Tabs */}
        <header className="mb-10 space-y-12">
          <div className="flex overflow-x-auto scrollbar-hide gap-8 pb-4 border-b border-white/5">
            <button
              onClick={() => handleCategoryChange("All")}
              className={`text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap transition-all pb-4 relative ${
                activeCategory === "All"
                  ? "text-primary"
                  : "text-gray-600 hover:text-gray-300"
              }`}
            >
              All Suites
              {activeCategory === "All" && (
                <span className="absolute bottom-0 left-0 w-full h-px bg-primary" />
              )}
            </button>

            {Object.values(RoomCategory).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap transition-all pb-4 relative ${
                  activeCategory === cat
                    ? "text-primary"
                    : "text-gray-600 hover:text-gray-300"
                }`}
              >
                {cat} Tier
                {activeCategory === cat && (
                  <span className="absolute bottom-0 left-0 w-full h-px bg-primary" />
                )}
              </button>
            ))}
          </div>
        </header>

        {/* Mobile Filter Bar */}
        <div className="md:hidden sticky top-24 z-40 bg-background-dark border-b border-white/5 mb-10">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-3 text-white"
            >
              <span className="material-symbols-outlined text-xl">
                tune
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Filter Rooms
              </span>
            </button>

            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
              {filteredRooms.length} Results
            </p>
          </div>
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] bg-white/[0.02] animate-pulse rounded-sm border border-white/5"
              />
            ))}
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20 lg:gap-y-32">
            {filteredRooms.map((room) => (
              <Link
                key={room.id}
                to={`/rooms/${room.id}`}
                className="group flex flex-col gap-8"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface-dark border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                  <img
                    src={room.images?.[0]}
                    className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-[3000ms] group-hover:scale-110"
                    alt={room.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />

                  <div className="absolute bottom-10 left-10 right-10 space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                    <p className="text-primary text-[9px] uppercase tracking-[0.4em] font-black">
                      {room.category} Tier
                    </p>
                    <h3 className="serif-font text-4xl text-white italic leading-tight group-hover:text-primary transition-colors">
                      {room.name}
                    </h3>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-white/5 px-1">
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.4em]">
                      NIGHTLY RATE
                    </p>
                    <p className="text-3xl text-white font-bold tracking-tighter italic">
                      ₦{room.pricePerNight.toLocaleString()}
                    </p>
                  </div>

                  <span className="material-symbols-outlined text-3xl text-primary">
                    arrow_right_alt
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-52 text-center">
            <p className="serif-font text-3xl text-gray-600 italic">
              No rooms match your lookup.
            </p>
          </div>
        )}

        {/* Mobile Filter Drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setFiltersOpen(false)}
            />

            <div className="absolute bottom-0 left-0 right-0 bg-background-dark rounded-t-2xl border-t border-white/10 max-h-[85vh] overflow-y-auto">
              <div className="p-6 space-y-10">

                <div className="flex justify-between items-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] font-black">
                    Filters
                  </p>
                  <button onClick={() => setFiltersOpen(false)}>
                    Close
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">
                    Search
                  </p>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black border border-white/10 px-4 py-3 text-white"
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">
                    Max Budget
                  </p>
                  <input
                    type="range"
                    min={50000}
                    max={3000000}
                    step={50000}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-white text-xl italic">
                    ₦{budget.toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-4 pt-6 border-t border-white/10">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setBudget(3000000);
                      setSelectedAmenities([]);
                    }}
                    className="flex-1 border border-white/10 py-4 text-[10px] uppercase tracking-[0.4em] text-gray-400"
                  >
                    Reset
                  </button>

                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="flex-1 bg-primary text-black py-4 text-[10px] uppercase tracking-[0.4em] font-black"
                  >
                    Apply
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Rooms;
