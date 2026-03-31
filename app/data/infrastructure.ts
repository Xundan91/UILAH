import { Room, InfraStats } from './types';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function seededRandom(seed: number): () => number {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

const rand = seededRandom(77);

function genMonthly(base: number): { month: string; percent: number }[] {
    return months.map((m) => ({
        month: m,
        percent: Math.min(100, Math.max(10, Math.round(base + (rand() - 0.5) * 30))),
    }));
}

export const rooms: Room[] = [
    // ═══════════ A2 BLOCK ═══════════
    // Ground Floor
    { id: 'A2-G01', building: 'A2', floor: 0, roomNumber: 'A2-G01', type: 'Classroom', capacity: 120, utilizationPercent: 88, monthlyUtilization: genMonthly(88), equipment: ['Projector', 'Smart Board', 'AC', 'Mic System'] },
    { id: 'A2-G02', building: 'A2', floor: 0, roomNumber: 'A2-G02', type: 'Classroom', capacity: 120, utilizationPercent: 85, monthlyUtilization: genMonthly(85), equipment: ['Projector', 'Smart Board', 'AC'] },
    { id: 'A2-G03', building: 'A2', floor: 0, roomNumber: 'A2-G03', type: 'Classroom', capacity: 80, utilizationPercent: 82, monthlyUtilization: genMonthly(82), equipment: ['Projector', 'AC'] },
    { id: 'A2-G04', building: 'A2', floor: 0, roomNumber: 'A2-G04', type: 'Lab', capacity: 60, utilizationPercent: 75, monthlyUtilization: genMonthly(75), equipment: ['60 Computer Systems', 'Projector', 'AC', 'Printer', 'Scanner'] },
    { id: 'A2-G05', building: 'A2', floor: 0, roomNumber: 'A2-G05', type: 'Tutorial Room', capacity: 40, utilizationPercent: 62, monthlyUtilization: genMonthly(62), equipment: ['Whiteboard', 'AC', 'Smart Board'] },
    { id: 'A2-G06', building: 'A2', floor: 0, roomNumber: 'A2-G06', type: 'Tutorial Room', capacity: 35, utilizationPercent: 55, monthlyUtilization: genMonthly(55), equipment: ['Whiteboard', 'AC'] },
    // 1st Floor
    { id: 'A2-101', building: 'A2', floor: 1, roomNumber: 'A2-101', type: 'Classroom', capacity: 150, utilizationPercent: 92, monthlyUtilization: genMonthly(92), equipment: ['Projector', 'Smart Board', 'AC', 'Mic System', 'Recording Setup'] },
    { id: 'A2-102', building: 'A2', floor: 1, roomNumber: 'A2-102', type: 'Classroom', capacity: 120, utilizationPercent: 87, monthlyUtilization: genMonthly(87), equipment: ['Projector', 'Smart Board', 'AC'] },
    { id: 'A2-103', building: 'A2', floor: 1, roomNumber: 'A2-103', type: 'Classroom', capacity: 80, utilizationPercent: 78, monthlyUtilization: genMonthly(78), equipment: ['Projector', 'AC'] },
    { id: 'A2-104', building: 'A2', floor: 1, roomNumber: 'A2-104', type: 'Lab', capacity: 50, utilizationPercent: 68, monthlyUtilization: genMonthly(68), equipment: ['50 Computer Systems', 'Projector', 'AC', 'Printer'] },
    { id: 'A2-105', building: 'A2', floor: 1, roomNumber: 'A2-105', type: 'Lab', capacity: 45, utilizationPercent: 72, monthlyUtilization: genMonthly(72), equipment: ['45 Computer Systems', 'Projector', 'AC'] },
    { id: 'A2-106', building: 'A2', floor: 1, roomNumber: 'A2-106', type: 'Library', capacity: 200, utilizationPercent: 91, monthlyUtilization: genMonthly(91), equipment: ['Reading Stations', 'Wi-Fi', 'AC', 'Digital Catalog System', 'Self-Issue Kiosk'] },
    // 2nd Floor
    { id: 'A2-201', building: 'A2', floor: 2, roomNumber: 'A2-201', type: 'Classroom', capacity: 120, utilizationPercent: 83, monthlyUtilization: genMonthly(83), equipment: ['Projector', 'Smart Board', 'AC'] },
    { id: 'A2-202', building: 'A2', floor: 2, roomNumber: 'A2-202', type: 'Classroom', capacity: 80, utilizationPercent: 76, monthlyUtilization: genMonthly(76), equipment: ['Projector', 'AC'] },
    { id: 'A2-203', building: 'A2', floor: 2, roomNumber: 'A2-203', type: 'Seminar Hall', capacity: 250, utilizationPercent: 52, monthlyUtilization: genMonthly(52), equipment: ['Projector', 'Stage', 'Sound System', 'AC', '12 Mic System', 'Live Streaming'] },
    { id: 'A2-204', building: 'A2', floor: 2, roomNumber: 'A2-204', type: 'Tutorial Room', capacity: 40, utilizationPercent: 58, monthlyUtilization: genMonthly(58), equipment: ['Whiteboard', 'AC', 'Smart Board'] },
    { id: 'A2-205', building: 'A2', floor: 2, roomNumber: 'A2-205', type: 'Lab', capacity: 40, utilizationPercent: 65, monthlyUtilization: genMonthly(65), equipment: ['40 Computer Systems', 'Projector', 'AC', 'Scanner', 'Printer'] },
    { id: 'A2-206', building: 'A2', floor: 2, roomNumber: 'A2-206', type: 'Tutorial Room', capacity: 30, utilizationPercent: 50, monthlyUtilization: genMonthly(50), equipment: ['Whiteboard', 'AC'] },
    // 3rd Floor
    { id: 'A2-301', building: 'A2', floor: 3, roomNumber: 'A2-301', type: 'Classroom', capacity: 100, utilizationPercent: 80, monthlyUtilization: genMonthly(80), equipment: ['Projector', 'Smart Board', 'AC'] },
    { id: 'A2-302', building: 'A2', floor: 3, roomNumber: 'A2-302', type: 'Classroom', capacity: 80, utilizationPercent: 74, monthlyUtilization: genMonthly(74), equipment: ['Projector', 'AC'] },
    { id: 'A2-303', building: 'A2', floor: 3, roomNumber: 'A2-303', type: 'Lab', capacity: 40, utilizationPercent: 60, monthlyUtilization: genMonthly(60), equipment: ['40 Computer Systems', 'Projector', 'AC'] },
    { id: 'A2-304', building: 'A2', floor: 3, roomNumber: 'A2-304', type: 'Tutorial Room', capacity: 35, utilizationPercent: 48, monthlyUtilization: genMonthly(48), equipment: ['Whiteboard', 'AC'] },

    // ═══════════ A3 BLOCK ═══════════
    // Ground Floor
    { id: 'A3-G01', building: 'A3', floor: 0, roomNumber: 'A3-G01', type: 'Classroom', capacity: 150, utilizationPercent: 90, monthlyUtilization: genMonthly(90), equipment: ['Projector', 'Smart Board', 'AC', 'Mic System'] },
    { id: 'A3-G02', building: 'A3', floor: 0, roomNumber: 'A3-G02', type: 'Classroom', capacity: 120, utilizationPercent: 86, monthlyUtilization: genMonthly(86), equipment: ['Projector', 'Smart Board', 'AC'] },
    { id: 'A3-G03', building: 'A3', floor: 0, roomNumber: 'A3-G03', type: 'Classroom', capacity: 80, utilizationPercent: 80, monthlyUtilization: genMonthly(80), equipment: ['Projector', 'AC'] },
    { id: 'A3-G04', building: 'A3', floor: 0, roomNumber: 'A3-G04', type: 'Lab', capacity: 60, utilizationPercent: 78, monthlyUtilization: genMonthly(78), equipment: ['60 Computer Systems', 'Projector', 'AC', 'Printer', '3D Printer'] },
    { id: 'A3-G05', building: 'A3', floor: 0, roomNumber: 'A3-G05', type: 'Lab', capacity: 50, utilizationPercent: 72, monthlyUtilization: genMonthly(72), equipment: ['50 Computer Systems', 'Projector', 'AC', 'Printer'] },
    { id: 'A3-G06', building: 'A3', floor: 0, roomNumber: 'A3-G06', type: 'Tutorial Room', capacity: 40, utilizationPercent: 55, monthlyUtilization: genMonthly(55), equipment: ['Whiteboard', 'AC', 'Smart Board'] },
    // 1st Floor
    { id: 'A3-101', building: 'A3', floor: 1, roomNumber: 'A3-101', type: 'Classroom', capacity: 150, utilizationPercent: 93, monthlyUtilization: genMonthly(93), equipment: ['Projector', 'Smart Board', 'AC', 'Mic System', 'Recording Setup'] },
    { id: 'A3-102', building: 'A3', floor: 1, roomNumber: 'A3-102', type: 'Classroom', capacity: 120, utilizationPercent: 84, monthlyUtilization: genMonthly(84), equipment: ['Projector', 'Smart Board', 'AC'] },
    { id: 'A3-103', building: 'A3', floor: 1, roomNumber: 'A3-103', type: 'Classroom', capacity: 80, utilizationPercent: 79, monthlyUtilization: genMonthly(79), equipment: ['Projector', 'AC'] },
    { id: 'A3-104', building: 'A3', floor: 1, roomNumber: 'A3-104', type: 'Lab', capacity: 55, utilizationPercent: 70, monthlyUtilization: genMonthly(70), equipment: ['55 Computer Systems', 'Projector', 'AC'] },
    { id: 'A3-105', building: 'A3', floor: 1, roomNumber: 'A3-105', type: 'Library', capacity: 250, utilizationPercent: 94, monthlyUtilization: genMonthly(94), equipment: ['Reading Stations', 'Digital Kiosks', 'Wi-Fi', 'AC', 'Reference Section', 'E-Resource Lab'] },
    { id: 'A3-106', building: 'A3', floor: 1, roomNumber: 'A3-106', type: 'Tutorial Room', capacity: 35, utilizationPercent: 60, monthlyUtilization: genMonthly(60), equipment: ['Whiteboard', 'AC', 'Smart Board'] },
    // 2nd Floor
    { id: 'A3-201', building: 'A3', floor: 2, roomNumber: 'A3-201', type: 'Classroom', capacity: 120, utilizationPercent: 82, monthlyUtilization: genMonthly(82), equipment: ['Projector', 'Smart Board', 'AC'] },
    { id: 'A3-202', building: 'A3', floor: 2, roomNumber: 'A3-202', type: 'Classroom', capacity: 80, utilizationPercent: 75, monthlyUtilization: genMonthly(75), equipment: ['Projector', 'AC'] },
    { id: 'A3-203', building: 'A3', floor: 2, roomNumber: 'A3-203', type: 'Seminar Hall', capacity: 350, utilizationPercent: 45, monthlyUtilization: genMonthly(45), equipment: ['Projector', 'Stage', 'Sound System', 'AC', '16 Mic System', 'Recording Setup', 'Live Streaming'] },
    { id: 'A3-204', building: 'A3', floor: 2, roomNumber: 'A3-204', type: 'Lab', capacity: 45, utilizationPercent: 64, monthlyUtilization: genMonthly(64), equipment: ['45 Computer Systems', 'Green Screen', 'Video Editing Workstations', 'AC'] },
    { id: 'A3-205', building: 'A3', floor: 2, roomNumber: 'A3-205', type: 'Tutorial Room', capacity: 40, utilizationPercent: 52, monthlyUtilization: genMonthly(52), equipment: ['Whiteboard', 'AC'] },
    { id: 'A3-206', building: 'A3', floor: 2, roomNumber: 'A3-206', type: 'Tutorial Room', capacity: 30, utilizationPercent: 48, monthlyUtilization: genMonthly(48), equipment: ['Whiteboard', 'AC'] },
    // 3rd Floor
    { id: 'A3-301', building: 'A3', floor: 3, roomNumber: 'A3-301', type: 'Classroom', capacity: 100, utilizationPercent: 78, monthlyUtilization: genMonthly(78), equipment: ['Projector', 'Smart Board', 'AC'] },
    { id: 'A3-302', building: 'A3', floor: 3, roomNumber: 'A3-302', type: 'Classroom', capacity: 80, utilizationPercent: 72, monthlyUtilization: genMonthly(72), equipment: ['Projector', 'AC'] },
    { id: 'A3-303', building: 'A3', floor: 3, roomNumber: 'A3-303', type: 'Lab', capacity: 50, utilizationPercent: 66, monthlyUtilization: genMonthly(66), equipment: ['50 Computer Systems', 'Projector', 'AC', 'Printer'] },
    { id: 'A3-304', building: 'A3', floor: 3, roomNumber: 'A3-304', type: 'Lab', capacity: 40, utilizationPercent: 58, monthlyUtilization: genMonthly(58), equipment: ['40 Computer Systems', 'Projector', 'AC'] },
    { id: 'A3-305', building: 'A3', floor: 3, roomNumber: 'A3-305', type: 'Seminar Hall', capacity: 200, utilizationPercent: 42, monthlyUtilization: genMonthly(42), equipment: ['Projector', 'Stage', 'Sound System', 'AC', '8 Mic System'] },
    { id: 'A3-306', building: 'A3', floor: 3, roomNumber: 'A3-306', type: 'Tutorial Room', capacity: 35, utilizationPercent: 45, monthlyUtilization: genMonthly(45), equipment: ['Whiteboard', 'AC'] },
];

export const getRoomsByBuilding = (building: 'A2' | 'A3', list: Room[]) =>
    list.filter((r) => r.building === building);

/** Aggregate stats for any room list (e.g. from API). */
export function computeInfraStats(roomList: Room[]): InfraStats {
    if (roomList.length === 0) {
        return {
            totalClassrooms: 0,
            totalLabs: 0,
            totalTutorialRooms: 0,
            totalLibraries: 0,
            totalCapacity: 0,
            avgUtilization: 0,
            computerSystems: 0,
        };
    }
    const classrooms = roomList.filter((r) => r.type === 'Classroom');
    const labs = roomList.filter((r) => r.type === 'Lab');
    const tutorials = roomList.filter((r) => r.type === 'Tutorial Room');
    const libraries = roomList.filter((r) => r.type === 'Library');
    const totalComputers = labs.reduce((acc, r) => {
        const match = r.equipment?.find((e) => e.includes('Computer Systems'));
        if (match) {
            const num = parseInt(match, 10);
            return acc + (isNaN(num) ? 0 : num);
        }
        return acc;
    }, 0);

    return {
        totalClassrooms: classrooms.length,
        totalLabs: labs.length,
        totalTutorialRooms: tutorials.length,
        totalLibraries: libraries.length,
        totalCapacity: roomList.reduce((acc, r) => acc + r.capacity, 0),
        avgUtilization: Math.round(roomList.reduce((acc, r) => acc + r.utilizationPercent, 0) / roomList.length),
        computerSystems: totalComputers,
    };
}

export const getInfraStats = (): InfraStats => computeInfraStats(rooms);
