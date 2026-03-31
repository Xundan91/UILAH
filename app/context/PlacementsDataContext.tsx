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
import type { PlacementRecord } from "../data/types";

type Value = {
    placements: PlacementRecord[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    addPlacement: (p: Omit<PlacementRecord, "id">) => Promise<void>;
    updatePlacement: (id: string, patch: Partial<PlacementRecord>) => Promise<void>;
    replacePlacement: (p: PlacementRecord) => Promise<void>;
    removePlacement: (id: string) => Promise<void>;
};

const Ctx = createContext<Value | null>(null);

export function PlacementsDataProvider({ children }: { children: ReactNode }) {
    const [placements, setPlacements] = useState<PlacementRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await fetch("/api/placements", { cache: "no-store" });
            if (!res.ok) throw new Error(await res.text());
            const data = (await res.json()) as { placements: PlacementRecord[] };
            setPlacements(Array.isArray(data.placements) ? data.placements : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load placements");
            setPlacements([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const addPlacement = useCallback(
        async (p: Omit<PlacementRecord, "id">) => {
            const res = await fetch("/api/placements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: p.studentId,
                    studentName: p.studentName,
                    department: p.department,
                    year: p.year,
                    company: p.company,
                    role: p.role,
                    package: p.package,
                    crcRegistered: p.crcRegistered,
                    email: p.email,
                    phone: p.phone,
                    isAlumni: p.isAlumni,
                    graduationYear: p.graduationYear ?? null,
                    valueAddCourses: p.valueAddCourses ?? [],
                }),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Create failed");
            await refresh();
        },
        [refresh]
    );

    const updatePlacement = useCallback(
        async (id: string, patch: Partial<PlacementRecord>) => {
            const res = await fetch(`/api/placements/${encodeURIComponent(id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Update failed");
            await refresh();
        },
        [refresh]
    );

    const replacePlacement = useCallback(
        async (p: PlacementRecord) => {
            const res = await fetch(`/api/placements/${encodeURIComponent(p.id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(p),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Update failed");
            await refresh();
        },
        [refresh]
    );

    const removePlacement = useCallback(
        async (id: string) => {
            const res = await fetch(`/api/placements/${encodeURIComponent(id)}`, { method: "DELETE" });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Delete failed");
            await refresh();
        },
        [refresh]
    );

    const value = useMemo(
        () => ({
            placements,
            loading,
            error,
            refresh,
            addPlacement,
            updatePlacement,
            replacePlacement,
            removePlacement,
        }),
        [placements, loading, error, refresh, addPlacement, updatePlacement, replacePlacement, removePlacement]
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlacements() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("usePlacements must be used within PlacementsDataProvider");
    return ctx;
}
