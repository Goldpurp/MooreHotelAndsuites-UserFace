import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { Room, RoomCategory } from "../types";
import Dialog from "../components/ui/Dialog";
import { addDaysToInput, todayInputValue } from "../utils/dates";
import RoomCard from "../components/RoomCard";

const CLIENT_LIMIT = 10;

type SortKey = "recommended" | "price-low" | "price-high" | "capacity" | "name";

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "capacity", label: "Guest capacity" },
  { value: "name", label: "Name: A to Z" },
];

const formatLabel = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
const normalizeAmenity = (value: string) => value.trim().toLowerCase().replace(/[_-]+/g, " ");
const readPrice = (value: string | null) => {
  const parsed = Number(value);
  return value && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const Rooms: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "2";
  const searchQuery = searchParams.get("q") || "";
  const minPrice = readPrice(searchParams.get("minPrice"));
  const maxPrice = readPrice(searchParams.get("maxPrice"));
  const selectedAmenities = useMemo(
    () => (searchParams.get("amenities") || "").split("|").map((item) => item.trim()).filter(Boolean),
    [searchParams],
  );
  const requestedSort = searchParams.get("sort") as SortKey | null;
  const sort = sortOptions.some((option) => option.value === requestedSort) ? requestedSort! : "recommended";
  const hasValidDates = Boolean(checkIn && checkOut && checkOut > checkIn);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(CLIENT_LIMIT);
  const [suggestions, setSuggestions] = useState<Room[]>([]);
  const [knownAmenities, setKnownAmenities] = useState<string[]>([]);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const { data: rooms = [], isLoading, error, refetch } = useQuery<Room[], Error>({
    queryKey: ["rooms", activeCategory, checkIn, checkOut, guests, selectedAmenities[0] || ""],
    queryFn: () => api.searchRooms({
      checkIn: hasValidDates ? checkIn : undefined,
      checkOut: hasValidDates ? checkOut : undefined,
      category: activeCategory === "All" ? undefined : activeCategory,
      guest: Math.max(1, Number(guests) || 1),
      amenity: selectedAmenities[0] || undefined,
    }),
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  useEffect(() => {
    const amenities = rooms.flatMap((room) => room.amenities || []).filter(Boolean);
    if (!amenities.length) return;
    setKnownAmenities((current) => Array.from(new Set([...current, ...amenities])).sort((a, b) => a.localeCompare(b)));
  }, [rooms]);

  useEffect(() => {
    if (!isLoading && rooms.length === 0 && hasValidDates) {
      api.getRooms()
        .then((allRooms) => setSuggestions(allRooms.filter((room) => room.capacity >= Math.max(1, Number(guests) || 1)).slice(0, 3)))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [isLoading, rooms.length, hasValidDates, guests]);

  useEffect(() => {
    setVisibleCount(CLIENT_LIMIT);
  }, [rooms, searchQuery, minPrice, maxPrice, selectedAmenities, sort, activeCategory, checkIn, checkOut]);

  const filteredRooms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = rooms.filter((room) => {
      const searchable = [room.name, room.category, room.description, room.size].join(" ").toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesMin = minPrice === null || room.pricePerNight >= minPrice;
      const matchesMax = maxPrice === null || room.pricePerNight <= maxPrice;
      const normalizedRoomAmenities = room.amenities.map(normalizeAmenity);
      const matchesAmenities = selectedAmenities.every((selected) =>
        normalizedRoomAmenities.some((amenity) => amenity.includes(normalizeAmenity(selected))),
      );
      return matchesSearch && matchesMin && matchesMax && matchesAmenities;
    });

    if (sort === "price-low") result.sort((a, b) => a.pricePerNight - b.pricePerNight);
    if (sort === "price-high") result.sort((a, b) => b.pricePerNight - a.pricePerNight);
    if (sort === "capacity") result.sort((a, b) => b.capacity - a.capacity || a.pricePerNight - b.pricePerNight);
    if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [rooms, searchQuery, minPrice, maxPrice, selectedAmenities, sort]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 240) {
        setVisibleCount((current) => Math.min(current + CLIENT_LIMIT, filteredRooms.length));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredRooms.length]);

  const updateParam = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value || value === "All" || (key === "sort" && value === "recommended")) nextParams.delete(key);
    else nextParams.set(key, value);
    if (key === "checkIn" && value && (nextParams.get("checkOut") || "") <= value) {
      nextParams.set("checkOut", addDaysToInput(value, 1));
    }
    setSearchParams(nextParams, { replace: true });
  };

  const toggleAmenity = (amenity: string) => {
    const next = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((item) => item !== amenity)
      : [...selectedAmenities, amenity];
    updateParam("amenities", next.join("|"));
  };

  const clearDates = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("checkIn");
    nextParams.delete("checkOut");
    setSearchParams(nextParams, { replace: true });
  };

  const handleReset = () => {
    setSearchParams({}, { replace: true });
    setFiltersOpen(false);
  };

  const activeFilterCount = [
    Boolean(checkIn || checkOut),
    guests !== "2",
    Boolean(searchQuery),
    minPrice !== null,
    maxPrice !== null,
    selectedAmenities.length > 0,
  ].filter(Boolean).length;
  const alternativeRooms = rooms.length > 0 ? rooms.slice(0, 3) : suggestions;

  if (error && rooms.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background-dark p-6 text-center">
        <span className="grid size-16 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary"><span className="material-symbols-outlined text-3xl" aria-hidden="true">cloud_off</span></span>
        <div><h1 className="ui-page-title italic text-white">Rooms are temporarily unavailable</h1><p className="ui-copy mx-auto mt-4 max-w-md">We could not reach the hotel inventory. Please try again in a moment.</p></div>
        <button onClick={() => refetch()} className="ui-button ui-button-primary">Try again</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark pb-24 pt-32">
      <div className="ui-container-wide">
        <header className="mb-9">
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="ui-eyebrow">Rooms &amp; suites</p>
              <h1 className="ui-page-title mt-3 italic text-white">Find your room</h1>
              <p className="ui-copy mt-4 max-w-2xl">Search live room availability, match guest capacity, and compare the details that matter to your stay.</p>
            </div>
            <button type="button" onClick={() => setFiltersOpen(true)} className="ui-button ui-button-secondary self-start md:self-auto">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">tune</span>
              Filters {activeFilterCount > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-[0.65rem] text-black">{activeFilterCount}</span>}
            </button>
          </div>

          <div className="mt-8 border-y border-white/10 py-4">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide" role="group" aria-label="Filter by room category">
              {["All", ...Object.values(RoomCategory)].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => updateParam("category", category)}
                  aria-pressed={activeCategory === category}
                  className={`min-h-11 whitespace-nowrap rounded px-4 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${activeCategory === category ? "bg-primary/12 text-primary" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}
                >
                  {category === "All" ? "All rooms" : formatLabel(category)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div aria-live="polite">
              <p className="text-sm font-medium text-white">{filteredRooms.length} {filteredRooms.length === 1 ? "room" : "rooms"}</p>
              <p className="mt-1 text-xs text-gray-500">Fitting {guests} {guests === "1" ? "guest" : "guests"}{hasValidDates ? " for your selected dates" : ""}</p>
            </div>
            <label className="w-full sm:w-56">
              <span className="ui-label">Sort results</span>
              <select value={sort} onChange={(event) => updateParam("sort", event.target.value)} className="ui-input">
                {sortOptions.map((option) => <option key={option.value} className="bg-black" value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>

          {(checkIn && checkOut) && (
            <div className="mt-4 inline-flex max-w-full items-center gap-3 rounded border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-gray-300">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">calendar_month</span>
              <span className="truncate">{checkIn} — {checkOut}</span>
              <button type="button" onClick={clearDates} className="ui-icon-button size-9 flex-none" aria-label="Clear selected dates"><span className="material-symbols-outlined text-lg" aria-hidden="true">close</span></button>
            </div>
          )}
        </header>

        {isLoading ? (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading rooms">
            {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="aspect-[4/5] animate-pulse rounded-lg border border-white/5 bg-white/[0.03]" />)}
          </div>
        ) : filteredRooms.length > 0 ? (
          <>
            <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.slice(0, visibleCount).map((room, index) => (
                <RoomCard key={room.id} room={room} to={`/rooms/${room.id}?${searchParams.toString()}`} eager={index < 2} />
              ))}
            </div>
            {visibleCount < filteredRooms.length && <div className="mt-12 text-center"><button type="button" onClick={() => setVisibleCount((current) => Math.min(current + CLIENT_LIMIT, filteredRooms.length))} className="ui-button ui-button-secondary">Show more rooms</button></div>}
          </>
        ) : (
          <div className="py-16 text-center sm:py-24">
            <span className="mx-auto grid size-16 place-items-center rounded-full border border-primary/25 bg-primary/10 text-primary"><span className="material-symbols-outlined text-3xl" aria-hidden="true">event_busy</span></span>
            <h2 className="ui-section-title mt-6 italic text-white">No exact match found</h2>
            <p className="ui-copy mx-auto mt-4 max-w-xl">Adjust your dates, guest count, price, or amenities to see more options.</p>
            {alternativeRooms.length > 0 && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {alternativeRooms.map((room) => <RoomCard key={room.id} room={room} to={`/rooms/${room.id}?${searchParams.toString()}`} variant="compact" />)}
              </div>
            )}
            <button type="button" onClick={handleReset} className="ui-button ui-button-primary mt-9">Reset filters</button>
          </div>
        )}
      </div>

      <Dialog
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        labelledBy="filters-title"
        variant="drawer"
        initialFocusRef={closeButtonRef}
        panelClassName="flex w-full max-w-lg flex-col border-l border-white/10 bg-background-dark p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div><p className="ui-eyebrow">Room search</p><h2 id="filters-title" className="ui-card-title mt-2 italic text-white">Refine results</h2></div>
          <button ref={closeButtonRef} type="button" onClick={() => setFiltersOpen(false)} className="ui-icon-button" aria-label="Close room filters"><span className="material-symbols-outlined" aria-hidden="true">close</span></button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-7 overflow-y-auto py-7 pr-1">
          <label><span className="ui-label">Search room name or description</span><input value={searchQuery} onChange={(event) => updateParam("q", event.target.value)} className="ui-input" placeholder="e.g. quiet workspace" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className="ui-label">Check-in</span><input type="date" min={todayInputValue()} value={checkIn} onChange={(event) => updateParam("checkIn", event.target.value)} className="ui-input" /></label>
            <label><span className="ui-label">Check-out</span><input type="date" min={checkIn || todayInputValue()} value={checkOut} onChange={(event) => updateParam("checkOut", event.target.value)} className="ui-input" /></label>
          </div>
          <label><span className="ui-label">Guests</span><select value={guests} onChange={(event) => updateParam("guests", event.target.value)} className="ui-input">{[1, 2, 3, 4, 5, 6, 7, 8].map((count) => <option key={count} className="bg-black" value={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}</select><span className="mt-2 block text-xs leading-5 text-gray-500">Only rooms with enough guest capacity are returned.</span></label>
          <fieldset>
            <legend className="ui-label">Nightly price range</legend>
            <div className="grid grid-cols-2 gap-4">
              <label><span className="mb-2 block text-xs text-gray-500">Minimum</span><div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₦</span><input type="number" min="0" step="5000" inputMode="numeric" value={minPrice ?? ""} onChange={(event) => updateParam("minPrice", event.target.value)} className="ui-input pl-8" placeholder="Any" /></div></label>
              <label><span className="mb-2 block text-xs text-gray-500">Maximum</span><div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₦</span><input type="number" min="0" step="5000" inputMode="numeric" value={maxPrice ?? ""} onChange={(event) => updateParam("maxPrice", event.target.value)} className="ui-input pl-8" placeholder="Any" /></div></label>
            </div>
          </fieldset>
          {knownAmenities.length > 0 && (
            <fieldset>
              <legend className="ui-label">Amenities</legend>
              <div className="flex flex-wrap gap-2">
                {knownAmenities.map((amenity) => {
                  const selected = selectedAmenities.includes(amenity);
                  return <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} aria-pressed={selected} className={`min-h-10 rounded-full border px-4 text-xs font-medium transition-colors ${selected ? "border-primary bg-primary/10 text-primary" : "border-white/10 bg-white/[0.025] text-gray-400 hover:border-white/25 hover:text-white"}`}>{formatLabel(amenity)}</button>;
                })}
              </div>
            </fieldset>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
          <button type="button" onClick={handleReset} className="ui-button ui-button-secondary">Clear all</button>
          <button type="button" onClick={() => setFiltersOpen(false)} className="ui-button ui-button-primary">View {filteredRooms.length}</button>
        </div>
      </Dialog>
    </div>
  );
};

export default Rooms;
