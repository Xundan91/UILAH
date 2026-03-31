import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { prismaFacultyToDto } from "../../../lib/facultyDto";
import { nextFacultyDbId } from "../../../lib/nextFacultyDbId";

/**
 * GET /api/faculty?department=
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");

        const where: Prisma.FacultyProfileWhereInput = {};
        if (department) where.department = department;

        const rows = await prisma.facultyProfile.findMany({
            where,
            orderBy: { id: "asc" },
        });
        return NextResponse.json({ faculty: rows.map(prismaFacultyToDto) });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to load faculty" }, { status: 500 });
    }
}

type CreateBody = {
    name: string;
    gender: string;
    age: number;
    religion: string;
    department: string;
    designation: string;
    education: string;
    educationDetails: string;
    specialization: string[];
    coursesTeaching: string[];
    publications: unknown;
    achievements: string[];
    facultyDevelopment: string[];
};

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as CreateBody;
        const { name, department, designation, education, educationDetails } = body;

        if (!name?.trim() || !department || !designation || !education || !educationDetails?.trim()) {
            return NextResponse.json({ error: "name, department, designation, education, educationDetails are required" }, { status: 400 });
        }

        const id = await nextFacultyDbId();
        const row = await prisma.facultyProfile.create({
            data: {
                id,
                name: name.trim(),
                gender: ["Male", "Female", "Other"].includes(body.gender) ? body.gender : "Male",
                age: Math.min(80, Math.max(22, Number(body.age) || 30)),
                religion: body.religion || "Hindu",
                department,
                designation,
                education,
                educationDetails: educationDetails.trim(),
                specialization: Array.isArray(body.specialization) ? body.specialization : [],
                coursesTeaching: Array.isArray(body.coursesTeaching) ? body.coursesTeaching : [],
                publications: (body.publications ?? {
                    scopusArticles: 0,
                    conferences: [],
                    books: [],
                    patents: [],
                    articles: [],
                }) as Prisma.InputJsonValue,
                achievements: Array.isArray(body.achievements) ? body.achievements : [],
                facultyDevelopment: Array.isArray(body.facultyDevelopment) ? body.facultyDevelopment : [],
            },
        });

        return NextResponse.json({ faculty: prismaFacultyToDto(row) }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to create faculty" }, { status: 500 });
    }
}
