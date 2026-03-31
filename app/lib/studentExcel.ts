import * as XLSX from "xlsx";
import { departments } from "../data/departments";
import type { Activity, Student } from "../data/types";

/** Payload for POST /api/students/import/multi (one row per student; institute + program vary per row). */
/** Returned by POST /api/students/import/multi for each row successfully inserted. */
export type MultiImportCreatedStudent = {
    id: string;
    name: string;
    instituteId: string;
    programCode: string;
};

export type StudentMultiImportRow = {
    instituteId: string;
    programCode: string;
    name: string;
    age?: number;
    gender?: string;
    religion?: string;
    semester?: number;
    enrollmentYear?: number;
    cgpa?: number;
    eventsAttended?: number;
    coursesEnrolled?: string[];
    dropYear?: number | string | null;
    activities?: Activity[];
    email?: string;
    phone?: string;
    educationalBackground?: string;
};

/** UTF-8 CSV suitable as an Excel import template (.csv opened in Excel or saved as .xlsx). */
export const MULTI_STUDENT_IMPORT_TEMPLATE_CSV = [
    "InstituteId,ProgramCode,Name,Age,Gender,Religion,Semester,EnrollmentYear,CGPA,EventsAttended,Courses,DropYear,Email,Phone,EducationalBackground",
    "uilah,BA203,Priya Sharma,20,Female,Hindu,3,2023,7.5,0,Core Course,,priya@example.com,+919800000001,CBSE Board",
    "uims,BJ201,Rohan Verma,19,Male,Sikh,2,2024,6.8,1,\"Core Course; Elective A\",,rohan@example.com,+919800000002,State Board",
    "uia,AR201,Ananya Mehta,21,Female,Hindu,5,2022,8.2,2,Core Course,,ananya@example.com,+919800000003,ISC",
].join("\n");

