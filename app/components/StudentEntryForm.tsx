"use client";

import { useEffect, useState } from "react";
import type { Activity, Student } from "../data/types";

export type StudentEntryFormProps = {
    deptId: string;
    programCode: string;
    programDisplay: string;
    mode: "add" | "edit";
    initial?: Student | null;
    onSubmit: (student: Student) => void | Promise<void>;
    onCancel?: () => void;
    /** When true, used inside a page card (wider layout hints). */
    variant?: "modal" | "inline";
};

const emptyActivity: Activity[] = [];

export default function StudentEntryForm({
    deptId,
    programCode,
    programDisplay,
    mode,
    initial,
    onSubmit,
    onCancel,
    variant = "modal",
}: StudentEntryFormProps) {
    const [name, setName] = useState("");
    const [age, setAge] = useState(20);
    const [gender, setGender] = useState<Student["gender"]>("Male");
    const [religion, setReligion] = useState("Hindu");
    const [semester, setSemester] = useState(3);
    const [enrollmentYear, setEnrollmentYear] = useState(2023);
    const [cgpa, setCgpa] = useState(7.5);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [educationalBackground, setEducationalBackground] = useState("CBSE Board");
    const [coursesText, setCoursesText] = useState("");
    const [dropYearText, setDropYearText] = useState("");
    const [eventsAttended, setEventsAttended] = useState(0);
    const [saving, setSaving] = useState(false);

    const resetEmpty = () => {
        setName("");
        setAge(20);
        setGender("Male");
        setReligion("Hindu");
        setSemester(3);
        setEnrollmentYear(2023);
        setCgpa(7.5);
        setEmail("");
        setPhone("");
        setEducationalBackground("CBSE Board");
        setCoursesText("");
        setDropYearText("");
        setEventsAttended(0);
    };

    useEffect(() => {
        if (mode === "edit" && initial) {
            setName(initial.name);
            setAge(initial.age);
            setGender(initial.gender);
            setReligion(initial.religion);
            setSemester(initial.semester);
            setEnrollmentYear(initial.enrollmentYear);
            setCgpa(initial.cgpa);
            setEmail(initial.email);
            setPhone(initial.phone);
            setEducationalBackground(initial.educationalBackground);
            setCoursesText(initial.coursesEnrolled.join(", "));
            setDropYearText(initial.dropYear != null ? String(initial.dropYear) : "");
            setEventsAttended(initial.eventsAttended);
        } else {
            resetEmpty();
        }
    }, [mode, initial, deptId, programCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || saving) return;

        const coursesEnrolled = coursesText
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean);
        const dropYear = dropYearText.trim() ? parseInt(dropYearText, 10) : null;

        const base: Omit<Student, "id"> = {
            name: name.trim(),
            age,
            gender,
            religion,
            department: initial?.department ?? deptId,
            programCode: initial?.programCode ?? programCode,
            program: programDisplay,
            semester,
            enrollmentYear,
            cgpa: Math.round(Math.min(10, Math.max(0, cgpa)) * 100) / 100,
            eventsAttended,
            coursesEnrolled: coursesEnrolled.length ? coursesEnrolled : ["Core Course"],
            dropYear: dropYear != null && !isNaN(dropYear) ? dropYear : null,
            activities: initial?.activities ?? emptyActivity,
            email: email.trim() || `student.${Date.now()}@cu.edu.in`,
            phone: phone.trim() || "+91 0000000000",
            educationalBackground,
        };

        setSaving(true);
        try {
            if (mode === "edit" && initial) {
                await onSubmit({ ...base, id: initial.id } as Student);
            } else {
                await onSubmit({ ...base, id: "" } as Student);
                if (variant === "inline") resetEmpty();
            }
        } catch (err) {
            window.alert(err instanceof Error ? err.message : "Could not save student.");
        } finally {
            setSaving(false);
        }
    };

    const gap = variant === "inline" ? 14 : 12;

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Full name *</span>
                <input
                    className="search-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Candidate full name"
                    autoComplete="name"
                />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Age</span>
                    <input
                        type="number"
                        className="search-input"
                        min={16}
                        max={60}
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value, 10) || 18)}
                    />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Gender</span>
                    <select className="filter-select" value={gender} onChange={(e) => setGender(e.target.value as Student["gender"])}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </label>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Religion</span>
                <input className="search-input" value={religion} onChange={(e) => setReligion(e.target.value)} />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Semester</span>
                    <select className="filter-select" value={semester} onChange={(e) => setSemester(parseInt(e.target.value, 10))}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Admission year</span>
                    <select className="filter-select" value={enrollmentYear} onChange={(e) => setEnrollmentYear(parseInt(e.target.value, 10))}>
                        {[2021, 2022, 2023, 2024, 2025, 2026].map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>CGPA</span>
                    <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={10}
                        className="search-input"
                        value={cgpa}
                        onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                    />
                </label>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Educational background</span>
                <input className="search-input" value={educationalBackground} onChange={(e) => setEducationalBackground(e.target.value)} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Courses (comma-separated)</span>
                <input
                    className="search-input"
                    value={coursesText}
                    onChange={(e) => setCoursesText(e.target.value)}
                    placeholder="Course A, Course B"
                />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Email</span>
                    <input type="email" className="search-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Phone</span>
                    <input className="search-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" />
                </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Events attended (count)</span>
                    <input
                        type="number"
                        min={0}
                        className="search-input"
                        value={eventsAttended}
                        onChange={(e) => setEventsAttended(parseInt(e.target.value, 10) || 0)}
                    />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Drop year (optional)</span>
                    <input
                        className="search-input"
                        value={dropYearText}
                        onChange={(e) => setDropYearText(e.target.value)}
                        placeholder="Leave empty if enrolled"
                    />
                </label>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: variant === "inline" ? 8 : 16, flexWrap: "wrap" }}>
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
