import { prisma } from "./prisma";

export async function nextStudentDbId(): Promise<string> {
    const last = await prisma.student.findFirst({
        where: { id: { startsWith: "STU" } },
        orderBy: { id: "desc" },
        select: { id: true },
    });
    if (!last) return "STU00001";
    const n = parseInt(last.id.replace(/^STU/i, ""), 10);
    if (isNaN(n)) return `STU${String(Date.now()).slice(-5)}`;
    return `STU${String(n + 1).padStart(5, "0")}`;
}
