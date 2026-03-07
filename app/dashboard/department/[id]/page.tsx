"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Filter, X, Activity, Mail, Phone,
} from "lucide-react";
import { getDepartmentById } from "../../../data/departments";
import { getStudentsByDepartment } from "../../../data/students";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, ArcElement,
    Tooltip, Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function DepartmentPage() {
    const params = useParams();
    const deptId = params.id as string;
    const dept = getDepartmentById(deptId);
    const allStudents = useMemo(() => getStudentsByDepartment(deptId), [deptId]);

    const [yearFilter, setYearFilter] = useState("all");
    const [cgpaFilter, setCgpaFilter] = useState("all");
    const [eventFilter, setEventFilter] = useState("all");
    const [religionFilter, setReligionFilter] = useState("all");
    const [genderFilter, setGenderFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const filteredStudents = useMemo(() => {
        return allStudents.filter((s) => {
            if (yearFilter !== "all" && s.enrollmentYear !== parseInt(yearFilter)) return false;
            if (cgpaFilter === "<6" && s.cgpa >= 6) return false;
            if (cgpaFilter === "6-7" && (s.cgpa < 6 || s.cgpa >= 7)) return false;
            if (cgpaFilter === "7-8" && (s.cgpa < 7 || s.cgpa >= 8)) return false;
            if (cgpaFilter === "8-9" && (s.cgpa < 8 || s.cgpa >= 9)) return false;
            if (cgpaFilter === "9+" && s.cgpa < 9) return false;
            if (eventFilter === "high" && s.eventsAttended < 4) return false;
            if (eventFilter === "medium" && (s.eventsAttended < 2 || s.eventsAttended >= 4)) return false;
            if (eventFilter === "low" && s.eventsAttended >= 2) return false;
            if (religionFilter !== "all" && s.religion !== religionFilter) return false;
            if (genderFilter !== "all" && s.gender !== genderFilter) return false;
            if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
    }, [allStudents, yearFilter, cgpaFilter, eventFilter, religionFilter, genderFilter, searchQuery]);

    const modalStudent = activeModal ? allStudents.find((s) => s.id === activeModal) : null;

    const cgpaChartData = useMemo(() => {
        const ranges = ["<6", "6-7", "7-8", "8-9", "9+"];
        const counts = [
            filteredStudents.filter((s) => s.cgpa < 6).length,
            filteredStudents.filter((s) => s.cgpa >= 6 && s.cgpa < 7).length,
            filteredStudents.filter((s) => s.cgpa >= 7 && s.cgpa < 8).length,
            filteredStudents.filter((s) => s.cgpa >= 8 && s.cgpa < 9).length,
            filteredStudents.filter((s) => s.cgpa >= 9).length,
        ];
        return {
            labels: ranges,
            datasets: [{
                label: "Students",
                data: counts,
                backgroundColor: [
                    "rgba(196,122,138,0.7)", "rgba(212,168,83,0.7)", "rgba(139,157,131,0.7)",
                    "rgba(107,163,190,0.7)", "rgba(155,142,196,0.7)",
                ],
                borderRadius: 6, borderSkipped: false,
            }],
        };
    }, [filteredStudents]);

    const religionChartData = useMemo(() => {
        const groups = [...new Set(allStudents.map((s) => s.religion))];
        return {
            labels: groups,
            datasets: [{
                data: groups.map((g) => filteredStudents.filter((s) => s.religion === g).length),
                backgroundColor: [
                    "rgba(194,117,72,0.7)", "rgba(139,157,131,0.7)", "rgba(107,163,190,0.7)",
                    "rgba(212,168,83,0.7)", "rgba(155,142,196,0.7)", "rgba(196,122,138,0.7)",
                ],
                borderWidth: 0,
            }],
        };
    }, [allStudents, filteredStudents]);

    if (!dept) {
        return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Department not found</div>;
    }

    const religions = [...new Set(allStudents.map((s) => s.religion))];

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <Link href="/dashboard" className="btn btn-ghost" style={{ padding: 8 }}>
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <div style={{ fontSize: 28, marginBottom: 2 }}>{dept.icon}</div>
                </div>
                <div>
                    <h1 className="heading-serif" style={{ fontSize: 24, margin: 0 }}>{dept.name}</h1>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{dept.description}</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <span className="badge badge-terracotta" style={{ fontSize: 13, padding: "6px 14px" }}>
                    {filteredStudents.length} Students shown
                </span>
                <span className="badge badge-sage" style={{ fontSize: 13, padding: "6px 14px" }}>
                    Avg CGPA: {(filteredStudents.reduce((a, s) => a + s.cgpa, 0) / (filteredStudents.length || 1)).toFixed(2)}
                </span>
                <span className="badge badge-sky" style={{ fontSize: 13, padding: "6px 14px" }}>
                    {filteredStudents.filter((s) => s.dropYear !== null).length} Dropped
                </span>
            </div>

            {/* Filters */}
            <div className="card-static" style={{ padding: 16, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <Filter size={14} color="var(--text-muted)" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Filters</span>
                </div>
                <div className="filter-bar" style={{ padding: 0 }}>
                    <input
                        type="text" placeholder="Search by name…" value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input" style={{ maxWidth: 200 }}
                    />
                    <select className="filter-select" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                        <option value="all">All Years</option>
                        <option value="2021">2021</option>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                    </select>
                    <select className="filter-select" value={cgpaFilter} onChange={(e) => setCgpaFilter(e.target.value)}>
                        <option value="all">All CGPA</option>
                        <option value="<6">Below 6</option>
                        <option value="6-7">6 - 7</option>
                        <option value="7-8">7 - 8</option>
                        <option value="8-9">8 - 9</option>
                        <option value="9+">9+</option>
                    </select>
                    <select className="filter-select" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
                        <option value="all">All Events</option>
                        <option value="high">High (4+)</option>
                        <option value="medium">Medium (2-3)</option>
                        <option value="low">Low (0-1)</option>
                    </select>
                    <select className="filter-select" value={religionFilter} onChange={(e) => setReligionFilter(e.target.value)}>
                        <option value="all">All Religions</option>
                        {religions.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <select className="filter-select" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                        <option value="all">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                <div className="chart-container">
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>CGPA Distribution</h3>
                    <div style={{ height: 200 }}>
                        <Bar data={cgpaChartData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { grid: { display: false } },
                                y: { grid: { color: "rgba(0,0,0,0.04)" } },
                            },
                        }} />
                    </div>
                </div>
                <div className="chart-container">
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Religious Diversity</h3>
                    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Doughnut data={religionChartData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { position: "right", labels: { padding: 8, font: { size: 11 } } } },
                            cutout: "60%",
                        }} />
                    </div>
                </div>
            </div>

            {/* Student Table */}
            <div className="card-static" style={{ overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Age</th>
                                <th>Background</th>
                                <th>Religion</th>
                                <th>CGPA</th>
                                <th>Year</th>
                                <th>Events</th>
                                <th>Courses</th>
                                <th>Drop Year</th>
                                <th>Activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => (
                                <tr key={student.id}>
                                    <td style={{ fontWeight: 500 }}>{student.name}</td>
                                    <td>{student.age}</td>
                                    <td><span className="badge badge-sky" style={{ fontSize: 11 }}>{student.educationalBackground}</span></td>
                                    <td>{student.religion}</td>
                                    <td>
                                        <span style={{
                                            fontWeight: 600,
                                            color: student.cgpa >= 8 ? "var(--accent-sage)" : student.cgpa >= 6 ? "var(--accent-gold)" : "var(--accent-rose)",
                                        }}>
                                            {student.cgpa.toFixed(2)}
                                        </span>
                                    </td>
                                    <td>{student.enrollmentYear}</td>
                                    <td>
                                        <span className="badge badge-gold">{student.eventsAttended}</span>
                                    </td>
                                    <td style={{ maxWidth: 200 }}>
                                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                            {student.coursesEnrolled.slice(0, 2).map((c) => (
                                                <span key={c} className="badge badge-lavender" style={{ fontSize: 10 }}>{c}</span>
                                            ))}
                                            {student.coursesEnrolled.length > 2 && (
                                                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>+{student.coursesEnrolled.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {student.dropYear ? (
                                            <span className="badge badge-rose">{student.dropYear}</span>
                                        ) : (
                                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => setActiveModal(student.id)}
                                            style={{ color: "var(--accent-terracotta)" }}
                                        >
                                            <Activity size={14} />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={10} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                                        No students match your filters
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Activity Modal */}
            {modalStudent && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h3 className="heading-serif" style={{ fontSize: 20, margin: 0 }}>
                                {modalStudent.name}
                            </h3>
                            <button className="btn btn-ghost" onClick={() => setActiveModal(null)} style={{ padding: 6 }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                                <Mail size={14} /> {modalStudent.email}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                                <Phone size={14} /> {modalStudent.phone}
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                                Activities Participated ({modalStudent.activities.length})
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {modalStudent.activities.map((act, i) => (
                                    <div key={i} className="card-static" style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 500 }}>{act.name}</div>
                                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{act.date}</div>
                                        </div>
                                        <span className={`badge badge-${act.type === 'Cultural' ? 'terracotta' : act.type === 'Academic' ? 'lavender' : act.type === 'Sports' ? 'sage' : act.type === 'Social' ? 'sky' : 'gold'}`}>
                                            {act.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                                Enrolled Courses
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {modalStudent.coursesEnrolled.map((c) => (
                                    <span key={c} className="badge badge-lavender">{c}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
