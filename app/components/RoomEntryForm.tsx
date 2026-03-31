"use client";

import { useEffect, useState } from "react";
import type { Room } from "../data/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function defaultMonthly(util: number): { month: string; percent: number }[] {
    const p = Math.min(100, Math.max(0, Math.round(util)));
    return MONTHS.map((month) => ({ month, percent: p }));
}

export type RoomEntryFormProps = {
    mode: "add" | "edit";
    initial?: Room | null;
    defaultBuilding?: "A2" | "A3";
    onSubmit: (r: Room) => void | Promise<void>;
    onCancel?: () => void;
    variant?: "modal" | "inline";
};

const ROOM_TYPES: Room["type"][] = ["Classroom", "Lab", "Tutorial Room", "Library", "Seminar Hall"];

export default function RoomEntryForm({
    mode,
    initial,
    defaultBuilding = "A2",
    onSubmit,
    onCancel,
    variant = "inline",
}: RoomEntryFormProps) {
    const [id, setId] = useState("");
    const [building, setBuilding] = useState<"A2" | "A3">(defaultBuilding);
    const [floor, setFloor] = useState(0);
    const [roomNumber, setRoomNumber] = useState("");
    const [type, setType] = useState<Room["type"]>("Classroom");
    const [capacity, setCapacity] = useState(60);
    const [utilizationPercent, setUtilizationPercent] = useState(70);
    const [equipmentText, setEquipmentText] = useState("");
    const [monthlyJson, setMonthlyJson] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (mode === "edit" && initial) {
            setId(initial.id);
            setBuilding(initial.building);
            setFloor(initial.floor);
            setRoomNumber(initial.roomNumber);
            setType(initial.type);
            setCapacity(initial.capacity);
            setUtilizationPercent(initial.utilizationPercent);
            setEquipmentText((initial.equipment ?? []).join(", "));
            setMonthlyJson(JSON.stringify(initial.monthlyUtilization, null, 2));
        } else {
            setId("");
            setBuilding(defaultBuilding);
            setFloor(0);
            setRoomNumber("");
            setType("Classroom");
            setCapacity(60);
            setUtilizationPercent(70);
            setEquipmentText("");
            setMonthlyJson("");
        }
    }, [mode, initial, defaultBuilding]);

    const parseMonthly = (): { month: string; percent: number }[] => {
        const t = monthlyJson.trim();
        if (t) {
            try {
                const parsed = JSON.parse(t) as unknown;
                if (Array.isArray(parsed) && parsed.length > 0) return parsed as { month: string; percent: number }[];
            } catch {
                /* fall through */
            }
        }
        return defaultMonthly(utilizationPercent);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomNumber.trim() || saving) return;
        if (mode === "add" && !id.trim()) {
            window.alert("Room ID is required (e.g. A2-G07).");
            return;
        }

        const equipment = equipmentText
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean);

        const monthlyUtilization = parseMonthly();

        const base: Omit<Room, "id"> & { id?: string } = {
            building,
            floor: Number(floor) || 0,
            roomNumber: roomNumber.trim(),
            type,
            capacity: Math.max(1, Number(capacity) || 1),
            utilizationPercent: Math.min(100, Math.max(0, Number(utilizationPercent) || 0)),
            monthlyUtilization,
            equipment: equipment.length ? equipment : undefined,
        };

        setSaving(true);
        try {
            if (mode === "edit" && initial) {
                await onSubmit({ ...base, id: initial.id } as Room);
            } else {
                await onSubmit({ ...base, id: id.trim() } as Room);
            }
            if (mode === "add" && variant === "inline") {
                setId("");
                setRoomNumber("");
                setEquipmentText("");
                setMonthlyJson("");
            }
        } catch (err) {
            window.alert(err instanceof Error ? err.message : "Could not save.");
        } finally {
            setSaving(false);
        }
    };

    const gap = variant === "inline" ? 14 : 12;

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Room ID * {mode === "edit" && "(fixed)"}</span>
                    <input
                        className="search-input"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        placeholder="e.g. A2-G07"
                        disabled={mode === "edit"}
                        required={mode === "add"}
                    />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Room label / number *</span>
                    <input className="search-input" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="Same as ID or display label" required />
                </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Building</span>
                    <select className="filter-select" value={building} onChange={(e) => setBuilding(e.target.value as "A2" | "A3")}>
                        <option value="A2">A2</option>
                        <option value="A3">A3</option>
                    </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Floor</span>
                    <input type="number" min={0} max={10} className="search-input" value={floor} onChange={(e) => setFloor(parseInt(e.target.value, 10) || 0)} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Type</span>
                    <select className="filter-select" value={type} onChange={(e) => setType(e.target.value as Room["type"])}>
                        {ROOM_TYPES.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Capacity</span>
                    <input type="number" min={1} className="search-input" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 1)} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Utilization %</span>
                    <input type="number" min={0} max={100} className="search-input" value={utilizationPercent} onChange={(e) => setUtilizationPercent(parseInt(e.target.value, 10) || 0)} />
                </label>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Equipment (comma-separated)</span>
                <input className="search-input" value={equipmentText} onChange={(e) => setEquipmentText(e.target.value)} placeholder="Projector, AC, Smart Board" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Monthly utilization JSON (optional)</span>
                <textarea
                    className="search-input"
                    rows={5}
                    value={monthlyJson}
                    onChange={(e) => setMonthlyJson(e.target.value)}
                    placeholder='Leave empty to use flat % for all 12 months. Or paste JSON: [{"month":"Jan","percent":80},…]'
                    style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, resize: "vertical" }}
                />
            </label>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8, flexWrap: "wrap" }}>
                {onCancel && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel} disabled={saving}>
                        Cancel
                    </button>
                )}
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? "Saving…" : mode === "add" ? "Save to database" : "Save changes"}
                </button>
            </div>
        </form>
    );
}
