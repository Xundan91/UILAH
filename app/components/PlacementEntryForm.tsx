"use client";

import { useEffect, useState } from "react";
import { departments } from "../data/departments";
import type { PlacementRecord } from "../data/types";

export type PlacementEntryFormProps = {
    mode: "add" | "edit";
    initial?: PlacementRecord | null;
    defaultDepartment?: string;
    onSubmit: (p: PlacementRecord) => void | Promise<void>;
    onCancel?: () => void;
    variant?: "modal" | "inline";
};

export default function PlacementEntryForm({
    mode,
    initial,
    defaultDepartment = "uilah",
    onSubmit,
    onCancel,
    variant = "inline",
}: PlacementEntryFormProps) {
    const [studentId, setStudentId] = useState("");
    const [studentName, setStudentName] = useState("");
    const [department, setDepartment] = useState(defaultDepartment);
    const [year, setYear] = useState(2025);
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [pkg, setPkg] = useState(5);
    const [crcRegistered, setCrcRegistered] = useState(true);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [isAlumni, setIsAlumni] = useState(false);
    const [graduationYearText, setGraduationYearText] = useState("");
    const [valueAddText, setValueAddText] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (mode === "edit" && initial) {
            setStudentId(initial.studentId);
            setStudentName(initial.studentName);
            setDepartment(initial.department);
            setYear(initial.year);
            setCompany(initial.company);
            setRole(initial.role);
            setPkg(initial.package);
            setCrcRegistered(initial.crcRegistered);
            setEmail(initial.email);
            setPhone(initial.phone);
            setIsAlumni(initial.isAlumni);
            setGraduationYearText(initial.graduationYear != null ? String(initial.graduationYear) : "");
            setValueAddText((initial.valueAddCourses ?? []).join(", "));
        } else {
            setStudentId("");
            setStudentName("");
            setDepartment(defaultDepartment);
            setYear(2025);
            setCompany("");
            setRole("");
            setPkg(5);
            setCrcRegistered(true);
            setEmail("");
            setPhone("");
            setIsAlumni(false);
            setGraduationYearText("");
            setValueAddText("");
        }
    }, [mode, initial, defaultDepartment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentName.trim() || !company.trim() || !role.trim() || saving) return;

        const courses = valueAddText
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean);
        const gy = graduationYearText.trim() ? parseInt(graduationYearText, 10) : null;

        const base: Omit<PlacementRecord, "id"> = {
            studentId: studentId.trim() || `STU${Date.now().toString().slice(-5)}`,
            studentName: studentName.trim(),
            department,
            year,
            company: company.trim(),
            role: role.trim(),
            package: Math.min(100, Math.max(0, Number(pkg) || 0)),
            crcRegistered,
            email: email.trim() || `student.${Date.now()}@cu.edu.in`,
            phone: phone.trim() || "+91 0000000000",
            isAlumni,
            graduationYear: gy != null && !isNaN(gy) ? gy : undefined,
            valueAddCourses: courses.length ? courses : undefined,
        };

        setSaving(true);
        try {
            if (mode === "edit" && initial) {
                await onSubmit({ ...base, id: initial.id });
            } else {
                await onSubmit({ ...base, id: "" } as PlacementRecord);
            }
            if (mode === "add" && variant === "inline") {
                setStudentId("");
                setStudentName("");
                setCompany("");
                setRole("");
                setEmail("");
                setPhone("");
                setGraduationYearText("");
                setValueAddText("");
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
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Student ID *</span>
                    <input
                        className="search-input"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="e.g. STU00123 (optional)"
                    />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Student name *</span>
                    <input
                        className="search-input"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        required
                    />
                </label>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Institute</span>
                <select className="filter-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                    {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.shortName}
                        </option>
                    ))}
                </select>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Year</span>
                    <select className="filter-select" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
                        {[2022, 2023, 2024, 2025, 2026].map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Package (LPA)</span>
                    <input
                        type="number"
                        step="0.01"
                        min={0}
                        className="search-input"
                        value={pkg}
                        onChange={(e) => setPkg(parseFloat(e.target.value) || 0)}
                    />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>CRC registered</span>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input type="checkbox" checked={crcRegistered} onChange={(e) => setCrcRegistered(e.target.checked)} />
                        <span style={{ fontSize: 13 }}>Registered with CRC</span>
                    </label>
                </label>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Company *</span>
                <input className="search-input" value={company} onChange={(e) => setCompany(e.target.value)} required />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Role *</span>
                <input className="search-input" value={role} onChange={(e) => setRole(e.target.value)} required />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Email</span>
                    <input type="email" className="search-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Phone</span>
                    <input className="search-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </label>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Alumni</span>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={isAlumni} onChange={(e) => setIsAlumni(e.target.checked)} />
                    <span style={{ fontSize: 13 }}>Mark as alumni placement</span>
                </label>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Graduation year (optional)</span>
                    <input className="search-input" value={graduationYearText} onChange={(e) => setGraduationYearText(e.target.value)} placeholder="e.g. 2024" />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Value-add courses (comma-separated)</span>
                    <input className="search-input" value={valueAddText} onChange={(e) => setValueAddText(e.target.value)} placeholder="Course A, Course B" />
                </label>
            </div>
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
