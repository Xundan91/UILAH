import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

/** GET /api/programs/[instituteId] — programs for one institute. */
export async function GET(_req: Request, { params }: { params: Promise<{ instituteId: string }> }) {
    try {
        const { instituteId } = await params;
        const programs = await prisma.program.findMany({
            where: { instituteId },
            orderBy: { code: "asc" },
        });
        return NextResponse.json({ programs });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to load programs" }, { status: 500 });
    }
}
