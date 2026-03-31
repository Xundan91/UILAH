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
import type { Faculty } from "../data/types";

type Value = {
    faculty: Faculty[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    addFaculty: (f: Omit<Faculty, "id">) => Promise<void>;
    updateFaculty: (id: string, patch: Partial<Faculty>) => Promise<void>;
    replaceFaculty: (f: Faculty) => Promise<void>;
    removeFaculty: (id: string) => Promise<void>;
};

const Ctx = createContext<Value | null>(null);

export function FacultyDataProvider({ children }: { children: ReactNode }) {
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await fetch("/api/faculty", { cache: "no-store" });
            if (!res.ok) throw new Error(await res.text());
            const data = (await res.json()) as { faculty: Faculty[] };
            setFaculty(Array.isArray(data.faculty) ? data.faculty : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load faculty");
            setFaculty([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const addFaculty = useCallback(
        async (f: Omit<Faculty, "id">) => {
            const res = await fetch("/api/faculty", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(f),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Create failed");
            await refresh();
        },
        [refresh]
    );

    const updateFaculty = useCallback(
        async (id: string, patch: Partial<Faculty>) => {
            const res = await fetch(`/api/faculty/${encodeURIComponent(id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Update failed");
            await refresh();
        },
        [refresh]
    );

    const replaceFaculty = useCallback(
        async (f: Faculty) => {
            const res = await fetch(`/api/faculty/${encodeURIComponent(f.id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(f),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Update failed");
            await refresh();
        },
        [refresh]
    );

    const removeFaculty = useCallback(
        async (id: string) => {
            const res = await fetch(`/api/faculty/${encodeURIComponent(id)}`, { method: "DELETE" });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Delete failed");
            await refresh();
        },
        [refresh]
    );

    const value = useMemo(
        () => ({
            faculty,
            loading,
            error,
            refresh,
            addFaculty,
            updateFaculty,
            replaceFaculty,
            removeFaculty,
        }),
        [faculty, loading, error, refresh, addFaculty, updateFaculty, replaceFaculty, removeFaculty]
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFacultyData() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useFacultyData must be used within FacultyDataProvider");
    return ctx;
}
