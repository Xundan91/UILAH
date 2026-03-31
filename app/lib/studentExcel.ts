import * as XLSX from "xlsx";
import type { Activity, Student } from "../data/types";

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
            Math.max(2018, parseInt(getCell(row, "enrollmentyear", "enrollment year", "admission year", "year"), 10) || 2023)
        );
        const semester = Math.min(8, Math.max(1, parseInt(getCell(row, "semester", "sem"), 10) || 3));
        const cgpa = Math.min(10, Math.max(0, parseFloat(getCell(row, "cgpa", "gpa")) || 7));
        const email =
            getCell(row, "email", "e-mail") || `import.row${line}.${Date.now()}@cu.edu.in`;
        const phone = getCell(row, "phone", "mobile", "contact") || "+91 0000000000";
        const educationalBackground =
            getCell(row, "educationalbackground", "background", "board", "school board") || "CBSE Board";
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
            parseInt(getCell(row, "events", "events attended", "eventsattended"), 10) || 0
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
