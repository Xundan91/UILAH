import { prisma } from "./prisma";

export async function nextPlacementDbId(): Promise<string> {
    const last = await prisma.placement.findFirst({
        where: { id: { startsWith: "PLC" } },
        orderBy: { id: "desc" },
        select: { id: true },
    });
    if (!last) return "PLC00001";
    const n = parseInt(last.id.replace(/^PLC/i, ""), 10);
    if (isNaN(n)) return `PLC${String(Date.now()).slice(-5)}`;
    return `PLC${String(n + 1).padStart(5, "0")}`;
}
