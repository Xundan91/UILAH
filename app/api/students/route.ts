import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { prismaStudentToDto } from "../../../lib/studentDto";
import { getProgramByInstituteAndCode } from "../../../lib/resolveProgram";
import { nextStudentDbId } from "../../../lib/nextStudentDbId";
import type { Activity } from "../../data/types";

/**
 * GET /api/students?instituteId=&programCode=
 * Omit filters to return all students (use sparingly).
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const instituteId = searchParams.get("instituteId");
        const programCode = searchParams.get("programCode");

        const where: Prisma.StudentWhereInput = {};
        if (instituteId && programCode) {
            where.program = {
                is: {
                    instituteId,
                    code: { equals: programCode, mode: "insensitive" },
                },
            };
        } else if (instituteId) {
            where.program = { is: { instituteId } };
        }

        const rows = await prisma.student.findMany({
            where,
            include: { program: true },
            orderBy: { id: "asc" },
        });
        return NextResponse.json({ students: rows.map(prismaStudentToDto) });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to load students" }, { status: 500 });
    }
}

type CreateBody = {
    instituteId: string;
    programCode: string;
    name: string;
    age: number;
    gender: string;
    religion: string;
    semester: number;
    enrollmentYear: number;
    cgpa: number;
    eventsAttended?: number;
    coursesEnrolled: string[];
    dropYear?: number | null;
    activities?: Activity[];
    email: string;
    phone: string;
    educationalBackground: string;
};

/** POST /api/students — create one student (assistant flows). */
export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as CreateBody;
        const {
            instituteId,
            programCode,
            name,
            age,
            gender,
            religion,
            semester,
            enrollmentYear,
            cgpa,
            coursesEnrolled,
            email,
            phone,
            educationalBackground,
        } = body;

        if (!instituteId || !programCode || !name?.trim()) {
            return NextResponse.json({ error: "instituteId, programCode, and name are required" }, { status: 400 });
        }

        const program = await getProgramByInstituteAndCode(instituteId, programCode);
        if (!program) {
            return NextResponse.json({ error: "Program not found for institute + code" }, { status: 404 });
        }

        const id = await nextStudentDbId();
        const row = await prisma.student.create({
            data: {
                id,
                programId: program.id,
                name: name.trim(),
                age: Math.min(60, Math.max(16, Number(age) || 18)),
                gender: ["Male", "Female", "Other"].includes(gender) ? gender : "Male",
                religion: religion || "Hindu",
                semester: Math.min(8, Math.max(1, Number(semester) || 1)),
                enrollmentYear: Math.min(2030, Math.max(2018, Number(enrollmentYear) || 2023)),
                cgpa: Math.min(10, Math.max(0, Number(cgpa) || 0)),
                eventsAttended: Number(body.eventsAttended) || 0,
                coursesEnrolled: Array.isArray(coursesEnrolled) && coursesEnrolled.length ? coursesEnrolled : ["Core Course"],
                dropYear:
                    body.dropYear != null && String(body.dropYear).trim() !== ""
                        ? Number(body.dropYear)
                        : null,
                activities: (body.activities ?? []) as unknown as Prisma.InputJsonValue,
                email: email || `${id.toLowerCase()}@cu.edu.in`,
                phone: phone || "+91 0000000000",
                educationalBackground: educationalBackground || "CBSE Board",
            },
            include: { program: true },
        });

        return NextResponse.json({ student: prismaStudentToDto(row) }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
    }
}
