import { Faculty } from './types';

// ────────── Seed helpers ──────────
function seededRandom(seed: number): () => number {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
const rand = seededRandom(2025);
function pick<T>(arr: T[]): T { return arr[Math.floor(rand() * arr.length)]; }
function pickN<T>(arr: T[], min: number, max: number): T[] {
    const n = min + Math.floor(rand() * (max - min + 1));
    return [...arr].sort(() => rand() - 0.5).slice(0, n);
}

// ────────── Name pools ──────────
const maleNames = [
    'Dr. Anil Sharma', 'Dr. Rajesh Kumar', 'Dr. Vikram Singh', 'Dr. Suresh Mehta', 'Dr. Pradeep Saxena',
    'Dr. Sameer Khan', 'Dr. Manoj Tiwari', 'Dr. Ramesh Bhat', 'Dr. Sanjay Mishra', 'Dr. Arjun Nair',
    'Mr. Rajiv Menon', 'Mr. George Thomas', 'Mr. Harish Patel', 'Mr. Deepak Chauhan', 'Mr. Naveen Joshi',
    'Dr. Vijay Reddy', 'Dr. Ashok Pandey', 'Dr. Rakesh Verma', 'Dr. Nitin Agarwal', 'Dr. Rahul Das',
    'Dr. Sandeep Rao', 'Dr. Ajay Gupta', 'Dr. Mohit Kapoor', 'Dr. Puneet Malhotra', 'Dr. Gaurav Bhatia',
    'Dr. Tarun Chopra', 'Mr. Lalit Bansal', 'Mr. Sumit Goyal', 'Dr. Vivek Dubey', 'Dr. Pankaj Yadav',
    'Dr. Himanshu Thakur', 'Mr. Chirag Sethi', 'Dr. Rohit Chaudhary', 'Mr. Ankit Grover', 'Dr. Karan Ahuja',
];
const femaleNames = [
    'Dr. Anita Desai', 'Dr. Meenakshi Iyer', 'Dr. Jasmine Kaur', 'Dr. Lakshmi Narayanan', 'Dr. Marie Dupont',
    'Dr. Nandini Sharma', 'Ms. Zoya Akhtar', 'Ms. Fatima Zaidi', 'Dr. Priya Nair', 'Dr. Sunita Singh',
    'Dr. Kavita Rao', 'Dr. Pallavi Joshi', 'Ms. Riya Mehta', 'Dr. Neha Gupta', 'Dr. Anjali Mishra',
    'Dr. Pooja Verma', 'Dr. Deepika Patel', 'Ms. Shruti Kapoor', 'Dr. Tanya Malhotra', 'Dr. Swati Das',
    'Dr. Ritika Agarwal', 'Ms. Kritika Saxena', 'Dr. Garima Reddy', 'Ms. Bhumi Chauhan', 'Dr. Vandana Kumar',
    'Dr. Payal Tiwari', 'Ms. Mansi Pandey', 'Dr. Shikha Dubey', 'Ms. Kirti Yadav', 'Dr. Roshni Thakur',
    'Dr. Urvi Chaudhary', 'Ms. Vidhi Bansal', 'Dr. Disha Goyal', 'Ms. Muskan Sethi', 'Dr. Kajal Grover',
];

const designations = ['Professor & HOD', 'Professor', 'Associate Professor', 'Assistant Professor', 'Assistant Professor'];
const educationLevels: Array<'PhD' | 'Pursuing PhD' | 'Non-PhD'> = ['PhD', 'PhD', 'PhD', 'Pursuing PhD', 'Non-PhD'];
const religionsList = ['Hindu', 'Muslim', 'Sikh', 'Christian', 'Buddhist', 'Jain'];
const religionWeights = [0.55, 0.18, 0.12, 0.08, 0.04, 0.03];

const universities = [
    'JNU', 'Delhi University', 'BHU', 'Panjab University', 'AMU', 'TISS Mumbai', 'IIT Bombay',
    'IIT Delhi', 'NIMHANS', 'Jawaharlal Nehru University', 'Calcutta University', 'Mumbai University',
    'Kerala University', 'Hyderabad University', 'Sorbonne University', 'Oxford', 'Cambridge',
    'NSD Delhi', 'FTII Pune', 'MSU Baroda', 'Chandigarh University', 'Jamia Millia Islamia',
];

const journals = [
    'Journal of Commonwealth Literature', 'South Asian Review', 'Indian Journal of Psychiatry',
    'Economic & Political Weekly', 'Journal of Development Studies', 'International Affairs',
    'Applied Linguistics', 'Visual Studies', 'History and Theory', 'AI & Society',
    'Indian Journal of Public Administration', 'Contributions to Indian Sociology',
    'Asian Journal of Psychology', 'Textual Practice', 'Journal of South Asian Studies',
    'Modern Asian Studies', 'Contemporary South Asia', 'Indian Economic Review',
    'Psychology, Crime & Law', 'Digital Scholarship in the Humanities',
];

const conferences = [
    'IACLALS International Conference', 'ICP World Congress', 'IPSA World Congress',
    'ISA World Congress', 'ACL', 'AAAI', 'APSA Annual Meeting', 'TESOL India',
    'CIHA World Congress', 'AILA World Congress', 'WCHS Conference', 'NAOP Annual Meet',
    'TIES Annual Conference', 'IUAES Conference', 'CLAI National Conference',
    'MIFF Mumbai', 'International Economics Association', 'IAAP Conference',
];

const publishers = [
    'Oxford University Press', 'Cambridge University Press', 'Sage Publications',
    'Routledge', 'PHI Learning', 'Penguin Academic', 'Springer',
    'Aleph Book Company', 'Primus Books', 'Roli Books', 'Harper Collins India',
    'Bloomsbury India', 'Taylor & Francis',
];

const achievements = [
    'UGC Fellowship', 'Best Researcher Award', 'Young Researcher Award',
    'ICSSR Research Grant', 'Fulbright Fellowship', 'ICCR Distinguished Lecturer',
    'Best Paper Award', 'ICSSR Senior Fellow', 'UGC National Fellowship',
    'Visiting Fellow, Cambridge', 'Visiting Fellow, Oxford', 'National Film Award',
    'Sangeet Natak Akademi Award Nominee', 'Lalit Kala Akademi Fellowship',
    'Google Research India Award', 'ACM India Eminent Speaker',
    'NAOP Distinguished Psychologist Award', 'ISS Best Paper Award',
    'Alliance Française Teaching Excellence Award', 'ICHR National Fellow',
    'Commonwealth Scholar', 'DST INSPIRE Faculty Award', 'Raman Fellowship',
];

const fdpActivities = [
    'Organized National Seminar', 'FDP on Research Methodology', 'Attended MOOC on Advanced Theory',
    'Established Counseling Center', 'Organized Mental Health Awareness Week',
    'Industry-Academia Partnership', 'Policy Roundtable', 'Heritage Walk Initiative',
    'Annual Theatre Festival Founder', 'Launched Digital Art Lab', 'Film Club Mentor',
    'AI Lab for Humanities', 'Inter-disciplinary Workshop Series', 'Gender Sensitization Program',
    'Community Policy Workshop', 'Student Mentorship Program', 'Curriculum Revision Committee',
    'International Exchange Program', 'Research Ethics Committee', 'E-learning Content Development',
];

// Department configs
const deptConfig: Record<string, { target: number; specializations: string[]; courses: string[] }> = {
    'english': { target: 28, specializations: ['Postcolonial Literature', 'Cultural Studies', 'Creative Writing', 'American Literature', 'British Literature', 'World Literature', 'Linguistics', 'Modern Poetry'], courses: ['British Literature', 'American Literature', 'Postcolonial Studies', 'Creative Writing', 'Linguistics Foundations', 'Cultural Studies', 'World Literature', 'Modern Poetry'] },
    'psychology': { target: 24, specializations: ['Clinical Psychology', 'Neuropsychology', 'Cognitive Psychology', 'Forensic Psychology', 'Developmental Psychology', 'Social Psychology', 'Health Psychology', 'Positive Psychology'], courses: ['Clinical Psychology', 'Cognitive Psychology', 'Neuropsychology', 'Forensic Psychology', 'Developmental Psychology', 'Social Psychology', 'Abnormal Psychology', 'Health Psychology'] },
    'economics': { target: 22, specializations: ['Indian Economy', 'Development Economics', 'Econometrics', 'International Trade', 'Public Finance', 'Macroeconomics', 'Microeconomics'], courses: ['Microeconomics', 'Macroeconomics', 'Indian Economy', 'Research Methodology', 'Development Economics', 'Econometrics', 'International Trade', 'Public Finance'] },
    'political-science': { target: 20, specializations: ['International Relations', 'Diplomacy', 'Public Policy', 'Indian Government', 'Comparative Politics', 'Political Theory'], courses: ['International Relations', 'Diplomacy', 'Comparative Politics', 'Political Theory', 'Public Policy', 'Indian Government', 'Constitutional Law'] },
    'sociology': { target: 18, specializations: ['Social Structures', 'Gender Studies', 'Urban Sociology', 'Rural Sociology', 'Social Movements', 'Environmental Sociology'], courses: ['Social Structures', 'Gender Studies', 'Urban Sociology', 'Rural Sociology', 'Research Methods', 'Social Movements'] },
    'language-studies': { target: 14, specializations: ['French Language', 'German Language', 'Spanish Language', 'Translation Studies', 'Linguistics', 'Comparative Literature'], courses: ['French I', 'German I', 'Spanish I', 'Linguistics', 'Translation Studies', 'Comparative Philology'] },
    'performing-arts': { target: 12, specializations: ['Theatre Production', 'Indian Classical Dance', 'Western Music', 'Acting', 'Stage Design', 'Creative Expression'], courses: ['Theatre Production', 'Acting Techniques', 'Dance Forms', 'Music Theory', 'Creative Expression', 'Stage Design'] },
    'fine-arts': { target: 12, specializations: ['Visual Arts', 'Art History', 'Digital Art', 'Sculpture', 'Photography', 'Graphic Design'], courses: ['Visual Arts', 'Sculpture', 'Digital Art', 'Art History', 'Media Studies', 'Design Thinking'] },
    'humanities': { target: 12, specializations: ['Indian History', 'World History', 'Philosophy', 'Geography', 'Cultural Heritage', 'Ethics'], courses: ['World History', 'Indian History', 'Philosophy', 'Geography', 'Ethics', 'Cultural Heritage'] },
    'film-media': { target: 10, specializations: ['Film Studies', 'Documentary Making', 'Screenwriting', 'Digital Media', 'Cinematography', 'Media Ethics'], courses: ['Film Studies', 'Screenwriting', 'Film Theory', 'Digital Media', 'Documentary Making', 'Media Ethics'] },
    'emerging-tech': { target: 8, specializations: ['AI for Social Sciences', 'Computational Linguistics', 'Data Analytics', 'NLP', 'Digital Humanities', 'Machine Learning'], courses: ['AI for Social Sciences', 'Data Analytics', 'Digital Humanities', 'Machine Learning Basics', 'Tech Ethics', 'Computational Linguistics'] },
};

function weightedPickRel(): string {
    const r = rand();
    let cum = 0;
    for (let i = 0; i < religionsList.length; i++) {
        cum += religionWeights[i];
        if (r <= cum) return religionsList[i];
    }
    return religionsList[0];
}

function generateFaculty(): Faculty[] {
    const allFaculty: Faculty[] = [];
    let id = 1;
    const deptIds = Object.keys(deptConfig);

    for (const deptId of deptIds) {
        const config = deptConfig[deptId];
        for (let i = 0; i < config.target; i++) {
            const isFemale = rand() < 0.45;
            const name = isFemale ? pick(femaleNames) : pick(maleNames);
            const education = i === 0 ? 'PhD' as const : pick(educationLevels);
            const designation = i === 0 ? 'Professor & HOD' : pick(designations);
            const age = education === 'PhD' ? 35 + Math.floor(rand() * 25) : education === 'Pursuing PhD' ? 28 + Math.floor(rand() * 12) : 25 + Math.floor(rand() * 15);
            const scopus = education === 'PhD' ? 5 + Math.floor(rand() * 30) : education === 'Pursuing PhD' ? 1 + Math.floor(rand() * 8) : Math.floor(rand() * 4);

            const numConferences = Math.floor(rand() * 4);
            const numBooks = education === 'PhD' ? Math.floor(rand() * 3) : 0;
            const numPatents = rand() > 0.85 ? 1 + Math.floor(rand() * 2) : 0;
            const numArticles = 1 + Math.floor(rand() * 4);

            allFaculty.push({
                id: `FAC${String(id).padStart(4, '0')}`,
                name,
                gender: isFemale ? 'Female' : 'Male',
                age,
                religion: weightedPickRel(),
                department: deptId,
                designation,
                education,
                educationDetails: `${education === 'PhD' ? 'PhD' : education === 'Pursuing PhD' ? 'Pursuing PhD' : 'M.A.'} in ${pick(config.specializations)}, ${pick(universities)}, ${2000 + Math.floor(rand() * 24)}`,
                specialization: pickN(config.specializations, 2, 3),
                coursesTeaching: pickN(config.courses, 2, 4),
                publications: {
                    scopusArticles: scopus,
                    conferences: Array.from({ length: numConferences }, () => ({
                        title: `${pick(['Study of', 'Analysis of', 'Impact of', 'Perspectives on', 'Research in', 'Advances in'])} ${pick(config.specializations)}`,
                        conference: pick(conferences),
                        year: 2020 + Math.floor(rand() * 6),
                    })),
                    books: Array.from({ length: numBooks }, () => ({
                        title: `${pick(['A Study of', 'Understanding', 'Introduction to', 'Perspectives on', 'Modern'])} ${pick(config.specializations)}`,
                        publisher: pick(publishers),
                        year: 2016 + Math.floor(rand() * 10),
                        isbn: rand() > 0.3 ? `978-${Math.floor(rand() * 90 + 10)}-${Math.floor(rand() * 9000 + 1000)}-${Math.floor(rand() * 900 + 100)}-${Math.floor(rand() * 9)}` : undefined,
                    })),
                    patents: Array.from({ length: numPatents }, () => ({
                        title: `${pick(['System for', 'Method of', 'Tool for', 'Platform for'])} ${pick(config.specializations)} ${pick(['Analysis', 'Assessment', 'Automation', 'Detection'])}`,
                        patentNumber: `IN2023${String(Math.floor(rand() * 100000000)).padStart(8, '0')}`,
                        year: 2020 + Math.floor(rand() * 6),
                        status: pick(['Granted', 'Filed', 'Published']) as 'Granted' | 'Filed' | 'Published',
                    })),
                    articles: Array.from({ length: numArticles }, () => ({
                        title: `${pick(['Examining', 'Revisiting', 'Exploring', 'Analyzing', 'New Perspectives on'])} ${pick(config.specializations)} in ${pick(['Indian Context', 'South Asia', 'Contemporary Society', 'Modern Era', 'Digital Age'])}`,
                        journal: pick(journals),
                        year: 2020 + Math.floor(rand() * 6),
                        impactFactor: Math.round((0.3 + rand() * 4) * 10) / 10,
                    })),
                },
                achievements: rand() > 0.4 ? pickN(achievements, 1, 3) : [],
                facultyDevelopment: pickN(fdpActivities, 1, 3),
            });
            id++;
        }
    }
    return allFaculty;
}

export const faculty = generateFaculty();

export const getFacultyByDepartment = (deptId: string) =>
    faculty.filter((f) => f.department === deptId);

export const getFacultyById = (id: string) =>
    faculty.find((f) => f.id === id);

export const totalFaculty = faculty.length;
