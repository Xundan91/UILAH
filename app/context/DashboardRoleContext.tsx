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

export type DashboardRole = "professor" | "assistant";

const ROLE_KEY = "uilah_dashboard_role";

type RoleContextValue = {
    role: DashboardRole;
    setRole: (r: DashboardRole) => void;
    isAssistant: boolean;
};

const DashboardRoleContext = createContext<RoleContextValue | null>(null);

export function DashboardRoleProvider({ children }: { children: ReactNode }) {
    const [role, setRoleState] = useState<DashboardRole>("assistant");

    useEffect(() => {
        try {
            const s = localStorage.getItem(ROLE_KEY) as DashboardRole | null;
            if (s === "assistant" || s === "professor") setRoleState(s);
        } catch {
            /* ignore */
        }
    }, []);

    const setRole = useCallback((r: DashboardRole) => {
        setRoleState(r);
        try {
            localStorage.setItem(ROLE_KEY, r);
        } catch {
            /* ignore */
        }
    }, []);

    const value = useMemo(
        () => ({
            role,
            setRole,
            isAssistant: role === "assistant",
        }),
        [role, setRole]
    );

    return <DashboardRoleContext.Provider value={value}>{children}</DashboardRoleContext.Provider>;
}

export function useDashboardRole() {
    const ctx = useContext(DashboardRoleContext);
    if (!ctx) throw new Error("useDashboardRole must be used within DashboardRoleProvider");
    return ctx;
}
