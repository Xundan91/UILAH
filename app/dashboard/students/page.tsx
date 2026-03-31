"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Users,
    Filter,
    FileSpreadsheet,
    Download,
    CheckCircle2,
    UserCircle2,
    Loader2,
    X,
} from "lucide-react";
import { departments, getDepartmentById, totalProgramOfferings, programCodeToSlug } from "../../data/departments";
import { useStudents } from "../../context/StudentsDataContext";
import { useDashboardRole } from "../../context/DashboardRoleContext";
import {
    MULTI_STUDENT_IMPORT_TEMPLATE_CSV,
    parseStudentExcelMulti,
    type MultiImportCreatedStudent,
} from "../../lib/studentExcel";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, ArcElement,
    Tooltip, Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function StudentsPage() {
    const { students, importStudentsMulti } = useStudents();
    const { isAssistant } = useDashboardRole();
    const [instituteFilter, setInstituteFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [excelFeedback, setExcelFeedback] = useState<{
        tone: "success" | "warning" | "error";
        message: string;
        imported: MultiImportCreatedStudent[];
    } | null>(null);
    const [excelUploading, setExcelUploading] = useState(false);
    const [importSuccessModal, setImportSuccessModal] = useState<{
        imported: MultiImportCreatedStudent[];
        hadErrors: boolean;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function downloadImportTemplate() {
        const blob = new Blob(["\uFEFF", MULTI_STUDENT_IMPORT_TEMPLATE_CSV], {
            type: "text/csv;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "students-import-template.csv";
        a.click();
        URL.revokeObjectURL(url);
    }

    async function onExcelSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setExcelFeedback(null);
        setImportSuccessModal(null);
        setExcelUploading(true);
        try {
            const { rows, errors: parseErrors } = await parseStudentExcelMulti(file);
            if (parseErrors.length) {
                setExcelFeedback({
                    tone: "error",
                    message:
                        "Could not read all rows. " +
                        parseErrors.slice(0, 12).join(" · ") +
                        (parseErrors.length > 12 ? " …" : ""),
                    imported: [],
                });
                return;
            }
            if (!rows.length) {
                setExcelFeedback({
                    tone: "error",
                    message: "No data rows found in the file. Nothing was added to the Student table.",
                    imported: [],
                });
                return;
            }
            const { created, errors, imported } = await importStudentsMulti(rows);
            const savedPhrase =
                created === 1
                    ? "1 student record was saved to the database table Student."
                    : `${created} student records were saved to the database table Student.`;
            const fileSummary =
                rows.length === 1 ? "" : ` Your file had ${rows.length} row(s); ${created} ${created === 1 ? "was" : "were"} written to the database.`;
            if (created === 0) {
                setExcelFeedback({
                    tone: "error",
                    message:
                        "No student data was saved to the database table Student. " +
                        (errors.length
                            ? errors.slice(0, 8).join(" · ") + (errors.length > 8 ? " …" : "")
                            : ""),
                    imported: [],
                });
                return;
            }
            if (errors.length) {
                setExcelFeedback({
                    tone: "warning",
                    message:
                        `Successfully added student data. ${savedPhrase}${fileSummary} Some rows were skipped: ` +
                        errors.slice(0, 8).join(" · ") +
                        (errors.length > 8 ? " …" : ""),
                    imported,
                });
                setImportSuccessModal({ imported, hadErrors: true });
                return;
            }
            setExcelFeedback({
                tone: "success",
                message: `Successfully added student data. ${savedPhrase}${fileSummary} New rows are listed first on each program page (sorted by time added).`,
                imported,
            });
            setImportSuccessModal({ imported, hadErrors: false });
        } catch (err) {
            setExcelFeedback({
                tone: "error",
                message: err instanceof Error ? err.message : "Upload failed.",
                imported: [],
            });
        } finally {
            setExcelUploading(false);
        }
    }

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
            <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                    <h1 className="heading-serif" style={{ fontSize: 28, margin: 0 }}>
                        Student Data — Institutes
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
                        Six university institutes (UIA, UID, UIFVA, UILAH, UIMS, UITTR) and their degree programs
                    </p>
                </div>
                {isAssistant && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={excelUploading}
                        >
                            {excelUploading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <FileSpreadsheet size={16} />
                            )}
                            {excelUploading ? "Processing…" : "Upload Excel"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                            onClick={downloadImportTemplate}
                            disabled={excelUploading}
                        >
                            <Download size={16} />
                            Download CSV template
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                            style={{ display: "none" }}
                            onChange={onExcelSelected}
                        />
                    </div>
                )}
            </div>
            {excelFeedback && (
                <div
                    className="card-static animate-fade-in"
                    style={{
                        marginBottom: 24,
                        padding: 0,
                        overflow: "hidden",
                        border:
                            excelFeedback.tone === "success"
                                ? "1px solid rgba(139,157,131,0.45)"
                                : excelFeedback.tone === "warning"
                                  ? "1px solid rgba(194,117,72,0.4)"
                                  : "1px solid rgba(196,122,138,0.45)",
                        boxShadow:
                            excelFeedback.tone === "success"
                                ? "0 8px 28px rgba(139,157,131,0.12)"
                                : excelFeedback.tone === "warning"
                                  ? "0 8px 28px rgba(194,117,72,0.1)"
                                  : "0 8px 28px rgba(196,122,138,0.1)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 14,
                            padding: "16px 18px",
                            background:
                                excelFeedback.tone === "success"
                                    ? "linear-gradient(135deg, rgba(139,157,131,0.18) 0%, rgba(255,252,248,0.95) 50%)"
                                    : excelFeedback.tone === "warning"
                                      ? "linear-gradient(135deg, rgba(212,168,83,0.14) 0%, rgba(255,252,248,0.95) 55%)"
                                      : "linear-gradient(135deg, rgba(196,122,138,0.12) 0%, rgba(255,250,248,0.98) 50%)",
                        }}
                    >
                        <div
                            style={{
                                flexShrink: 0,
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background:
                                    excelFeedback.tone === "success"
                                        ? "var(--accent-sage)"
                                        : excelFeedback.tone === "warning"
                                          ? "var(--accent-gold)"
                                          : "var(--accent-rose)",
                                color: "#fff",
                            }}
                        >
                            {excelFeedback.tone === "success" ? (
                                <CheckCircle2 size={24} strokeWidth={2.2} />
                            ) : (
                                <UserCircle2 size={24} strokeWidth={2.2} />
                            )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                    color: "var(--accent-terracotta)",
                                    marginBottom: 6,
                                }}
                            >
                                {excelFeedback.tone === "success"
                                    ? "Import complete"
                                    : excelFeedback.tone === "warning"
                                      ? "Import partially complete"
                                      : "Import could not finish"}
                            </div>
                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--text-primary)" }}>
                                {excelFeedback.message}
                            </p>
                        </div>
                    </div>
                    {excelFeedback.imported.length > 0 && (
                        <div style={{ padding: "0 18px 18px" }}>
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "var(--text-muted)",
                                    marginBottom: 10,
                                }}
                            >
                                Added to the Student table ({excelFeedback.imported.length})
                            </div>
                            <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid var(--border-subtle)" }}>
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        fontSize: 13,
                                        background: "var(--card-bg)",
                                    }}
                                >
                                    <thead>
                                        <tr
                                            style={{
                                                textAlign: "left",
                                                background: "rgba(194,117,72,0.06)",
                                                borderBottom: "1px solid var(--border-subtle)",
                                            }}
                                        >
                                            <th style={{ padding: "10px 12px" }}>Student</th>
                                            <th style={{ padding: "10px 12px" }}>Institute</th>
                                            <th style={{ padding: "10px 12px" }}>Program</th>
                                            <th style={{ padding: "10px 12px" }}>ID</th>
                                            <th style={{ padding: "10px 12px" }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {excelFeedback.imported.map((s) => {
                                            const dept = getDepartmentById(s.instituteId);
                                            const slug = programCodeToSlug(s.programCode);
                                            return (
                                                <tr key={s.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{s.name}</td>
                                                    <td style={{ padding: "10px 12px" }}>
                                                        <span className="badge badge-sage" style={{ fontSize: 11 }}>
                                                            {dept?.shortName ?? s.instituteId}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "10px 12px" }}>
                                                        <code style={{ fontSize: 12 }}>{s.programCode}</code>
                                                    </td>
                                                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 12 }}>
                                                        {s.id}
                                                    </td>
                                                    <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                                                        <Link
                                                            href={`/dashboard/department/${s.instituteId}/program/${slug}`}
                                                            className="btn btn-ghost btn-sm"
                                                            style={{ fontSize: 12 }}
                                                        >
                                                            Open program
                                                            <ArrowRight size={14} style={{ marginLeft: 4 }} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {isAssistant && (
                <details className="card-static" style={{ padding: 14, marginBottom: 24 }}>
                    <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                        Excel / CSV column reference (multi-institute import)
                    </summary>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "10px 0 8px" }}>
                        Each row is one student. <strong>InstituteId</strong> must be the institute slug used in the app
                        (<code style={{ fontSize: 11 }}>uia</code>, <code style={{ fontSize: 11 }}>uid</code>,{" "}
                        <code style={{ fontSize: 11 }}>uifva</code>, <code style={{ fontSize: 11 }}>uilah</code>,{" "}
                        <code style={{ fontSize: 11 }}>uims</code>, <code style={{ fontSize: 11 }}>uittr</code>).{" "}
                        <strong>ProgramCode</strong> must match a program already in the database for that institute
                        (e.g. <code style={{ fontSize: 11 }}>BA203</code>, <code style={{ fontSize: 11 }}>BJ201</code>).
                    </p>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ fontSize: 12, borderCollapse: "collapse", width: "100%" }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-subtle)" }}>
                                    <th style={{ padding: "6px 8px" }}>Column</th>
                                    <th style={{ padding: "6px 8px" }}>Required</th>
                                    <th style={{ padding: "6px 8px" }}>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["InstituteId", "Yes", "Slug: uia, uid, uifva, uilah, uims, uittr"],
                                    ["ProgramCode", "Yes", "Must exist in DB. Short headers like ProgramC work too."],
                                    ["Name", "Yes", "Student full name"],
                                    ["Age", "No", "Default 20"],
                                    ["Gender", "No", "Male / Female / Other"],
                                    ["Religion", "No", "Default Hindu"],
                                    ["Semester", "No", "1–8, default 3"],
                                    ["EnrollmentYear", "No", "2018–2030, default 2023"],
                                    ["CGPA", "No", "0–10, default 7"],
                                    ["EventsAttended", "No", "Integer, default 0"],
                                    ["Courses", "No", "Semicolon or comma separated; default Core Course"],
                                    ["DropYear", "No", "Leave blank if active"],
                                    ["Email", "No", "Placeholder generated if empty"],
                                    ["Phone", "No", "Default +91 0000000000"],
                                    ["EducationalBackground", "No", "Default CBSE Board"],
                                ].map(([col, req, note]) => (
                                    <tr key={col} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                        <td style={{ padding: "6px 8px", fontFamily: "monospace" }}>{col}</td>
                                        <td style={{ padding: "6px 8px" }}>{req}</td>
                                        <td style={{ padding: "6px 8px", color: "var(--text-secondary)" }}>{note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "12px 0 0" }}>
                        Sample rows (different institutes in one file): UILAH + BA203, UIMS + BJ201, UIA + AR201 — see
                        &quot;Download CSV template&quot;.
                    </p>
                </details>
            )}

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

            {importSuccessModal && (
                <div
                    className="modal-overlay"
                    style={{ zIndex: 90 }}
                    onClick={() => setImportSuccessModal(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="import-success-title"
                >
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        background: "var(--accent-sage)",
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <CheckCircle2 size={26} />
                                </div>
                                <div>
                                    <h2 id="import-success-title" className="heading-serif" style={{ fontSize: 20, margin: 0 }}>
                                        {importSuccessModal.hadErrors ? "Import finished" : "Import successful"}
                                    </h2>
                                    <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "6px 0 0" }}>
                                        {importSuccessModal.hadErrors
                                            ? "Some rows were saved. Check the banner for any skipped rows."
                                            : "These students were added to the Student table."}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => setImportSuccessModal(null)}
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ marginTop: 16, marginBottom: 8, maxHeight: 280, overflowY: "auto" }}>
                            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-subtle)" }}>
                                        <th style={{ padding: "8px 6px" }}>Name</th>
                                        <th style={{ padding: "8px 6px" }}>Institute</th>
                                        <th style={{ padding: "8px 6px" }}>Program</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importSuccessModal.imported.map((s) => (
                                        <tr key={s.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                            <td style={{ padding: "8px 6px", fontWeight: 600 }}>{s.name}</td>
                                            <td style={{ padding: "8px 6px" }}>
                                                {getDepartmentById(s.instituteId)?.shortName ?? s.instituteId}
                                            </td>
                                            <td style={{ padding: "8px 6px" }}>
                                                <code>{s.programCode}</code>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                            <button type="button" className="btn btn-primary btn-sm" onClick={() => setImportSuccessModal(null)}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
