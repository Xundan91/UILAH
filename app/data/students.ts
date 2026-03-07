import { Student } from './types';

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
const religionWeights = [0.55, 0.18, 0.12, 0.08, 0.04, 0.03]; // realistic Indian university distribution

const educationalBackgrounds = ['CBSE Board', 'ICSE Board', 'State Board', 'International Baccalaureate', 'NIOS'];
const bgWeights = [0.40, 0.15, 0.35, 0.06, 0.04];

// Target: ~6175 students across departments
const departmentTargets: Record<string, number> = {
    'english': 980, 'psychology': 850, 'economics': 780, 'political-science': 720,
    'sociology': 650, 'language-studies': 480, 'performing-arts': 380,
    'fine-arts': 420, 'humanities': 385, 'film-media': 280, 'emerging-tech': 250,
};

const departmentCourses: Record<string, string[]> = {
    'english': ['British Literature', 'American Literature', 'Postcolonial Studies', 'Creative Writing', 'Linguistics Foundations', 'Cultural Studies', 'World Literature', 'Modern Poetry'],
    'psychology': ['Clinical Psychology', 'Cognitive Psychology', 'Neuropsychology', 'Forensic Psychology', 'Developmental Psychology', 'Social Psychology', 'Abnormal Psychology', 'Health Psychology'],
    'economics': ['Microeconomics', 'Macroeconomics', 'Indian Economy', 'Research Methodology', 'Development Economics', 'Econometrics', 'International Trade', 'Public Finance'],
    'political-science': ['International Relations', 'Diplomacy', 'Comparative Politics', 'Political Theory', 'Public Policy', 'Indian Government', 'Constitutional Law', 'Political Sociology'],
    'sociology': ['Social Structures', 'Gender Studies', 'Urban Sociology', 'Rural Sociology', 'Research Methods', 'Social Movements', 'Family & Marriage', 'Environmental Sociology'],
    'language-studies': ['French I', 'French II', 'German I', 'German II', 'Spanish I', 'Spanish II', 'Linguistics', 'Translation Studies', 'Comparative Philology', 'Hindi Literature'],
    'performing-arts': ['Theatre Production', 'Acting Techniques', 'Dance Forms', 'Music Theory', 'Creative Expression', 'Stage Design', 'Western Music', 'Indian Classical'],
    'fine-arts': ['Visual Arts', 'Sculpture', 'Digital Art', 'Art History', 'Media Studies', 'Design Thinking', 'Photography', 'Graphic Design'],
    'humanities': ['World History', 'Indian History', 'Philosophy', 'Geography', 'Ethics', 'Cultural Heritage', 'Archaeology', 'Religious Studies'],
    'film-media': ['Film Studies', 'Screenwriting', 'Film Theory', 'Digital Media', 'Documentary Making', 'Media Ethics', 'Cinematography', 'Sound Design'],
    'emerging-tech': ['AI for Social Sciences', 'Data Analytics', 'Digital Humanities', 'Machine Learning Basics', 'Tech Ethics', 'Computational Linguistics', 'NLP Fundamentals', 'Data Visualization'],
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
    { name: 'Inter-Department Quiz', type: 'Academic' as const },
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

function generateStudents(): Student[] {
    const allStudents: Student[] = [];
    let id = 1;
    const departmentIds = Object.keys(departmentTargets);

    for (const deptId of departmentIds) {
        const target = departmentTargets[deptId];
        for (let i = 0; i < target; i++) {
            const firstName = pick(firstNames);
            const lastName = pick(lastNames);
            const enrollmentYear = 2021 + Math.floor(rand() * 4); // 2021-2024
            const yearInProgram = 2025 - enrollmentYear;

            // CGPA distribution: bell curve centered around 7.2
            const cgpaBase = 5.0 + rand() * 2.5 + rand() * 2.5; // roughly normal, mean ~7.5
            const cgpa = Math.round(Math.min(10, Math.max(4.0, cgpaBase)) * 100) / 100;

            const numActivities = Math.floor(rand() * 8); // 0-7 activities
            const activities = pickN(activityNames, 0, Math.min(numActivities, 7)).map((a) => ({
                name: a.name,
                type: a.type,
                date: `${2023 + Math.floor(rand() * 3)}-${String(1 + Math.floor(rand() * 12)).padStart(2, '0')}-${String(1 + Math.floor(rand() * 28)).padStart(2, '0')}`,
            }));

            // Drop rate: ~8% for older students, ~3% for newer
            const dropChance = yearInProgram >= 3 ? 0.08 : yearInProgram >= 2 ? 0.05 : 0.03;

            const gender = rand() < 0.44 ? 'Male' : rand() < 0.93 ? 'Female' : 'Other';

            allStudents.push({
                id: `STU${String(id).padStart(5, '0')}`,
                name: `${firstName} ${lastName}`,
                age: 17 + yearInProgram + Math.floor(rand() * 3),
                gender,
                religion: weightedPick(religions, religionWeights),
                department: deptId,
                program: `B.A. ${deptId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
                enrollmentYear,
                cgpa,
                eventsAttended: activities.length,
                coursesEnrolled: pickN(departmentCourses[deptId] || [], 2, 5),
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

export const students = generateStudents();

export const getStudentsByDepartment = (deptId: string) =>
    students.filter((s) => s.department === deptId);

export const getStudentById = (id: string) =>
    students.find((s) => s.id === id);

export const totalEnrolled = students.filter((s) => s.dropYear === null).length;
export const totalStudents = students.length;
