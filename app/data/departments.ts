import { Department } from './types';

/** Six university institutes and their degree programs (code as per curriculum). */
export const departments: Department[] = [
    {
        id: 'uia',
        shortName: 'UIA',
        name: 'University Institute of Architecture (UIA)',
        description: 'Architecture — B.Arch and M.Arch programs.',
        icon: '🏛️',
        programs: [
            { name: 'BArch', code: 'AR201' },
            { name: 'M.Arch.', code: 'AR301' },
        ],
        studentCount: 457,
        facultyCount: 10,
    },
    {
        id: 'uid',
        shortName: 'UID',
        name: 'University Institute of Design (UID)',
        description: 'Design — product, industrial, fashion, MFA, BFA.',
        icon: '🎨',
        programs: [
            { name: 'Bachelor of Design (Product and Industrial Design)', code: 'BD205' },
            { name: 'Bachelor of Design (Fashion)', code: 'BD203' },
            { name: 'MFA', code: 'MR302' },
            { name: 'BFA', code: 'BS204' },
        ],
        studentCount: 915,
        facultyCount: 26,
    },
    {
        id: 'uifva',
        shortName: 'UIFVA',
        name: 'University Institute of Film & Visual Arts (UIFVA)',
        description: 'Film, animation, VFX, gaming, and digital film making.',
        icon: '🎬',
        programs: [
            { name: 'B.Sc. (Hons./Hons. with Research) (Digital Film Making)', code: 'AN205' },
            { name: 'M.Sc (A & MT)', code: 'AN301' },
            { name: 'B.Sc. (Animation, VFX & Gaming) (ITP)', code: 'AN801' },
            { name: 'B.Sc. (Animation, VFX & Gaming)', code: 'AN203' },
        ],
        studentCount: 915,
        facultyCount: 26,
    },
    {
        id: 'uilah',
        shortName: 'UILAH',
        name: 'University Institute of Liberal Arts & Humanities (UILAH)',
        description: 'Liberal arts, psychology, social work, and related disciplines.',
        icon: '📚',
        programs: [
            { name: 'B.A. Psy', code: 'BA203' },
            { name: 'B.A. (Hons) Liberal Arts', code: 'LA202' },
            { name: 'M.A. (Psychology)', code: 'MA303' },
            { name: 'M.A. (Clinical Psychology)', code: 'HY302' },
            { name: 'M.A. (Politics and International Relations)', code: 'MA306' },
            { name: 'M.A. (English)', code: 'MA302' },
            { name: 'B.A. (Hons./Hons. with Research) (Social Work)', code: 'BA202' },
            { name: 'B.A. (Hons) Liberal Arts - ITP', code: 'LA801' },
            { name: 'B.A. Psychology (Hons.) - ITP', code: 'BA801' },
        ],
        studentCount: 2058,
        facultyCount: 72,
    },
    {
        id: 'uims',
        shortName: 'UIMS',
        name: 'University Institute of Media Studies (UIMS)',
        description: 'Journalism, mass communication, and media.',
        icon: '📰',
        programs: [
            { name: 'B.A. JMC', code: 'BJ201' },
            { name: 'M.A. - JMC', code: 'MJ301' },
            { name: 'B.A. JMC - ITP', code: 'BJ801' },
        ],
        studentCount: 686,
        facultyCount: 18,
    },
    {
        id: 'uittr',
        shortName: 'UITTR',
        name: 'University Institute of Teacher Training & Research (UITTR)',
        description: 'Education, physical education, yoga, and integrated teacher programs.',
        icon: '🎓',
        programs: [
            { name: 'P.G DIP(Yoga Education)', code: 'EY301' },
            { name: 'B.P.Ed', code: 'BE201' },
            { name: 'B.A.', code: 'BA301' },
            { name: 'B.Sc. + B.Ed.', code: 'BS502' },
            { name: 'B.A.+ B.Ed.', code: 'BA501' },
        ],
        studentCount: 1144,
        facultyCount: 28,
    },
];

export const totalProgramOfferings = departments.reduce((n, d) => n + d.programs.length, 0);

export const getDepartmentById = (id: string) =>
    departments.find((d) => d.id === id);

/** URL segment for program routes — lowercase code (e.g. ar201). */
export function programCodeToSlug(code: string): string {
    return code.toLowerCase();
}

export function getProgramByDeptAndSlug(deptId: string, codeSlug: string) {
    const dept = getDepartmentById(deptId);
    if (!dept) return null;
    const program = dept.programs.find((p) => p.code.toLowerCase() === codeSlug.toLowerCase());
    if (!program) return null;
    return { dept, program };
}
