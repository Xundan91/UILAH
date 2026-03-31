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
