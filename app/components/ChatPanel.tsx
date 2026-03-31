"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ChatPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) inputRef.current.focus();
    }, [isOpen]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg: Message = { role: "user", content: input.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });
            const data = await res.json();
            setMessages([...newMessages, { role: "assistant", content: data.reply || data.error || "Error" }]);
        } catch {
            setMessages([...newMessages, { role: "assistant", content: "Sorry, connection failed. Please try again." }]);
        }
        setLoading(false);
    };

    const suggestions = [
        "What is the student-teacher ratio?",
        "Which institute has highest placements?",
        "Average CGPA across institutes?",
        "Total computer systems available?",
    ];

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: "fixed", bottom: 28, right: 28, zIndex: 1000,
                        width: 58, height: 58, borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--accent-terracotta), var(--accent-gold))",
                        border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 6px 24px rgba(194,117,72,0.4)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(194,117,72,0.5)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(194,117,72,0.4)"; }}
                >
                    <MessageCircle size={24} color="white" />
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div
                    style={{
                        position: "fixed", bottom: 28, right: 28, zIndex: 1000,
                        width: 420, height: 600, maxHeight: "80vh",
                        borderRadius: 20, overflow: "hidden",
                        background: "var(--card-bg)",
                        border: "1px solid var(--border-light)",
                        boxShadow: "0 16px 64px rgba(0,0,0,0.15)",
                        display: "flex", flexDirection: "column",
                    }}
                    className="animate-fade-in"
                >
                    {/* Header */}
                    <div style={{
                        padding: "16px 20px",
                        background: "linear-gradient(135deg, var(--accent-terracotta), var(--accent-gold))",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 12,
                                background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Sparkles size={18} color="white" />
                            </div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: "white" }}>UILAH AI Assistant</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>Powered by Gemini</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer",
                                width: 32, height: 32, borderRadius: 8,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <X size={16} color="white" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1, overflowY: "auto", padding: "16px 16px 8px",
                        background: "var(--background)",
                    }}>
                        {messages.length === 0 && (
                            <div style={{ textAlign: "center", padding: "20px 0" }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: 16, margin: "0 auto 12px",
                                    background: "rgba(194,117,72,0.1)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <Bot size={28} color="var(--accent-terracotta)" />
                                </div>
                                <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px", color: "var(--text-primary)" }}>
                                    Ask me anything!
                                </h3>
                                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>
                                    I know everything about UILAH&apos;s dashboard data
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {suggestions.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => { setInput(s); }}
                                            style={{
                                                padding: "10px 14px", fontSize: 12, textAlign: "left",
                                                background: "var(--card-bg)", border: "1px solid var(--border-light)",
                                                borderRadius: 10, cursor: "pointer", color: "var(--text-secondary)",
                                                transition: "border-color 0.15s",
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent-terracotta)"}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-light)"}
                                        >
                                            💬 {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex", gap: 8, marginBottom: 14,
                                    flexDirection: msg.role === "user" ? "row-reverse" : "row",
                                }}
                            >
                                <div style={{
                                    width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                                    background: msg.role === "user"
                                        ? "linear-gradient(135deg, var(--accent-terracotta), var(--accent-gold))"
                                        : "rgba(155,142,196,0.15)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    {msg.role === "user"
                                        ? <User size={14} color="white" />
                                        : <Bot size={14} color="var(--accent-lavender)" />}
                                </div>
                                <div style={{
                                    maxWidth: "80%", padding: "10px 14px", borderRadius: 14,
                                    fontSize: 13, lineHeight: 1.5,
                                    background: msg.role === "user" ? "var(--accent-terracotta)" : "var(--card-bg)",
                                    color: msg.role === "user" ? "white" : "var(--text-primary)",
                                    border: msg.role === "assistant" ? "1px solid var(--border-light)" : "none",
                                    borderTopRightRadius: msg.role === "user" ? 4 : 14,
                                    borderTopLeftRadius: msg.role === "assistant" ? 4 : 14,
                                    whiteSpace: "pre-wrap",
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                                <div style={{
                                    width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                                    background: "rgba(155,142,196,0.15)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <Bot size={14} color="var(--accent-lavender)" />
                                </div>
                                <div style={{
                                    padding: "12px 18px", borderRadius: 14, borderTopLeftRadius: 4,
                                    background: "var(--card-bg)", border: "1px solid var(--border-light)",
                                }}>
                                    <div className="typing-dots" style={{ display: "flex", gap: 4 }}>
                                        <span className="dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", animation: "pulse 1.4s infinite ease-in-out" }} />
                                        <span className="dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", animation: "pulse 1.4s infinite ease-in-out 0.2s" }} />
                                        <span className="dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", animation: "pulse 1.4s infinite ease-in-out 0.4s" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: "12px 16px", borderTop: "1px solid var(--border-light)",
                        background: "var(--card-bg)",
                    }}>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Ask about students, faculty, placements..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                className="search-input"
                                style={{
                                    flex: 1, fontSize: 13, padding: "10px 14px",
                                    borderRadius: 12, border: "1px solid var(--border-light)",
                                }}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || loading}
                                style={{
                                    width: 42, height: 42, borderRadius: 12, border: "none",
                                    background: input.trim() && !loading
                                        ? "linear-gradient(135deg, var(--accent-terracotta), var(--accent-gold))"
                                        : "var(--border-light)",
                                    cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "background 0.2s",
                                }}
                            >
                                <Send size={16} color={input.trim() && !loading ? "white" : "var(--text-muted)"} />
                            </button>
                        </div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 6 }}>
                            UILAH AI · Powered by Google Gemini
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
