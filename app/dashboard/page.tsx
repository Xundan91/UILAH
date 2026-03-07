"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    Users, BookOpen, GraduationCap, Briefcase, Calendar,
    TrendingUp, ArrowRight, UserCheck,
} from "lucide-react";
import { departments } from "../data/departments";
import { students, totalStudents, totalEnrolled } from "../data/students";
import { totalFaculty } from "../data/faculty";
import { placements } from "../data/placements";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, ArcElement,
    PointElement, LineElement, Filler,
    Tooltip, Legend, Title,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Filler, Tooltip, Legend, Title);

const statCards = [
    { label: "Total Students", icon: Users, color: "terracotta" },
    { label: "Enrolled", icon: UserCheck, color: "sage" },
    { label: "Programs", icon: BookOpen, color: "gold" },
    { label: "Faculty", icon: GraduationCap, color: "lavender" },
    { label: "Placements", icon: Briefcase, color: "rose" },
    { label: "Events", icon: Calendar, color: "sky" },
];

export default function OverallDashboard() {
    const totalPrograms = departments.length;
    const totalPlacements = placements.filter((p) => p.year === 2025).length;
    const totalEvents = 24;

    const values = [totalStudents, totalEnrolled, totalPrograms, totalFaculty, totalPlacements, totalEvents];

    const coreDepts = departments.filter((d) => d.category === "core");
    const specialDepts = departments.filter((d) => d.category === "specialised");

    // Filters for Gender & CGPA charts
    const [chartYear, setChartYear] = useState("all");
    const [chartCourse, setChartCourse] = useState("all");

    const allCourses = useMemo(() => {
        const set = new Set<string>();
        students.forEach((s) => s.coursesEnrolled.forEach((c) => set.add(c)));
        return Array.from(set).sort();
    }, []);

    const filteredForCharts = useMemo(() => {
        return students.filter((s) => {
            if (chartYear !== "all" && s.enrollmentYear !== parseInt(chartYear)) return false;
            if (chartCourse !== "all" && !s.coursesEnrolled.includes(chartCourse)) return false;
            return true;
        });
    }, [chartYear, chartCourse]);

    const enrollmentData = useMemo(() => ({
        labels: departments.map((d) => d.name.replace("Department of ", "").replace(" Studies", "")),
        datasets: [{
            label: "Students",
            data: departments.map((d) => {
                const count = students.filter((s) => s.department === d.id).length;
                return count;
            }),
            backgroundColor: [
                "rgba(194,117,72,0.7)", "rgba(212,168,83,0.7)", "rgba(139,157,131,0.7)",
                "rgba(155,142,196,0.7)", "rgba(196,122,138,0.7)", "rgba(107,163,190,0.7)",
                "rgba(194,117,72,0.5)", "rgba(212,168,83,0.5)", "rgba(139,157,131,0.5)",
                "rgba(155,142,196,0.5)", "rgba(196,122,138,0.5)",
            ],
            borderRadius: 6,
            borderSkipped: false,
        }],
    }), []);

    const genderData = useMemo(() => {
        const male = filteredForCharts.filter((s) => s.gender === "Male").length;
        const female = filteredForCharts.filter((s) => s.gender === "Female").length;
        const other = filteredForCharts.filter((s) => s.gender === "Other").length;
        return {
            labels: ["Male", "Female", "Other"],
            datasets: [{
                data: [male, female, other],
                backgroundColor: ["rgba(107,163,190,0.8)", "rgba(196,122,138,0.8)", "rgba(212,168,83,0.8)"],
                borderWidth: 0,
                hoverOffset: 8,
            }],
        };
    }, [filteredForCharts]);

    const cgpaData = useMemo(() => {
        const ranges = ["<6", "6-7", "7-8", "8-9", "9+"];
        const counts = [
            filteredForCharts.filter((s) => s.cgpa < 6).length,
            filteredForCharts.filter((s) => s.cgpa >= 6 && s.cgpa < 7).length,
            filteredForCharts.filter((s) => s.cgpa >= 7 && s.cgpa < 8).length,
            filteredForCharts.filter((s) => s.cgpa >= 8 && s.cgpa < 9).length,
            filteredForCharts.filter((s) => s.cgpa >= 9).length,
        ];
        return {
            labels: ranges,
            datasets: [{
                data: counts,
                backgroundColor: [
                    "rgba(196,122,138,0.7)", "rgba(212,168,83,0.7)", "rgba(139,157,131,0.7)",
                    "rgba(107,163,190,0.7)", "rgba(155,142,196,0.7)",
                ],
                borderWidth: 0,
                hoverOffset: 8,
            }],
        };
    }, [filteredForCharts]);

    const placementByDept = useMemo(() => ({
        labels: departments.map((d) => d.name.replace("Department of ", "").slice(0, 12)),
        datasets: [{
            label: "Placements",
            data: departments.map((d) => placements.filter((p) => p.department === d.id).length),
            backgroundColor: "rgba(194,117,72,0.7)",
            borderRadius: 6,
            borderSkipped: false as const,
        }],
    }), []);

    const placementTrend = useMemo(() => {
        const years = [2022, 2023, 2024, 2025];
        return {
            labels: years.map(String),
            datasets: [
                {
                    label: "CRC Registered",
                    data: years.map((y) => placements.filter((p) => p.year === y && p.crcRegistered).length),
                    borderColor: "var(--accent-terracotta)",
                    backgroundColor: "rgba(194,117,72,0.1)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                },
                {
                    label: "Non-CRC",
                    data: years.map((y) => placements.filter((p) => p.year === y && !p.crcRegistered).length),
                    borderColor: "var(--accent-sage)",
                    backgroundColor: "rgba(139,157,131,0.1)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                },
            ],
        };
    }, []);

    const crcSplit = useMemo(() => ({
        labels: ["CRC Registered", "Non-CRC"],
        datasets: [{
            data: [
                placements.filter((p) => p.crcRegistered).length,
                placements.filter((p) => !p.crcRegistered).length,
            ],
            backgroundColor: ["rgba(194,117,72,0.7)", "rgba(139,157,131,0.7)"],
            borderWidth: 0,
        }],
    }), []);

    const ratioData = useMemo(() => {
        const labels = departments.map((d) => d.name.replace("Department of ", ""));
        const data = departments.map((d) => {
            const deptStudents = students.filter((s) => s.department === d.id && s.dropYear === null).length;
            return d.facultyCount > 0 ? Math.round(deptStudents / d.facultyCount) : 0;
        });

        return {
            labels,
            datasets: [{
                label: "Students per Faculty",
                data,
                backgroundColor: "rgba(212,168,83,0.7)",
                borderRadius: 4,
            }],
        };
    }, []);

    const enrollmentStatusData = useMemo(() => {
        const labels = departments.map((d) => d.name.replace("Department of ", ""));
        const enrolledData = departments.map((d) => students.filter((s) => s.department === d.id && s.dropYear === null).length);
        const droppedData = departments.map((d) => students.filter((s) => s.department === d.id && s.dropYear !== null).length);

        return {
            labels,
            datasets: [
                {
                    label: "Enrolled",
                    data: enrolledData,
                    backgroundColor: "rgba(139,157,131,0.7)",
                    borderRadius: 4,
                },
                {
                    label: "Dropped Out",
                    data: droppedData,
                    backgroundColor: "rgba(194,117,72,0.7)",
                    borderRadius: 4,
                }
            ],
        };
    }, []);

    const eventsData = useMemo(() => {
        const labels = departments.map((d) => d.name.replace("Department of ", ""));
        const data = departments.map((d) => {
            const deptStudents = students.filter((s) => s.department === d.id);
            const uniqueEvents = new Set<string>();
            deptStudents.forEach(s => s.activities.forEach(a => uniqueEvents.add(a.name)));
            return uniqueEvents.size;
        });

        return {
            labels,
            datasets: [{
                label: "Unique Events Participated",
                data,
                backgroundColor: "rgba(155,142,196,0.7)",
                borderRadius: 4,
            }],
        };
    }, []);

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 className="heading-serif" style={{ fontSize: 28, margin: 0, color: "var(--text-primary)" }}>
                    Dashboard Overview
                </h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
                    Welcome back, (PROF) Dr. Santosh Kumar — here&apos;s your UILAH snapshot
                </p>
            </div>

            {/* Stat Cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 16, marginBottom: 36,
            }}>
                {statCards.map((card, i) => (
                    <div key={card.label} className={`stat-card ${card.color} animate-fade-in stagger-${i + 1}`}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: `var(--accent-${card.color})15`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <card.icon size={18} color={`var(--accent-${card.color})`} />
                            </div>
                            <TrendingUp size={14} color="var(--accent-sage)" />
                        </div>
                        <div className="animate-count-up" style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>
                            {values[i]}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 20, marginBottom: 36 }}>
                <div className="chart-container">
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-primary)" }}>
                        Enrollment by Department
                    </h3>
                    <div style={{ height: 260 }}>
                        <Bar data={enrollmentData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } },
                                y: { grid: { color: "rgba(0,0,0,0.04)" }, ticks: { font: { size: 11 } } },
                            },
                        }} />
                    </div>
                </div>
                <div className="chart-container">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                            Gender Distribution
                        </h3>
                        <div style={{ display: "flex", gap: 6 }}>
                            <select className="filter-select" value={chartYear} onChange={(e) => setChartYear(e.target.value)} style={{ fontSize: 11, padding: "4px 24px 4px 8px" }}>
                                <option value="all">All Years</option>
                                <option value="2021">2021</option>
                                <option value="2022">2022</option>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                            </select>
                            <select className="filter-select" value={chartCourse} onChange={(e) => setChartCourse(e.target.value)} style={{ fontSize: 11, padding: "4px 24px 4px 8px", maxWidth: 130 }}>
                                <option value="all">All Courses</option>
                                {allCourses.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                        Showing {filteredForCharts.length} of {students.length} students
                    </div>
                    <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Doughnut data={genderData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { position: "bottom", labels: { padding: 12, font: { size: 11 } } } },
                            cutout: "65%",
                        }} />
                    </div>
                </div>
                <div className="chart-container">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                            CGPA Distribution
                        </h3>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                        Filtered by same year & course
                    </div>
                    <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Doughnut data={cgpaData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { position: "bottom", labels: { padding: 12, font: { size: 11 } } } },
                            cutout: "65%",
                        }} />
                    </div>
                </div>
            </div>

            {/* Department Analytics Row */}
            <div style={{ marginBottom: 36 }}>
                <h2 className="heading-serif" style={{ fontSize: 20, marginBottom: 16, color: "var(--text-primary)" }}>
                    Department Insights
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                    <div className="chart-container">
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-primary)" }}>
                            Student-Teacher Ratio
                        </h3>
                        <div style={{ height: 240 }}>
                            <Bar data={ratioData} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45 } },
                                    y: { grid: { color: "rgba(0,0,0,0.04)" }, beginAtZero: true },
                                },
                            }} />
                        </div>
                    </div>
                    <div className="chart-container">
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-primary)" }}>
                            Enrollment vs Dropouts
                        </h3>
                        <div style={{ height: 240 }}>
                            <Bar data={enrollmentStatusData} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { position: "bottom", labels: { font: { size: 10 }, boxWidth: 12 } } },
                                scales: {
                                    x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45 }, stacked: false },
                                    y: { grid: { color: "rgba(0,0,0,0.04)" }, beginAtZero: true },
                                },
                            }} />
                        </div>
                    </div>
                    <div className="chart-container">
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-primary)" }}>
                            Event Participation
                        </h3>
                        <div style={{ height: 240 }}>
                            <Bar data={eventsData} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45 } },
                                    y: { grid: { color: "rgba(0,0,0,0.04)" }, beginAtZero: true },
                                },
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Placement Charts Row */}
            <div style={{ marginBottom: 36 }}>
                <h2 className="heading-serif" style={{ fontSize: 20, marginBottom: 16, color: "var(--text-primary)" }}>
                    Placement Overview
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 20 }}>
                    <div className="chart-container">
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-primary)" }}>
                            Placements by Department
                        </h3>
                        <div style={{ height: 240 }}>
                            <Bar data={placementByDept} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45 } },
                                    y: { grid: { color: "rgba(0,0,0,0.04)" } },
                                },
                            }} />
                        </div>
                    </div>
                    <div className="chart-container">
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-primary)" }}>
                            Year-over-Year Trend
                        </h3>
                        <div style={{ height: 240 }}>
                            <Line data={placementTrend} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } },
                                scales: {
                                    x: { grid: { display: false } },
                                    y: { grid: { color: "rgba(0,0,0,0.04)" } },
                                },
                            }} />
                        </div>
                    </div>
                    <div className="chart-container">
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "var(--text-primary)" }}>
                            CRC Registration Split
                        </h3>
                        <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Doughnut data={crcSplit} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } },
                                cutout: "65%",
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Academic Departments */}
            <div style={{ marginBottom: 32 }}>
                <h2 className="heading-serif" style={{ fontSize: 20, marginBottom: 16, color: "var(--text-primary)" }}>
                    Core Academic Departments
                </h2>
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 16,
                }}>
                    {coreDepts.map((dept, i) => {
                        const deptStudents = students.filter((s) => s.department === dept.id);
                        const enrolled = deptStudents.filter((s) => s.dropYear === null).length;
                        const dropped = deptStudents.filter((s) => s.dropYear !== null).length;
                        const ratio = dept.facultyCount > 0 ? Math.round(enrolled / dept.facultyCount) : 0;

                        return (
                            <Link
                                key={dept.id}
                                href={`/dashboard/department/${dept.id}`}
                                style={{ textDecoration: "none" }}
                            >
                                <div className={`card animate-fade-in stagger-${i + 1}`} style={{ padding: 20 }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                        <div style={{ fontSize: 28, marginBottom: 8 }}>{dept.icon}</div>
                                        <ArrowRight size={16} color="var(--text-muted)" />
                                    </div>
                                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "4px 0" }}>
                                        {dept.name.replace("Department of ", "")}
                                    </h3>
                                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 12px" }}>
                                        {dept.description}
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        <span className="badge badge-terracotta">{enrolled} Enrolled</span>
                                        <span className="badge badge-sage">{dept.facultyCount} Faculty</span>
                                        <span className="badge badge-gold">Ratio {ratio}:1</span>
                                        {dropped > 0 && <span className="badge badge-rose">{dropped} Dropped</span>}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Specialised Areas */}
            <div>
                <h2 className="heading-serif" style={{ fontSize: 20, marginBottom: 16, color: "var(--text-primary)" }}>
                    Specialised Areas & Minors
                </h2>
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: 16,
                }}>
                    {specialDepts.map((dept, i) => {
                        const deptStudents = students.filter((s) => s.department === dept.id);
                        const enrolled = deptStudents.filter((s) => s.dropYear === null).length;
                        const dropped = deptStudents.filter((s) => s.dropYear !== null).length;
                        const ratio = dept.facultyCount > 0 ? Math.round(enrolled / dept.facultyCount) : 0;

                        return (
                            <Link
                                key={dept.id}
                                href={`/dashboard/department/${dept.id}`}
                                style={{ textDecoration: "none" }}
                            >
                                <div className={`card animate-fade-in stagger-${i + 1}`} style={{ padding: 18 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <span style={{ fontSize: 24 }}>{dept.icon}</span>
                                        <div>
                                            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                                                {dept.name}
                                            </h3>
                                            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                                                {dept.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                                        <span className="badge badge-lavender">{enrolled} Enrolled</span>
                                        <span className="badge badge-sky">{dept.facultyCount} Faculty</span>
                                        <span className="badge badge-gold">Ratio {ratio}:1</span>
                                        {dropped > 0 && <span className="badge badge-rose">{dropped} Dropped</span>}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div >
        </div >
    );
}
