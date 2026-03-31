import type { Activity, Student } from "../app/data/types";
import type { Prisma } from "@prisma/client";

type StudentWithProgram = Prisma.StudentGetPayload<{
    include: { program: true };
}>;

export function prismaStudentToDto(s: StudentWithProgram): Student {
    const activities = (s.activities as unknown as Activity[]) ?? [];
    return {
        id: s.id,
        name: s.name,
        age: s.age,
        gender: s.gender as Student["gender"],
        religion: s.religion,
        department: s.program.instituteId,
        programCode: s.program.code,
        program: `${s.program.name} [${s.program.code}]`,
        semester: s.semester,
        enrollmentYear: s.enrollmentYear,
        cgpa: s.cgpa,
        eventsAttended: s.eventsAttended,
        coursesEnrolled: s.coursesEnrolled,
        dropYear: s.dropYear,
        activities,
        email: s.email,
        phone: s.phone,
        educationalBackground: s.educationalBackground,
    };
}
