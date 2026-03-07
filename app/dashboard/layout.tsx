"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Building2,
    GraduationCap,
    LogOut,
    Menu,
    X,
    BookOpen,
} from "lucide-react";
import { useState } from "react";
import ChatPanel from "../components/ChatPanel";

const navItems = [
    { href: "/dashboard", label: "Overall", icon: LayoutDashboard },
    { href: "/dashboard/students", label: "Student Data (Academic)", icon: BookOpen },
    { href: "/dashboard/placement", label: "Placement Data", icon: Briefcase },
    { href: "/dashboard/teachers", label: "Teacher Profiles", icon: Users },
    { href: "/dashboard/infrastructure", label: "Infrastructure", icon: Building2 },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        if (href === "/dashboard/students") return pathname === "/dashboard/students" || pathname.startsWith("/dashboard/department");
        return pathname.startsWith(href);
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Mobile toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                    position: "fixed", top: 16, left: 16, zIndex: 50,
                    width: 40, height: 40, borderRadius: 10,
                    background: "var(--card-bg)", border: "1px solid var(--border-light)",
                    display: "none", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "var(--shadow-md)",
                }}
                className="mobile-menu-btn"
            >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                {/* Logo */}
                <div style={{ padding: "0 24px 28px", borderBottom: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: "linear-gradient(135deg, var(--accent-terracotta), var(--accent-gold))",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <GraduationCap size={22} color="white" />
                        </div>
                        <div>
                            <div className="heading-serif" style={{ fontSize: 18, color: "var(--text-primary)" }}>
                                UILAH
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.03em" }}>
                                Dashboard
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: "16px 0" }}>
                    <div style={{
                        padding: "0 24px 8px", fontSize: 11, fontWeight: 600,
                        color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>
                        Menu
                    </div>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* User Info */}
                <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <div
                            style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: "linear-gradient(135deg, rgba(194,117,72,0.15), rgba(212,168,83,0.15))",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 14, fontWeight: 600, color: "var(--accent-terracotta)",
                            }}
                        >
                            SK
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                                Dr. Santosh Kumar
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Senior Associate Director</div>
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="btn btn-ghost btn-sm"
                        style={{ width: "100%", fontSize: 12, color: "var(--text-muted)" }}
                    >
                        <LogOut size={14} />
                        Sign Out
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main
                style={{
                    flex: 1, marginLeft: 260, padding: "32px 40px",
                    minHeight: "100vh", background: "var(--background)",
                }}
            >
                {children}
            </main>

            <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          main { margin-left: 0 !important; padding: 20px 16px !important; padding-top: 64px !important; }
        }
      `}</style>

            {/* AI Chat */}
            <ChatPanel />
        </div>
    );
}
