import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { prismaFacultyToDto } from "../../../../lib/facultyDto";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const row = await prisma.facultyProfile.findUnique({ where: { id } });
        if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ faculty: prismaFacultyToDto(row) });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to load faculty" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = (await req.json()) as Record<string, unknown>;
        const existing = await prisma.facultyProfile.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const data: Prisma.FacultyProfileUncheckedUpdateInput = {};
        if (typeof body.name === "string") data.name = body.name;
        if (typeof body.gender === "string") data.gender = body.gender;
        if (typeof body.age === "number") data.age = body.age;
        if (typeof body.religion === "string") data.religion = body.religion;
        if (typeof body.department === "string") data.department = body.department;
        if (typeof body.designation === "string") data.designation = body.designation;
        if (typeof body.education === "string") data.education = body.education;
        if (typeof body.educationDetails === "string") data.educationDetails = body.educationDetails;
        if (Array.isArray(body.specialization)) data.specialization = body.specialization as string[];
        if (Array.isArray(body.coursesTeaching)) data.coursesTeaching = body.coursesTeaching as string[];
        if (body.publications !== undefined) data.publications = body.publications as Prisma.InputJsonValue;
        if (Array.isArray(body.achievements)) data.achievements = body.achievements as string[];
        if (Array.isArray(body.facultyDevelopment)) data.facultyDevelopment = body.facultyDevelopment as string[];

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ faculty: prismaFacultyToDto(existing) });
        }

        const row = await prisma.facultyProfile.update({ where: { id }, data });
        return NextResponse.json({ faculty: prismaFacultyToDto(row) });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to update faculty" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.facultyProfile.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to delete faculty" }, { status: 500 });
    }
}
