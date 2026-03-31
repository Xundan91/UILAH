import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { prismaRoomToDto } from "../../../../lib/roomDto";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const row = await prisma.infraRoom.findUnique({ where: { id } });
        if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ room: prismaRoomToDto(row) });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to load room" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = (await req.json()) as Record<string, unknown>;
        const existing = await prisma.infraRoom.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const data: Prisma.InfraRoomUncheckedUpdateInput = {};
        if (typeof body.building === "string" && (body.building === "A2" || body.building === "A3")) data.building = body.building;
        if (typeof body.floor === "number") data.floor = body.floor;
        if (typeof body.roomNumber === "string") data.roomNumber = body.roomNumber;
        if (typeof body.type === "string") data.type = body.type;
        if (typeof body.capacity === "number") data.capacity = body.capacity;
        if (typeof body.utilizationPercent === "number") data.utilizationPercent = body.utilizationPercent;
        if (body.monthlyUtilization !== undefined) data.monthlyUtilization = body.monthlyUtilization as Prisma.InputJsonValue;
        if (Array.isArray(body.equipment)) data.equipment = body.equipment as string[];

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ room: prismaRoomToDto(existing) });
        }

        const row = await prisma.infraRoom.update({ where: { id }, data });
        return NextResponse.json({ room: prismaRoomToDto(row) });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.infraRoom.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
    }
}
