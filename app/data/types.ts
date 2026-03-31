export interface Student {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  religion: string;
  department: string;
  /** Curriculum code, e.g. AR201 */
  programCode: string;
  program: string;
  /** Current semester (1–8) */
  semester: number;
  enrollmentYear: number;
  cgpa: number;
  eventsAttended: number;
  coursesEnrolled: string[];
  dropYear: number | null;
  activities: Activity[];
  email: string;
  phone: string;
  educationalBackground: string;
}

export interface Activity {
  name: string;
  type: 'Cultural' | 'Academic' | 'Sports' | 'Social' | 'Technical';
  date: string;
}

export interface ProgramOffering {
  name: string;
  code: string;
}

export interface Department {
  id: string;
  shortName: string;
  name: string;
  description: string;
  icon: string;
  programs: ProgramOffering[];
  studentCount: number;
  facultyCount: number;
}

export interface Faculty {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  religion: string;
  department: string;
  designation: string;
  education: 'PhD' | 'Pursuing PhD' | 'Non-PhD';
  educationDetails: string;
  specialization: string[];
  coursesTeaching: string[];
  publications: PublicationProfile;
  achievements: string[];
  facultyDevelopment: string[];
}

export interface PublicationProfile {
  scopusArticles: number;
  conferences: ConferenceEntry[];
  books: BookEntry[];
  patents: PatentEntry[];
  articles: ArticleEntry[];
}

export function emptyPublicationProfile(): PublicationProfile {
  return {
    scopusArticles: 0,
    conferences: [],
    books: [],
    patents: [],
    articles: [],
  };
}

export interface ConferenceEntry {
  title: string;
  conference: string;
  year: number;
}

export interface BookEntry {
  title: string;
  publisher: string;
  year: number;
  isbn?: string;
}

export interface PatentEntry {
  title: string;
  patentNumber: string;
  year: number;
  status: 'Granted' | 'Filed' | 'Published';
}

export interface ArticleEntry {
  title: string;
  journal: string;
  year: number;
  impactFactor?: number;
}

export interface PlacementRecord {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  year: number;
  company: string;
  role: string;
  package: number;
  crcRegistered: boolean;
  email: string;
  phone: string;
  isAlumni: boolean;
  graduationYear?: number;
  valueAddCourses?: string[];
}

export interface Room {
  id: string;
  building: 'A2' | 'A3';
  floor: number;
  roomNumber: string;
  type: 'Classroom' | 'Lab' | 'Tutorial Room' | 'Library' | 'Seminar Hall';
  capacity: number;
  utilizationPercent: number;
  monthlyUtilization: { month: string; percent: number }[];
  equipment?: string[];
}

export interface InfraStats {
  totalClassrooms: number;
  totalLabs: number;
  totalTutorialRooms: number;
  totalLibraries: number;
  totalCapacity: number;
  avgUtilization: number;
  computerSystems: number;
}
