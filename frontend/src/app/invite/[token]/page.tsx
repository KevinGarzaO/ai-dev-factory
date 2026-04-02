"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type InviteInfo = {
  orgName: string; orgId: number;
  projectName: string | null; projectId: number | null;
  teamName: string | null; teamId: number | null;
  role: string; projectRole: string;
};

export default function InvitePage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/invitations?token=${token}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setInfo(d); });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/invitations/${token}/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/"), 2000);
      } else {
        setError(data.error || "Error al registrar");
      }
    } catch {
      setError("Error de red");
    }
    setLoading(false);
  };

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100vw" }}>
      <div className="glass-panel" style={{ padding: "40px", textAlign: "center", maxWidth: "400px" }}>
        <i className="fa-solid fa-circle-xmark" style={{ fontSize: "3rem", color: "var(--danger)", marginBottom: "16px" }}></i>
        <h2>Link Inválido</h2>
        <p style={{ color: "var(--text-muted)", margin: "16px 0" }}>{error}</p>
        <Link href="/login" className="action-btn" style={{ display: "inline-block", padding: "12px 24px", textDecoration: "none" }}>Ir al Login</Link>
      </div>
    </div>
  );

  if (!info) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100vw" }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem", color: "var(--primary)" }}></i>
    </div>
  );

  if (success) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100vw" }}>
      <div className="glass-panel" style={{ padding: "40px", textAlign: "center", maxWidth: "400px" }}>
        <i className="fa-solid fa-circle-check" style={{ fontSize: "3rem", color: "var(--success)", marginBottom: "16px" }}></i>
        <h2>¡Bienvenido a {info.orgName}!</h2>
        <p style={{ color: "var(--text-muted)" }}>Redirigiendo...</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* Left branding */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px", background: "linear-gradient(135deg, #0d0e14 0%, #0b1a2e 50%, #051225 100%)", borderRight: "1px solid rgba(69,243,255,0.1)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(69,243,255,0.12) 0%, transparent 70%)", top: "-80px", left: "-80px", borderRadius: "50%" }}></div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "48px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #45f3ff, #1192ff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fa-solid fa-code-branch" style={{ color: "#fff", fontSize: "1.4rem" }}></i>
            </div>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, background: "linear-gradient(90deg, #fff, #45f3ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI DevOps Factory</h1>
            </div>
          </div>

          <div style={{ background: "rgba(69,243,255,0.06)", border: "1px solid rgba(69,243,255,0.2)", borderRadius: "16px", padding: "32px", marginBottom: "32px" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>Fuiste invitado a unirte</p>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", marginBottom: "24px" }}>{info.orgName}</h2>
            {[
              { label: "Proyecto", value: info.projectName, icon: "fa-folder-open" },
              { label: "Equipo", value: info.teamName, icon: "fa-users" },
              { label: "Tu Rol", value: info.projectRole, icon: "fa-id-badge" }
            ].filter(i => i.value).map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(69,243,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`fa-solid ${item.icon}`} style={{ color: "var(--primary)", fontSize: "0.85rem" }}></i>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{item.label}</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff" }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Este link es personal y de un solo uso. Una vez que te registres, tendrás acceso inmediato al dashboard.</p>
        </div>
      </div>

      {/* Right form */}
      <div style={{ width: "460px", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px", background: "var(--bg-color)", flexShrink: 0 }}>
        <div style={{ marginBottom: "36px" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Crear tu cuenta</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>Completa tu perfil para unirte al equipo</p>
        </div>
        {error && <div style={{ background: "rgba(255,95,86,0.1)", color: "var(--danger)", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", border: "1px solid rgba(255,95,86,0.2)" }}><i className="fa-solid fa-circle-exclamation" style={{ marginRight: "8px" }}></i>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}><i className="fa-solid fa-user" style={{ color: "var(--primary)", marginRight: "6px" }}></i>Tu Nombre</label>
            <input required type="text" className="wi-select" style={{ width: "100%", padding: "14px 16px" }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Juan Pérez" />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}><i className="fa-solid fa-envelope" style={{ color: "var(--primary)", marginRight: "6px" }}></i>Correo Electrónico</label>
            <input required type="email" className="wi-select" style={{ width: "100%", padding: "14px 16px" }} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="juan@empresa.com" />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}><i className="fa-solid fa-lock" style={{ color: "var(--primary)", marginRight: "6px" }}></i>Contraseña</label>
            <input required type="password" className="wi-select" style={{ width: "100%", padding: "14px 16px" }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" minLength={8} />
          </div>
          <button type="submit" className="action-btn" style={{ padding: "16px", fontSize: "1rem", marginTop: "8px", width: "100%" }} disabled={loading}>
            {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Creando cuenta...</> : <><i className="fa-solid fa-rocket"></i> Unirme al Equipo</>}
          </button>
        </form>
        <p style={{ marginTop: "24px", fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center" }}>
          ¿Ya tienes cuenta? <Link href="/login" style={{ color: "var(--primary)", textDecoration: "none" }}>Iniciar Sesión</Link>
        </p>
      </div>
    </div>
  );
}
