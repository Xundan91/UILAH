import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../../../lib/prisma";
import { getProgramByInstituteAndCodeLoose } from "../../../../../lib/resolveProgram";
import { nextStudentDbId } from "../../../../../lib/nextStudentDbId";
import type { Activity } from "../../../../data/types";

type MultiRow = {
    instituteId: string;
    programCode: string;
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
 * POST /api/students/import/multi
 * Body: { rows: MultiRow[] } — each row must include instituteId + programCode (any mix of institutes/programs).
 * Response: { created, errors, imported } where imported is { id, name, instituteId, programCode }[] for each inserted row.
 */
export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as { rows: MultiRow[] };
        const { rows } = body;
        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ error: "rows[] is required and must not be empty" }, { status: 400 });
        }

        let created = 0;
        const errors: string[] = [];
        const imported: { id: string; name: string; instituteId: string; programCode: string }[] = [];

        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            const line = i + 1;
            if (!r?.name?.trim()) {
                errors.push(`Row ${line}: missing name`);
                continue;
            }
            const instituteId = String(r.instituteId ?? "").trim();
            const programCode = String(r.programCode ?? "").trim();
            if (!instituteId || !programCode) {
                errors.push(`Row ${line}: instituteId and programCode are required`);
                continue;
            }

            const program = await getProgramByInstituteAndCodeLoose(instituteId, programCode);
            if (!program) {
                errors.push(`Row ${line}: no program found for institute "${instituteId}" + code "${programCode}"`);
                continue;
            }

            try {
                const id = await nextStudentDbId();
                const row = await prisma.student.create({
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
                    include: { program: true },
                });
                created++;
                imported.push({
                    id: row.id,
                    name: row.name,
                    instituteId: row.program.instituteId,
                    programCode: row.program.code,
                });
            } catch (err) {
                errors.push(`Row ${line}: ${err instanceof Error ? err.message : "error"}`);
            }
        }

        return NextResponse.json({ created, errors, imported });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Import failed" }, { status: 500 });
    }
}
