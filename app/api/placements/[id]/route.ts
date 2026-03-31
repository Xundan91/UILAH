import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { prismaPlacementToDto } from "../../../../lib/placementDto";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const row = await prisma.placement.findUnique({ where: { id } });
        if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ placement: prismaPlacementToDto(row) });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to load placement" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = (await req.json()) as Record<string, unknown>;
        const existing = await prisma.placement.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const data: Prisma.PlacementUncheckedUpdateInput = {};
        if (typeof body.studentId === "string") data.studentId = body.studentId;
        if (typeof body.studentName === "string") data.studentName = body.studentName;
        if (typeof body.department === "string") data.department = body.department;
        if (typeof body.year === "number") data.year = body.year;
        if (typeof body.company === "string") data.company = body.company;
        if (typeof body.role === "string") data.role = body.role;
        if (typeof body.package === "number") data.package = body.package;
        if (typeof body.crcRegistered === "boolean") data.crcRegistered = body.crcRegistered;
        if (typeof body.email === "string") data.email = body.email;
        if (typeof body.phone === "string") data.phone = body.phone;
        if (typeof body.isAlumni === "boolean") data.isAlumni = body.isAlumni;
        if (body.graduationYear === null || typeof body.graduationYear === "number") data.graduationYear = body.graduationYear as number | null;
        if (Array.isArray(body.valueAddCourses)) data.valueAddCourses = body.valueAddCourses as string[];

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ placement: prismaPlacementToDto(existing) });
        }

        const row = await prisma.placement.update({ where: { id }, data });
        return NextResponse.json({ placement: prismaPlacementToDto(row) });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to update placement" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.placement.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to delete placement" }, { status: 500 });
    }
}
