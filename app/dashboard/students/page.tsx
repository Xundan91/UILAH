"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Users, Filter } from "lucide-react";
import { departments, totalProgramOfferings, programCodeToSlug } from "../../data/departments";
import { useStudents } from "../../context/StudentsDataContext";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, ArcElement,
    Tooltip, Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function StudentsPage() {
    const { students } = useStudents();
    const [instituteFilter, setInstituteFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredDepts = useMemo(() => {
        return departments.filter((d) => {
            if (instituteFilter !== "all" && d.id !== instituteFilter) return false;
            if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase()) && !d.shortName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
    }, [instituteFilter, searchQuery]);

    const enrollmentData = useMemo(() => ({
        labels: filteredDepts.map((d) => d.shortName),
        datasets: [{
            label: "Students",
            data: filteredDepts.map((d) => students.filter((s) => s.department === d.id).length),
            backgroundColor: [
                "rgba(194,117,72,0.7)", "rgba(212,168,83,0.7)", "rgba(139,157,131,0.7)",
                "rgba(155,142,196,0.7)", "rgba(196,122,138,0.7)", "rgba(107,163,190,0.7)",
            ],
            borderRadius: 6,
            borderSkipped: false,
        }],
    }), [filteredDepts]);

    const instituteSplitData = useMemo(() => ({
        labels: departments.map((d) => d.shortName),
        datasets: [{
            data: departments.map((d) => students.filter((s) => s.department === d.id).length),
            backgroundColor: [
                "rgba(194,117,72,0.75)", "rgba(212,168,83,0.75)", "rgba(139,157,131,0.75)",
                "rgba(155,142,196,0.75)", "rgba(196,122,138,0.75)", "rgba(107,163,190,0.75)",
            ],
            borderWidth: 0,
            hoverOffset: 8,
        }],
    }), []);

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: 28 }}>
                <h1 className="heading-serif" style={{ fontSize: 28, margin: 0 }}>
                    Student Data — Institutes
                </h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
                    Six university institutes (UIA, UID, UIFVA, UILAH, UIMS, UITTR) and their degree programs
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
                <div className="stat-card terracotta">
                    <Users size={18} color="var(--accent-terracotta)" />
                    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>{students.length}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Total Students</div>
                </div>
                <div className="stat-card sage">
                    <Users size={18} color="var(--accent-sage)" />
                    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>{departments.length}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Institutes</div>
                </div>
                <div className="stat-card lavender">
                    <Users size={18} color="var(--accent-lavender)" />
                    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>{totalProgramOfferings}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Program offerings</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 28 }}>
                <div className="chart-container">
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Students per Institute</h3>
                    <div style={{ height: 240 }}>
                        <Bar data={enrollmentData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } },
                                y: { grid: { color: "rgba(0,0,0,0.04)" } },
                            },
                        }} />
                    </div>
                </div>
                <div className="chart-container">
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>By Institute</h3>
                    <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Doughnut data={instituteSplitData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { position: "bottom", labels: { font: { size: 10 } } } },
                            cutout: "65%",
                        }} />
                    </div>
                </div>
            </div>

            <div className="card-static" style={{ padding: 16, marginBottom: 24 }}>
                <div className="filter-bar" style={{ padding: 0 }}>
                    <Filter size={14} color="var(--text-muted)" />
                    <input
                        type="text" placeholder="Search institute…" value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input" style={{ maxWidth: 220 }}
                    />
                    <div className="tab-group" style={{ width: "auto", flexWrap: "wrap" }}>
                        <button className={`tab ${instituteFilter === "all" ? "active" : ""}`} onClick={() => setInstituteFilter("all")}>All</button>
                        {departments.map((d) => (
                            <button
                                key={d.id}
                                className={`tab ${instituteFilter === d.id ? "active" : ""}`}
                                onClick={() => setInstituteFilter(d.id)}
                            >
                                {d.shortName}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 16,
            }}>
                {filteredDepts.map((dept, i) => {
                    const deptStudents = students.filter((s) => s.department === dept.id);
                    const avgCgpa = deptStudents.length > 0
                        ? (deptStudents.reduce((a, s) => a + s.cgpa, 0) / deptStudents.length).toFixed(2)
                        : "—";
                    const dropped = deptStudents.filter((s) => s.dropYear !== null).length;
                    return (
                        <div key={dept.id} className={`card animate-fade-in stagger-${(i % 5) + 1}`} style={{ padding: 22 }}>
                            <Link href={`/dashboard/department/${dept.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <span style={{ fontSize: 30 }}>{dept.icon}</span>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "var(--accent-terracotta)" }}>{dept.shortName}</div>
                                            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                                                {dept.name}
                                            </h3>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} color="var(--text-muted)" />
                                </div>
                            </Link>
                            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "10px 0 8px" }}>{dept.description}</p>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>Programs</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                                {dept.programs.map((p) => (
                                    <Link
                                        key={p.code}
                                        href={`/dashboard/department/${dept.id}/program/${programCodeToSlug(p.code)}`}
                                        className="badge badge-sage"
                                        style={{ fontSize: 11, textDecoration: "none" }}
                                    >
                                        {p.name} · {p.code}
                                    </Link>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <span className="badge badge-terracotta">{deptStudents.length} Students</span>
                                <span className="badge badge-sage">Avg CGPA: {avgCgpa}</span>
                                {dropped > 0 && <span className="badge badge-rose">{dropped} Dropped</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
