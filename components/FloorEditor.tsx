"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Floor, FloorRoom, RoomKey } from "@/lib/projects";

const FLOOR_LABELS: Record<Floor["key"], string> = {
  ground: "Zemin Kat",
  first: "1. Kat",
  roof: "Çatı Katı",
};

const ROOM_LABELS: Record<RoomKey, string> = {
  room: "Oda",
  bedroom: "Yatak Odası",
  livingRoom: "Salon",
  kitchen: "Mutfak",
  bathroom: "Banyo",
  masterBathroom: "Ebeveyn Banyosu",
  dressingRoom: "Giyinme Odası",
  hall: "Hol",
};

function emptyFloor(): Floor {
  return { key: "ground", areaM2: 0, outdoorKind: null, outdoorAreaM2: null, rooms: [] };
}

function emptyRoom(): FloorRoom {
  return { roomKey: "bedroom", count: 1 };
}

export function FloorEditor({ floors, onChange }: { floors: Floor[]; onChange: (floors: Floor[]) => void }) {
  function updateFloor(index: number, patch: Partial<Floor>) {
    onChange(floors.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function updateRoom(floorIndex: number, roomIndex: number, patch: Partial<FloorRoom>) {
    const floor = floors[floorIndex];
    const rooms = floor.rooms.map((r, i) => (i === roomIndex ? { ...r, ...patch } : r));
    updateFloor(floorIndex, { rooms });
  }

  return (
    <div className="space-y-4">
      {floors.map((floor, floorIndex) => (
        <div key={floorIndex} className="rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <select
              value={floor.key}
              onChange={(e) => updateFloor(floorIndex, { key: e.target.value as Floor["key"] })}
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            >
              {(Object.keys(FLOOR_LABELS) as Floor["key"][]).map((k) => (
                <option key={k} value={k}>
                  {FLOOR_LABELS[k]}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={floor.areaM2}
              onChange={(e) => updateFloor(floorIndex, { areaM2: Number(e.target.value) })}
              placeholder="Alan m²"
              className="w-28 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <select
              value={floor.outdoorKind ?? ""}
              onChange={(e) =>
                updateFloor(floorIndex, {
                  outdoorKind: (e.target.value || null) as Floor["outdoorKind"],
                  outdoorAreaM2: e.target.value ? floor.outdoorAreaM2 : null,
                })
              }
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            >
              <option value="">Veranda/Teras yok</option>
              <option value="veranda">Veranda</option>
              <option value="terrace">Teras</option>
            </select>
            {floor.outdoorKind && (
              <input
                type="number"
                value={floor.outdoorAreaM2 ?? ""}
                onChange={(e) => updateFloor(floorIndex, { outdoorAreaM2: Number(e.target.value) })}
                placeholder="Veranda/Teras m²"
                className="w-32 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
              />
            )}
            <button
              type="button"
              onClick={() => onChange(floors.filter((_, i) => i !== floorIndex))}
              className="ml-auto text-neutral-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {floor.rooms.map((room, roomIndex) => (
              <div key={roomIndex} className="flex items-center gap-2">
                <select
                  value={room.roomKey}
                  onChange={(e) => updateRoom(floorIndex, roomIndex, { roomKey: e.target.value as RoomKey })}
                  className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                >
                  {(Object.keys(ROOM_LABELS) as RoomKey[]).map((k) => (
                    <option key={k} value={k}>
                      {ROOM_LABELS[k]}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={room.count}
                  onChange={(e) => updateRoom(floorIndex, roomIndex, { count: Number(e.target.value) })}
                  className="w-16 rounded-md border border-neutral-300 px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => updateFloor(floorIndex, { rooms: floor.rooms.filter((_, i) => i !== roomIndex) })}
                  className="text-neutral-400 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateFloor(floorIndex, { rooms: [...floor.rooms, emptyRoom()] })}
              className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
            >
              <Plus className="h-3.5 w-3.5" /> Oda ekle
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...floors, emptyFloor()])}
        className="flex items-center gap-1.5 rounded-md border border-dashed border-neutral-300 px-3 py-2 text-sm text-neutral-500 hover:border-neutral-400 hover:text-neutral-900"
      >
        <Plus className="h-4 w-4" /> Kat ekle
      </button>
    </div>
  );
}
