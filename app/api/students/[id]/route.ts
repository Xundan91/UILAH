import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { prismaStudentToDto } from "../../../../lib/studentDto";
/** GET /api/students/[id] */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const row = await prisma.student.findUnique({
            where: { id },
            include: { program: true },
        });
        if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ student: prismaStudentToDto(row) });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to load student" }, { status: 500 });
    }
}

/** PATCH /api/students/[id] — body may include instituteId + programCode to move program, or scalar fields. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = (await req.json()) as Record<string, unknown>;

        const existing = await prisma.student.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

        let programId = existing.programId;
        const instituteId = body.instituteId as string | undefined;
        const programCode = body.programCode as string | undefined;
        if (instituteId && programCode) {
            const p = await prisma.program.findUnique({
                where: {
                    instituteId_code: { instituteId, code: programCode },
                },
            });
            if (!p) return NextResponse.json({ error: "Target program not found" }, { status: 404 });
            programId = p.id;
        }

        const data: Prisma.StudentUncheckedUpdateInput = {};
        if (programId !== existing.programId) data.programId = programId;
        if (typeof body.name === "string") data.name = body.name;
        if (typeof body.age === "number") data.age = body.age;
        if (typeof body.gender === "string") data.gender = body.gender;
        if (typeof body.religion === "string") data.religion = body.religion;
        if (typeof body.semester === "number") data.semester = body.semester;
        if (typeof body.enrollmentYear === "number") data.enrollmentYear = body.enrollmentYear;
        if (typeof body.cgpa === "number") data.cgpa = body.cgpa;
        if (typeof body.eventsAttended === "number") data.eventsAttended = body.eventsAttended;
        if (Array.isArray(body.coursesEnrolled)) data.coursesEnrolled = body.coursesEnrolled as string[];
        if (body.dropYear === null || typeof body.dropYear === "number") data.dropYear = body.dropYear as number | null;
        if (Array.isArray(body.activities)) data.activities = body.activities as unknown as Prisma.InputJsonValue;
        if (typeof body.email === "string") data.email = body.email;
        if (typeof body.phone === "string") data.phone = body.phone;
        if (typeof body.educationalBackground === "string") data.educationalBackground = body.educationalBackground;

        if (Object.keys(data).length === 0) {
            const unchanged = await prisma.student.findUnique({
                where: { id },
                include: { program: true },
            });
            if (!unchanged) return NextResponse.json({ error: "Not found" }, { status: 404 });
            return NextResponse.json({ student: prismaStudentToDto(unchanged) });
        }

        const row = await prisma.student.update({
            where: { id },
            data,
            include: { program: true },
        });

        return NextResponse.json({ student: prismaStudentToDto(row) });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
    }
}

/** DELETE /api/students/[id] */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.student.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
    }
}
