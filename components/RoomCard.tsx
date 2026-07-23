import React from "react";
import { Link } from "react-router-dom";
import { Room } from "../types";

type RoomCardVariant = "featured" | "listing" | "compact";

interface RoomCardProps {
  room: Room;
  to: string;
  variant?: RoomCardVariant;
  eager?: boolean;
}

const fallbackRoomImage =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80";

const RoomImage = ({ room, eager = false, className }: { room: Room; eager?: boolean; className: string }) => (
  <img
    src={room.images?.find(Boolean) || fallbackRoomImage}
    alt={room.name}
    className={className}
    loading={eager ? "eager" : "lazy"}
    fetchPriority={eager ? "high" : "auto"}
    decoding="async"
    onError={(event) => {
      if (event.currentTarget.src !== fallbackRoomImage) event.currentTarget.src = fallbackRoomImage;
    }}
  />
);

const RoomCard: React.FC<RoomCardProps> = ({ room, to, variant = "listing", eager = false }) => {
  const category = room.category.replace(/([a-z])([A-Z])/g, "$1 $2");

  if (variant === "compact") {
    return (
      <Link to={to} className="group ui-card overflow-hidden text-left transition-transform duration-300 hover:-translate-y-1">
        <RoomImage room={room} className="image-luxury aspect-[16/10] w-full object-cover" />
        <div className="p-5">
          <p className="ui-eyebrow">{category}</p>
          <h3 className="ui-card-title mt-2 italic text-white transition-colors group-hover:text-primary">{room.name}</h3>
          <p className="mt-2 text-xs text-gray-500">Up to {room.capacity} {room.capacity === 1 ? "guest" : "guests"}{room.size ? ` · ${room.size}` : ""}</p>
          <p className="mt-3 text-sm text-gray-300">₦{room.pricePerNight.toLocaleString()} / night</p>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link to={to} className="group">
        <article className="ui-card overflow-hidden transition-transform duration-300 hover:-translate-y-1">
          <div className="relative aspect-[4/5] overflow-hidden">
            <RoomImage room={room} eager={eager} className="image-luxury h-full w-full object-cover" />
            <div className="luxury-gradient absolute inset-0" />
            <div className="absolute inset-x-5 bottom-5">
              <p className="ui-eyebrow">{category}</p>
              <h3 className="ui-card-title mt-2 italic text-white">{room.name}</h3>
              <p className="mt-2 text-sm font-semibold text-gray-300">From ₦{room.pricePerNight.toLocaleString()} / night</p>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={to} className="group">
      <article>
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-surface-dark shadow-2xl">
          <RoomImage room={room} eager={eager} className="image-luxury h-full w-full object-cover" />
          <div className="luxury-gradient absolute inset-0" />
          <div className="absolute inset-x-6 bottom-6">
            <p className="ui-eyebrow">{category}</p>
            <h2 className="ui-card-title mt-2 italic text-white transition-colors group-hover:text-primary">{room.name}</h2>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-300"><span>{room.capacity} {room.capacity === 1 ? "guest" : "guests"}</span>{room.size && <span>{room.size}</span>}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <div>
            <span className="ui-label mb-1">From</span>
            <p className="text-xl font-semibold text-white">₦{room.pricePerNight.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ night</span></p>
          </div>
          <span className="ui-icon-button" aria-hidden="true"><span className="material-symbols-outlined">arrow_forward</span></span>
        </div>
      </article>
    </Link>
  );
};

export default RoomCard;
