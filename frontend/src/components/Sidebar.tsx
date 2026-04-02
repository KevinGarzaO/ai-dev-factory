"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserInfo = {
  name: string;
  email: string;
  orgName: string;
  role: string;
  teamName: string;
  projectName: string;
};

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(d => { if (d) setUserInfo(d); });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Contextual Enterprise Routing
  const org = params.organization ? decodeURIComponent(params.organization as string) : (userInfo?.orgName || "Mi Empresa");
  const proj = params.project ? decodeURIComponent(params.project as string) : (userInfo?.projectName || "Proyecto");
  const team = params.team ? decodeURIComponent(params.team as string) : (userInfo?.teamName || "Mi Equipo");
  const sprintFallback = `${proj}/Sprint 1`;

  const backlogUrl = `/${encodeURIComponent(org)}/${encodeURIComponent(proj)}/backlogs/board/${encodeURIComponent(team)}`;
  const sprintUrl = `/${encodeURIComponent(org)}/${encodeURIComponent(proj)}/sprints/taskboard/${encodeURIComponent(team)}/${encodeURIComponent(sprintFallback)}`;

  const initials = userInfo?.name?.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() || "?";

  return (
    <aside className="sidebar glass-panel">
      {/* Brand */}
      <div className="brand">
        <div className="logo-icon" style={{ color: "var(--primary)", fontSize: "1.5rem" }}>
          <i className="fa-solid fa-code-branch"></i>
        </div>
        <h1>AI DevOps</h1>
      </div>

      {/* Org + Project Breadcrumb */}
      {userInfo && (
        <div style={{ padding: "12px 16px", margin: "0 -4px 8px", background: "rgba(69,243,255,0.04)", borderRadius: "8px", border: "1px solid rgba(69,243,255,0.08)" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}><i className="fa-solid fa-building" style={{ marginRight: "4px" }}></i>Organización</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "8px" }}>{userInfo.orgName}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}><i className="fa-solid fa-folder-open" style={{ marginRight: "4px" }}></i>Proyecto actual</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)" }}>{userInfo.projectName || proj}</div>
        </div>
      )}

      {/* Nav */}
      <nav className="nav-menu">
        <Link href={backlogUrl} className={`nav-item ${pathname?.includes('/backlogs') || pathname === '/' ? 'active' : ''}`}>
          <span className="icon"><i className="fa-solid fa-list-check"></i></span>
          <span>Backlog</span>
        </Link>
        <Link href={sprintUrl} className={`nav-item ${pathname?.includes('/sprints') ? 'active' : ''}`}>
          <span className="icon"><i className="fa-solid fa-route"></i></span>
          <span>Sprint Activo</span>
        </Link>
        <Link href="/settings" className={`nav-item ${pathname?.includes('/settings') ? 'active' : ''}`}>
          <span className="icon"><i className="fa-solid fa-gear"></i></span>
          <span>Configuración</span>
        </Link>
      </nav>

      {/* User Card + Logout */}
      <div className="agent-status" style={{ marginTop: "auto", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          <i className="fa-solid fa-robot" style={{ color: "var(--primary)" }}></i> Claude Haiku 4
        </p>
        <div className="status-indicator online">Online & Listo</div>

        {userInfo && (
          <div style={{ marginTop: "8px", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid var(--panel-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", color: "#fff", flexShrink: 0 }}>{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userInfo.name}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userInfo.email}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: "10px", background: "rgba(69,243,255,0.1)", color: "var(--primary)", border: "1px solid rgba(69,243,255,0.2)" }}>{userInfo.role}</span>
              {userInfo.teamName && <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", border: "1px solid var(--panel-border)" }}>{userInfo.teamName}</span>}
            </div>
          </div>
        )}

        <button onClick={handleLogout} style={{ background: "rgba(255,95,86,0.1)", color: "var(--danger)", border: "1px solid rgba(255,95,86,0.25)", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", width: "100%" }}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
