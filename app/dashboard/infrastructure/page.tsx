"use client";

import { useMemo, useState } from "react";
import {
    Building2, Monitor, BookOpen, DoorOpen, Layers,
    Cpu, TrendingUp,
} from "lucide-react";
import { rooms, getRoomsByBuilding, getInfraStats } from "../../data/infrastructure";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, ArcElement,
    PointElement, LineElement,
    Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Filler);

const typeIcons: Record<string, typeof Building2> = {
    Classroom: DoorOpen,
    Lab: Monitor,
    "Tutorial Room": BookOpen,
    Library: BookOpen,
    "Seminar Hall": Layers,
};

const typeColors: Record<string, string> = {
    Classroom: "var(--accent-terracotta)",
    Lab: "var(--accent-lavender)",
    "Tutorial Room": "var(--accent-sage)",
    Library: "var(--accent-gold)",
    "Seminar Hall": "var(--accent-sky)",
};

function getUtilColor(pct: number) {
    if (pct >= 80) return "var(--accent-sage)";
    if (pct >= 60) return "var(--accent-gold)";
    if (pct >= 40) return "var(--accent-terracotta)";
    return "var(--accent-rose)";
}

export default function InfrastructurePage() {
    const [activeBuilding, setActiveBuilding] = useState<"A2" | "A3">("A2");
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const stats = getInfraStats();

    const buildingRooms = useMemo(() => getRoomsByBuilding(activeBuilding), [activeBuilding]);
    const selectedRoomData = selectedRoom ? rooms.find((r) => r.id === selectedRoom) : null;

    const utilizationData = useMemo(() => ({
        labels: buildingRooms.map((r) => r.roomNumber),
        datasets: [{
            label: "Utilization %",
            data: buildingRooms.map((r) => r.utilizationPercent),
            backgroundColor: buildingRooms.map((r) =>
                r.utilizationPercent >= 80 ? "rgba(139,157,131,0.7)" :
                    r.utilizationPercent >= 60 ? "rgba(212,168,83,0.7)" :
                        r.utilizationPercent >= 40 ? "rgba(194,117,72,0.7)" :
                            "rgba(196,122,138,0.7)"
            ),
            borderRadius: 6,
            borderSkipped: false,
        }],
    }), [buildingRooms]);

    const typeDistribution = useMemo(() => {
        const types = [...new Set(buildingRooms.map((r) => r.type))];
        return {
            labels: types,
            datasets: [{
                data: types.map((t) => buildingRooms.filter((r) => r.type === t).length),
                backgroundColor: [
                    "rgba(194,117,72,0.7)", "rgba(155,142,196,0.7)", "rgba(139,157,131,0.7)",
                    "rgba(212,168,83,0.7)", "rgba(107,163,190,0.7)",
                ],
                borderWidth: 0,
            }],
        };
    }, [buildingRooms]);

    // Monthly trend for selected room or average
    const monthlyTrend = useMemo(() => {
        if (selectedRoomData) {
            return {
                labels: selectedRoomData.monthlyUtilization.map((m) => m.month),
                datasets: [{
                    label: `${selectedRoomData.roomNumber} Utilization`,
                    data: selectedRoomData.monthlyUtilization.map((m) => m.percent),
                    borderColor: "var(--accent-terracotta)",
                    backgroundColor: "rgba(194,117,72,0.1)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                }],
            };
        }
        // Average across building
        const months = buildingRooms[0]?.monthlyUtilization.map((m) => m.month) || [];
        return {
            labels: months,
            datasets: [{
                label: `${activeBuilding} Block Average`,
                data: months.map((_, mi) => {
                    const avg = buildingRooms.reduce((a, r) => a + r.monthlyUtilization[mi].percent, 0) / buildingRooms.length;
                    return Math.round(avg);
                }),
                borderColor: "var(--accent-terracotta)",
                backgroundColor: "rgba(194,117,72,0.1)",
                fill: true,
                tension: 0.4,
                pointRadius: 3,
            },
            {
                label: "Predicted (Next 3m)",
                data: months.map((_, mi) => {
                    if (mi < 9) return null;
                    const avg = buildingRooms.reduce((a, r) => a + r.monthlyUtilization[mi].percent, 0) / buildingRooms.length;
                    return Math.round(avg + (Math.random() - 0.3) * 10);
                }),
                borderColor: "var(--accent-sage)",
                backgroundColor: "rgba(139,157,131,0.08)",
                borderDash: [5, 5],
                fill: true,
                tension: 0.4,
                pointRadius: 3,
            }],
        };
    }, [buildingRooms, selectedRoomData, activeBuilding]);

    // Floors grouping
    const floors = [...new Set(buildingRooms.map((r) => r.floor))].sort();

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: 28 }}>
                <h1 className="heading-serif" style={{ fontSize: 28, margin: 0 }}>Infrastructure</h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
                    A2 & A3 Block — Rooms, Utilization & Learning Resources
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
                {[
                    { label: "Classrooms", value: stats.totalClassrooms, icon: DoorOpen, color: "terracotta" },
                    { label: "Labs", value: stats.totalLabs, icon: Monitor, color: "lavender" },
                    { label: "Tutorial Rooms", value: stats.totalTutorialRooms, icon: BookOpen, color: "sage" },
                    { label: "Libraries", value: stats.totalLibraries, icon: BookOpen, color: "gold" },
                    { label: "Total Capacity", value: stats.totalCapacity, icon: Layers, color: "sky" },
                    { label: "Avg Utilization", value: `${stats.avgUtilization}%`, icon: TrendingUp, color: "rose" },
                    { label: "Computer Systems", value: stats.computerSystems, icon: Cpu, color: "lavender" },
                ].map((s, i) => (
                    <div key={s.label} className={`stat-card ${s.color} animate-fade-in stagger-${i + 1}`}>
                        <s.icon size={16} color={`var(--accent-${s.color})`} />
                        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Building Tabs */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div className="tab-group" style={{ width: "auto" }}>
                    <button className={`tab ${activeBuilding === "A2" ? "active" : ""}`} onClick={() => { setActiveBuilding("A2"); setSelectedRoom(null); }}>
                        <Building2 size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />A2 Block
                    </button>
                    <button className={`tab ${activeBuilding === "A3" ? "active" : ""}`} onClick={() => { setActiveBuilding("A3"); setSelectedRoom(null); }}>
                        <Building2 size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />A3 Block
                    </button>
                </div>
                {selectedRoom && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedRoom(null)}>
                        ← Back to overview
                    </button>
                )}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 28 }}>
                <div className="chart-container">
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                        Room Utilization — {activeBuilding} Block
                    </h3>
                    <div style={{ height: 260 }}>
                        <Bar data={utilizationData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                                y: { max: 100, grid: { color: "rgba(0,0,0,0.04)" }, ticks: { callback: (v) => `${v}%` } },
                            },
                            onClick: (_, elements) => {
                                if (elements.length > 0) {
                                    const idx = elements[0].index;
                                    setSelectedRoom(buildingRooms[idx].id);
                                }
                            },
                        }} />
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                        Click a bar to see monthly trend for that room
                    </p>
                </div>
                <div className="chart-container">
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Room Type Distribution</h3>
                    <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Doughnut data={typeDistribution} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } },
                            cutout: "60%",
                        }} />
                    </div>
                </div>
            </div>

            {/* Monthly Trend / Prediction */}
            <div className="chart-container" style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                    {selectedRoomData
                        ? `Monthly Utilization — ${selectedRoomData.roomNumber} (${selectedRoomData.type})`
                        : `Monthly Utilization Trend & Prediction — ${activeBuilding} Block`}
                </h3>
                <div style={{ height: 240 }}>
                    <Line data={monthlyTrend} options={{
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { position: "top", labels: { font: { size: 11 } } } },
                        scales: {
                            x: { grid: { display: false } },
                            y: { max: 100, grid: { color: "rgba(0,0,0,0.04)" }, ticks: { callback: (v) => `${v}%` } },
                        },
                    }} />
                </div>
            </div>

            {/* Floor-wise Room Cards */}
            {floors.map((floor) => (
                <div key={floor} style={{ marginBottom: 28 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>
                        {floor === 0 ? "Ground Floor" : `Floor ${floor}`}
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                        {buildingRooms.filter((r) => r.floor === floor).map((room) => {
                            const Icon = typeIcons[room.type] || DoorOpen;
                            const color = typeColors[room.type] || "var(--accent-terracotta)";
                            return (
                                <div
                                    key={room.id}
                                    className="card"
                                    style={{
                                        padding: 20, cursor: "pointer",
                                        border: selectedRoom === room.id ? `2px solid ${color}` : undefined,
                                    }}
                                    onClick={() => setSelectedRoom(room.id)}
                                >
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 10,
                                                background: `${color}15`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                <Icon size={18} color={color} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 15, fontWeight: 600 }}>{room.roomNumber}</div>
                                                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{room.type}</div>
                                            </div>
                                        </div>
                                        <span className="badge" style={{
                                            background: `${getUtilColor(room.utilizationPercent)}20`,
                                            color: getUtilColor(room.utilizationPercent),
                                            fontWeight: 600,
                                        }}>
                                            {room.utilizationPercent}%
                                        </span>
                                    </div>

                                    {/* Utilization Bar */}
                                    <div className="progress-bar" style={{ marginBottom: 10 }}>
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${room.utilizationPercent}%`,
                                                background: getUtilColor(room.utilizationPercent),
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
                                        <span>Capacity: {room.capacity}</span>
                                        <span>{room.equipment?.length || 0} Equipment</span>
                                    </div>

                                    {/* Equipment Tags */}
                                    {room.equipment && (
                                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                                            {room.equipment.slice(0, 3).map((e) => (
                                                <span key={e} className="badge badge-sky" style={{ fontSize: 10 }}>{e}</span>
                                            ))}
                                            {room.equipment.length > 3 && (
                                                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>+{room.equipment.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Learning Resources Section */}
            <div className="card-static" style={{ padding: 24, marginBottom: 28 }}>
                <h3 className="heading-serif" style={{ fontSize: 18, marginBottom: 16 }}>
                    📚 Learning Resources & Lab Systems
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
                    <div className="card-static" style={{ padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <Cpu size={18} color="var(--accent-lavender)" />
                            <span style={{ fontSize: 14, fontWeight: 600 }}>Computer Systems</span>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent-lavender)" }}>{stats.computerSystems}</div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
                            Across {rooms.filter((r) => r.type === "Lab").length} labs in A2 & A3 blocks
                        </p>
                    </div>
                    <div className="card-static" style={{ padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <BookOpen size={18} color="var(--accent-gold)" />
                            <span style={{ fontSize: 14, fontWeight: 600 }}>Digital Libraries</span>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent-gold)" }}>{stats.totalLibraries}</div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
                            With digital kiosks, reading stations & Wi-Fi
                        </p>
                    </div>
                    <div className="card-static" style={{ padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <Monitor size={18} color="var(--accent-terracotta)" />
                            <span style={{ fontSize: 14, fontWeight: 600 }}>Smart Boards</span>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent-terracotta)" }}>
                            {rooms.filter((r) => r.equipment?.some((e) => e.includes("Smart Board"))).length}
                        </div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
                            Classrooms with interactive smart boards
                        </p>
                    </div>
                    <div className="card-static" style={{ padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <Layers size={18} color="var(--accent-sage)" />
                            <span style={{ fontSize: 14, fontWeight: 600 }}>Seminar Halls</span>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent-sage)" }}>
                            {rooms.filter((r) => r.type === "Seminar Hall").length}
                        </div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
                            With projectors, stage & sound systems
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
