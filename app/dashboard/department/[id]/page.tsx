"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getDepartmentById, programCodeToSlug } from "../../../data/departments";
import { filterStudentsByDepartment } from "../../../data/students";
import { useStudents } from "../../../context/StudentsDataContext";

export default function InstituteProgramsPage() {
    const { students } = useStudents();
    const params = useParams();
    const deptId = params.id as string;
    const dept = getDepartmentById(deptId);
    const allStudents = useMemo(() => filterStudentsByDepartment(students, deptId), [students, deptId]);

    if (!dept) {
        return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Institute not found</div>;
    }

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                <Link href="/dashboard" className="btn btn-ghost" style={{ padding: 8 }}>
                    <ArrowLeft size={18} />
                </Link>
                <div style={{ fontSize: 32 }}>{dept.icon}</div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--accent-terracotta)" }}>{dept.shortName}</div>
                    <h1 className="heading-serif" style={{ fontSize: 24, margin: 0 }}>{dept.name}</h1>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>{dept.description}</p>
                </div>
            </div>

            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, maxWidth: 640 }}>
                Select a program to view students, semester filters, and analytics for that cohort.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 16,
                }}
            >
                {dept.programs.map((prog) => {
                    const slug = programCodeToSlug(prog.code);
                    const progStudents = allStudents.filter((s) => s.programCode.toLowerCase() === prog.code.toLowerCase());
                    const enrolled = progStudents.filter((s) => s.dropYear === null).length;
                    const avgCgpa =
                        progStudents.length > 0
                            ? (progStudents.reduce((a, s) => a + s.cgpa, 0) / progStudents.length).toFixed(2)
                            : "—";

                    return (
                        <Link
                            key={prog.code}
                            href={`/dashboard/department/${deptId}/program/${slug}`}
                            style={{ textDecoration: "none" }}
                        >
                            <div className="card" style={{ padding: 20, height: "100%" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 700,
                                                letterSpacing: "0.08em",
                                                color: "var(--accent-terracotta)",
                                                marginBottom: 6,
                                            }}
                                        >
                                            {prog.code}
                                        </div>
                                        <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0, lineHeight: 1.35 }}>
                                            {prog.name}
                                        </h2>
                                    </div>
                                    <ArrowRight size={18} color="var(--text-muted)" />
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                                    <span className="badge badge-terracotta">{progStudents.length} students</span>
                                    <span className="badge badge-sage">{enrolled} enrolled</span>
                                    <span className="badge badge-gold">Avg CGPA {avgCgpa}</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
