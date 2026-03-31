import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { prismaPlacementToDto } from "../../../lib/placementDto";
import { nextPlacementDbId } from "../../../lib/nextPlacementDbId";

/**
 * GET /api/placements?department=&year=
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");
        const year = searchParams.get("year");

        const where: Prisma.PlacementWhereInput = {};
        if (department) where.department = department;
        if (year) where.year = parseInt(year, 10);

        const rows = await prisma.placement.findMany({
            where,
            orderBy: [{ year: "desc" }, { id: "asc" }],
        });
        return NextResponse.json({ placements: rows.map(prismaPlacementToDto) });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to load placements" }, { status: 500 });
    }
}

type CreateBody = {
    studentId: string;
    studentName: string;
    department: string;
    year: number;
    company: string;
    role: string;
    package: number;
    crcRegistered?: boolean;
    email: string;
    phone: string;
    isAlumni?: boolean;
    graduationYear?: number | null;
    valueAddCourses?: string[];
};

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as CreateBody;
        const {
            studentId,
            studentName,
            department,
            year,
            company,
            role,
            package: pkg,
            email,
            phone,
        } = body;

        if (!studentId || !studentName?.trim() || !department || !company?.trim() || !role?.trim()) {
            return NextResponse.json({ error: "studentId, studentName, department, company, and role are required" }, { status: 400 });
        }

        const id = await nextPlacementDbId();
        const row = await prisma.placement.create({
            data: {
                id,
                studentId,
                studentName: studentName.trim(),
                department,
                year: Math.min(2030, Math.max(2000, Number(year) || new Date().getFullYear())),
                company: company.trim(),
                role: role.trim(),
                package: Math.min(100, Math.max(0, Number(pkg) || 0)),
                crcRegistered: Boolean(body.crcRegistered),
                email: email || `${id.toLowerCase()}@cu.edu.in`,
                phone: phone || "+91 0000000000",
                isAlumni: Boolean(body.isAlumni),
                graduationYear:
                    body.graduationYear != null && String(body.graduationYear).trim() !== ""
                        ? Number(body.graduationYear)
                        : null,
                valueAddCourses: Array.isArray(body.valueAddCourses) ? body.valueAddCourses : [],
            },
        });

        return NextResponse.json({ placement: prismaPlacementToDto(row) }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to create placement" }, { status: 500 });
    }
}
