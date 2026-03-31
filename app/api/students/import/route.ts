import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { getProgramByInstituteAndCode } from "../../../../lib/resolveProgram";
import { nextStudentDbId } from "../../../../lib/nextStudentDbId";
import type { Activity } from "../../../data/types";

type Row = {
    name: string;
    age?: number;
    gender?: string;
    religion?: string;
    semester?: number;
    enrollmentYear?: number;
    cgpa?: number;
    eventsAttended?: number;
    coursesEnrolled?: string[];
    dropYear?: number | string | null;
    activities?: Activity[];
    email?: string;
    phone?: string;
    educationalBackground?: string;
};

/**
 * POST /api/students/import
 * Body: { instituteId, programCode, rows: Row[] }
 * All rows are assigned to the same program.
 */
export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as {
            instituteId: string;
            programCode: string;
            rows: Row[];
        };

        const { instituteId, programCode, rows } = body;
        if (!instituteId || !programCode || !Array.isArray(rows)) {
            return NextResponse.json({ error: "instituteId, programCode, and rows[] are required" }, { status: 400 });
        }

        const program = await getProgramByInstituteAndCode(instituteId, programCode);
        if (!program) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        let created = 0;
        const errors: string[] = [];

        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            if (!r?.name?.trim()) {
                errors.push(`Row ${i + 1}: missing name`);
                continue;
            }
            try {
                const id = await nextStudentDbId();
                await prisma.student.create({
                    data: {
                        id,
                        programId: program.id,
                        name: r.name.trim(),
                        age: Math.min(60, Math.max(16, Number(r.age) || 20)),
                        gender: ["Male", "Female", "Other"].includes(String(r.gender)) ? String(r.gender) : "Male",
                        religion: r.religion || "Hindu",
                        semester: Math.min(8, Math.max(1, Number(r.semester) || 3)),
                        enrollmentYear: Math.min(2030, Math.max(2018, Number(r.enrollmentYear) || 2023)),
                        cgpa: Math.min(10, Math.max(0, Number(r.cgpa) || 7)),
                        eventsAttended: Number(r.eventsAttended) || 0,
                        coursesEnrolled:
                            Array.isArray(r.coursesEnrolled) && r.coursesEnrolled.length
                                ? r.coursesEnrolled
                                : ["Core Course"],
                        dropYear:
                            r.dropYear != null && String(r.dropYear).trim() !== ""
                                ? Number(r.dropYear)
                                : null,
                        activities: (r.activities ?? []) as unknown as Prisma.InputJsonValue,
                        email: r.email || `import.${id}@cu.edu.in`,
                        phone: r.phone || "+91 0000000000",
                        educationalBackground: r.educationalBackground || "CBSE Board",
                    },
                });
                created++;
            } catch (err) {
                errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "error"}`);
            }
        }

        return NextResponse.json({ created, errors });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Import failed" }, { status: 500 });
    }
}
