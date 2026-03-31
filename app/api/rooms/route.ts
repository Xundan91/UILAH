import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { prismaRoomToDto } from "../../../lib/roomDto";

/**
 * GET /api/rooms?building=A2|A3
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const building = searchParams.get("building");

        const where: Prisma.InfraRoomWhereInput = {};
        if (building === "A2" || building === "A3") where.building = building;

        const rows = await prisma.infraRoom.findMany({
            where,
            orderBy: [{ building: "asc" }, { floor: "asc" }, { roomNumber: "asc" }],
        });
        return NextResponse.json({ rooms: rows.map(prismaRoomToDto) });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to load rooms" }, { status: 500 });
    }
}

type CreateBody = {
    id: string;
    building: string;
    floor: number;
    roomNumber: string;
    type: string;
    capacity: number;
    utilizationPercent: number;
    monthlyUtilization: { month: string; percent: number }[];
    equipment?: string[];
};

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as CreateBody;
        const { id, building, floor, roomNumber, type, capacity, utilizationPercent, monthlyUtilization } = body;

        if (!id?.trim() || (building !== "A2" && building !== "A3") || !roomNumber?.trim() || !type?.trim()) {
            return NextResponse.json({ error: "id, building (A2|A3), roomNumber, and type are required" }, { status: 400 });
        }

        const row = await prisma.infraRoom.create({
            data: {
                id: id.trim(),
                building,
                floor: Number(floor) || 0,
                roomNumber: roomNumber.trim(),
                type: type.trim(),
                capacity: Math.max(1, Number(capacity) || 1),
                utilizationPercent: Math.min(100, Math.max(0, Number(utilizationPercent) || 0)),
                monthlyUtilization: (monthlyUtilization ?? []) as unknown as Prisma.InputJsonValue,
                equipment: Array.isArray(body.equipment) ? body.equipment : [],
            },
        });

        return NextResponse.json({ room: prismaRoomToDto(row) }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to create room (duplicate id?)" }, { status: 500 });
    }
}
