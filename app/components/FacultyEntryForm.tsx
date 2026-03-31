"use client";

import { useEffect, useState } from "react";
import { departments } from "../data/departments";
import { emptyPublicationProfile, type Faculty, type PublicationProfile } from "../data/types";

export type FacultyEntryFormProps = {
    mode: "add" | "edit";
    initial?: Faculty | null;
    defaultDepartment?: string;
    onSubmit: (f: Faculty) => void | Promise<void>;
    onCancel?: () => void;
    variant?: "modal" | "inline";
};

function mergePublications(
    initial: Faculty | null | undefined,
    scopus: number,
    jsonText: string
): PublicationProfile {
    const base = initial?.publications
        ? (JSON.parse(JSON.stringify(initial.publications)) as PublicationProfile)
        : emptyPublicationProfile();
    base.scopusArticles = scopus;
    const trimmed = jsonText.trim();
    if (!trimmed) return base;
    try {
        const parsed = JSON.parse(trimmed) as Partial<PublicationProfile>;
        return {
            ...emptyPublicationProfile(),
            ...base,
            ...parsed,
            scopusArticles: parsed.scopusArticles ?? scopus,
            conferences: parsed.conferences ?? base.conferences,
            books: parsed.books ?? base.books,
            patents: parsed.patents ?? base.patents,
            articles: parsed.articles ?? base.articles,
        };
    } catch {
        return base;
    }
}

export default function FacultyEntryForm({
    mode,
    initial,
    defaultDepartment = "uilah",
    onSubmit,
    onCancel,
    variant = "inline",
}: FacultyEntryFormProps) {
    const [name, setName] = useState("");
    const [gender, setGender] = useState<Faculty["gender"]>("Male");
    const [age, setAge] = useState(35);
    const [religion, setReligion] = useState("Hindu");
    const [department, setDepartment] = useState(defaultDepartment);
    const [designation, setDesignation] = useState("Assistant Professor");
    const [education, setEducation] = useState<Faculty["education"]>("PhD");
    const [educationDetails, setEducationDetails] = useState("");
    const [specText, setSpecText] = useState("");
    const [coursesText, setCoursesText] = useState("");
    const [achievementsText, setAchievementsText] = useState("");
    const [fdpText, setFdpText] = useState("");
    const [scopus, setScopus] = useState(0);
    const [publicationsJson, setPublicationsJson] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (mode === "edit" && initial) {
            setName(initial.name);
            setGender(initial.gender);
            setAge(initial.age);
            setReligion(initial.religion);
            setDepartment(initial.department);
            setDesignation(initial.designation);
            setEducation(initial.education);
            setEducationDetails(initial.educationDetails);
            setSpecText(initial.specialization.join(", "));
            setCoursesText(initial.coursesTeaching.join(", "));
            setAchievementsText(initial.achievements.join(", "));
            setFdpText(initial.facultyDevelopment.join(", "));
            setScopus(initial.publications.scopusArticles);
            setPublicationsJson("");
        } else {
            setName("");
            setGender("Male");
            setAge(35);
            setReligion("Hindu");
            setDepartment(defaultDepartment);
            setDesignation("Assistant Professor");
            setEducation("PhD");
            setEducationDetails("");
            setSpecText("");
            setCoursesText("");
            setAchievementsText("");
            setFdpText("");
            setScopus(0);
            setPublicationsJson("");
        }
    }, [mode, initial, defaultDepartment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !educationDetails.trim() || saving) return;

        const specialization = specText
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean);
        const coursesTeaching = coursesText
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean);
        const achievements = achievementsText
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean);
        const facultyDevelopment = fdpText
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean);

        const publications = mergePublications(initial ?? null, scopus, publicationsJson);

        const base: Omit<Faculty, "id"> = {
            name: name.trim(),
            gender,
            age: Math.min(80, Math.max(22, age)),
            religion,
            department,
            designation,
            education,
            educationDetails: educationDetails.trim(),
            specialization: specialization.length ? specialization : ["General"],
            coursesTeaching: coursesTeaching.length ? coursesTeaching : ["Core course"],
            publications,
            achievements,
            facultyDevelopment,
        };

        setSaving(true);
        try {
            if (mode === "edit" && initial) {
                await onSubmit({ ...base, id: initial.id });
            } else {
                await onSubmit({ ...base, id: "" } as Faculty);
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
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Full name *</span>
                <input className="search-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Gender</span>
                    <select className="filter-select" value={gender} onChange={(e) => setGender(e.target.value as Faculty["gender"])}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Age</span>
                    <input type="number" min={22} max={80} className="search-input" value={age} onChange={(e) => setAge(parseInt(e.target.value, 10) || 30)} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Religion</span>
                    <input className="search-input" value={religion} onChange={(e) => setReligion(e.target.value)} />
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
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Designation</span>
                <input className="search-input" value={designation} onChange={(e) => setDesignation(e.target.value)} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Education</span>
                <select className="filter-select" value={education} onChange={(e) => setEducation(e.target.value as Faculty["education"])}>
                    <option value="PhD">PhD</option>
                    <option value="Pursuing PhD">Pursuing PhD</option>
                    <option value="Non-PhD">Non-PhD</option>
                </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Education details *</span>
                <textarea
                    className="search-input"
                    rows={3}
                    value={educationDetails}
                    onChange={(e) => setEducationDetails(e.target.value)}
                    placeholder="Degree, university, year"
                    required
                    style={{ resize: "vertical", minHeight: 72 }}
                />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Specializations (comma-separated)</span>
                <input className="search-input" value={specText} onChange={(e) => setSpecText(e.target.value)} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Courses teaching (comma-separated)</span>
                <input className="search-input" value={coursesText} onChange={(e) => setCoursesText(e.target.value)} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Scopus article count</span>
                <input type="number" min={0} className="search-input" value={scopus} onChange={(e) => setScopus(parseInt(e.target.value, 10) || 0)} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Achievements (comma-separated)</span>
                <input className="search-input" value={achievementsText} onChange={(e) => setAchievementsText(e.target.value)} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Faculty development (comma-separated)</span>
                <input className="search-input" value={fdpText} onChange={(e) => setFdpText(e.target.value)} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Full publications JSON (optional, overrides counts)</span>
                <textarea
                    className="search-input"
                    rows={4}
                    value={publicationsJson}
                    onChange={(e) => setPublicationsJson(e.target.value)}
                    placeholder='Paste full PublicationProfile JSON, or leave empty to use fields above'
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
