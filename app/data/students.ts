import { Student } from './types';
import { departments } from './departments';

const firstNames = [
    'Aarav', 'Priya', 'Rohan', 'Sneha', 'Vikram', 'Ananya', 'Arjun', 'Meera', 'Karan', 'Ishita',
    'Dev', 'Nisha', 'Rahul', 'Pooja', 'Aditya', 'Kavya', 'Siddharth', 'Riya', 'Manish', 'Divya',
    'Rajesh', 'Simran', 'Nikhil', 'Tanvi', 'Harsh', 'Neha', 'Varun', 'Shruti', 'Amit', 'Pallavi',
    'Suraj', 'Komal', 'Deepak', 'Anjali', 'Gaurav', 'Sakshi', 'Akash', 'Megha', 'Tushar', 'Ritika',
    'Sahil', 'Bhavna', 'Vishal', 'Sonal', 'Pankaj', 'Tanya', 'Mohit', 'Jyoti', 'Naveen', 'Preeti',
    'Kunal', 'Swati', 'Prakash', 'Richa', 'Vivek', 'Ankita', 'Ashish', 'Sweta', 'Yash', 'Kratika',
    'Abhishek', 'Prachi', 'Tarun', 'Nikita', 'Rishabh', 'Kanika', 'Sourav', 'Garima', 'Mayank', 'Disha',
    'Ankit', 'Shivani', 'Lalit', 'Nandini', 'Shubham', 'Vidhi', 'Himanshu', 'Kritika', 'Chirag', 'Bhumi',
    'Lakshay', 'Muskan', 'Ayush', 'Vandana', 'Dhruv', 'Payal', 'Rajat', 'Mansi', 'Pranav', 'Kajal',
    'Sandeep', 'Urvi', 'Rohit', 'Shikha', 'Ajay', 'Kirti', 'Sumit', 'Roshni', 'Vijay', 'Deepika',
];

const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Mehta', 'Joshi', 'Chauhan', 'Reddy',
    'Nair', 'Iyer', 'Kapoor', 'Malhotra', 'Bhatia', 'Saxena', 'Agarwal', 'Rao', 'Das', 'Mishra',
    'Pandey', 'Tiwari', 'Dubey', 'Yadav', 'Thakur', 'Chaudhary', 'Srivastava', 'Chopra', 'Bansal', 'Goyal',
    'Mahajan', 'Sethi', 'Kaur', 'Gill', 'Dhillon', 'Bajaj', 'Arora', 'Khanna', 'Grover', 'Ahuja',
];

const religions = ['Hindu', 'Muslim', 'Sikh', 'Christian', 'Buddhist', 'Jain'];
const religionWeights = [0.55, 0.18, 0.12, 0.08, 0.04, 0.03];

const educationalBackgrounds = ['CBSE Board', 'ICSE Board', 'State Board', 'International Baccalaureate', 'NIOS'];
const bgWeights = [0.40, 0.15, 0.35, 0.06, 0.04];

const departmentTargets: Record<string, number> = Object.fromEntries(
    departments.map((d) => [d.id, d.studentCount])
);

const instituteCourses: Record<string, string[]> = {
    uia: ['Architectural Design Studio', 'Building Materials', 'Structural Systems', 'History of Architecture', 'Environmental Design', 'Urban Design', 'Construction Technology', 'Landscape Architecture'],
    uid: ['Design Fundamentals', 'Product Design Studio', 'Industrial Ergonomics', 'Fashion Illustration', 'Textile Studies', 'Design Thinking', 'Portfolio Development', 'Digital Design Tools'],
    uifva: ['Digital Filmmaking', 'Animation Principles', 'VFX Compositing', '3D Modeling', 'Game Design', 'Screenwriting', 'Cinematography', 'Post-Production'],
    uilah: ['Psychology Core', 'Research Methods', 'Literary Theory', 'Social Work Practice', 'International Relations', 'English Literature', 'Clinical Psychology', 'Liberal Arts Seminar'],
    uims: ['News Reporting', 'Media Ethics', 'Broadcast Journalism', 'Digital Media', 'Public Relations', 'Content Writing', 'Video Production', 'Media Law'],
    uittr: ['Educational Psychology', 'Pedagogy', 'Yoga Philosophy', 'Sports Science', 'Curriculum Design', 'Classroom Management', 'Assessment Methods', 'Inclusive Education'],
};

const activityNames = [
    { name: 'Annual Cultural Fest - Tarang', type: 'Cultural' as const },
    { name: 'Inter-University Debate Championship', type: 'Academic' as const },
    { name: 'Poetry Slam', type: 'Cultural' as const },
    { name: 'Research Symposium', type: 'Academic' as const },
    { name: 'CU Sports Meet', type: 'Sports' as const },
    { name: 'Community Outreach Program', type: 'Social' as const },
    { name: 'Art Exhibition - Kala Utsav', type: 'Cultural' as const },
    { name: 'Model United Nations', type: 'Academic' as const },
    { name: 'Theatre Workshop', type: 'Cultural' as const },
    { name: 'Hackathon - CodeArts', type: 'Technical' as const },
    { name: 'Literary Society Meet', type: 'Academic' as const },
    { name: 'Film Screening Festival', type: 'Cultural' as const },
    { name: 'NSS Volunteer Drive', type: 'Social' as const },
    { name: 'Photography Contest', type: 'Cultural' as const },
    { name: 'Guest Lecture Series', type: 'Academic' as const },
    { name: 'Blood Donation Camp', type: 'Social' as const },
    { name: 'Inter-Institute Quiz', type: 'Academic' as const },
    { name: 'Dance Competition - Nritya', type: 'Cultural' as const },
    { name: 'Entrepreneurship Workshop', type: 'Academic' as const },
    { name: 'Annual Sports Day', type: 'Sports' as const },
    { name: 'Music Concert - Swaranjali', type: 'Cultural' as const },
    { name: 'Book Fair', type: 'Academic' as const },
    { name: 'Street Play Competition', type: 'Cultural' as const },
    { name: 'Career Counseling Session', type: 'Academic' as const },
    { name: 'Yoga & Wellness Week', type: 'Sports' as const },
];

