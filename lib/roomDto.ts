import type { Room } from "../app/data/types";
import type { InfraRoom as PrismaRoom } from "@prisma/client";

export function prismaRoomToDto(r: PrismaRoom): Room {
    const monthly = r.monthlyUtilization as unknown as { month: string; percent: number }[];
    return {
        id: r.id,
        building: r.building as Room["building"],
        floor: r.floor,
        roomNumber: r.roomNumber,
        type: r.type as Room["type"],
        capacity: r.capacity,
        utilizationPercent: r.utilizationPercent,
        monthlyUtilization: Array.isArray(monthly) ? monthly : [],
        equipment: r.equipment.length ? r.equipment : undefined,
    };
}
