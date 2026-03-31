import { prisma } from "./prisma";

export async function nextFacultyDbId(): Promise<string> {
    const last = await prisma.facultyProfile.findFirst({
        where: { id: { startsWith: "FAC" } },
        orderBy: { id: "desc" },
        select: { id: true },
    });
    if (!last) return "FAC0001";
    const n = parseInt(last.id.replace(/^FAC/i, ""), 10);
    if (isNaN(n)) return `FAC${String(Date.now()).slice(-4)}`;
    return `FAC${String(n + 1).padStart(4, "0")}`;
}
