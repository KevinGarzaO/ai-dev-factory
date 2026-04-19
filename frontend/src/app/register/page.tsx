"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ companyName: "", name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem("onboarding", JSON.stringify({
          orgId: data.orgId,
          userId: data.userId,
          orgName: data.orgName,
          defaultTeamId: data.defaultTeamId,
          defaultProjectId: data.defaultProjectId
        }));
        router.push("/onboarding");
      } else {
        setError(data.error || "Error al registrar");
      }
    } catch {
      setError("Error de red");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* LEFT PANEL - Branding */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px",
        background: "linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0f172a 100%)",
        borderRight: "1px solid rgba(78,204,163,0.1)", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(78,204,163,0.12) 0%, transparent 70%)", top: "-80px", left: "-80px", borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(78,204,163,0.1) 0%, transparent 70%)", bottom: "-60px", right: "-60px", borderRadius: "50%" }}></div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "48px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #4ECCA3, #10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
              <i className="fa-solid fa-code-branch" style={{ color: "#fff" }}></i>
            </div>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, background: "linear-gradient(90deg, #fff, #4ECCA3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SpecForge-TX</h1>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>SDD para builders latinos</p>
            </div>
          </div>

          <h2 style={{ fontSize: "2.2rem", fontWeight: 700, lineHeight: 1.2, marginBottom: "20px", color: "#fff" }}>
            Tu proyecto. Tu metodología. <span style={{ color: "var(--primary)" }}>Tu agente.</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.6, marginBottom: "40px" }}>
            En 1 comando tienes todo listo para desarrollar con IA y metodología SDD.
          </p>

          <div style={{ background: "rgba(78,204,163,0.04)", border: "1px solid rgba(78,204,163,0.15)", borderRadius: "12px", padding: "24px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>LO QUE OBTIENES:</p>
            {["Metodología SDD instalada", "Slash commands configurados", "Mapa del proyecto generado", "Tasks sincronizadas", "RAG index listo"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <i className="fa-solid fa-circle-check" style={{ color: "var(--success)", fontSize: "0.9rem" }}></i>
                <span style={{ fontSize: "0.9rem", color: "#fff" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div style={{ width: "520px", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px", background: "var(--bg-color)", flexShrink: 0, overflowY: "auto" }}>
        <div style={{ marginBottom: "36px" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "8px" }}>Únete como builder</h2>
          <p style={{ color: "var(--text-muted)" }}>Configura tu workspace en segundos</p>
        </div>

        {error && (
          <div style={{ background: "rgba(255,95,86,0.1)", color: "var(--danger)", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", fontSize: "0.9rem", border: "1px solid rgba(255,95,86,0.2)" }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "8px" }}></i>{error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
              <i className="fa-solid fa-folder" style={{ marginRight: "6px", color: "var(--primary)" }}></i>Nombre de tu proyecto o workspace
            </label>
            <input required type="text" className="wi-select" style={{ width: "100%", padding: "14px 16px" }} value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="ej. mi-proyecto" />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
              <i className="fa-solid fa-user" style={{ marginRight: "6px", color: "var(--primary)" }}></i>Tu nombre, builder
            </label>
            <input required type="text" className="wi-select" style={{ width: "100%", padding: "14px 16px" }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Tu nombre" />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
              <i className="fa-solid fa-envelope" style={{ marginRight: "6px", color: "var(--primary)" }}></i>Correo Electrónico
            </label>
            <input required type="email" className="wi-select" style={{ width: "100%", padding: "14px 16px" }} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
              <i className="fa-solid fa-lock" style={{ marginRight: "6px", color: "var(--primary)" }}></i>Contraseña
            </label>
            <input required type="password" className="wi-select" style={{ width: "100%", padding: "14px 16px" }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" minLength={8} />
          </div>
          <button type="submit" className="action-btn" style={{ padding: "16px", fontSize: "1rem", marginTop: "8px", width: "100%" }} disabled={loading}>
            {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Creando workspace...</> : <><i className="fa-solid fa-rocket"></i> Crear mi workspace gratis 🥑</>}
          </button>
        </form>

        <p style={{ marginTop: "28px", fontSize: "0.9rem", color: "var(--text-muted)", textAlign: "center" }}>
          ¿Ya eres builder? <Link href="/login" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>Inicia sesión →</Link>
        </p>
      </div>
    </div>
  );
}
