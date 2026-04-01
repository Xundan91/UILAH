import { ApiError, GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const GEMINI_MODEL = 'gemini-3-flash-preview';

// Build a comprehensive context summary from the dashboard data
function buildDashboardContext(): string {
    return `You are UILAH AI Assistant for Chandigarh University. The dashboard covers six University Institutes (not the old "core vs specialised" department split). Use the institute and program structure below.

=== UNIVERSITY OVERVIEW ===
Total Students: 6,175
Total Enrolled (active, not dropped): ~5,850
Total Faculty: ~180
University Institutes: 6 (UIA, UID, UIFVA, UILAH, UIMS, UITTR)
Total distinct degree programs listed: 27
Total Placements (2022-2025): large dataset across all institutes
Total Events Conducted: 24+
Buildings: A2 Block & A3 Block (4 floors each)

=== INSTITUTES & PROGRAMS (code) ===
UIA — University Institute of Architecture: BArch (AR201), M.Arch. (AR301)
UID — University Institute of Design: Bachelor of Design Product & Industrial (BD205), Bachelor of Design Fashion (BD203), MFA (MR302), BFA (BS204)
UIFVA — Film & Visual Arts: B.Sc. Hons Digital Film Making (AN205), M.Sc A & MT (AN301), B.Sc. Animation VFX Gaming ITP (AN801), B.Sc. Animation VFX Gaming (AN203)
UILAH — Liberal Arts & Humanities: B.A. Psy (BA203), B.A. Hons Liberal Arts (LA202), M.A. Psychology (MA303), M.A. Clinical Psychology (HY302), M.A. Politics & IR (MA306), M.A. English (MA302), B.A. Hons Social Work (BA202), B.A. Hons Liberal Arts ITP (LA801), B.A. Psychology Hons ITP (BA801)
UIMS — Media Studies: B.A. JMC (BJ201), M.A. JMC (MJ301), B.A. JMC ITP (BJ801)
UITTR — Teacher Training & Research: P.G. Dip Yoga Education (EY301), B.P.Ed (BE201), B.A. (BA301), B.Sc. + B.Ed. (BS502), B.A. + B.Ed. (BA501)

=== STUDENT DEMOGRAPHICS ===
Gender: ~44% Male, ~53% Female, ~3% Other
Religion Distribution: Hindu ~55%, Muslim ~18%, Sikh ~12%, Christian ~8%, Buddhist ~4%, Jain ~3%
Educational Background: CBSE ~40%, State Board ~35%, ICSE ~15%, IB ~6%, NIOS ~4%
Enrollment Years: 2021-2024 (4 batches)
CGPA Distribution: Bell curve centered around 7.0-7.5 (scale of 10)
Drop Rate: ~3-8% depending on year in program
Average Events Attended: 2-4 per student

=== PLACEMENT DATA (2022-2025) ===
Total Placement Records: ~1,800
CRC (Career Resource Center) Registered: ~75%
Average Package: ~5-8 LPA
Highest Package: ~20-25 LPA
Year-wise Trend: Growing each year (2022 → 2023 → 2024 → 2025)

Top Recruiting Companies: Deloitte, KPMG, EY, PwC, Accenture, TCS, Infosys, Amazon, Google, Microsoft, HDFC Bank, ICICI Bank, Teach For India, UNICEF, etc.

Common Roles: Content Analyst, Research Associate, HR Associate, Policy Analyst, Consultant, Data Analyst, Journalist, UX Researcher, Digital Marketing Specialist, Management Trainee

Alumni Value-Add Courses: Advanced Excel, Business Communication, Digital Marketing, Foreign Language Certification, Public Speaking, Data Analytics using Python

=== INFRASTRUCTURE ===
A2 Block: 22 rooms across 4 floors (Ground to 3rd)
- 10 Classrooms (capacity 80-150 each)
- 4 Labs (~195 computer systems)
- 5 Tutorial Rooms
- 1 Library (200 capacity, digital catalog)
- 1 Seminar Hall (250 capacity, live streaming)

A3 Block: 24 rooms across 4 floors (Ground to 3rd)
- 10 Classrooms (capacity 80-150 each)
- 5 Labs (~250 computer systems)
- 5 Tutorial Rooms
- 1 Library (250 capacity, e-resource lab)
- 2 Seminar Halls (200-350 capacity)
- 1 Studio Lab (green screen, video editing)

Total Capacity: ~4,000+ seats
Average Room Utilization: ~71%
Total Computer Systems: ~770
Smart Boards: 10+ classrooms
Libraries: 2 (fully digital with Wi-Fi, kiosks)
Seminar Halls: 3 (with recording & live streaming)

=== FACULTY HIGHLIGHTS ===
Education: ~60% PhD, ~20% Pursuing PhD, ~20% Non-PhD (M.A./M.F.A.)
Total Scopus Articles: ~1,500+
Total Patents/IPR: ~25+
Total Books Published: ~40+
Notable Achievements: UGC Fellowships, Fulbright Fellows, ICSSR Grants, National Awards

=== SENIOR EXECUTIVE DIRECTOR ===
Name: Dr. Santosh Kumar
Role: Senior Executive Director of UILAH
The dashboard is designed for him to monitor all university metrics.

Personal Assistant role exists for data entry and editing.

IMPORTANT INSTRUCTIONS:
- Always be helpful and provide specific numbers when asked.
- If asked about specific students/faculty, provide realistic answers based on the data ranges above.
- For questions outside the dashboard data, politely redirect to dashboard-related topics.
- Use a friendly, professional tone appropriate for a university setting.
- Format responses with markdown for readability when helpful.
- Keep responses concise but informative.
`;
}

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        const systemContext = buildDashboardContext();

        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set');
            return NextResponse.json(
                { reply: 'The AI assistant is not configured (missing GEMINI_API_KEY). Add your key to .env.local or .env.' },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

        const geminiMessages = messages.map((msg: { role: string; content: string }) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: geminiMessages,
            config: {
                systemInstruction: systemContext,
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 1024,
                responseMimeType: 'text/plain',
            },
        });

        const text =
            response.text?.trim() ||
            "Sorry, I couldn't generate a response.";

        return NextResponse.json({ reply: text });
    } catch (error) {
        console.error('Chat API error:', error);
        if (error instanceof ApiError && error.status === 429) {
            return NextResponse.json({
                reply:
                    "I'm receiving too many requests right now due to Gemini rate limits. Please wait a few seconds and try again.",
            });
        }
        return NextResponse.json(
            {
                reply: 'I encountered an error connecting to the AI provider. Please try again later.',
            },
            { status: 500 }
        );
    }
}
