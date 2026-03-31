import { prisma } from "./prisma";

export async function getProgramByInstituteAndCode(instituteId: string, programCode: string) {
    return prisma.program.findUnique({
        where: {
            instituteId_code: {
                instituteId,
                code: programCode,
            },
        },
    });
}

/** Exact match first; then case-insensitive code (helps Excel uploads). */
export async function getProgramByInstituteAndCodeLoose(instituteId: string, programCode: string) {
    const code = programCode.trim();
    if (!instituteId.trim() || !code) return null;
    const exact = await getProgramByInstituteAndCode(instituteId.trim(), code);
    if (exact) return exact;
    return prisma.program.findFirst({
        where: {
            instituteId: instituteId.trim(),
            code: { equals: code, mode: "insensitive" },
        },
    });
}
