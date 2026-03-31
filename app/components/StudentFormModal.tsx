"use client";

import { X } from "lucide-react";
import type { Student } from "../data/types";
import StudentEntryForm from "./StudentEntryForm";

type Props = {
    open: boolean;
    mode: "add" | "edit";
    initial?: Student | null;
    deptId: string;
    programCode: string;
    programDisplay: string;
    onClose: () => void;
    onSave: (student: Student) => void | Promise<void>;
};

export default function StudentFormModal({
    open,
    mode,
    initial,
    deptId,
    programCode,
    programDisplay,
    onClose,
    onSave,
}: Props) {
    if (!open) return null;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="student-form-title" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 id="student-form-title" className="heading-serif" style={{ fontSize: 20, margin: 0 }}>
                        {mode === "add" ? "Add student" : "Edit student"}
                    </h3>
                    <button type="button" className="btn btn-ghost" onClick={onClose} style={{ padding: 6 }} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Program: {programDisplay}</p>
                <StudentEntryForm
                    variant="modal"
                    deptId={deptId}
                    programCode={programCode}
                    programDisplay={programDisplay}
                    mode={mode}
                    initial={mode === "edit" ? initial : null}
                    onCancel={onClose}
                    onSubmit={async (s) => {
                        await onSave(s);
                        onClose();
                    }}
                />
            </div>
        </div>
    );
}
