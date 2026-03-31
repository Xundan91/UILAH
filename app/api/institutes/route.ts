import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

/** GET /api/institutes — all institutes with programs (ids for API wiring). */
export async function GET() {
    try {
        const institutes = await prisma.institute.findMany({
            include: {
                programs: {
                    orderBy: { code: "asc" },
                },
            },
            orderBy: { id: "asc" },
        });
        return NextResponse.json({ institutes });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to load institutes" }, { status: 500 });
    }
}
