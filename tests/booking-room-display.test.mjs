import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
const source=await readFile(new URL("../utils/bookingRooms.ts",import.meta.url),"utf8");
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {bookingRoomLabel}=await import("data:text/javascript;base64,"+Buffer.from(js).toString("base64"));
test("guest room display uses current multi-unit assignment and preserves pending units",()=>{
 const booking={status:"Confirmed",rooms:[{sequence:2,roomTypeName:"Deluxe",assignmentStatus:"Pending"},{sequence:1,roomTypeName:"Suite",assignedRoomName:"Ocean suite",assignmentStatus:"Assigned"}]};
 assert.equal(bookingRoomLabel(booking),"Ocean suite; Deluxe: assignment pending");
 booking.rooms[1].assignedRoomName="Garden suite";
 assert.match(bookingRoomLabel(booking),/^Garden suite/);
 assert.equal(booking.rooms[0].sequence,2);
});
test("released and completed reservations never imply a current room allocation",()=>{
 const booking={status:"Cancelled",rooms:[{sequence:1,roomTypeName:"Suite",assignedRoomName:"Ocean suite",assignmentStatus:"Released"}]};
 assert.equal(bookingRoomLabel(booking),"Room allocation released");
 booking.status="CheckedOut";booking.rooms[0].assignmentStatus="Completed";
 assert.equal(bookingRoomLabel(booking),"Ocean suite (past stay)");
 assert.equal(bookingRoomLabel({status:"Pending"}),"Room assignment pending");
});
