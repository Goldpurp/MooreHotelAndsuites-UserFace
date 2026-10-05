import type { Booking, Room } from "../types";

export function bookingRoomLabel(booking: Booking, legacyRoom?: Room | null): string {
  const state = String(booking.status).toLowerCase();
  if (state === "cancelled" || state === "noshow") return "Room allocation released";
  if (booking.rooms?.length) return [...booking.rooms].sort((a, b) => a.sequence - b.sequence).map(unit => {
    const status = (unit.assignmentStatus || "Pending").toLowerCase();
    if (status === "released") return unit.roomTypeName + ": allocation released";
    if (unit.assignedRoomName) return unit.assignedRoomName + (status === "completed" ? " (past stay)" : "");
    return unit.roomTypeName + (status === "completed" ? ": past stay" : ": assignment pending");
  }).join("; ");
  return legacyRoom?.name || (booking.roomId ? "Room details unavailable" : "Room assignment pending");
}
