import { PrismaClient, type Prisma } from "@prisma/client";
import { departments } from "../app/data/departments";
import { getInitialStudents } from "../app/data/students";
import { getInitialPlacements } from "../app/data/placements";
import { getInitialFaculty } from "../app/data/faculty";
import { rooms as seedRooms } from "../app/data/infrastructure";

const prisma = new PrismaClient();

const CHUNK = 250;
const PL_CHUNK = 500;

async function main() {
    for (const d of departments) {
        await prisma.institute.upsert({
            where: { id: d.id },
            create: {
                id: d.id,
                shortName: d.shortName,
                name: d.name,
                description: d.description,
                icon: d.icon,
                facultyCount: d.facultyCount,
            },
            update: {
                shortName: d.shortName,
                name: d.name,
                description: d.description,
                icon: d.icon,
                facultyCount: d.facultyCount,
            },
        });

        for (const p of d.programs) {
            await prisma.program.upsert({
                where: {
                    instituteId_code: { instituteId: d.id, code: p.code },
                },
                create: {
                    code: p.code,
                    name: p.name,
                    instituteId: d.id,
                },
                update: { name: p.name },
            });
        }
    }

    const programs = await prisma.program.findMany();
    const programIdByKey = new Map<string, string>();
    for (const p of programs) {
        programIdByKey.set(`${p.instituteId}|${p.code}`, p.id);
    }

    await prisma.student.deleteMany({});

    const seedStudents = getInitialStudents();
    const rows: Prisma.StudentCreateManyInput[] = [];

    for (const s of seedStudents) {
        const programId = programIdByKey.get(`${s.department}|${s.programCode}`);
        if (!programId) {
            console.warn(`Skip: no program for ${s.department} ${s.programCode}`);
            continue;
        }
        rows.push({
            id: s.id,
            programId,
            name: s.name,
            age: s.age,
            gender: s.gender,
            religion: s.religion,
            semester: s.semester,
            enrollmentYear: s.enrollmentYear,
            cgpa: s.cgpa,
            eventsAttended: s.eventsAttended,
            coursesEnrolled: s.coursesEnrolled,
            dropYear: s.dropYear,
            activities: s.activities as unknown as Prisma.InputJsonValue,
            email: s.email,
            phone: s.phone,
            educationalBackground: s.educationalBackground,
        });
    }

    for (let i = 0; i < rows.length; i += CHUNK) {
        const slice = rows.slice(i, i + CHUNK);
        await prisma.student.createMany({ data: slice });
    }

    console.log(`Seeded ${rows.length} students across ${programs.length} programs.`);

    await prisma.placement.deleteMany({});
    const seedPlacements = getInitialPlacements();
    const placementRows: Prisma.PlacementCreateManyInput[] = seedPlacements.map((p) => ({
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
        graduationYear: p.graduationYear ?? null,
        valueAddCourses: p.valueAddCourses ?? [],
    }));
    for (let i = 0; i < placementRows.length; i += PL_CHUNK) {
        await prisma.placement.createMany({ data: placementRows.slice(i, i + PL_CHUNK) });
    }
    console.log(`Seeded ${placementRows.length} placements.`);

    await prisma.facultyProfile.deleteMany({});
    const seedFaculty = getInitialFaculty();
    for (const f of seedFaculty) {
        await prisma.facultyProfile.create({
            data: {
                id: f.id,
                name: f.name,
                gender: f.gender,
                age: f.age,
                religion: f.religion,
                department: f.department,
                designation: f.designation,
                education: f.education,
                educationDetails: f.educationDetails,
                specialization: f.specialization,
                coursesTeaching: f.coursesTeaching,
                publications: f.publications as unknown as Prisma.InputJsonValue,
                achievements: f.achievements,
                facultyDevelopment: f.facultyDevelopment,
            },
        });
    }
    console.log(`Seeded ${seedFaculty.length} faculty profiles.`);

    await prisma.infraRoom.deleteMany({});
    await prisma.infraRoom.createMany({
        data: seedRooms.map((r) => ({
            id: r.id,
            building: r.building,
            floor: r.floor,
            roomNumber: r.roomNumber,
            type: r.type,
            capacity: r.capacity,
            utilizationPercent: r.utilizationPercent,
            monthlyUtilization: r.monthlyUtilization as unknown as Prisma.InputJsonValue,
            equipment: r.equipment ?? [],
        })),
    });
    console.log(`Seeded ${seedRooms.length} infrastructure rooms.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