function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

const rand = seededRandom(42);

function pick<T>(arr: T[]): T {
    return arr[Math.floor(rand() * arr.length)];
}

function weightedPick(items: string[], weights: number[]): string {
    const r = rand();
    let cumulative = 0;
    for (let i = 0; i < items.length; i++) {
        cumulative += weights[i];
        if (r <= cumulative) return items[i];
    }
    return items[items.length - 1];
}

function pickN<T>(arr: T[], min: number, max: number): T[] {
    const count = min + Math.floor(rand() * (max - min + 1));
    const shuffled = [...arr].sort(() => rand() - 0.5);
    return shuffled.slice(0, count);
}

/** Map enrollment cohort to current semester (1–8) for display/filtering. */
function semesterForEnrollment(enrollmentYear: number): number {
    const yearInProgram = Math.min(4, Math.max(1, 2025 - enrollmentYear));
    const base = (yearInProgram - 1) * 2 + 1;
    return Math.min(8, base + (rand() < 0.5 ? 0 : 1));
}

function generateStudents(): Student[] {
    const allStudents: Student[] = [];
    let id = 1;
    const departmentIds = Object.keys(departmentTargets);

    for (const deptId of departmentIds) {
        const target = departmentTargets[deptId];
        const deptMeta = departments.find((d) => d.id === deptId);
        const programs = deptMeta?.programs ?? [];
        const coursePool = instituteCourses[deptId] || [];

        for (let i = 0; i < target; i++) {
            const firstName = pick(firstNames);
            const lastName = pick(lastNames);
            const enrollmentYear = 2021 + Math.floor(rand() * 4);
            const yearInProgram = 2025 - enrollmentYear;

            const cgpaBase = 5.0 + rand() * 2.5 + rand() * 2.5;
            const cgpa = Math.round(Math.min(10, Math.max(4.0, cgpaBase)) * 100) / 100;

            const numActivities = Math.floor(rand() * 8);
            const activities = pickN(activityNames, 0, Math.min(numActivities, 7)).map((a) => ({
                name: a.name,
                type: a.type,
                date: `${2023 + Math.floor(rand() * 3)}-${String(1 + Math.floor(rand() * 12)).padStart(2, '0')}-${String(1 + Math.floor(rand() * 28)).padStart(2, '0')}`,
            }));

            const dropChance = yearInProgram >= 3 ? 0.08 : yearInProgram >= 2 ? 0.05 : 0.03;

            const gender = rand() < 0.44 ? 'Male' : rand() < 0.93 ? 'Female' : 'Other';

            const prog = programs.length ? pick(programs) : { name: 'Program', code: '—' };
            const programLabel = `${prog.name} [${prog.code}]`;
            const semester = semesterForEnrollment(enrollmentYear);

            allStudents.push({
                id: `STU${String(id).padStart(5, '0')}`,
                name: `${firstName} ${lastName}`,
                age: 17 + yearInProgram + Math.floor(rand() * 3),
                gender,
                religion: weightedPick(religions, religionWeights),
                department: deptId,
                programCode: prog.code,
                program: programLabel,
                semester,
                enrollmentYear,
                cgpa,
                eventsAttended: activities.length,
                coursesEnrolled: pickN(coursePool, 2, 5),
                dropYear: rand() < dropChance ? enrollmentYear + 1 + Math.floor(rand() * 2) : null,
                activities,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${String(id).padStart(3, '0')}@cu.edu.in`,
                phone: `+91 ${Math.floor(7000000000 + rand() * 3000000000)}`,
                educationalBackground: weightedPick(educationalBackgrounds, bgWeights),
            });
            id++;
        }
    }
    return allStudents;
}

/** Deterministic seed data (used before localStorage overlay). */
export function getInitialStudents(): Student[] {
    return generateStudents();
}

export const students = generateStudents();

export function filterStudentsByDepartment(all: Student[], deptId: string): Student[] {
    return all.filter((s) => s.department === deptId);
}

export function filterStudentsByProgram(all: Student[], deptId: string, programCode: string): Student[] {
    return all.filter(
        (s) =>
            s.department === deptId &&
            s.programCode.toLowerCase() === programCode.toLowerCase()
    );
}

/** @deprecated use filterStudentsByDepartment with list from context */
export const getStudentsByDepartment = (deptId: string) =>
    students.filter((s) => s.department === deptId);

/** @deprecated use filterStudentsByProgram with list from context */
export const getStudentsByProgram = (deptId: string, programCode: string) =>
    filterStudentsByProgram(students, deptId, programCode);

export const getStudentById = (id: string) => students.find((s) => s.id === id);

export const totalEnrolled = students.filter((s) => s.dropYear === null).length;
export const totalStudents = students.length;
