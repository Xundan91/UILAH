"use client";

import { useState } from "react";
import {
    GraduationCap, BookOpen, Award, FileText, Lightbulb,
    ChevronDown, ChevronUp, User, Globe, Briefcase,
} from "lucide-react";
import { departments } from "../../data/departments";
import { faculty, getFacultyByDepartment } from "../../data/faculty";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, ArcElement,
    Tooltip, Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function TeachersPage() {
    const [selectedDept, setSelectedDept] = useState<string | null>(null);
    const [expandedFaculty, setExpandedFaculty] = useState<string | null>(null);

    const deptFaculty = selectedDept ? getFacultyByDepartment(selectedDept) : [];
    const selectedDeptInfo = selectedDept ? departments.find((d) => d.id === selectedDept) : null;

    // Global stats
    const phdCount = faculty.filter((f) => f.education === "PhD").length;
    const pursuingCount = faculty.filter((f) => f.education === "Pursuing PhD").length;
    const nonPhdCount = faculty.filter((f) => f.education === "Non-PhD").length;

    const educationData = {
        labels: ["PhD", "Pursuing PhD", "Non-PhD"],
        datasets: [{
            data: [phdCount, pursuingCount, nonPhdCount],
            backgroundColor: ["rgba(139,157,131,0.8)", "rgba(212,168,83,0.8)", "rgba(196,122,138,0.8)"],
            borderWidth: 0,
        }],
    };

    const genderData = {
        labels: ["Male", "Female"],
        datasets: [{
            data: [faculty.filter((f) => f.gender === "Male").length, faculty.filter((f) => f.gender === "Female").length],
            backgroundColor: ["rgba(107,163,190,0.8)", "rgba(196,122,138,0.8)"],
            borderWidth: 0,
        }],
    };

    const publicationData = {
        labels: departments.map((d) => d.name.replace("Department of ", "").slice(0, 10)),
        datasets: [{
            label: "Scopus Articles",
            data: departments.map((d) => {
                const df = getFacultyByDepartment(d.id);
                return df.reduce((a, f) => a + f.publications.scopusArticles, 0);
            }),
            backgroundColor: "rgba(155,142,196,0.7)",
            borderRadius: 6,
            borderSkipped: false,
        }],
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: 28 }}>
                <h1 className="heading-serif" style={{ fontSize: 28, margin: 0 }}>Teacher Profiles</h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
                    Faculty details, publications, and development initiatives
                </p>
            </div>

            {/* Quick Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                <div className="stat-card terracotta">
                    <User size={18} color="var(--accent-terracotta)" />
                    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>{faculty.length}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Total Faculty</div>
                </div>
                <div className="stat-card sage">
                    <GraduationCap size={18} color="var(--accent-sage)" />
                    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>{phdCount}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>PhD Holders</div>
                </div>
                <div className="stat-card gold">
                    <FileText size={18} color="var(--accent-gold)" />
                    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>
                        {faculty.reduce((a, f) => a + f.publications.scopusArticles, 0)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Scopus Articles</div>
                </div>
                <div className="stat-card lavender">
                    <Lightbulb size={18} color="var(--accent-lavender)" />
                    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>
                        {faculty.reduce((a, f) => a + f.publications.patents.length, 0)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Patents / IPR</div>
                </div>
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 20, marginBottom: 28 }}>
                <div className="chart-container">
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Education Level</h3>
                    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Doughnut data={educationData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } },
                            cutout: "60%",
                        }} />
                    </div>
                </div>
                <div className="chart-container">
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Gender Ratio</h3>
                    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Doughnut data={genderData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } },
                            cutout: "60%",
                        }} />
                    </div>
                </div>
                <div className="chart-container">
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Publications by Department</h3>
                    <div style={{ height: 200 }}>
                        <Bar data={publicationData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45 } },
                                y: { grid: { color: "rgba(0,0,0,0.04)" } },
                            },
                        }} />
                    </div>
                </div>
            </div>

            {/* Course / Department Grid */}
            <h2 className="heading-serif" style={{ fontSize: 20, marginBottom: 16 }}>Select Department</h2>
            <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 12, marginBottom: 28,
            }}>
                {departments.map((dept) => {
                    const df = getFacultyByDepartment(dept.id);
                    return (
                        <button
                            key={dept.id}
                            onClick={() => setSelectedDept(selectedDept === dept.id ? null : dept.id)}
                            className={selectedDept === dept.id ? "" : "card"}
                            style={{
                                padding: 16, textAlign: "left", cursor: "pointer",
                                border: selectedDept === dept.id ? "2px solid var(--accent-terracotta)" : "1px solid var(--border-light)",
                                borderRadius: "var(--radius-md)",
                                background: selectedDept === dept.id ? "rgba(194,117,72,0.04)" : "var(--card-bg)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 22 }}>{dept.icon}</span>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{dept.name.replace("Department of ", "")}</div>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{df.length} Faculty</div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Faculty List for selected department */}
            {selectedDept && selectedDeptInfo && (
                <div className="animate-fade-in">
                    <h2 className="heading-serif" style={{ fontSize: 20, marginBottom: 16 }}>
                        {selectedDeptInfo.icon} {selectedDeptInfo.name} — Faculty
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {deptFaculty.map((f) => {
                            const isExpanded = expandedFaculty === f.id;
                            return (
                                <div key={f.id} className="card-static" style={{ overflow: "hidden" }}>
                                    {/* Faculty Header */}
                                    <button
                                        onClick={() => setExpandedFaculty(isExpanded ? null : f.id)}
                                        style={{
                                            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                                            padding: "20px 24px", cursor: "pointer", border: "none", background: "transparent",
                                            textAlign: "left",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                            <div style={{
                                                width: 48, height: 48, borderRadius: 14,
                                                background: `linear-gradient(135deg, ${f.education === 'PhD' ? 'rgba(139,157,131,0.2)' : f.education === 'Pursuing PhD' ? 'rgba(212,168,83,0.2)' : 'rgba(196,122,138,0.2)'}, transparent)`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 18, fontWeight: 700, color: "var(--accent-terracotta)",
                                            }}>
                                                {f.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{f.name}</div>
                                                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{f.designation}</div>
                                                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                                                    <span className={`badge ${f.education === 'PhD' ? 'badge-sage' : f.education === 'Pursuing PhD' ? 'badge-gold' : 'badge-rose'}`}>
                                                        {f.education}
                                                    </span>
                                                    <span className="badge badge-sky">{f.gender}</span>
                                                    <span className="badge badge-lavender">Age: {f.age}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>

                                    {/* Expanded Detail */}
                                    {isExpanded && (
                                        <div style={{ padding: "0 24px 24px", borderTop: "1px solid var(--border-light)" }} className="animate-fade-in">
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
                                                {/* Left Column */}
                                                <div>
                                                    <div style={{ marginBottom: 20 }}>
                                                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                                                            Education
                                                        </div>
                                                        <div style={{ fontSize: 14, color: "var(--text-primary)" }}>{f.educationDetails}</div>
                                                    </div>

                                                    <div style={{ marginBottom: 20 }}>
                                                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                                                            Personal Details
                                                        </div>
                                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 14 }}>
                                                            <div><Globe size={13} style={{ marginRight: 4, verticalAlign: "middle" }} />Religion: {f.religion}</div>
                                                            <div><User size={13} style={{ marginRight: 4, verticalAlign: "middle" }} />Gender: {f.gender}</div>
                                                        </div>
                                                    </div>

                                                    <div style={{ marginBottom: 20 }}>
                                                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                                                            Specialization
                                                        </div>
                                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                            {f.specialization.map((s) => <span key={s} className="badge badge-terracotta">{s}</span>)}
                                                        </div>
                                                    </div>

                                                    <div style={{ marginBottom: 20 }}>
                                                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                                                            <Briefcase size={13} style={{ marginRight: 4, verticalAlign: "middle" }} />Courses Teaching
                                                        </div>
                                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                            {f.coursesTeaching.map((c) => <span key={c} className="badge badge-lavender">{c}</span>)}
                                                        </div>
                                                    </div>

                                                    {f.achievements.length > 0 && (
                                                        <div>
                                                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                                                                <Award size={13} style={{ marginRight: 4, verticalAlign: "middle" }} />Achievements
                                                            </div>
                                                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "var(--text-primary)" }}>
                                                                {f.achievements.map((a) => <li key={a} style={{ marginBottom: 4 }}>{a}</li>)}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right Column — Publications */}
                                                <div>
                                                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                                                        <FileText size={13} style={{ marginRight: 4, verticalAlign: "middle" }} />Publication Profile
                                                    </div>

                                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 16 }}>
                                                        <div className="card-static" style={{ padding: 12, textAlign: "center" }}>
                                                            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-lavender)" }}>{f.publications.scopusArticles}</div>
                                                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Scopus Articles</div>
                                                        </div>
                                                        <div className="card-static" style={{ padding: 12, textAlign: "center" }}>
                                                            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-terracotta)" }}>{f.publications.conferences.length}</div>
                                                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Conferences</div>
                                                        </div>
                                                        <div className="card-static" style={{ padding: 12, textAlign: "center" }}>
                                                            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-gold)" }}>{f.publications.books.length}</div>
                                                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Books</div>
                                                        </div>
                                                        <div className="card-static" style={{ padding: 12, textAlign: "center" }}>
                                                            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-sage)" }}>{f.publications.patents.length}</div>
                                                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Patents / IPR</div>
                                                        </div>
                                                    </div>

                                                    {/* Journal Articles */}
                                                    {f.publications.articles.length > 0 && (
                                                        <div style={{ marginBottom: 12 }}>
                                                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Journal Articles</div>
                                                            {f.publications.articles.map((a, i) => (
                                                                <div key={i} style={{ fontSize: 13, marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid var(--accent-lavender)" }}>
                                                                    <div style={{ fontWeight: 500 }}>{a.title}</div>
                                                                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                                                                        {a.journal} ({a.year}) {a.impactFactor && `· IF: ${a.impactFactor}`}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Conference Papers */}
                                                    {f.publications.conferences.length > 0 && (
                                                        <div style={{ marginBottom: 12 }}>
                                                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Conference Papers</div>
                                                            {f.publications.conferences.map((c, i) => (
                                                                <div key={i} style={{ fontSize: 13, marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid var(--accent-terracotta)" }}>
                                                                    <div style={{ fontWeight: 500 }}>{c.title}</div>
                                                                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{c.conference} ({c.year})</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Books */}
                                                    {f.publications.books.length > 0 && (
                                                        <div style={{ marginBottom: 12 }}>
                                                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Books</div>
                                                            {f.publications.books.map((b, i) => (
                                                                <div key={i} style={{ fontSize: 13, marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid var(--accent-gold)" }}>
                                                                    <div style={{ fontWeight: 500 }}>{b.title}</div>
                                                                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                                                                        {b.publisher} ({b.year}) {b.isbn && `· ISBN: ${b.isbn}`}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Patents */}
                                                    {f.publications.patents.length > 0 && (
                                                        <div style={{ marginBottom: 12 }}>
                                                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Patents / IPR</div>
                                                            {f.publications.patents.map((p, i) => (
                                                                <div key={i} style={{ fontSize: 13, marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid var(--accent-sage)" }}>
                                                                    <div style={{ fontWeight: 500 }}>{p.title}</div>
                                                                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                                                                        {p.patentNumber} ({p.year}) · <span className={`badge ${p.status === 'Granted' ? 'badge-sage' : p.status === 'Filed' ? 'badge-gold' : 'badge-sky'}`} style={{ fontSize: 10 }}>{p.status}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Faculty Development */}
                                                    {f.facultyDevelopment.length > 0 && (
                                                        <div>
                                                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>
                                                                <Lightbulb size={12} style={{ marginRight: 3, verticalAlign: "middle" }} />
                                                                Institution Development Initiatives
                                                            </div>
                                                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "var(--text-primary)" }}>
                                                                {f.facultyDevelopment.map((d) => <li key={d} style={{ marginBottom: 3 }}>{d}</li>)}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {deptFaculty.length === 0 && (
                            <div className="card-static" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                                No faculty data available for this department
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
