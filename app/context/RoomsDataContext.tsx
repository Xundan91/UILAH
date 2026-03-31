"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { Room } from "../data/types";

type Value = {
    rooms: Room[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    addRoom: (r: Omit<Room, "id"> & { id: string }) => Promise<void>;
    updateRoom: (id: string, patch: Partial<Room>) => Promise<void>;
    replaceRoom: (r: Room) => Promise<void>;
    removeRoom: (id: string) => Promise<void>;
};

const Ctx = createContext<Value | null>(null);

export function RoomsDataProvider({ children }: { children: ReactNode }) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await fetch("/api/rooms", { cache: "no-store" });
            if (!res.ok) throw new Error(await res.text());
            const data = (await res.json()) as { rooms: Room[] };
            setRooms(Array.isArray(data.rooms) ? data.rooms : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load rooms");
            setRooms([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const addRoom = useCallback(
        async (r: Omit<Room, "id"> & { id: string }) => {
            const res = await fetch("/api/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: r.id,
                    building: r.building,
                    floor: r.floor,
                    roomNumber: r.roomNumber,
                    type: r.type,
                    capacity: r.capacity,
                    utilizationPercent: r.utilizationPercent,
                    monthlyUtilization: r.monthlyUtilization,
                    equipment: r.equipment ?? [],
                }),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Create failed");
            await refresh();
        },
        [refresh]
    );

    const updateRoom = useCallback(
        async (id: string, patch: Partial<Room>) => {
            const res = await fetch(`/api/rooms/${encodeURIComponent(id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Update failed");
            await refresh();
        },
        [refresh]
    );

    const replaceRoom = useCallback(
        async (r: Room) => {
            const res = await fetch(`/api/rooms/${encodeURIComponent(r.id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    building: r.building,
                    floor: r.floor,
                    roomNumber: r.roomNumber,
                    type: r.type,
                    capacity: r.capacity,
                    utilizationPercent: r.utilizationPercent,
                    monthlyUtilization: r.monthlyUtilization,
                    equipment: r.equipment ?? [],
                }),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Update failed");
            await refresh();
        },
        [refresh]
    );

    const removeRoom = useCallback(
        async (id: string) => {
            const res = await fetch(`/api/rooms/${encodeURIComponent(id)}`, { method: "DELETE" });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Delete failed");
            await refresh();
        },
        [refresh]
    );

    const value = useMemo(
        () => ({
            rooms,
            loading,
            error,
            refresh,
            addRoom,
            updateRoom,
            replaceRoom,
            removeRoom,
        }),
        [rooms, loading, error, refresh, addRoom, updateRoom, replaceRoom, removeRoom]
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRooms() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useRooms must be used within RoomsDataProvider");
    return ctx;
}
