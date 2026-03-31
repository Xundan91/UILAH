"use client";

import { useMemo, useState } from "react";
import {
    Filter, Briefcase, Users, TrendingUp, Award,
    Mail, Phone, BookOpen, Pencil, Trash2, X,
} from "lucide-react";
import { departments } from "../../data/departments";
import { usePlacements } from "../../context/PlacementsDataContext";
import { useDashboardRole } from "../../context/DashboardRoleContext";
import PlacementEntryForm from "../../components/PlacementEntryForm";
import type { PlacementRecord } from "../../data/types";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, ArcElement,
    PointElement, LineElement,
    Tooltip, Legend,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

export default function PlacementPage() {
    const { placements, addPlacement, replacePlacement, removePlacement } = usePlacements();
    const { isAssistant } = useDashboardRole();
    const [editPlacement, setEditPlacement] = useState<PlacementRecord | null>(null);
    const [view, setView] = useState<"all" | "crc" | "non-crc">("all");
    const [deptFilter, setDeptFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState("all");
    const [showAlumni, setShowAlumni] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = useMemo(() => {
        const base = showAlumni ? placements.filter((p) => p.isAlumni) : placements;
        return base.filter((p) => {
            if (view === "crc" && !p.crcRegistered) return false;
            if (view === "non-crc" && p.crcRegistered) return false;
            if (deptFilter !== "all" && p.department !== deptFilter) return false;
            if (yearFilter !== "all" && p.year !== parseInt(yearFilter)) return false;
            if (searchQuery && !p.studentName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
    }, [placements, view, deptFilter, yearFilter, showAlumni, searchQuery]);

    const deptChartData = useMemo(() => {
        const deptNames = departments.map((d) => d.shortName);
        return {
            labels: deptNames,
            datasets: [{
                label: "Placements",
                data: departments.map((d) => filtered.filter((p) => p.department === d.id).length),
                backgroundColor: "rgba(194,117,72,0.7)",
                borderRadius: 6,
                borderSkipped: false,
            }],
        };
    }, [filtered]);

    const yearTrendData = useMemo(() => {
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
    }, [placements]);

    const crcSplit = useMemo(() => ({
        labels: ["CRC Registered", "Non-CRC"],
        datasets: [{
            data: [
                filtered.filter((p) => p.crcRegistered).length,
                filtered.filter((p) => !p.crcRegistered).length,
            ],
            backgroundColor: ["rgba(194,117,72,0.7)", "rgba(139,157,131,0.7)"],
            borderWidth: 0,
        }],
    }), [filtered]);

    const avgPackage = filtered.length > 0
        ? (filtered.reduce((a, p) => a + p.package, 0) / filtered.length).toFixed(1)
        : "0";

    const handleSavePlacement = async (p: PlacementRecord) => {
        if (!p.id) {
            const { id: _id, ...rest } = p;
            await addPlacement(rest);
        } else {
            await replacePlacement(p);
        }
        setEditPlacement(null);
    };

    const confirmDeletePlacement = async (p: PlacementRecord) => {
        if (typeof window === "undefined") return;
        if (!window.confirm(`Remove placement record for ${p.studentName}?`)) return;
        try {
            await removePlacement(p.id);
        } catch (err) {
            window.alert(err instanceof Error ? err.message : "Could not delete.");
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: 28 }}>
                <h1 className="heading-serif" style={{ fontSize: 28, margin: 0 }}>Placement Data</h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
                    CRC registered and non-registered placement analytics
                </p>
            </div>

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                <div className="stat-card terracotta">
                    <Briefcase size={18} color="var(--accent-terracotta)" />
                    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>{filtered.length}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Total Placements</div>
                </div>
                <div className="stat-card sage">
                    <Users size={18} color="var(--accent-sage)" />
                    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>
                        {filtered.filter((p) => p.crcRegistered).length}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>CRC Registered</div>
                </div>
                <div className="stat-card gold">
                    <TrendingUp size={18} color="var(--accent-gold)" />
                    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>{filtered.length ? avgPackage : "0"} LPA</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Avg Package</div>
                </div>
                <div className="stat-card lavender">
                    <Award size={18} color="var(--accent-lavender)" />
                    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>
                        {filtered.length ? Math.max(...filtered.map((p) => p.package)).toFixed(1) : "0"} LPA
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Highest Package</div>
                </div>
            </div>

            {/* Toggle & Filters */}
            <div className="card-static" style={{ padding: 16, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                    <div className="tab-group" style={{ width: "auto" }}>
                        <button className={`tab ${view === "all" ? "active" : ""}`} onClick={() => setView("all")}>All</button>
                        <button className={`tab ${view === "crc" ? "active" : ""}`} onClick={() => setView("crc")}>CRC Registered</button>
                        <button className={`tab ${view === "non-crc" ? "active" : ""}`} onClick={() => setView("non-crc")}>Non-CRC</button>
                    </div>
                    <button
                        className={`btn ${showAlumni ? "btn-primary" : "btn-secondary"} btn-sm`}
                        onClick={() => setShowAlumni(!showAlumni)}
                    >
                        🎓 {showAlumni ? "Showing Alumni" : "Show Alumni"}
                    </button>
                </div>
                <div className="filter-bar" style={{ padding: 0 }}>
                    <Filter size={14} color="var(--text-muted)" />
                    <input
                        type="text" placeholder="Search student…" value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input" style={{ maxWidth: 200 }}
                    />
                    <select className="filter-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                        <option value="all">All Institutes</option>
                        {departments.map((d) => <option key={d.id} value={d.id}>{d.shortName} — {d.name}</option>)}
                    </select>
                    <select className="filter-select" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                        <option value="all">All Years</option>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                </div>
            </div>

            {isAssistant && (
                <div
                    className="card-static"
                    style={{
                        padding: 24,
                        marginBottom: 24,
                        border: "1px solid rgba(194, 117, 72, 0.25)",
                        background: "linear-gradient(180deg, rgba(255,250,245,0.9) 0%, var(--card-bg) 100%)",
                    }}
                >
                    <h2 className="heading-serif" style={{ fontSize: 18, margin: "0 0 8px" }}>
                        Add placement record
                    </h2>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                        Enter placement details and click <strong>Save to database</strong>. Uses <code>POST /api/placements</code>.
                    </p>
                    <PlacementEntryForm
                        mode="add"
                        defaultDepartment="uilah"
                        variant="inline"
                        onSubmit={handleSavePlacement}
                    />
                </div>
            )}

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 20, marginBottom: 28 }}>
                <div className="chart-container">
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Placements by Institute</h3>
                    <div style={{ height: 240 }}>
                        <Bar data={deptChartData} options={{
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
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>CRC Split</h3>
                    <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Doughnut data={crcSplit} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } },
                            cutout: "65%",
                        }} />
                    </div>
                </div>
                <div className="chart-container">
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Year-over-Year Trend</h3>
                    <div style={{ height: 240 }}>
                        <Line data={yearTrendData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } },
                            scales: {
                                x: { grid: { display: false } },
                                y: { grid: { color: "rgba(0,0,0,0.04)" } },
                            },
                        }} />
                    </div>
                </div>
            </div>

            {/* Placement Table */}
            <div className="card-static" style={{ overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Institute</th>
                                <th>Year</th>
                                <th>Company</th>
                                <th>Role</th>
                                <th>Package (LPA)</th>
                                <th>CRC</th>
                                <th>Contact</th>
                                {showAlumni && <th>Value-Add Courses</th>}
                                {isAssistant && <th>Manage</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.slice(0, 50).map((p) => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 500 }}>{p.studentName}</td>
                                    <td>
                                        <span className="badge badge-lavender" style={{ fontSize: 11 }}>
                                            {departments.find((d) => d.id === p.department)?.shortName || p.department}
                                        </span>
                                    </td>
                                    <td>{p.year}</td>
                                    <td style={{ fontWeight: 500 }}>{p.company}</td>
                                    <td>{p.role}</td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: p.package >= 8 ? "var(--accent-sage)" : "var(--text-primary)" }}>
                                            ₹{p.package.toFixed(1)}
                                        </span>
                                    </td>
                                    <td>
                                        {p.crcRegistered ? (
                                            <span className="badge badge-sage">✓ Registered</span>
                                        ) : (
                                            <span className="badge badge-rose">Not Registered</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <a href={`mailto:${p.email}`} className="btn btn-ghost" style={{ padding: 4 }}>
                                                <Mail size={14} />
                                            </a>
                                            <a href={`tel:${p.phone}`} className="btn btn-ghost" style={{ padding: 4 }}>
                                                <Phone size={14} />
                                            </a>
                                        </div>
                                    </td>
                                    {showAlumni && (
                                        <td>
                                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                                {p.valueAddCourses?.map((c) => (
                                                    <span key={c} className="badge badge-gold" style={{ fontSize: 10 }}>
                                                        <BookOpen size={10} style={{ marginRight: 3 }} />{c}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    )}
                                    {isAssistant && (
                                        <td>
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-sm"
                                                    title="Edit"
                                                    onClick={() => setEditPlacement(p)}
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-sm"
                                                    title="Delete"
                                                    style={{ color: "var(--accent-rose)" }}
                                                    onClick={() => void confirmDeletePlacement(p)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {editPlacement && (
                <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setEditPlacement(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <h3 className="heading-serif" style={{ fontSize: 20, margin: 0 }}>
                                Edit placement
                            </h3>
                            <button type="button" className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setEditPlacement(null)} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>
                        <PlacementEntryForm
                            mode="edit"
                            initial={editPlacement}
                            defaultDepartment={editPlacement.department}
                            variant="modal"
                            onCancel={() => setEditPlacement(null)}
                            onSubmit={async (rec) => {
                                await handleSavePlacement(rec);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