function normKey(k: string): string {
    return String(k).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getCell(row: Record<string, unknown>, ...aliases: string[]): string {
    const map = new Map<string, string>();
    for (const k of Object.keys(row)) {
        map.set(normKey(k), String(row[k] ?? "").trim());
    }
    for (const a of aliases) {
        const v = map.get(normKey(a));
        if (v !== undefined && v !== "") return v;
    }
    return "";
}

/**
 * Excel often truncates visible headers (e.g. "ProgramCc", "EventsAtte"). Prefer exact aliases,
 * then first column whose normalized header starts with `keyPrefix` (e.g. "program" matches programcode & programcc).
 */
function getCellWithPrefix(row: Record<string, unknown>, keyPrefix: string, ...aliases: string[]): string {
    const direct = getCell(row, ...aliases);
    if (direct) return direct;
    const p = normKey(keyPrefix);
    for (const k of Object.keys(row)) {
        if (normKey(k).startsWith(p)) {
            const val = String(row[k] ?? "").trim();
            if (val) return val;
        }
    }
    return "";
}

function parseGender(s: string): "Male" | "Female" | "Other" {
    const x = s.toLowerCase();
    if (x.startsWith("f")) return "Female";
    if (x.startsWith("o") || x === "non-binary") return "Other";
    return "Male";
}

export async function parseStudentExcel(
    file: File,
    deptId: string,
    programCode: string,
    programDisplay: string
): Promise<{ students: Omit<Student, "id">[]; errors: string[] }> {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

    const out: Omit<Student, "id">[] = [];
    const errors: string[] = [];

    rows.forEach((row, idx) => {
        const line = idx + 2;
        const name = getCell(row, "name", "student name", "full name", "student");
        if (!name) {
            errors.push(`Row ${line}: missing Name`);
            return;
        }

        const age = Math.min(35, Math.max(16, parseInt(getCell(row, "age"), 10) || 20));
        const gender = parseGender(getCell(row, "gender", "sex"));
        const religion = getCell(row, "religion") || "Hindu";
        const enrollmentYear = Math.min(
            2025,
            Math.max(
                2018,
                parseInt(
                    getCell(row, "enrollmentyear", "enrollment year", "enrollment", "admission year", "year"),
                    10
                ) || 2023
            )
        );
        const semester = Math.min(8, Math.max(1, parseInt(getCell(row, "semester", "sem"), 10) || 3));
        const cgpa = Math.min(10, Math.max(0, parseFloat(getCell(row, "cgpa", "gpa")) || 7));
        const email =
            getCell(row, "email", "e-mail") || `import.row${line}.${Date.now()}@cu.edu.in`;
        const phone = getCell(row, "phone", "mobile", "contact") || "+91 0000000000";
        const educationalBackground =
            getCellWithPrefix(
                row,
                "educat",
                "educationalbackground",
                "background",
                "board",
                "school board"
            ) || "CBSE Board";
        const coursesStr = getCell(row, "courses", "courses enrolled", "subjects");
        const coursesEnrolled = coursesStr
            ? coursesStr
                  .split(/[,;]/)
                  .map((s) => s.trim())
                  .filter(Boolean)
            : ["Core Course"];
        const dropStr = getCell(row, "dropyear", "drop year", "discontinue");
        const dropYear = dropStr ? Math.min(2026, Math.max(2018, parseInt(dropStr, 10))) : null;
        const eventsAttended = Math.max(
            0,
            parseInt(
                getCellWithPrefix(row, "events", "events", "events attended", "eventsattended", "eventsatte"),
                10
            ) || 0
        );

        const st: Omit<Student, "id"> = {
            name,
            age,
            gender,
            religion,
            department: deptId,
            programCode,
            program: programDisplay,
            semester,
            enrollmentYear,
            cgpa: Math.round(cgpa * 100) / 100,
            eventsAttended,
            coursesEnrolled,
            dropYear,
            activities: [] as Activity[],
            email,
            phone,
            educationalBackground,
        };
        out.push(st);
    });

    return { students: out, errors };
}

const KNOWN_INSTITUTE_IDS = new Set(departments.map((d) => d.id));

function normalizeInstituteId(raw: string): string {
    const s = raw.trim().toLowerCase();
    if (KNOWN_INSTITUTE_IDS.has(s)) return s;
    return s;
}

/**
 * Read institute slug (uia, uilah, …). Do not use a loose "institute" prefix — that can match
 * "Institute name" / full titles and repeat the same wrong value for every row.
 */
function getInstituteIdFromRow(row: Record<string, unknown>): string {
    const direct = getCell(
        row,
        "instituteid",
        "institute id",
        "institutecode",
        "institute code",
        "deptid",
        "departmentid",
        "department",
        "dept"
    );
    if (direct) return direct;
    for (const k of Object.keys(row)) {
        const nk = normKey(k);
        if (nk.startsWith("institute") && (nk.includes("id") || nk.includes("code"))) {
            const val = String(row[k] ?? "").trim();
            if (val) return val;
        }
    }
    return "";
}

/** Program codes in the sheet look like BA203, AR201; avoid mistaking a "Program name" column. */
function getProgramCodeFromRow(row: Record<string, unknown>): string {
    const direct = getCell(
        row,
        "programcode",
        "programc",
        "programcc",
        "program code",
        "degreecode",
        "degree code",
        "coursecode"
    );
    if (direct) return direct;
    const codeLike = /^[A-Z]{1,4}\d{2,4}[A-Z]?$/i;
    for (const k of Object.keys(row)) {
        const nk = normKey(k);
        if (!nk.startsWith("program") && !nk.startsWith("degree") && !nk.startsWith("course")) continue;
        if (nk.includes("name") || nk.includes("title")) continue;
        const val = String(row[k] ?? "").trim();
        if (val && codeLike.test(val)) return val;
    }
    return "";
}

/**
 * Parse workbook where each row includes InstituteId (institute slug: uia, uid, …) and ProgramCode (e.g. BA203).
 * Other columns match single-program import (Name, Age, Gender, …).
 */
export async function parseStudentExcelMulti(
    file: File
): Promise<{ rows: StudentMultiImportRow[]; errors: string[] }> {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    const sheetRows = rawRows.filter((row) =>
        Object.values(row).some((v) => String(v ?? "").trim() !== "")
    );

    const rows: StudentMultiImportRow[] = [];
    const errors: string[] = [];

    sheetRows.forEach((row, idx) => {
        const line = idx + 2;
        const name = getCell(row, "name", "student name", "full name", "student");
        if (!name) {
            errors.push(`Row ${line}: missing Name`);
            return;
        }

        const instituteRaw = getInstituteIdFromRow(row);
        const programCode = getProgramCodeFromRow(row);
        const instituteId = normalizeInstituteId(instituteRaw);
        if (!instituteId) {
            errors.push(`Row ${line}: missing InstituteId (institute slug, e.g. uilah, uims)`);
            return;
        }
        if (!KNOWN_INSTITUTE_IDS.has(instituteId)) {
            errors.push(
                `Row ${line}: unknown InstituteId "${instituteRaw}" — use one of: ${[...KNOWN_INSTITUTE_IDS].sort().join(", ")}`
            );
            return;
        }
        if (!programCode) {
            errors.push(`Row ${line}: missing ProgramCode`);
            return;
        }

        const age = Math.min(60, Math.max(16, parseInt(getCell(row, "age"), 10) || 20));
        const gender = parseGender(getCell(row, "gender", "sex"));
        const religion = getCell(row, "religion") || "Hindu";
        const enrollmentYear = Math.min(
            2030,
            Math.max(
                2018,
                parseInt(
                    getCell(row, "enrollmentyear", "enrollment year", "enrollment", "admission year", "year"),
                    10
                ) || 2023
            )
        );
        const semester = Math.min(8, Math.max(1, parseInt(getCell(row, "semester", "sem"), 10) || 3));
        const cgpa = Math.min(10, Math.max(0, parseFloat(getCell(row, "cgpa", "gpa")) || 7));
        const email =
            getCell(row, "email", "e-mail") || `import.row${line}.${Date.now()}@cu.edu.in`;
        const phone = getCell(row, "phone", "mobile", "contact") || "+91 0000000000";
        const educationalBackground =
            getCellWithPrefix(
                row,
                "educat",
                "educationalbackground",
                "background",
                "board",
                "school board"
            ) || "CBSE Board";
        const coursesStr = getCell(row, "courses", "courses enrolled", "subjects");
        const coursesEnrolled = coursesStr
            ? coursesStr
                  .split(/[,;]/)
                  .map((s) => s.trim())
                  .filter(Boolean)
            : ["Core Course"];
        const dropStr = getCell(row, "dropyear", "drop year", "discontinue");
        const dropYear = dropStr ? Math.min(2030, Math.max(2018, parseInt(dropStr, 10))) : null;
        const eventsAttended = Math.max(
            0,
            parseInt(
                getCellWithPrefix(row, "events", "events", "events attended", "eventsattended", "eventsatte"),
                10
            ) || 0
        );

        rows.push({
            instituteId,
            programCode: programCode.trim(),
            name,
            age,
            gender,
            religion,
            semester,
            enrollmentYear,
            cgpa: Math.round(cgpa * 100) / 100,
            eventsAttended,
            coursesEnrolled,
            dropYear,
            activities: [],
            email,
            phone,
            educationalBackground,
        });
    });

    return { rows, errors };
}
