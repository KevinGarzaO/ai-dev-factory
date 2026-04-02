"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/${encodeURIComponent(data.orgName)}/${encodeURIComponent(data.projectName)}/backlogs/board/${encodeURIComponent(data.teamName)}`);
      } else {
        setError(data.error || "Credenciales inválidas");
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
        background: "linear-gradient(135deg, #0d0e14 0%, #0b1a2e 50%, #051225 100%)",
        borderRight: "1px solid rgba(69,243,255,0.1)", position: "relative", overflow: "hidden"
      }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(69,243,255,0.12) 0%, transparent 70%)", top: "-80px", left: "-80px", borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(138,43,226,0.1) 0%, transparent 70%)", bottom: "-60px", right: "-60px", borderRadius: "50%" }}></div>

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "48px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #45f3ff, #1192ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
              <i className="fa-solid fa-code-branch" style={{ color: "#fff" }}></i>
            </div>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, background: "linear-gradient(90deg, #fff, #45f3ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI DevOps Factory</h1>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>Plataforma Autónoma para Equipos de Desarrollo</p>
            </div>
          </div>

          {/* Headline */}
          <h2 style={{ fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2, marginBottom: "20px", color: "#fff" }}>
            Desarrolla más rápido con <span style={{ color: "var(--primary)" }}>Inteligencia Artificial</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "40px", maxWidth: "480px" }}>
            Gestiona sprints, backlogs y equipos completos. Deja que los agentes de IA generen, planifiquen y ejecuten tareas de software por ti.
          </p>

          {/* Features */}
          {[
            { icon: "fa-robot", title: "Agentes Autónomos", desc: "La IA crea y ejecuta tareas de código automáticamente" },
            { icon: "fa-layer-group", title: "Gestión Enterprise", desc: "Organizaciones, equipos, proyectos y sprints en un solo lugar" },
            { icon: "fa-code-branch", title: "Integración con GitHub", desc: "Ramas, commits y Pull Requests creados automáticamente" },
          ].map(f => (
            <div key={f.icon} style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "24px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(69,243,255,0.08)", border: "1px solid rgba(69,243,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className={`fa-solid ${f.icon}`} style={{ color: "var(--primary)", fontSize: "1rem" }}></i>
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "#fff", marginBottom: "3px" }}>{f.title}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div style={{ width: "480px", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px", background: "var(--bg-color)", flexShrink: 0 }}>
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "8px" }}>Bienvenido de vuelta</h2>
          <p style={{ color: "var(--text-muted)" }}>Ingresa a tu espacio de trabajo</p>
        </div>

        {error && (
          <div style={{ background: "rgba(255,95,86,0.1)", color: "var(--danger)", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", fontSize: "0.9rem", border: "1px solid rgba(255,95,86,0.2)" }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "8px" }}></i>{error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>Correo Electrónico</label>
            <input required type="email" className="wi-select" style={{ width: "100%", padding: "14px 16px" }} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="tu@empresa.com" />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>Contraseña</label>
            <input required type="password" className="wi-select" style={{ width: "100%", padding: "14px 16px" }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          <button type="submit" className="action-btn" style={{ padding: "16px", fontSize: "1rem", marginTop: "8px", width: "100%" }} disabled={loading}>
            {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Autenticando...</> : "Iniciar Sesión"}
          </button>
        </form>

        <p style={{ marginTop: "32px", fontSize: "0.9rem", color: "var(--text-muted)", textAlign: "center" }}>
          ¿No tienes cuenta? <Link href="/register" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>Crea tu empresa →</Link>
        </p>
      </div>
    </div>
  );
}
