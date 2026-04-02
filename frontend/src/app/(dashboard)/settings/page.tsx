"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

// Types
type TeamMember = { user: { name: string; email: string }; role: string };
type ProjectTeam = { id: number; team: { id: number; name: string; description?: string; memberships: TeamMember[] } };
type Membership = { user: { name: string; email: string }; role: string; team: { name: string } | null };
type Sprint = { id: number; name: string; startDate: string | null; endDate: string | null; location: string | null; parentId: number | null; children?: Sprint[] };
type Project = { id: number; name: string; description: string | null; team: { name: string } | null; projectTeams: ProjectTeam[]; memberships: Membership[]; sprints: Sprint[] };
type Invitation = { id: number; token: string; projectRole: string; project: { name: string } | null; usedAt: string | null; createdAt: string };

const PROJECT_ROLES = ["Developer", "QA Engineer", "DevOps", "Designer", "Product Owner", "Scrum Master"];
const ORG_ROLES = ["member", "project_admin"];

const inputStyle = { width: "100%", padding: "10px 14px", background: "#0d0f1a", border: "1px solid rgba(69,243,255,0.2)", borderRadius: "8px", color: "#fff", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" as const };
const selectStyle = { ...inputStyle, cursor: "pointer" };
const labelStyle = { fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" };

export default function SettingsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [section, setSection] = useState<"overview" | "teams" | "members" | "invitations" | "sprints">("overview");

  // Modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [showInvModal, setShowInvModal] = useState(false);
  const [invForm, setInvForm] = useState({ name: "", email: "", projectId: "", role: "member", projectRole: "Developer" });
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [sprintForm, setSprintForm] = useState({ name: "", startDate: "", endDate: "", parentId: "" });
  const [newLink, setNewLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  // Edit overview
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/settings/projects").then(r => r.json()).then(d => {
      const data = d.projects || d; // Handle both old and new format
      if (Array.isArray(data)) {
        setProjects(data);
        if (!selectedProjectId && data.length > 0) setSelectedProjectId(data[0].id);
      }
      if (d.debug) console.log("Settings Debug:", d.debug);
    });
    fetch("/api/invitations").then(r => r.json()).then(d => { if (Array.isArray(d)) setInvitations(d); });
  };

  const loadSprints = () => {
    if (!selectedProjectId) return;
    fetch(`/api/settings/sprints?projectId=${selectedProjectId}`).then(r => r.json()).then(d => { if (Array.isArray(d)) setSprints(d); });
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (selectedProjectId && section === "sprints") loadSprints(); }, [selectedProjectId, section]);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  useEffect(() => {
    if (selectedProject) { setEditName(selectedProject.name); setEditDesc(selectedProject.description || ""); }
  }, [selectedProjectId, projects]);

  const saveProject = async () => {
    if (!selectedProject) return;
    setSaving(true);
    await fetch("/api/settings/projects", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: selectedProject.id, name: editName, description: editDesc }) });
    setSaving(false); load();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Cambios guardados correctamente',
      showConfirmButton: false,
      timer: 2000,
      background: '#1a1d2e',
      color: '#fff'
    });
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    const res = await fetch("/api/settings/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newProjectName }) });
    const data = await res.json();
    setNewProjectName(""); setShowProjectModal(false); load();
    if (data.project) setSelectedProjectId(data.project.id);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Proyecto creado!',
      showConfirmButton: false,
      timer: 2000,
      background: '#1a1d2e',
      color: '#fff'
    });
  };

  const createTeam = async () => {
    if (!newTeamName.trim() || !selectedProject) return;
    await fetch("/api/settings/teams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newTeamName, projectId: selectedProject.id }) });
    setNewTeamName(""); setShowTeamModal(false); load();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Equipo creado!',
      showConfirmButton: false,
      timer: 2000,
      background: '#1a1d2e',
      color: '#fff'
    });
  };

  const createSprint = async () => {
    if (!sprintForm.name.trim() || !selectedProject) return;
    await fetch("/api/settings/sprints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...sprintForm, projectId: selectedProject.id })
    });
    setSprintForm({ name: "", startDate: "", endDate: "", parentId: "" });
    setShowSprintModal(false);
    loadSprints();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Iteración creada!', showConfirmButton: false, timer: 2000, background: '#1a1d2e', color: '#fff' });
  };

  const deleteSprint = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar iteración?',
      text: "Esto no borrará las tareas, pero quedarán sin sprint asignado.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      confirmButtonText: 'Sí, eliminar',
      background: '#1a1d2e',
      color: '#fff'
    });
    if (result.isConfirmed) {
      await fetch(`/api/settings/sprints?id=${id}`, { method: "DELETE" });
      loadSprints();
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Eliminado', showConfirmButton: false, timer: 1500, background: '#1a1d2e', color: '#fff' });
    }
  };

  const createInvitation = async () => {
    const res = await fetch("/api/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...invForm, projectId: invForm.projectId ? parseInt(invForm.projectId) : null }) });
    const data = await res.json();
    if (data.token) { setNewLink(`${window.location.origin}/invite/${data.token}`); load(); }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Link copiado al portapapeles',
      showConfirmButton: false,
      timer: 1500,
      background: '#1a1d2e',
      color: '#fff'
    });
  };

  const navItem = (id: typeof section, label: string, icon: string) => (
    <button key={id} onClick={() => setSection(id)} style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 14px", borderRadius: "8px", border: "none", cursor: "pointer", textAlign: "left", fontSize: "0.88rem", background: section === id ? "rgba(69,243,255,0.1)" : "transparent", color: section === id ? "var(--primary)" : "var(--text-muted)", fontWeight: section === id ? 600 : 400 }}>
      <i className={`fa-solid ${icon}`} style={{ width: "16px" }}></i>{label}
    </button>
  );

  const admins = selectedProject?.memberships.filter(m => m.role === "Project Manager" || m.role === "project_admin") || [];
  const allMembers = selectedProject?.memberships || [];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* LEFT SIDEBAR */}
      <div style={{ width: "240px", flexShrink: 0, borderRight: "1px solid var(--panel-border)", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
        <div style={{ marginBottom: "20px" }}>
          <div className="meta-col" style={{ flex: 1 }}>
            <label style={labelStyle}>Seleccionar Proyecto</label>
            <select
              value={selectedProjectId || ""}
              onChange={e => { setSelectedProjectId(parseInt(e.target.value)); setSection("overview"); }}
              className="wi-select"
              style={{ width: "100%", marginBottom: "16px" }}
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button onClick={() => setShowProjectModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", width: "100%", background: "none", border: "none", color: "var(--primary)", fontSize: "0.8rem", cursor: "pointer", padding: "4px 0" }}>
            <i className="fa-solid fa-plus"></i> Nuevo proyecto
          </button>
        </div>

        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px", marginTop: "8px" }}>General</div>
        {navItem("overview", "Resumen", "fa-layer-group")}
        {navItem("teams", "Equipos", "fa-users")}
        {navItem("members", "Miembros", "fa-id-card")}
        {navItem("sprints", "Sprints", "fa-calendar-days")}

        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px", marginTop: "16px" }}>Accesos</div>
        {navItem("invitations", "Invitaciones", "fa-envelope-open-text")}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
        
        {/* EMPTY STATE OR LOADING */}
        {!selectedProject && section !== "invitations" && (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
            <i className="fa-solid fa-folder-open" style={{ fontSize: "3rem", marginBottom: "20px", opacity: 0.3 }}></i>
            {projects.length === 0 ? (
              <>
                <h3 style={{ color: "#fff", marginBottom: "8px" }}>No hay proyectos</h3>
                <p style={{ marginBottom: "24px" }}>Crea tu primer proyecto para empezar a configurar equipos y miembros.</p>
                <button className="action-btn" onClick={() => setShowProjectModal(true)}>
                  <i className="fa-solid fa-plus"></i> Crear Proyecto
                </button>
              </>
            ) : (
              <p>Selecciona un proyecto de la lista para ver sus detalles.</p>
            )}
          </div>
        )}

        {/* OVERVIEW */}
        {section === "overview" && selectedProject && (
          <div style={{ maxWidth: "700px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
               <h2 style={{ fontSize: "1.6rem", fontWeight: 700 }}>Detalles del Proyecto</h2>
               <span style={{ fontSize: "0.75rem", padding: "2px 8px", background: "rgba(69,243,255,0.1)", color: "var(--primary)", borderRadius: "4px", border: "1px solid rgba(69,243,255,0.2)" }}>ID: {selectedProject.id}</span>
            </div>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>Configura la información básica y administradores de {selectedProject.name}.</p>

            <div className="glass-panel" style={{ padding: "28px", marginBottom: "24px" }}>
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Nombre del Proyecto</label>
                <input type="text" style={inputStyle} value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Descripción</label>
                <textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Describe el objetivo de este proyecto..." />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="action-btn" style={{ padding: "10px 32px" }} onClick={saveProject} disabled={saving}>
                  {saving ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Guardando...</> : "Guardar Cambios"}
                </button>
              </div>
            </div>

            {/* Project Admins */}
            <div className="glass-panel" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Administradores del Proyecto</h3>
                <button onClick={() => { setInvForm({ ...invForm, projectId: String(selectedProject.id), role: "project_admin" }); setShowInvModal(true); setNewLink(""); }} className="action-btn" style={{ padding: "7px 16px", fontSize: "0.85rem" }}>
                  <i className="fa-solid fa-user-plus"></i> Agregar
                </button>
              </div>
              {admins.length ? admins.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: i < admins.length - 1 ? "1px solid var(--panel-border)" : "none" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{m.user.name.charAt(0).toUpperCase()}</div>
                  <div><div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{m.user.name}</div><div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{m.user.email}</div></div>
                </div>
              )) : <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Sin administradores asignados todavía.</p>}
            </div>
          </div>
        )}

        {/* TEAMS */}
        {section === "teams" && selectedProject && (
          <div style={{ maxWidth: "900px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
              <div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "4px" }}>Equipos</h2>
                <p style={{ color: "var(--text-muted)" }}>{selectedProject.name} · {selectedProject.projectTeams.length} equipo(s)</p>
              </div>
              <button className="action-btn" style={{ padding: "10px 20px" }} onClick={() => setShowTeamModal(true)}>
                <i className="fa-solid fa-plus"></i> Nuevo Equipo
              </button>
            </div>

            <div className="glass-panel" style={{ overflow: "hidden" }}>
              {selectedProject.projectTeams.length ? (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--panel-border)" }}>
                      {["Equipo", "Descripción", "Miembros"].map(h => (
                        <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProject.projectTeams.map(pt => (
                      <tr key={pt.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg, rgba(69,243,255,0.2), rgba(124,58,237,0.2))", border: "1px solid rgba(69,243,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <i className="fa-solid fa-users" style={{ color: "var(--primary)", fontSize: "0.85rem" }}></i>
                            </div>
                            <span style={{ fontWeight: 600 }}>{pt.team.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>{pt.team.description || "—"}</td>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{ display: "flex" }}>
                              {pt.team.memberships.slice(0, 4).map((m, i) => (
                                <div key={i} title={m.user.name} style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), #7c3aed)", border: "2px solid var(--bg-color)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#fff", marginLeft: i > 0 ? "-8px" : "0" }}>
                                  {m.user.name.charAt(0).toUpperCase()}
                                </div>
                              ))}
                              {pt.team.memberships.length > 4 && <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "2px solid var(--bg-color)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "var(--text-muted)", marginLeft: "-8px" }}>+{pt.team.memberships.length - 4}</div>}
                            </div>
                            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{pt.team.memberships.length}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: "60px", textAlign: "center" }}>
                  <i className="fa-solid fa-users" style={{ fontSize: "2rem", color: "var(--text-muted)", marginBottom: "16px", display: "block" }}></i>
                  <p style={{ color: "var(--text-muted)" }}>No hay equipos en este proyecto todavía.</p>
                  <button className="action-btn" style={{ marginTop: "16px", padding: "10px 20px" }} onClick={() => setShowTeamModal(true)}>Crear primer equipo</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MEMBERS */}
        {section === "members" && selectedProject && (
          <div style={{ maxWidth: "900px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
              <div><h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "4px" }}>Miembros</h2><p style={{ color: "var(--text-muted)" }}>{selectedProject.name}</p></div>
              <button className="action-btn" style={{ padding: "10px 20px" }} onClick={() => { setInvForm({ ...invForm, projectId: String(selectedProject.id) }); setShowInvModal(true); setNewLink(""); }}>
                <i className="fa-solid fa-user-plus"></i> Invitar
              </button>
            </div>
            <div className="glass-panel" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid var(--panel-border)" }}>
                  {["Nombre", "Correo", "Equipo", "Rol"].map(h => <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {allMembers.map((m, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{m.user.name.charAt(0).toUpperCase()}</div>
                          <span style={{ fontWeight: 500 }}>{m.user.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>{m.user.email}</td>
                      <td style={{ padding: "14px 20px", fontSize: "0.85rem", color: "var(--text-muted)" }}>{m.team?.name || "—"}</td>
                      <td style={{ padding: "14px 20px" }}><span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "10px", background: "rgba(69,243,255,0.08)", color: "var(--primary)", border: "1px solid rgba(69,243,255,0.15)" }}>{m.role}</span></td>
                    </tr>
                  ))}
                  {!allMembers.length && <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Sin miembros todavía.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INVITATIONS */}
        {section === "invitations" && (
          <div style={{ maxWidth: "900px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
              <div><h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "4px" }}>Invitaciones</h2><p style={{ color: "var(--text-muted)" }}>Links de acceso generados para tu organización</p></div>
              <button className="action-btn" style={{ padding: "10px 20px" }} onClick={() => { setShowInvModal(true); setNewLink(""); }}>
                <i className="fa-solid fa-user-plus"></i> Invitar persona
              </button>
            </div>
            <div className="glass-panel" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid var(--panel-border)" }}>
                  {["Proyecto", "Rol", "Creada", "Estado", "Link"].map(h => <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {invitations.map(inv => (
                    <tr key={inv.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "14px 20px", fontSize: "0.85rem" }}>{inv.project?.name || "Organización"}</td>
                      <td style={{ padding: "14px 20px", fontSize: "0.85rem" }}>{inv.projectRole}</td>
                      <td style={{ padding: "14px 20px", fontSize: "0.82rem", color: "var(--text-muted)" }}>{new Date(inv.createdAt).toLocaleDateString("es-MX")}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "10px", background: inv.usedAt ? "rgba(255,95,86,0.1)" : "rgba(69,243,255,0.08)", color: inv.usedAt ? "var(--danger)" : "var(--success)", border: `1px solid ${inv.usedAt ? "rgba(255,95,86,0.2)" : "rgba(69,243,255,0.2)"}` }}>
                          {inv.usedAt ? "Usado" : "Pendiente"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <button onClick={() => copyLink(`${window.location.origin}/invite/${inv.token}`)} style={{ background: "rgba(69,243,255,0.08)", border: "1px solid rgba(69,243,255,0.2)", color: "var(--primary)", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem" }}>
                          <i className="fa-solid fa-copy" style={{ marginRight: "5px" }}></i>Copiar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!invitations.length && <tr><td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No hay invitaciones todavía.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SPRINTS / ITERATIONS */}
        {section === "sprints" && selectedProject && (
          <div style={{ maxWidth: "1000px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
              <div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "4px" }}>Iteraciones</h2>
                <p style={{ color: "var(--text-muted)" }}>Gestiona los ciclos y sprints para {selectedProject.name}</p>
              </div>
              <button className="action-btn" style={{ padding: "10px 20px" }} onClick={() => setShowSprintModal(true)}>
                <i className="fa-solid fa-plus"></i> Nueva Iteración
              </button>
            </div>

            <div className="glass-panel" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--panel-border)" }}>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Iteraciones</th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Fecha Inicio</th>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Fecha Fin</th>
                    <th style={{ width: "80px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {sprints.filter(s => !s.parentId).map(root => (
                    <React.Fragment key={root.id}>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "14px 20px", fontWeight: 600 }}>
                          <i className="fa-solid fa-chevron-down" style={{ fontSize: "0.7rem", marginRight: "10px", color: "var(--primary)" }}></i>
                          {root.name}
                        </td>
                        <td style={{ padding: "14px 20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>{root.startDate ? new Date(root.startDate).toLocaleDateString() : "—"}</td>
                        <td style={{ padding: "14px 20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>{root.endDate ? new Date(root.endDate).toLocaleDateString() : "—"}</td>
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <button onClick={() => deleteSprint(root.id)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", opacity: 0.6 }}><i className="fa-solid fa-trash-can"></i></button>
                        </td>
                      </tr>
                      {sprints.filter(s => s.parentId === root.id).map(child => (
                        <tr key={child.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", background: "rgba(255,255,255,0.01)" }}>
                          <td style={{ padding: "12px 20px 12px 48px", fontSize: "0.9rem" }}>
                            <i className="fa-solid fa-calendar-check" style={{ fontSize: "0.8rem", marginRight: "10px", color: "var(--warning)", opacity: 0.7 }}></i>
                            {child.name}
                          </td>
                          <td style={{ padding: "12px 20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>{child.startDate ? new Date(child.startDate).toLocaleDateString() : "—"}</td>
                          <td style={{ padding: "12px 20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>{child.endDate ? new Date(child.endDate).toLocaleDateString() : "—"}</td>
                          <td style={{ padding: "12px 20px", textAlign: "right" }}>
                            <button onClick={() => deleteSprint(child.id)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", opacity: 0.5 }}><i className="fa-solid fa-trash-can"></i></button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  {!sprints.length && <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No hay iteraciones definidas.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: New Project */}
      {showProjectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ padding: "32px", width: "420px", background: "#1a1d2e", borderRadius: "16px", border: "1px solid rgba(69,243,255,0.15)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
            <h3 style={{ marginBottom: "20px" }}><i className="fa-solid fa-folder-plus" style={{ color: "var(--primary)", marginRight: "10px" }}></i>Nuevo Proyecto</h3>
            <input type="text" style={inputStyle} placeholder="Nombre del proyecto" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} onKeyDown={e => e.key === "Enter" && createProject()} />
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid var(--panel-border)", borderRadius: "8px", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setShowProjectModal(false)}>Cancelar</button>
              <button className="action-btn" style={{ flex: 2, padding: "12px" }} onClick={createProject}><i className="fa-solid fa-plus"></i> Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: New Team */}
      {showTeamModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ padding: "32px", width: "420px", background: "#1a1d2e", borderRadius: "16px", border: "1px solid rgba(69,243,255,0.15)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
            <h3 style={{ marginBottom: "20px" }}><i className="fa-solid fa-users" style={{ color: "var(--primary)", marginRight: "10px" }}></i>Nuevo Equipo en <span style={{ color: "var(--primary)" }}>{selectedProject?.name}</span></h3>
            <input type="text" style={inputStyle} placeholder="ej. Equipo Backend, Mobile Team..." value={newTeamName} onChange={e => setNewTeamName(e.target.value)} onKeyDown={e => e.key === "Enter" && createTeam()} />
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid var(--panel-border)", borderRadius: "8px", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setShowTeamModal(false)}>Cancelar</button>
              <button className="action-btn" style={{ flex: 2, padding: "12px" }} onClick={createTeam}><i className="fa-solid fa-plus"></i> Crear Equipo</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Invite */}
      {showInvModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ padding: "32px", width: "480px", background: "#1a1d2e", borderRadius: "16px", border: "1px solid rgba(69,243,255,0.15)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
            <h3 style={{ marginBottom: "20px" }}><i className="fa-solid fa-user-plus" style={{ color: "var(--primary)", marginRight: "10px" }}></i>Invitar Persona</h3>
            {newLink ? (
              <div>
                <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>Comparte este link único. Expira en 7 días.</p>
                <div style={{ background: "rgba(69,243,255,0.06)", border: "1px solid rgba(69,243,255,0.2)", borderRadius: "8px", padding: "12px 16px", fontFamily: "monospace", fontSize: "0.8rem", wordBreak: "break-all", color: "var(--primary)", marginBottom: "16px" }}>{newLink}</div>
                <button className="action-btn" style={{ width: "100%", padding: "12px" }} onClick={() => copyLink(newLink)}><i className={`fa-solid ${linkCopied ? "fa-check" : "fa-copy"}`} style={{ marginRight: "6px" }}></i>{linkCopied ? "¡Copiado!" : "Copiar Link"}</button>
                <button style={{ width: "100%", marginTop: "10px", padding: "10px", background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => { setShowInvModal(false); setNewLink(""); }}>Cerrar</button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div><label style={labelStyle}>Nombre de la persona</label><input type="text" style={inputStyle} placeholder="Juan Pérez" value={invForm.name} onChange={e => setInvForm({ ...invForm, name: e.target.value })} /></div>
                  <div><label style={labelStyle}>Email (opcional)</label><input type="email" style={inputStyle} placeholder="persona@empresa.com" value={invForm.email} onChange={e => setInvForm({ ...invForm, email: e.target.value })} /></div>
                  <div><label style={labelStyle}>Proyecto</label>
                    <select style={selectStyle} value={invForm.projectId} onChange={e => setInvForm({ ...invForm, projectId: e.target.value })}>
                      <option value="" style={{ background: "#0d0f1a" }}>Sin asignar</option>
                      {projects.map(p => <option key={p.id} value={p.id} style={{ background: "#0d0f1a" }}>{p.name}</option>)}
                    </select></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div><label style={labelStyle}>Rol en la org</label>
                      <select style={selectStyle} value={invForm.role} onChange={e => setInvForm({ ...invForm, role: e.target.value })}>
                        {ORG_ROLES.map(r => <option key={r} value={r} style={{ background: "#0d0f1a" }}>{r === "member" ? "Miembro" : "Admin"}</option>)}
                      </select></div>
                    <div><label style={labelStyle}>Rol en el proyecto</label>
                      <select style={selectStyle} value={invForm.projectRole} onChange={e => setInvForm({ ...invForm, projectRole: e.target.value })}>
                        {PROJECT_ROLES.map(r => <option key={r} value={r} style={{ background: "#0d0f1a" }}>{r}</option>)}
                      </select></div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                  <button style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid var(--panel-border)", borderRadius: "8px", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setShowInvModal(false)}>Cancelar</button>
                  <button className="action-btn" style={{ flex: 2, padding: "12px" }} onClick={createInvitation}><i className="fa-solid fa-link"></i> Generar Link</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL: New Sprint */}
      {showSprintModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ padding: "32px", width: "450px", background: "#1a1d2e", borderRadius: "16px", border: "1px solid rgba(69,243,255,0.15)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
            <h3 style={{ marginBottom: "20px" }}><i className="fa-solid fa-calendar-plus" style={{ color: "var(--primary)", marginRight: "10px" }}></i>Nueva Iteración</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Iteration name</label>
                <input type="text" style={inputStyle} placeholder="ej. Sprint 1" value={sprintForm.name} onChange={e => setSprintForm({ ...sprintForm, name: e.target.value })} />
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Start date</label>
                  <input type="date" style={{ ...inputStyle, colorScheme: "dark" }} value={sprintForm.startDate} onChange={e => setSprintForm({ ...sprintForm, startDate: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>End date</label>
                  <input type="date" style={{ ...inputStyle, colorScheme: "dark" }} value={sprintForm.endDate} onChange={e => setSprintForm({ ...sprintForm, endDate: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Location (Parent)</label>
                <select className="wi-select" style={{ width: "100%" }} value={sprintForm.parentId} onChange={e => setSprintForm({ ...sprintForm, parentId: e.target.value })}>
                  <option value="">Root (No parent)</option>
                  {sprints.filter(s => !s.parentId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
              <button style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid var(--panel-border)", borderRadius: "8px", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setShowSprintModal(false)}>Cancelar</button>
              <button className="action-btn" style={{ flex: 2, padding: "12px", background: "var(--primary)", color: "#000" }} onClick={createSprint}>Save and close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
