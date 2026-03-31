import { ApiError, GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const GEMINI_MODEL = 'gemini-3-flash-preview';

// Build a comprehensive context summary from the dashboard data
function buildDashboardContext(): string {
    return `You are UILAH AI Assistant for the University Institute of Liberal Arts & Humanities (UILAH) at Chandigarh University. You have complete knowledge of the dashboard data.

=== UNIVERSITY OVERVIEW ===
Total Students: 6,175
Total Enrolled (active, not dropped): ~5,850
Total Faculty: ~180
Total Departments: 11 (5 Core Academic + 6 Specialised Areas)
Total Placements (2022-2025): ~1,800
Total Events Conducted: 24+
Buildings: A2 Block & A3 Block (4 floors each)

=== DEPARTMENTS (Student Count | Faculty Count) ===
CORE ACADEMIC:
1. English — 980 students, 28 faculty (Student:Teacher ratio = 35:1)
   Courses: British Literature, American Literature, Postcolonial Studies, Creative Writing, Linguistics Foundations, Cultural Studies, World Literature, Modern Poetry
2. Psychology — 850 students, 24 faculty (ratio = 35:1)
   Courses: Clinical Psychology, Cognitive Psychology, Neuropsychology, Forensic Psychology, Developmental Psychology, Social Psychology, Abnormal Psychology, Health Psychology
3. Economics — 780 students, 22 faculty (ratio = 35:1)
   Courses: Microeconomics, Macroeconomics, Indian Economy, Research Methodology, Development Economics, Econometrics, International Trade, Public Finance
4. Political Science — 720 students, 20 faculty (ratio = 36:1)
   Courses: International Relations, Diplomacy, Comparative Politics, Political Theory, Public Policy, Indian Government, Constitutional Law, Political Sociology
5. Sociology — 650 students, 18 faculty (ratio = 36:1)
   Courses: Social Structures, Gender Studies, Urban Sociology, Rural Sociology, Research Methods, Social Movements, Family & Marriage, Environmental Sociology

SPECIALISED AREAS:
6. Language Studies — 480 students, 14 faculty (ratio = 34:1)
   Courses: French, German, Spanish, Linguistics, Translation Studies, Comparative Philology, Hindi Literature
7. Performing Arts — 380 students, 12 faculty (ratio = 32:1)
   Courses: Theatre Production, Acting Techniques, Dance Forms, Music Theory, Creative Expression, Stage Design
8. Fine Arts & Design — 420 students, 12 faculty (ratio = 35:1)
   Courses: Visual Arts, Sculpture, Digital Art, Art History, Media Studies, Design Thinking, Photography, Graphic Design
9. Humanities — 385 students, 12 faculty (ratio = 32:1)
   Courses: World History, Indian History, Philosophy, Geography, Ethics, Cultural Heritage, Archaeology, Religious Studies
10. Film & Media — 280 students, 10 faculty (ratio = 28:1)
    Courses: Film Studies, Screenwriting, Film Theory, Digital Media, Documentary Making, Media Ethics, Cinematography
11. Emerging Technologies — 250 students, 8 faculty (ratio = 31:1)
    Courses: AI for Social Sciences, Data Analytics, Digital Humanities, Machine Learning Basics, Tech Ethics, Computational Linguistics

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

=== SENIOR ASSOCIATE DIRECTOR ===
Name: Dr. Santosh Kumar
Role: Senior Associate Director of UILAH
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
