import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { Room } from "../types";
import AestheticLoader from "../components/AestheticLoader";
import { addDaysToInput, differenceInNights, todayInputValue } from "../utils/dates";

const amenityIcons: Record<string, string> = {
  wifi: "wifi",
  ac: "ac_unit",
  air_conditioning: "ac_unit",
  workspace: "desk",
  telephone: "call",
  bathtub: "bathtub",
  mini_bar: "local_bar",
  iron: "iron",
  tv: "tv",
  safe: "lock",
  wardrobe: "checkroom",
  kettle: "coffee_maker",
  fridge: "kitchen",
  king_bed: "bed",
};

const RoomDetail: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [selectedCheckIn, setSelectedCheckIn] = useState(searchParams.get("checkIn") ?? todayInputValue());
  const [selectedCheckOut, setSelectedCheckOut] = useState(searchParams.get("checkOut") ?? addDaysToInput(todayInputValue(), 1));

  const { data: room, isLoading, error } = useQuery<Room, Error>({
    queryKey: ["roomDetail", id],
    queryFn: () => api.getRoomById(id!),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (error) navigate("/rooms", { replace: true });
  }, [error, navigate]);

  useEffect(() => {
    const verifyDates = async () => {
      if (!id || !selectedCheckIn || !selectedCheckOut) return;
      if (selectedCheckOut <= selectedCheckIn) {
        setIsAvailable(false);
        setAvailabilityMessage("Check-out must be after check-in.");
        return;
      }
      if (selectedCheckIn < todayInputValue()) {
        setIsAvailable(false);
        setAvailabilityMessage("Check-in cannot be in the past.");
        return;
      }

      setAvailabilityLoading(true);
      setAvailabilityMessage(null);
      try {
        const result = await api.checkAvailability(id, selectedCheckIn, selectedCheckOut);
        setIsAvailable(result.available);
        setAvailabilityMessage(result.available ? null : result.message || "This room is not available for those dates.");
      } catch {
        setIsAvailable(false);
        setAvailabilityMessage("Availability could not be verified. Please try again.");
      } finally {
        setAvailabilityLoading(false);
      }
    };
    const timer = window.setTimeout(verifyDates, 450);
    return () => window.clearTimeout(timer);
  }, [id, selectedCheckIn, selectedCheckOut]);

  const stay = useMemo(() => {
    if (!room) return { nights: 0, total: 0 };
    const nights = differenceInNights(selectedCheckIn, selectedCheckOut);
    return { nights, total: room.pricePerNight * nights };
  }, [room, selectedCheckIn, selectedCheckOut]);

  if (isLoading) return <AestheticLoader message="Preparing room details" subtext="Checking availability" />;
  if (!room) return null;

  const images = room.images?.filter(Boolean) ?? [];
  const buildRoomSearchUrl = () => {
    const params = new URLSearchParams(searchParams);
    params.set("checkIn", selectedCheckIn);
    params.set("checkOut", selectedCheckOut);
    return `/rooms?${params.toString()}`;
  };
  const bookRoom = () => {
    if (!isAvailable || availabilityLoading) return;
    const params = new URLSearchParams(searchParams);
    params.set("checkIn", selectedCheckIn);
    params.set("checkOut", selectedCheckOut);
    navigate(`/checkout/${room.id}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background-dark pb-20">
      <header className="relative min-h-[38rem] overflow-hidden bg-black pt-24 sm:min-h-[44rem]">
        {images[activeImage] ? (
          <img src={images[activeImage]} alt={`${room.name} — view ${activeImage + 1}`} className="absolute inset-0 h-full w-full object-cover image-luxury" fetchPriority="high" />
        ) : <div className="absolute inset-0 bg-surface-dark" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-background-dark" />

        <div className="ui-container-wide relative z-10 flex min-h-[38rem] flex-col justify-between pb-20 pt-4 sm:min-h-[44rem]">
          <button type="button" onClick={() => navigate(buildRoomSearchUrl())} className="ui-button ui-button-secondary self-start bg-black/45 backdrop-blur-lg">
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span> Back to rooms
          </button>
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div><p className="ui-eyebrow">{room.category.replace(/([a-z])([A-Z])/g, "$1 $2")}</p><h1 className="ui-page-title mt-3 italic text-white">{room.name}</h1></div>
            {images.length > 1 && (
              <div className="flex max-w-full gap-2 overflow-x-auto rounded-lg border border-white/10 bg-black/45 p-2 backdrop-blur-lg scrollbar-hide" role="group" aria-label="Room gallery">
                {images.map((image, index) => (
                  <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(index)} aria-label={`Show room image ${index + 1}`} aria-pressed={activeImage === index} className={`h-14 w-20 flex-none overflow-hidden rounded border-2 transition-all ${activeImage === index ? "border-primary" : "border-transparent opacity-65 hover:opacity-100"}`}>
                    <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="ui-container-wide relative z-20 -mt-10 grid gap-9 lg:grid-cols-12 lg:items-start">
        <div className="space-y-12 lg:col-span-8">
          <section className="ui-card p-6 sm:p-8">
            <p className="font-display text-[clamp(1.35rem,2.5vw,2rem)] italic leading-8 text-white">{room.description || "A refined room designed for a comfortable and restorative stay."}</p>
            <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-7 sm:grid-cols-4">
              <RoomDetailItem label="Category" value={room.category.replace(/([a-z])([A-Z])/g, "$1 $2")} />
              <RoomDetailItem label="Location" value="Assigned at check-in" />
              <RoomDetailItem label="Guests" value={room.capacity ? `${room.capacity} guests` : "Ask hotel"} />
              <RoomDetailItem label="Size" value={room.size ?? "Not specified"} />
            </dl>
          </section>

          <section>
            <p className="ui-eyebrow">In-room amenities</p>
            <h2 className="ui-card-title mt-3 italic text-white">Everything for an easy stay.</h2>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {room.amenities.map((amenity) => {
                const key = amenity.toLowerCase().replace(/[\s-]+/g, "_");
                return (
                  <li key={amenity} className="flex min-h-16 items-center gap-4 rounded border border-white/10 bg-white/[0.025] px-5 py-4 text-sm font-medium text-gray-200">
                    <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary"><span className="material-symbols-outlined" aria-hidden="true">{amenityIcons[key] || "verified"}</span></span>
                    {amenity}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="ui-card p-6 shadow-2xl sm:p-8 lg:sticky lg:top-28 lg:col-span-4" aria-label="Book this room">
          <span className="ui-label">Nightly rate</span>
          <p className="font-display text-4xl font-semibold text-white sm:text-5xl">₦{room.pricePerNight.toLocaleString()}</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <label><span className="ui-label">Check-in</span><input type="date" min={todayInputValue()} value={selectedCheckIn} onChange={(event) => { const value = event.target.value; setSelectedCheckIn(value); if (selectedCheckOut <= value) setSelectedCheckOut(addDaysToInput(value, 1)); }} className="ui-input" /></label>
            <label><span className="ui-label">Check-out</span><input type="date" min={selectedCheckIn || todayInputValue()} value={selectedCheckOut} onChange={(event) => setSelectedCheckOut(event.target.value)} className="ui-input" /></label>
          </div>

          <div className="mt-6 min-h-12" aria-live="polite">
            {availabilityLoading ? (
              <p className="flex items-center gap-2 text-sm text-gray-400"><span className="material-symbols-outlined animate-spin text-primary" aria-hidden="true">progress_activity</span> Checking availability…</p>
            ) : availabilityMessage ? (
              <p className="rounded border border-red-500/20 bg-red-500/5 p-3 text-sm leading-6 text-red-300">{availabilityMessage}</p>
            ) : isAvailable ? (
              <p className="flex items-center gap-2 text-sm text-emerald-400"><span className="material-symbols-outlined" aria-hidden="true">check_circle</span> Available for your dates</p>
            ) : null}
          </div>

          <dl className="mt-5 space-y-3 border-y border-white/10 py-5 text-sm">
            <div className="flex justify-between gap-4 text-gray-400"><dt>Length of stay</dt><dd className="font-semibold text-white">{stay.nights} {stay.nights === 1 ? "night" : "nights"}</dd></div>
            <div className="flex items-end justify-between gap-4"><dt className="text-gray-400">Stay total</dt><dd className="font-display text-2xl italic text-primary">₦{stay.total.toLocaleString()}</dd></div>
          </dl>

          <button type="button" onClick={bookRoom} disabled={!isAvailable || availabilityLoading} className="ui-button ui-button-primary mt-6 w-full">Continue to booking <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span></button>
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-gray-500"><span className="material-symbols-outlined text-base" aria-hidden="true">lock</span> Secure checkout</p>
        </aside>
      </div>
    </div>
  );
};

const RoomDetailItem = ({ label, value }: { label: string; value: string }) => (
  <div><dt className="ui-label">{label}</dt><dd className="text-sm font-semibold capitalize text-white sm:text-base">{value}</dd></div>
);

export default RoomDetail;
