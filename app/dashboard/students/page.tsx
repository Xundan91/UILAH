"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Users, Filter } from "lucide-react";
import { departments } from "../../data/departments";
import { students } from "../../data/students";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, ArcElement,
    Tooltip, Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function StudentsPage() {
    const [categoryFilter, setCategoryFilter] = useState<"all" | "core" | "specialised">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredDepts = useMemo(() => {
        return departments.filter((d) => {
            if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
            if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
    }, [categoryFilter, searchQuery]);

    const enrollmentData = useMemo(() => ({
        labels: filteredDepts.map((d) => d.name.replace("Department of ", "").replace(" Studies", "").slice(0, 14)),
        datasets: [{
            label: "Students",
            data: filteredDepts.map((d) => students.filter((s) => s.department === d.id).length),
            backgroundColor: [
                "rgba(194,117,72,0.7)", "rgba(212,168,83,0.7)", "rgba(139,157,131,0.7)",
                "rgba(155,142,196,0.7)", "rgba(196,122,138,0.7)", "rgba(107,163,190,0.7)",
                "rgba(194,117,72,0.5)", "rgba(212,168,83,0.5)", "rgba(139,157,131,0.5)",
                "rgba(155,142,196,0.5)", "rgba(196,122,138,0.5)",
            ],
            borderRadius: 6,
            borderSkipped: false,
        }],
    }), [filteredDepts]);

    const categoryData = useMemo(() => {
        const core = students.filter((s) => departments.find((d) => d.id === s.department)?.category === "core").length;
        const spec = students.filter((s) => departments.find((d) => d.id === s.department)?.category === "specialised").length;
        return {
            labels: ["Core Academic", "Specialised Areas"],
            datasets: [{
                data: [core, spec],
                backgroundColor: ["rgba(194,117,72,0.7)", "rgba(139,157,131,0.7)"],
                borderWidth: 0,
                hoverOffset: 8,
            }],
        };
    }, []);

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: 28 }}>
                <h1 className="heading-serif" style={{ fontSize: 28, margin: 0 }}>
                    Student Data — Academic Departments
                </h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
                    Select a department to view detailed student records
                </p>
            </div>

            {/* Quick Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
                <div className="stat-card terracotta">
                    <Users size={18} color="var(--accent-terracotta)" />
                    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>{students.length}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Total Students</div>
                </div>
                <div className="stat-card sage">
                    <Users size={18} color="var(--accent-sage)" />
                    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>
                        {departments.filter((d) => d.category === "core").length}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Core Departments</div>
                </div>
                <div className="stat-card lavender">
                    <Users size={18} color="var(--accent-lavender)" />
                    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>
                        {departments.filter((d) => d.category === "specialised").length}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Specialised Areas</div>
                </div>
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 28 }}>
                <div className="chart-container">
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Students per Department</h3>
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
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Core vs Specialised</h3>
                    <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Doughnut data={categoryData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } },
                            cutout: "65%",
                        }} />
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="card-static" style={{ padding: 16, marginBottom: 24 }}>
                <div className="filter-bar" style={{ padding: 0 }}>
                    <Filter size={14} color="var(--text-muted)" />
                    <input
                        type="text" placeholder="Search department…" value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input" style={{ maxWidth: 220 }}
                    />
                    <div className="tab-group" style={{ width: "auto" }}>
                        <button className={`tab ${categoryFilter === "all" ? "active" : ""}`} onClick={() => setCategoryFilter("all")}>All</button>
                        <button className={`tab ${categoryFilter === "core" ? "active" : ""}`} onClick={() => setCategoryFilter("core")}>Core Academic</button>
                        <button className={`tab ${categoryFilter === "specialised" ? "active" : ""}`} onClick={() => setCategoryFilter("specialised")}>Specialised</button>
                    </div>
                </div>
            </div>

            {/* Department Cards */}
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
                        <Link
                            key={dept.id}
                            href={`/dashboard/department/${dept.id}`}
                            style={{ textDecoration: "none" }}
                        >
                            <div className={`card animate-fade-in stagger-${(i % 5) + 1}`} style={{ padding: 22 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <span style={{ fontSize: 30 }}>{dept.icon}</span>
                                        <div>
                                            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                                                {dept.name.replace("Department of ", "")}
                                            </h3>
                                            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                                                {dept.description}
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} color="var(--text-muted)" />
                                </div>

                                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                                    <span className="badge badge-terracotta">{deptStudents.length} Students</span>
                                    <span className="badge badge-sage">Avg CGPA: {avgCgpa}</span>
                                    {dropped > 0 && <span className="badge badge-rose">{dropped} Dropped</span>}
                                </div>

                                <span className={`badge ${dept.category === "core" ? "badge-gold" : "badge-sky"}`}
                                    style={{ marginTop: 8, fontSize: 11 }}>
                                    {dept.category === "core" ? "Core Academic" : "Specialised Area"}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
