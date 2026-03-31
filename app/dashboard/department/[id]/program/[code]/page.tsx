"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Filter, X, Mail, Phone, Activity, UserPlus, FileSpreadsheet, Pencil, Trash2, Loader2 } from "lucide-react";
import { getProgramByDeptAndSlug } from "../../../../../data/departments";
import { useStudents } from "../../../../../context/StudentsDataContext";
import { useDashboardRole } from "../../../../../context/DashboardRoleContext";
import { parseStudentExcel } from "../../../../../lib/studentExcel";
import StudentFormModal from "../../../../../components/StudentFormModal";
import StudentEntryForm from "../../../../../components/StudentEntryForm";
import type { Student } from "../../../../../data/types";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, ArcElement,
    Tooltip, Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function ProgramStudentsPage() {
    const params = useParams();
    const deptId = params.id as string;
    const codeSlug = params.code as string;
    const { students, addStudent, replaceStudent, removeStudent, importStudents } = useStudents();
    const { isAssistant } = useDashboardRole();
    const resolved = useMemo(() => getProgramByDeptAndSlug(deptId, codeSlug), [deptId, codeSlug]);

    const programDisplay = resolved
        ? `${resolved.program.name} [${resolved.program.code}]`
        : "";

    /** Server-filtered list so this page only shows students for this institute + program (Prisma query). */
    const [programStudents, setProgramStudents] = useState<Student[]>([]);
    const [programListLoading, setProgramListLoading] = useState(false);

    const loadProgramStudents = useCallback(async () => {
        if (!resolved) {
            setProgramStudents([]);
            return;
        }
        setProgramListLoading(true);
        try {
            const q = new URLSearchParams({
                instituteId: resolved.dept.id,
                programCode: resolved.program.code,
            });
            const res = await fetch(`/api/students?${q}`, { cache: "no-store" });
            if (!res.ok) return;
            const data = (await res.json()) as { students?: Student[] };
            setProgramStudents(Array.isArray(data.students) ? data.students : []);
        } finally {
            setProgramListLoading(false);
        }
    }, [resolved]);

    useEffect(() => {
        void loadProgramStudents();
    }, [loadProgramStudents, students]);

    const [yearFilter, setYearFilter] = useState("all");
    const [cgpaFilter, setCgpaFilter] = useState("all");
    const [semesterFilter, setSemesterFilter] = useState("all");
    const [genderFilter, setGenderFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit">("add");
    const [formStudent, setFormStudent] = useState<Student | null>(null);
    const [excelFeedback, setExcelFeedback] = useState<{
        tone: "success" | "warning" | "error";
        message: string;
    } | null>(null);
    const [excelBusy, setExcelBusy] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredStudents = useMemo(() => {
        return programStudents.filter((s) => {
            if (yearFilter !== "all" && s.enrollmentYear !== parseInt(yearFilter, 10)) return false;
            if (semesterFilter !== "all" && s.semester !== parseInt(semesterFilter, 10)) return false;
            if (cgpaFilter === "<6" && s.cgpa >= 6) return false;
            if (cgpaFilter === "6-7" && (s.cgpa < 6 || s.cgpa >= 7)) return false;
            if (cgpaFilter === "7-8" && (s.cgpa < 7 || s.cgpa >= 8)) return false;
            if (cgpaFilter === "8-9" && (s.cgpa < 8 || s.cgpa >= 9)) return false;
            if (cgpaFilter === "9+" && s.cgpa < 9) return false;
            if (genderFilter !== "all" && s.gender !== genderFilter) return false;
            if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
    }, [programStudents, yearFilter, cgpaFilter, semesterFilter, genderFilter, searchQuery]);

    const modalStudent = activeModal ? programStudents.find((s) => s.id === activeModal) : null;

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
            datasets: [
                {
                    label: "Students",
                    data: counts,
                    backgroundColor: [
                        "rgba(196,122,138,0.7)",
                        "rgba(212,168,83,0.7)",
                        "rgba(139,157,131,0.7)",
                        "rgba(107,163,190,0.7)",
                        "rgba(155,142,196,0.7)",
                    ],
                    borderRadius: 6,
                    borderSkipped: false,
                },
            ],
        };
    }, [filteredStudents]);

    const genderChartData = useMemo(() => {
        const male = filteredStudents.filter((s) => s.gender === "Male").length;
        const female = filteredStudents.filter((s) => s.gender === "Female").length;
        const other = filteredStudents.filter((s) => s.gender === "Other").length;
        return {
            labels: ["Male", "Female", "Other"],
            datasets: [
                {
                    data: [male, female, other],
                    backgroundColor: ["rgba(107,163,190,0.8)", "rgba(196,122,138,0.8)", "rgba(212,168,83,0.8)"],
                    borderWidth: 0,
                },
            ],
        };
    }, [filteredStudents]);

    const handleSaveStudent = async (s: Student) => {
        if (formMode === "add" || !s.id) {
            await addStudent(s);
        } else {
            await replaceStudent(s);
        }
    };

    const handleExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !resolved) return;
        setExcelFeedback(null);
        setExcelBusy(true);
        try {
            const { students: rows, errors: parseErrors } = await parseStudentExcel(
                file,
                deptId,
                resolved.program.code,
                programDisplay
            );
            if (rows.length === 0) {
                setExcelFeedback({
                    tone: "error",
                    message: parseErrors.length
                        ? "No student data was saved to the database table Student. " + parseErrors.join(" ")
                        : "No valid rows in the file. Nothing was added to the database table Student.",
                });
                return;
            }
            const { created, errors: apiErrors } = await importStudents(deptId, resolved.program.code, rows);
            const saved =
                created === 1
                    ? "1 student record was saved to the database table Student."
                    : `${created} student records were saved to the database table Student.`;
            if (created === 0) {
                setExcelFeedback({
                    tone: "error",
                    message:
                        "No student data was saved to the database table Student. " +
                        (apiErrors.length ? apiErrors.join(" · ") : ""),
                });
                return;
            }
            let message = `Successfully added student data. ${saved}`;
            if (rows.length > 1) {
                message += ` Your file had ${rows.length} valid row(s) for this program.`;
            }
            if (parseErrors.length) {
                message +=
                    ` ${parseErrors.length} other row(s) in the file were skipped: ` +
                    parseErrors.slice(0, 5).join(" · ") +
                    (parseErrors.length > 5 ? " …" : "");
            }
            if (apiErrors.length) {
                message +=
                    ` Some rows could not be saved: ` +
                    apiErrors.slice(0, 5).join(" · ") +
                    (apiErrors.length > 5 ? " …" : "");
            }
            setExcelFeedback({
                tone: parseErrors.length || apiErrors.length ? "warning" : "success",
                message,
            });
        } catch (err) {
            setExcelFeedback({
                tone: "error",
                message: err instanceof Error ? err.message : "Could not read Excel file.",
            });
        } finally {
            setExcelBusy(false);
        }
    };

    const confirmRemove = async (id: string, name: string) => {
        if (typeof window === "undefined") return;
        if (!window.confirm(`Remove ${name} from this program?`)) return;
        try {
            await removeStudent(id);
        } catch (err) {
            window.alert(err instanceof Error ? err.message : "Could not remove student.");
        }
    };

    if (!resolved) {
        return (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                Program not found
                <div style={{ marginTop: 16 }}>
                    <Link href="/dashboard" className="btn btn-secondary btn-sm">
                        Back to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const { dept, program } = resolved;

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <Link href={`/dashboard/department/${deptId}`} className="btn btn-ghost" style={{ padding: 8 }}>
                    <ArrowLeft size={18} />
                </Link>
                <div style={{ fontSize: 28 }}>{dept.icon}</div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--accent-terracotta)" }}>
                        {dept.shortName} · {program.code}
                    </div>
                    <h1 className="heading-serif" style={{ fontSize: 22, margin: 0 }}>
                        {program.name}
                    </h1>
                </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
                <span className="badge badge-terracotta" style={{ fontSize: 13, padding: "6px 14px" }}>
                    {filteredStudents.length} students (filtered)
                </span>
                <span className="badge badge-sage" style={{ fontSize: 13, padding: "6px 14px" }}>
                    Avg CGPA:{" "}
                    {(filteredStudents.reduce((a, s) => a + s.cgpa, 0) / (filteredStudents.length || 1)).toFixed(2)}
                </span>
                <span className="badge badge-sky" style={{ fontSize: 13, padding: "6px 14px" }}>
                    {filteredStudents.filter((s) => s.dropYear !== null).length} dropped
                </span>
                {isAssistant && (
                    <>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                            onClick={() => {
                                setFormMode("add");
                                setFormStudent(null);
                                setFormOpen(true);
                            }}
                        >
                            <UserPlus size={16} />
                            Add student
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={excelBusy}
                        >
                            {excelBusy ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <FileSpreadsheet size={16} />
                            )}
                            {excelBusy ? "Reading file…" : "Add from Excel"}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                            style={{ display: "none" }}
                            onChange={handleExcel}
                        />
                    </>
                )}
            </div>
            {excelFeedback && (
                <div
                    className="card-static"
                    style={{
                        padding: 12,
                        marginBottom: 16,
                        fontSize: 13,
                        color: "var(--text-primary)",
                        borderLeft:
                            excelFeedback.tone === "success"
                                ? "3px solid var(--accent-sage)"
                                : excelFeedback.tone === "warning"
                                  ? "3px solid var(--accent-terracotta)"
                                  : "3px solid #c45c6a",
                        background:
                            excelFeedback.tone === "success"
                                ? "rgba(139,157,131,0.12)"
                                : excelFeedback.tone === "warning"
                                  ? "rgba(194,117,72,0.08)"
                                  : "rgba(196,122,138,0.08)",
                    }}
                >
                    {excelFeedback.message}
                </div>
            )}

            {isAssistant ? (
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
                        Add candidate
                    </h2>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                        Enter details below and click <strong>Save to database</strong>. This program is{" "}
                        <span style={{ color: "var(--accent-terracotta)" }}>{programDisplay}</span>.
                    </p>
                    <StudentEntryForm
                        variant="inline"
                        deptId={deptId}
                        programCode={program.code}
                        programDisplay={programDisplay}
                        mode="add"
                        onSubmit={handleSaveStudent}
                    />
                </div>
            ) : (
                <div
                    className="card-static"
                    style={{
                        padding: 16,
                        marginBottom: 24,
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        background: "rgba(107,163,190,0.08)",
                    }}
                >
                    To add or edit students, switch <strong>Access role</strong> in the sidebar to{" "}
                    <strong>Personal Assistant (edit data)</strong>.
                </div>
            )}

            {isAssistant && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Excel columns: Name, Age, Gender, Religion, EnrollmentYear, Semester, CGPA, Email, Phone, EducationalBackground, Courses, DropYear, Events (optional).</p>
            )}

            <div className="card-static" style={{ padding: 16, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <Filter size={14} color="var(--text-muted)" />
                    <span
                        style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        Filters
                    </span>
                </div>
                <div className="filter-bar" style={{ padding: 0, flexWrap: "wrap" }}>
                    <input
                        type="text"
                        placeholder="Search by name…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                        style={{ maxWidth: 200 }}
                    />
                    <select className="filter-select" value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
                        <option value="all">All semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <option key={n} value={String(n)}>
                                Semester {n}
                            </option>
                        ))}
                    </select>
                    <select className="filter-select" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                        <option value="all">All admission years</option>
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
                    <select className="filter-select" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                        <option value="all">All genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "10px 0 0" }}>
                    Newly added and imported students appear at the top of this list. Use search by name if you do not see someone (older rows are below).
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                <div className="chart-container">
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>CGPA distribution (filtered)</h3>
                    <div style={{ height: 200 }}>
                        <Bar
                            data={cgpaChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { display: false } },
                                    y: { grid: { color: "rgba(0,0,0,0.04)" } },
                                },
                            }}
                        />
                    </div>
                </div>
                <div className="chart-container">
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Gender (filtered)</h3>
                    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Doughnut
                            data={genderChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { position: "bottom", labels: { padding: 8, font: { size: 11 } } } },
                                cutout: "60%",
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="card-static" style={{ overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Semester</th>
                                <th>Age</th>
                                <th>Background</th>
                                <th>CGPA</th>
                                <th>Year</th>
                                <th>Courses</th>
                                <th>Drop</th>
                                <th>Details</th>
                                {isAssistant && <th>Manage</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {programListLoading ? (
                                <tr>
                                    <td
                                        colSpan={isAssistant ? 10 : 9}
                                        style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}
                                    >
                                        <Loader2
                                            size={28}
                                            className="animate-spin"
                                            style={{ color: "var(--accent-terracotta)", display: "inline-block" }}
                                        />
                                        <div style={{ marginTop: 14, fontSize: 14 }}>Loading students for this program…</div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                <tr key={student.id}>
                                    <td style={{ fontWeight: 500 }}>{student.name}</td>
                                    <td>
                                        <span className="badge badge-lavender">Sem {student.semester}</span>
                                    </td>
                                    <td>{student.age}</td>
                                    <td>
                                        <span className="badge badge-sky" style={{ fontSize: 11 }}>
                                            {student.educationalBackground}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                color:
                                                    student.cgpa >= 8
                                                        ? "var(--accent-sage)"
                                                        : student.cgpa >= 6
                                                          ? "var(--accent-gold)"
                                                          : "var(--accent-rose)",
                                            }}
                                        >
                                            {student.cgpa.toFixed(2)}
                                        </span>
                                    </td>
                                    <td>{student.enrollmentYear}</td>
                                    <td style={{ maxWidth: 200 }}>
                                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                            {student.coursesEnrolled.slice(0, 2).map((c) => (
                                                <span key={c} className="badge badge-lavender" style={{ fontSize: 10 }}>
                                                    {c}
                                                </span>
                                            ))}
                                            {student.coursesEnrolled.length > 2 && (
                                                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                                    +{student.coursesEnrolled.length - 2}
                                                </span>
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
                                    {isAssistant && (
                                        <td>
                                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => {
                                                        setFormMode("edit");
                                                        setFormStudent(student);
                                                        setFormOpen(true);
                                                    }}
                                                    title="Edit"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => confirmRemove(student.id, student.name)}
                                                    title="Remove"
                                                    style={{ color: "var(--accent-rose)" }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                                ))
                            )}
                            {!programListLoading && filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={isAssistant ? 10 : 9} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                                        {programStudents.length === 0
                                            ? "No students in this program yet."
                                            : "No students match your filters"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "var(--text-muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: 8,
                                }}
                            >
                                Activities ({modalStudent.activities.length})
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {modalStudent.activities.map((act, i) => (
                                    <div
                                        key={i}
                                        className="card-static"
                                        style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                    >
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 500 }}>{act.name}</div>
                                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{act.date}</div>
                                        </div>
                                        <span
                                            className={`badge badge-${act.type === "Cultural" ? "terracotta" : act.type === "Academic" ? "lavender" : act.type === "Sports" ? "sage" : act.type === "Social" ? "sky" : "gold"}`}
                                        >
                                            {act.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "var(--text-muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: 8,
                                }}
                            >
                                Enrolled courses
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {modalStudent.coursesEnrolled.map((c) => (
                                    <span key={c} className="badge badge-lavender">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <StudentFormModal
                open={formOpen}
                mode={formMode}
                initial={formMode === "edit" ? formStudent : null}
                deptId={deptId}
                programCode={program.code}
                programDisplay={programDisplay}
                onClose={() => setFormOpen(false)}
                onSave={(s) => {
                    handleSaveStudent(s);
                }}
            />
        </div>
    );
}
