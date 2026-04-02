"use client";

import React, { useState, useEffect } from "react";
import { useBacklog } from "@/context/BacklogContext";
import AgentTerminal from "./AgentTerminal";
import { useParams } from "next/navigation";

export default function BacklogTable() {
  const { backlogData, setSelectedItem, refreshBacklog, setShowTerminal, setTerminalPrompt } = useBacklog();
  const params = useParams();
  
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [userInfo, setUserInfo] = useState<{ projectId: number | null } | null>(null);
  const [showNewMenu, setShowNewMenu] = useState(false);

  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(d => { if (d) setUserInfo(d); });
  }, []);

  const handleAiSubmit = () => {
    if (!aiPrompt.trim()) return;
    setShowPromptModal(false);
    setTerminalPrompt(aiPrompt);
    setShowTerminal(true);
  };

  const handleTerminalClose = () => {
    setAiPrompt("");
    if (refreshBacklog) refreshBacklog();
  };

  const handleNewItem = (type: string) => {
    setSelectedItem({ 
      type: type.toLowerCase() === 'user story' ? 'story' : 'task', 
      id: 0, 
      parentId: undefined 
    });
    setShowNewMenu(false);
  };

  return (
    <main className="view-container">
      {/* TABLE */}
      <div className="view-header" onClick={() => setShowNewMenu(false)}>
        <div className="backlog-toolbar" style={{ marginBottom: "24px" }}>
          <div className="custom-dropdown">
            <button className="action-btn" onClick={(e) => { e.stopPropagation(); setShowNewMenu(!showNewMenu); }}>
              <i className="fa-solid fa-plus"></i> New Work Item <i className="fa-solid fa-chevron-down" style={{ fontSize: "0.7rem", opacity: 0.7 }}></i>
            </button>
            {showNewMenu && (
              <div className="dropdown-menu" style={{ display: "block" }}>
                <div className="dropdown-item" onClick={() => handleNewItem("User Story")}>
                  <i className="fa-solid fa-book-open" style={{ color: "var(--primary)" }}></i> User Story
                </div>
                <div className="dropdown-item" onClick={() => handleNewItem("Task")}>
                  <i className="fa-solid fa-check-square" style={{ color: "var(--warning)" }}></i> Task
                </div>
                <div className="dropdown-item" onClick={() => handleNewItem("Bug")}>
                  <i className="fa-solid fa-bug" style={{ color: "var(--danger)" }}></i> Bug
                </div>
              </div>
            )}
          </div>
          <button 
            className="action-btn" 
            style={{ 
                background: "rgba(167, 139, 250, 0.12)", 
                color: "#a78bfa", 
                border: "1px solid rgba(167, 139, 250, 0.25)",
                marginLeft: "12px"
            }} 
            onClick={() => setShowPromptModal(true)}
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i> AI Agent Generate
          </button>
        </div>

        <table className="devops-table">
          <thead>
            <tr>
              <th style={{ width: "50px", textAlign: "center" }}>Order</th>
              <th>Work Item Type</th>
              <th>ID</th>
              <th style={{ width: "40%" }}>Title</th>
              <th>State</th>
              <th>Assigned To</th>
              <th>Iteration Path</th>
            </tr>
          </thead>
          <tbody>
            {backlogData.map((story, index) => (
              <React.Fragment key={story.id}>
                <tr className="table-row" onClick={() => setSelectedItem({ type: 'story', id: story.id })}>
                  <td align="center">{index + 1}</td>
                  <td><i className="fa-solid fa-book-open" style={{ color: "#45f3ff" }}></i> User Story</td>
                  <td>{story.id}</td>
                  <td style={{ fontWeight: 500 }}>
                    <i className="fa-solid fa-chevron-down" style={{ fontSize: "0.7rem", marginRight: "6px", color: "var(--text-muted)" }}></i>
                    <i className="fa-solid fa-book" style={{ color: "#fff", marginRight: "6px" }}></i> {story.title}
                  </td>
                  <td><span className={`state-dot ${story.state.toLowerCase().replace(' ', '-')}`}></span> {story.state}</td>
                  <td>{story.assignee}</td>
                  <td>AI-Factory\\{story.sprint}</td>
                </tr>
                {story.tasks.map(task => {
                  let stateColor = task.state === 'Done' || task.state === 'Closed' ? 'closed' : (task.state === 'In Progress' ? 'active' : 'new');
                  return (
                    <tr key={task.id} className="table-row" onClick={(e) => { e.stopPropagation(); setSelectedItem({ type: 'task', id: task.id, parentId: story.id }); }}>
                      <td align="center"></td>
                      <td style={{ paddingLeft: "24px" }}><i className="fa-solid fa-check-square" style={{ color: "#ffbd2e" }}></i> Task</td>
                      <td>{task.id}</td>
                      <td className="task-title-cell">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <i className="fa-solid fa-check-square" style={{ color: "#ffbd2e", fontSize: "0.8rem" }}></i>
                          {task.title}
                          {task.aiInstructions && (
                            <i className="fa-solid fa-wand-magic-sparkles" title="Contiene instrucciones para IA" style={{ color: "#a78bfa", fontSize: "0.7rem" }}></i>
                          )}
                        </div>
                      </td>
                      <td><span className={`state-dot ${stateColor}`}></span> {task.state}</td>
                      <td>{task.assignee}</td>
                      <td>AI-Factory\\{story.sprint}</td>
                    </tr>
                  )
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI PROMPT MODAL */}
      {showPromptModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ padding: "32px", width: "500px", background: "#1a1d2e", borderRadius: "16px", border: "1px solid rgba(167,139,250,0.3)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
            <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ color: "#a78bfa" }}></i> Generar con IA
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>Describe la funcionalidad que quieres agregar al backlog. El agente se encargará de crear la historia de usuario y las tareas necesarias.</p>
            
            <textarea 
              autoFocus
              style={{ width: "100%", minHeight: "120px", padding: "14px", background: "#0d0f1a", border: "1px solid rgba(69,243,255,0.2)", borderRadius: "8px", color: "#fff", fontSize: "0.95rem", outline: "none", resize: "none", marginBottom: "24px" }}
              placeholder="Ej: Necesito un sistema de autenticación que incluya registro, login y recuperación de contraseña..."
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key === "Enter" && e.ctrlKey && handleAiSubmit()}
            />

            <div style={{ display: "flex", gap: "12px" }}>
              <button style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid var(--panel-border)", borderRadius: "8px", color: "var(--text-muted)", cursor: "pointer" }} onClick={() => setShowPromptModal(false)}>Cancelar</button>
              <button className="action-btn" style={{ flex: 2, padding: "12px", background: "#7c3aed" }} disabled={!aiPrompt.trim()} onClick={handleAiSubmit}>
                <i className="fa-solid fa-paper-plane"></i> Enviar al Agente
              </button>
            </div>
            <div style={{ marginTop: "12px", textAlign: "center", fontSize: "0.75rem", color: "#555" }}>Presiona Ctrl + Enter para enviar rápidamente</div>
          </div>
        </div>
      )}
    </main>
  );
}

