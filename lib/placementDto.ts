import type { PlacementRecord } from "../app/data/types";
import type { Placement as PrismaPlacement } from "@prisma/client";

export function prismaPlacementToDto(p: PrismaPlacement): PlacementRecord {
    return {
        id: p.id,
        studentId: p.studentId,
        studentName: p.studentName,
        department: p.department,
        year: p.year,
        company: p.company,
        role: p.role,
        package: p.package,
        crcRegistered: p.crcRegistered,
        email: p.email,
        phone: p.phone,
        isAlumni: p.isAlumni,
        graduationYear: p.graduationYear ?? undefined,
        valueAddCourses: p.valueAddCourses.length ? p.valueAddCourses : undefined,
    };
}
