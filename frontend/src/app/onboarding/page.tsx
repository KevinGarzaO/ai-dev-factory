"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orgData, setOrgData] = useState<{ orgId: number, userId: number, orgName: string, defaultTeamId: number, defaultProjectId: number } | null>(null);

  const [teamName, setTeamName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("onboarding");
    if (!raw) { router.push("/login"); return; }
    setOrgData(JSON.parse(raw));
  }, [router]);

  const handleFinish = async () => {
    if (!orgData || !teamName || !projectName || !role) return;
    setLoading(true);

    try {
      // Rename existing default team and project instead of creating duplicates
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: orgData.userId,
          projectId: orgData.defaultProjectId,
          teamId: orgData.defaultTeamId,
          role,
          teamName,
          projectName,
          renameDefaults: true
        })
      });

      sessionStorage.removeItem("onboarding");
      router.push(`/${encodeURIComponent(orgData.orgName)}/${encodeURIComponent(projectName)}/backlogs/board/${encodeURIComponent(teamName)}`);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const wrapStyle: React.CSSProperties = {
    minHeight: "100vh", width: "100vw", display: "flex",
    alignItems: "center", justifyContent: "center",
    padding: "40px", boxSizing: "border-box"
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--panel-bg)", backdropFilter: "blur(16px)",
    border: "1px solid var(--panel-border)", borderRadius: "20px",
    padding: "48px", maxWidth: "520px", width: "100%"
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: "10px",
    background: "rgba(255,255,255,0.04)", border: "1px solid var(--panel-border)",
    color: "var(--text-main)", fontSize: "1rem", outline: "none",
    boxSizing: "border-box"
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "8px"
  };

  const stepColors = ["#45f3ff", "#a78bfa", "#34d399"];
  const stepIcons = ["fa-users", "fa-folder-open", "fa-id-badge"];

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        {/* Progress bar */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "40px" }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: "4px", borderRadius: "4px", background: s <= step ? stepColors[step - 1] : "var(--panel-border)", transition: "background 0.3s ease" }}></div>
          ))}
        </div>

        {/* Icon */}
        <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: `rgba(69,243,255,0.08)`, border: `1px solid rgba(69,243,255,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
          <i className={`fa-solid ${stepIcons[step - 1]}`} style={{ color: stepColors[step - 1], fontSize: "1.4rem" }}></i>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "0.8rem", color: stepColors[0], marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Paso 1 de 3</div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "8px" }}>¿Cómo se llama tu equipo?</h2>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>Ponle un nombre al equipo con el que trabajarás.</p>
            </div>
            <div>
              <label style={labelStyle}><i className="fa-solid fa-users" style={{ marginRight: "6px", color: stepColors[0] }}></i>Nombre del equipo</label>
              <input autoFocus type="text" style={inputStyle} placeholder="ej. Equipo Frontend, Core Team..." value={teamName}
                onChange={e => setTeamName(e.target.value)} onKeyDown={e => e.key === "Enter" && teamName.trim() && setStep(2)} />
            </div>
            <button className="action-btn" style={{ width: "100%", padding: "14px", marginTop: "28px", fontSize: "1rem" }} disabled={!teamName.trim()} onClick={() => setStep(2)}>
              Continuar <i className="fa-solid fa-arrow-right"></i>
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "0.8rem", color: stepColors[1], marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Paso 2 de 3</div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "8px" }}>¿En qué proyecto trabajan?</h2>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>El nombre del proyecto que <strong style={{ color: "var(--text-main)" }}>{teamName}</strong> va a desarrollar.</p>
            </div>
            <div>
              <label style={labelStyle}><i className="fa-solid fa-folder-open" style={{ marginRight: "6px", color: stepColors[1] }}></i>Nombre del proyecto</label>
              <input autoFocus type="text" style={inputStyle} placeholder="ej. App Móvil, Portal Web, API v2..." value={projectName}
                onChange={e => setProjectName(e.target.value)} onKeyDown={e => e.key === "Enter" && projectName.trim() && setStep(3)} />
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: "14px", background: "transparent", border: "1px solid var(--panel-border)", borderRadius: "10px", color: "var(--text-muted)", cursor: "pointer" }}>
                <i className="fa-solid fa-arrow-left"></i> Atrás
              </button>
              <button className="action-btn" style={{ flex: 2, padding: "14px", fontSize: "1rem" }} disabled={!projectName.trim()} onClick={() => setStep(3)}>
                Continuar <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "0.8rem", color: stepColors[2], marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Paso 3 de 3</div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "8px" }}>¿Cuál es tu rol?</h2>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>Tu función dentro de <strong style={{ color: "var(--text-main)" }}>{projectName}</strong>.</p>
            </div>
            <div>
              <label style={labelStyle}><i className="fa-solid fa-id-badge" style={{ marginRight: "6px", color: stepColors[2] }}></i>Tu rol en el proyecto</label>
              <input autoFocus type="text" style={inputStyle} placeholder="ej. Developer, Product Owner, Scrum Master..." value={role}
                onChange={e => setRole(e.target.value)} onKeyDown={e => e.key === "Enter" && role.trim() && handleFinish()} />
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: "14px", background: "transparent", border: "1px solid var(--panel-border)", borderRadius: "10px", color: "var(--text-muted)", cursor: "pointer" }}>
                <i className="fa-solid fa-arrow-left"></i> Atrás
              </button>
              <button className="action-btn" style={{ flex: 2, padding: "14px", fontSize: "1rem" }} disabled={!role.trim() || loading} onClick={handleFinish}>
                {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Configurando...</> : <><i className="fa-solid fa-rocket"></i> Entrar al Dashboard</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
