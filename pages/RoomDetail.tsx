import React, { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { Room } from "../types";
import AestheticLoader from "../components/AestheticLoader";

import {
  IconWifi,
  IconAirConditioningDisabled,
  IconBath,
  IconPhone,
  IconGlassFullFilled,
  IconIroning,
  IconDesk,
  IconFridge,
  IconLockFilled,
  IconHanger2Filled,
  IconDeviceTv,
  IconTeapot,
  IconBedFilled,
  IconRosetteDiscountCheckFilled,
} from "@tabler/icons-react";
import { JSX } from "react/jsx-runtime";

/* ---------------- ICON MAP ---------------- */
const AMENITY_ICON_MAP: Record<string, JSX.Element> = {
  wifi: <IconWifi size={18} />,
  ac: <IconAirConditioningDisabled size={18} />,
  workspace: <IconDesk size={18} />,
  telephone: <IconPhone size={18} />,
  bathtub: <IconBath size={18} />,
  mini_bar: <IconGlassFullFilled size={18} />,
  iron: <IconIroning size={18} />,
  tv: <IconDeviceTv size={18} />,
  safe: <IconLockFilled size={18} />,
  wardrobe: <IconHanger2Filled size={18} />,
  kettle: <IconTeapot size={18} />,
  fridge: <IconFridge size={18} />,
  king_bed: <IconBedFilled size={18} />,
};

const RoomDetail: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeImage, setActiveImage] = useState(0);

  // Availability state
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);

  const [selectedCheckIn, setSelectedCheckIn] = useState(
    searchParams.get("checkIn") ?? new Date().toISOString().split("T")[0]
  );
  const [selectedCheckOut, setSelectedCheckOut] = useState(
    searchParams.get("checkOut") ?? new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );

  // Fetch room using React Query
  const {
    data: room,
    isLoading,
    error,
  } = useQuery<Room, Error>({
    queryKey: ["roomDetail", id],
    queryFn: async () => {
      const data = await api.getRoomById(id!);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Redirect if error
  useEffect(() => {
    if (error) {
      navigate("/rooms");
    }
  }, [error, navigate]);

  /* ---------------- AVAILABILITY CHECK ---------------- */
  useEffect(() => {
    const verifyDates = async () => {
      if (!id || !selectedCheckIn || !selectedCheckOut) return;

      const checkInDate = new Date(selectedCheckIn);
      const checkOutDate = new Date(selectedCheckOut);

      if (checkOutDate <= checkInDate) {
        setIsAvailable(false);
        setAvailabilityMessage("Check-out must be after check-in.");
        return;
      }

      setAvailabilityLoading(true);

      try {
        const res = await api.checkAvailability(
          id,
          selectedCheckIn,
          selectedCheckOut,
        );
        setIsAvailable(res.available);
        setAvailabilityMessage(
          res.available
            ? null
            : res.message || "Room is not available for these dates.",
        );
      } catch {
        setIsAvailable(true);
        setAvailabilityMessage(null);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    const timer = setTimeout(verifyDates, 500);
    return () => clearTimeout(timer);
  }, [id, selectedCheckIn, selectedCheckOut]);

  /* ---------------- STAY CALCULATION ---------------- */
  const stayCalculations = useMemo(() => {
    if (!room) return { nights: 0, total: 0 };

    const checkInDate = new Date(selectedCheckIn);
    const checkOutDate = new Date(selectedCheckOut);
    const nights = Math.max(
      1,
      Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86400000),
    );

    return {
      nights,
      total: room.pricePerNight * nights,
    };
  }, [room, selectedCheckIn, selectedCheckOut]);

  if (isLoading) {
    return <AestheticLoader message="Sanctuary Registry" subtext="Decrypting Room Specifications..." />;
  }

  if (!room) return null;

  const images = room.images?.length ? room.images : [];

  const handleAuthoriseStay = () => {
    if (!isAvailable) return;
    navigate(
      `/checkout/${room.id}?checkIn=${selectedCheckIn}&checkOut=${selectedCheckOut}`,
    );
  };

  return (
    <div className="bg-background-dark min-h-screen pb-12">
      {/* HERO */}
      <section className="relative">
        <div className="absolute top-24 left-6 z-50">
          <button
            onClick={() => navigate("/rooms")}
            className="flex items-center gap-2 px-3 py-2 bg-black/50 border border-white/10 rounded-sm text-white hover:text-primary transition"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_left_alt
            </span>
            <span className="text-[9px] uppercase tracking-[0.35em] font-black">
              Back
            </span>
          </button>
        </div>

        <div className="relative h-[70vh] bg-black overflow-hidden">
          {images[activeImage] && (
            <img
              src={images[activeImage]}
              alt={room.name}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-black/30" />

          <div className="absolute bottom-10 left-6 space-y-4 z-20">
            <p className="text-primary text-[9px] uppercase tracking-[0.6em] font-black">
              Room {room.roomNumber}
            </p>
            <h1 className="serif-font text-4xl md:text-7xl italic text-white">
              {room.name}
            </h1>
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-16 right-6 flex gap-3 z-30">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-20 h-14 overflow-hidden border ${
                    activeImage === index
                      ? "border-primary scale-105"
                      : "border-white/20 opacity-70"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        <div className="lg:col-span-8 space-y-12 md:space-y-16">
          <section className="my-[-110px]">
            <h2 className="serif-font text-2xl md:text-4xl text-white leading-tight">
              {room.description || "A refined sanctuary crafted for stillness."}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 py-10 border-y border-white/5 mt-10">
              <Detail label="Category" value={room.category} />
              <Detail label="Floor" value={room.floor ?? "N/A"} highlight />
              <Detail label="Guests" value={`${room.capacity} Guests`} />
              <Detail label="Size" value={room.size ?? "N/A"} />
            </div>
          </section>

          <section>
            <p className="text-primary text-[10px] uppercase tracking-[0.5em] font-black mb-6">
              Amenities
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {room.amenities.map((a) => (
                <div
                  key={a}
                  className="p-6 bg-white/[0.03] border border-white/5 flex items-center gap-4 hover:border-primary/20 transition-all"
                >
                  {/* Icon */}
                  <span className="text-primary">
                    {AMENITY_ICON_MAP[a.toLowerCase().replace(/\s+/g, "_")] || (
                      <IconRosetteDiscountCheckFilled size={18} />
                    )}
                  </span>

                  <span className="text-[11px] uppercase tracking-[0.2em] text-white font-black">
                    {a}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* BOOKING CARD */}
        <aside className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
          <div className="bg-surface-dark border border-white/10 p-8 md:p-10 space-y-10 shadow-2xl rounded-sm">
            <div className="text-center">
              <p className="text-primary text-[9px] uppercase tracking-[0.5em] font-black">
                Nightly Rate
              </p>
              <h3 className="serif-font text-5xl md:text-6xl text-white font-bold tracking-tight">
                ₦{room.pricePerNight.toLocaleString()}
              </h3>
            </div>

            {availabilityMessage && (
              <p className="text-red-500 text-[10px] uppercase font-black text-center tracking-widest bg-red-500/5 py-3 border border-red-500/10 rounded-sm">
                {availabilityMessage}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[8px] uppercase tracking-[0.2em] text-gray-600 font-black ml-1">Arrival</label>
                <input
                  type="date"
                  value={selectedCheckIn}
                  onChange={(e) => setSelectedCheckIn(e.target.value)}
                  className="w-full bg-white/[0.07] p-4 text-xs text-white outline-none border border-white/5 focus:border-primary/40 transition-all appearance-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] uppercase tracking-[0.2em] text-gray-600 font-black ml-1">Departure</label>
                <input
                  type="date"
                  value={selectedCheckOut}
                  onChange={(e) => setSelectedCheckOut(e.target.value)}
                  className="w-full bg-white/[0.07] p-4 text-xs text-white outline-none border border-white/5 focus:border-primary/40 transition-all appearance-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-end text-xs pt-6 border-t border-white/5">
              <div className="space-y-1">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest font-black">Stay Record</p>
                <p className="text-white text-lg italic font-medium">{stayCalculations.nights} Nights</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest font-black">Total Investment</p>
                <p className="serif-font text-3xl text-primary italic font-bold">₦{stayCalculations.total.toLocaleString()}</p>
              </div>
            </div>

            <button
              onClick={handleAuthoriseStay}
              disabled={!isAvailable || availabilityLoading}
              className="w-full h-16 bg-primary text-black uppercase text-[10px] font-black tracking-[0.4em] hover:bg-[#B04110] transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
            >
              {availabilityLoading ? (
                 <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : (
                "Confirm Booking"
              )}
            </button>
            <p className="text-[8px] text-center text-gray-600 uppercase tracking-[0.3em] font-black italic">Secure Handshake Protocol Active</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

/* -------- SMALL HELPER COMPONENT -------- */
const Detail = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div>
    <p className="text-[8px] uppercase tracking-[0.4em] text-gray-600 font-black mb-1">
      {label}
    </p>
    <p
      className={`text-lg md:text-xl font-bold italic ${highlight ? "text-primary" : "text-white"}`}
    >
      {value}
    </p>
  </div>
);

export default RoomDetail;