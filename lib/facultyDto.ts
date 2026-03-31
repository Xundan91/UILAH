import type { Faculty, PublicationProfile } from "../app/data/types";
import type { FacultyProfile as PrismaFaculty } from "@prisma/client";

export function prismaFacultyToDto(f: PrismaFaculty): Faculty {
    return {
        id: f.id,
        name: f.name,
        gender: f.gender as Faculty["gender"],
        age: f.age,
        religion: f.religion,
        department: f.department,
        designation: f.designation,
        education: f.education as Faculty["education"],
        educationDetails: f.educationDetails,
        specialization: f.specialization,
        coursesTeaching: f.coursesTeaching,
        publications: f.publications as unknown as PublicationProfile,
        achievements: f.achievements,
        facultyDevelopment: f.facultyDevelopment,
    };
}
