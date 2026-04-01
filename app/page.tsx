"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Shield, UserCog, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!selectedRole) return;
    setIsLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="login-container">
      {/* Decorative floating elements */}
      <div style={{
        position: "absolute", top: "15%", left: "8%", width: 60, height: 60,
        borderRadius: "50%", border: "2px solid rgba(194,117,72,0.15)",
        animation: "pulse-soft 3s infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "20%", right: "12%", width: 40, height: 40,
        borderRadius: "8px", border: "2px solid rgba(139,157,131,0.15)",
        transform: "rotate(45deg)", animation: "pulse-soft 4s infinite 1s",
      }} />
      <div style={{
        position: "absolute", top: "60%", left: "15%", width: 20, height: 20,
        borderRadius: "50%", background: "rgba(212,168,83,0.1)",
        animation: "pulse-soft 5s infinite 2s",
      }} />

      <div className="login-card">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 64, height: 64, borderRadius: 16,
            background: "linear-gradient(135deg, rgba(194,117,72,0.12), rgba(212,168,83,0.12))",
            marginBottom: 20,
          }}>
            <GraduationCap size={32} color="#C27548" />
          </div>
          <h1 className="heading-serif" style={{ fontSize: 28, color: "var(--text-primary)", margin: 0 }}>
            UILAH
          </h1>
          <p style={{
            fontSize: 13, color: "var(--text-muted)", marginTop: 6, letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}>
            University Institute of Liberal Arts & Humanities
          </p>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 12 }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* Role Selection */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          <button
            onClick={() => setSelectedRole("director")}
            style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "18px 20px", borderRadius: "var(--radius-md)",
              border: selectedRole === "director"
                ? "2px solid var(--accent-terracotta)"
                : "1px solid var(--border-light)",
              background: selectedRole === "director" ? "rgba(194,117,72,0.04)" : "var(--card-bg)",
              cursor: "pointer", transition: "all 0.2s ease", textAlign: "left",
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: selectedRole === "director"
                ? "linear-gradient(135deg, var(--accent-terracotta), #D4A853)"
                : "var(--sidebar-bg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s ease",
            }}>
              <Shield size={22} color={selectedRole === "director" ? "white" : "#6B6560"} />
            </div>
            <div>
              <div style={{
                fontSize: 15, fontWeight: 600,
                color: selectedRole === "director" ? "var(--accent-terracotta)" : "var(--text-primary)",
              }}>
                Senior Executive Director
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                View analytics & reports
              </div>
            </div>
            {selectedRole === "director" && (
              <Sparkles size={16} color="var(--accent-terracotta)" style={{ marginLeft: "auto" }} />
            )}
          </button>

          <button
            onClick={() => setSelectedRole("assistant")}
            style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "18px 20px", borderRadius: "var(--radius-md)",
              border: selectedRole === "assistant"
                ? "2px solid var(--accent-sage)"
                : "1px solid var(--border-light)",
              background: selectedRole === "assistant" ? "rgba(139,157,131,0.04)" : "var(--card-bg)",
              cursor: "pointer", transition: "all 0.2s ease", textAlign: "left",
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: selectedRole === "assistant"
                ? "linear-gradient(135deg, var(--accent-sage), #6BA3BE)"
                : "var(--sidebar-bg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s ease",
            }}>
              <UserCog size={22} color={selectedRole === "assistant" ? "white" : "#6B6560"} />
            </div>
            <div>
              <div style={{
                fontSize: 15, fontWeight: 600,
                color: selectedRole === "assistant" ? "var(--accent-sage)" : "var(--text-primary)",
              }}>
                Personal Assistant
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                Manage & update data
              </div>
            </div>
            {selectedRole === "assistant" && (
              <Sparkles size={16} color="var(--accent-sage)" style={{ marginLeft: "auto" }} />
            )}
          </button>
        </div>

        {/* Login Button */}
        <button
          className="btn btn-primary"
          onClick={handleLogin}
          disabled={!selectedRole || isLoading}
          style={{
            width: "100%", padding: "14px 24px", fontSize: 15, fontWeight: 600,
            borderRadius: "var(--radius-md)",
            opacity: !selectedRole ? 0.5 : 1,
            cursor: !selectedRole ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? (
            <span style={{ animation: "pulse-soft 1s infinite" }}>Signing in…</span>
          ) : (
            <>
              Sign In
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Footer */}
        <p style={{
          textAlign: "center", fontSize: 12, color: "var(--text-muted)",
          marginTop: 24,
        }}>
          Dr. Santosh Kumar — Senior Executive Director, UILAH
          <br />
          <span style={{ opacity: 0.7 }}>Chandigarh University</span>
        </p>
      </div>
    </div>
  );
}
