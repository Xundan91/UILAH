import { PlacementRecord } from './types';

const companies = [
    // Big 4 & Consulting
    'Deloitte', 'KPMG', 'Ernst & Young', 'PwC', 'Accenture', 'McKinsey', 'BCG',
    // IT/Tech
    'TCS', 'Infosys', 'Wipro', 'HCL', 'Cognizant', 'Capgemini', 'Tech Mahindra', 'LTIMindtree',
    'Amazon', 'Google', 'Microsoft', 'IBM', 'Adobe',
    // EdTech & Media
    'BYJU\'S', 'Unacademy', 'Vedantu', 'upGrad', 'Coursera India',
    'Times Group', 'HT Media', 'Zee Media', 'NDTV', 'India Today Group',
    'Network 18', 'Republic Media', 'The Hindu Group',
    // Banking & Finance
    'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'SBI', 'Kotak Mahindra', 'Yes Bank',
    'Bajaj Finance', 'IDFC First', 'RBI (Grade B)',
    // NGO & Social
    'Teach For India', 'UNICEF', 'World Bank', 'UNDP', 'Oxfam', 'CARE India',
    'Pratham', 'Ashoka Foundation', 'Azim Premji Foundation',
    // Government & PSU
    'UPSC (IAS/IFS)', 'SSC CGL', 'State PCS', 'NABARD', 'RBI', 'SEBI',
    // Startups & Others
    'Zomato', 'Swiggy', 'Flipkart', 'Paytm', 'PhonePe', 'OYO', 'Nykaa',
    'Urban Company', 'CRED', 'Razorpay',
];

const roles = [
    'Content Analyst', 'Research Associate', 'HR Associate', 'Policy Analyst',
    'Consultant', 'Corporate Trainer', 'Social Media Manager', 'Copywriter',
    'Data Analyst', 'Program Coordinator', 'Academic Coordinator', 'Journalist',
    'UX Researcher', 'Community Manager', 'Public Relations Associate',
    'Teaching Assistant', 'Editorial Associate', 'Market Research Analyst',
    'Brand Strategist', 'Communications Manager', 'Business Development Executive',
    'Content Writer', 'Digital Marketing Specialist', 'Event Manager',
    'Project Associate', 'Operations Analyst', 'Client Servicing Executive',
    'Trainee Probationary Officer', 'Management Trainee', 'Research Fellow',
];

const valueAddCourses = [
    'Advanced Excel & Data Visualization',
    'Business Communication',
    'Digital Marketing Fundamentals',
    'Foreign Language Certification (French/German)',
    'Research Methodology Workshop',
    'Public Speaking & Debate',
    'Project Management Basics',
    'Design Thinking Workshop',
    'Data Analytics using Python',
    'Content Strategy & SEO',
    'Financial Literacy Program',
    'Corporate Etiquette & Grooming',
    'IELTS/TOEFL Preparation',
    'Aptitude & Reasoning Mastery',
    'Personality Development',
];

const departmentIds = ['english', 'psychology', 'economics', 'political-science', 'sociology', 'language-studies', 'performing-arts', 'fine-arts', 'humanities', 'film-media', 'emerging-tech'];

// Placement rate varies by department — more employable depts get more placements
const deptPlacementWeight: Record<string, number> = {
    'english': 1.0, 'psychology': 1.1, 'economics': 1.3, 'political-science': 0.9,
    'sociology': 0.8, 'language-studies': 0.7, 'performing-arts': 0.6,
    'fine-arts': 0.65, 'humanities': 0.7, 'film-media': 0.75, 'emerging-tech': 1.4,
};

function seededRandom(seed: number): () => number {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

const rand = seededRandom(99);
function pick<T>(arr: T[]): T { return arr[Math.floor(rand() * arr.length)]; }
function pickN<T>(arr: T[], min: number, max: number): T[] {
    const count = min + Math.floor(rand() * (max - min + 1));
    return [...arr].sort(() => rand() - 0.5).slice(0, count);
}

const firstNames = [
    'Aarav', 'Priya', 'Rohan', 'Sneha', 'Vikram', 'Ananya', 'Arjun', 'Meera', 'Karan', 'Ishita',
    'Dev', 'Nisha', 'Rahul', 'Pooja', 'Aditya', 'Kavya', 'Siddharth', 'Riya', 'Manish', 'Divya',
    'Kunal', 'Swati', 'Prakash', 'Richa', 'Vivek', 'Ankita', 'Ashish', 'Sweta', 'Yash', 'Kratika',
    'Abhishek', 'Prachi', 'Tarun', 'Nikita', 'Rishabh', 'Kanika', 'Sourav', 'Garima', 'Mayank', 'Disha',
    'Ankit', 'Shivani', 'Lalit', 'Nandini', 'Shubham', 'Vidhi', 'Himanshu', 'Kritika', 'Chirag', 'Bhumi',
];
const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Mehta', 'Joshi', 'Chauhan', 'Reddy',
    'Nair', 'Iyer', 'Kapoor', 'Malhotra', 'Bhatia', 'Saxena', 'Agarwal', 'Rao', 'Das', 'Mishra',
    'Pandey', 'Tiwari', 'Dubey', 'Yadav', 'Thakur', 'Chaudhary', 'Arora', 'Khanna', 'Grover', 'Kaur',
];

function generatePlacements(): PlacementRecord[] {
    const records: PlacementRecord[] = [];
    let id = 1;

    for (const deptId of departmentIds) {
        const weight = deptPlacementWeight[deptId] || 1.0;
        for (let year = 2022; year <= 2025; year++) {
            // Base 30-55 per dept per year, weighted by employability
            const count = Math.round((30 + rand() * 25) * weight);
            for (let i = 0; i < count; i++) {
                const fn = pick(firstNames);
                const ln = pick(lastNames);
                const isAlumni = year <= 2023;

                // Package: 3-25 LPA, with most between 3-8
                const pkgBase = 3 + rand() * 5 + (rand() > 0.7 ? rand() * 12 : 0);
                const pkg = Math.round(pkgBase * 100) / 100;

                records.push({
                    id: `PLC${String(id).padStart(5, '0')}`,
                    studentId: `STU${String(Math.floor(rand() * 6175) + 1).padStart(5, '0')}`,
                    studentName: `${fn} ${ln}`,
                    department: deptId,
                    year,
                    company: pick(companies),
                    role: pick(roles),
                    package: pkg,
                    crcRegistered: rand() > 0.25, // 75% CRC registered
                    email: `${fn.toLowerCase()}.${ln.toLowerCase()}${String(id).padStart(3, '0')}@cu.edu.in`,
                    phone: `+91 ${Math.floor(7000000000 + rand() * 3000000000)}`,
                    isAlumni,
                    graduationYear: isAlumni ? year : undefined,
                    valueAddCourses: isAlumni ? pickN(valueAddCourses, 1, 4) : undefined,
                });
                id++;
            }
        }
    }
    return records;
}

export const placements = generatePlacements();

export const getPlacementsByDepartment = (deptId: string) =>
    placements.filter((p) => p.department === deptId);

export const crcRegistered = placements.filter((p) => p.crcRegistered);
export const crcNotRegistered = placements.filter((p) => !p.crcRegistered);
export const alumni = placements.filter((p) => p.isAlumni);
