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
import type { Student } from "../data/types";

type StudentsContextValue = {
    students: Student[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    addStudent: (s: Student) => Promise<void>;
    updateStudent: (id: string, patch: Partial<Student>) => Promise<void>;
    replaceStudent: (s: Student) => Promise<void>;
    removeStudent: (id: string) => Promise<void>;
    importStudents: (instituteId: string, programCode: string, rows: Omit<Student, "id">[]) => Promise<void>;
    resetToSeed: () => void;
};

const StudentsContext = createContext<StudentsContextValue | null>(null);

function studentToCreateBody(s: Student) {
    return {
        instituteId: s.department,
        programCode: s.programCode,
        name: s.name,
        age: s.age,
        gender: s.gender,
        religion: s.religion,
        semester: s.semester,
        enrollmentYear: s.enrollmentYear,
        cgpa: s.cgpa,
        eventsAttended: s.eventsAttended,
        coursesEnrolled: s.coursesEnrolled,
        dropYear: s.dropYear,
        activities: s.activities,
        email: s.email,
        phone: s.phone,
        educationalBackground: s.educationalBackground,
    };
}

function studentToPatchBody(s: Partial<Student>) {
    const out: Record<string, unknown> = {};
    if (s.department != null && s.programCode != null) {
        out.instituteId = s.department;
        out.programCode = s.programCode;
    }
    if (s.name !== undefined) out.name = s.name;
    if (s.age !== undefined) out.age = s.age;
    if (s.gender !== undefined) out.gender = s.gender;
    if (s.religion !== undefined) out.religion = s.religion;
    if (s.semester !== undefined) out.semester = s.semester;
    if (s.enrollmentYear !== undefined) out.enrollmentYear = s.enrollmentYear;
    if (s.cgpa !== undefined) out.cgpa = s.cgpa;
    if (s.eventsAttended !== undefined) out.eventsAttended = s.eventsAttended;
    if (s.coursesEnrolled !== undefined) out.coursesEnrolled = s.coursesEnrolled;
    if (s.dropYear !== undefined) out.dropYear = s.dropYear;
    if (s.activities !== undefined) out.activities = s.activities;
    if (s.email !== undefined) out.email = s.email;
    if (s.phone !== undefined) out.phone = s.phone;
    if (s.educationalBackground !== undefined) out.educationalBackground = s.educationalBackground;
    return out;
}

export function StudentsDataProvider({ children }: { children: ReactNode }) {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await fetch("/api/students", { cache: "no-store" });
            if (!res.ok) throw new Error(await res.text());
            const data = (await res.json()) as { students: Student[] };
            setStudents(Array.isArray(data.students) ? data.students : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load students");
            setStudents([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const addStudent = useCallback(async (s: Student) => {
        const res = await fetch("/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(studentToCreateBody(s)),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Create failed");
        await refresh();
    }, [refresh]);

    const updateStudent = useCallback(
        async (id: string, patch: Partial<Student>) => {
            const res = await fetch(`/api/students/${encodeURIComponent(id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(studentToPatchBody(patch)),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Update failed");
            await refresh();
        },
        [refresh]
    );

    const replaceStudent = useCallback(
        async (s: Student) => {
            const res = await fetch(`/api/students/${encodeURIComponent(s.id)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(studentToPatchBody(s)),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Update failed");
            await refresh();
        },
        [refresh]
    );

    const removeStudent = useCallback(
        async (id: string) => {
            const res = await fetch(`/api/students/${encodeURIComponent(id)}`, { method: "DELETE" });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Delete failed");
            await refresh();
        },
        [refresh]
    );

    const importStudents = useCallback(
        async (instituteId: string, programCode: string, rows: Omit<Student, "id">[]) => {
            const res = await fetch("/api/students/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instituteId, programCode, rows }),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Import failed");
            await refresh();
        },
        [refresh]
    );

    const resetToSeed = useCallback(() => {
        void refresh();
    }, [refresh]);

    const value = useMemo(
        () => ({
            students,
            loading,
            error,
            refresh,
            addStudent,
            updateStudent,
            replaceStudent,
            removeStudent,
            importStudents,
            resetToSeed,
        }),
        [
            students,
            loading,
            error,
            refresh,
            addStudent,
            updateStudent,
            replaceStudent,
            removeStudent,
            importStudents,
            resetToSeed,
        ]
    );

    return <StudentsContext.Provider value={value}>{children}</StudentsContext.Provider>;
}

export function useStudents() {
    const ctx = useContext(StudentsContext);
    if (!ctx) throw new Error("useStudents must be used within StudentsDataProvider");
    return ctx;
}
