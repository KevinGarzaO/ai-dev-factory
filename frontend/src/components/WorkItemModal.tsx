"use client";

import React, { useState, useEffect } from "react";
import { useBacklog } from "@/context/BacklogContext";
import Swal from "sweetalert2";

export default function WorkItemModal() {
  const { backlogData, selectedItem, closeModal, refreshBacklog } = useBacklog();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(d => { if (d) setUserInfo(d); });
  }, []);

  useEffect(() => {
    if (!selectedItem) {
      setFormData(null);
      return;
    }

    if (selectedItem.id === 0) {
      // Creation Mode
      setFormData({
        id: 0,
        type: selectedItem.type,
        title: '',
        desc: '',
        aiInstructions: '',
        state: 'New',
        assignee: 'Unassigned',
        projectId: 1,
        parentId: selectedItem.parentId,
        sprintId: null
      });
    } else {
      // Edit Mode
      if (selectedItem.type === 'story') {
        const story = backlogData.find(s => Number(s.id) === Number(selectedItem.id));
        setFormData(story ? { ...story } : null);
      } else {
        const story = backlogData.find(s => Number(s.id) === Number(selectedItem.parentId));
        const task = story?.tasks.find(t => Number(t.id) === Number(selectedItem.id));
        setFormData(task ? { ...task, parentId: story?.id } : null);
      }
    }
  }, [selectedItem, backlogData]);

  const deleteWorkItem = async () => {
    if (isNew || !formData.id) return;
    
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás este ${formData.type} y todas sus tareas asociadas permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      cancelButtonColor: 'rgba(255,255,255,0.1)',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#1a1d2e',
      color: '#fff'
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/work-items?id=${formData.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (refreshBacklog) await refreshBacklog();
        closeModal();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Eliminado correctamente',
          showConfirmButton: false,
          timer: 2000,
          background: '#1a1d2e',
          color: '#fff'
        });
      }
    } catch (e) {
      console.error("Delete error:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkItem = async () => {
    if (!formData.title.trim()) return;
    setLoading(true);
    try {
      const isNew = formData.id === 0;
      const res = await fetch('/api/work-items', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          projectId: userInfo?.projectId || 1, 
        })
      });
      if (res.ok) {
        if (refreshBacklog) await refreshBacklog();
        closeModal();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: isNew ? 'Work Item creado!' : 'Cambios guardados',
          showConfirmButton: false,
          timer: 2000,
          background: '#1a1d2e',
          color: '#fff'
        });
      }
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedItem || !formData) return null;

  const isNew = formData.id === 0;

  return (
    <div className="work-item-page" id="workItemPage" style={{ zIndex: 9999 }}>
      <div className="wi-top-bar">
        <div className="wi-breadcrumbs">
          <span style={{ color: "var(--text-muted)" }}><i className="fa-solid fa-layer-group"></i> Work Items</span>
          <span style={{ margin: "0 8px" }}>/</span>
          <button className="btn-ghost-sm" onClick={closeModal}><i className="fa-solid fa-arrow-left"></i> Back to Work Items</button>
        </div>
        <div className="wi-actions">
          {!isNew && (
            <button className="icon-btn danger" title="Eliminar" onClick={deleteWorkItem} disabled={loading} style={{ marginRight: "10px" }}>
              <i className="fa-solid fa-trash-can"></i>
            </button>
          )}
          {!isNew && selectedItem.type === 'task' && formData.state !== 'Done' && formData.state !== 'Closed' && (
            <button className="action-btn" style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", borderColor: "rgba(167,139,250,0.3)" }}>
              <i className="fa-solid fa-wand-sparkles"></i> Run AI Agent
            </button>
          )}
          <button className="btn-ghost-sm"><i className="fa-solid fa-rotate-right"></i></button>
          <button className="action-btn" onClick={saveWorkItem} disabled={loading}>
            <i className="fa-regular fa-floppy-disk"></i> {loading ? "Saving..." : (isNew ? "Create & Close" : "Save & Close")}
          </button>
        </div>
      </div>

      <div className="wi-content-scroll">
        <div className="wi-container glass-panel">
          <div className="wi-header">
            <div className="wi-type-indicator">
              <span id="wiTypeDisplay">
                {isNew ? (
                   <><i className="fa-solid fa-plus-circle" style={{ color: "var(--primary)" }}></i> NEW {formData.type?.toUpperCase()} *</>
                ) : (
                  selectedItem.type === 'story' ? (
                    <><i className="fa-solid fa-book-open" style={{ color: "#45f3ff" }}></i> USER STORY {formData.id}</>
                  ) : (
                    <><i className="fa-solid fa-check-square" style={{ color: "#ffbd2e" }}></i> TASK {formData.id}</>
                  )
                )}
              </span>
            </div>
          </div>

          <input 
            type="text" 
            className="wi-title-input" 
            value={formData.title} 
            onChange={e => setFormData({ ...formData, title: e.target.value })} 
            placeholder="Enter title" 
          />

          <div className="wi-meta-bar">
            <div className="meta-col">
              <label>STATE</label>
              <select value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="wi-select">
                <option value="New">New</option>
                <option value="Active">Active</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Removed">Removed</option>
              </select>
            </div>
            {formData.type === 'task' && (
              <div className="meta-col">
                <label>Parent Story</label>
                <select className="wi-select" value={formData.parentId || ""} onChange={e => setFormData({ ...formData, parentId: e.target.value })}>
                  <option value="">Select Parent...</option>
                  {backlogData.map(s => <option key={s.id} value={s.id}>{s.id}: {s.title}</option>)}
                </select>
              </div>
            )}
            <div className="meta-col">
              <label>Iteration / Sprint</label>
              <SprintSelect 
                projectId={userInfo?.projectId || 1} 
                value={formData.sprintId || ""} 
                onChange={(id: any) => setFormData({ ...formData, sprintId: id })} 
              />
            </div>
            <div className="meta-col">
              <label>Area</label>
              <select className="wi-select"><option>AI-Factory</option></select>
            </div>
          </div>

          <div className="wi-body-grid">
            <div className="wi-left-col">
              <div className="wi-section">
                <h4>Description</h4>
                <textarea 
                  className="wi-textarea" 
                  rows={8} 
                  value={formData.desc || ''} 
                  onChange={e => setFormData({ ...formData, desc: e.target.value })}
                  placeholder={isNew ? "Enter detailed requirements..." : "No description provided."}
                ></textarea>
              </div>
              <div className="ai-panel">
                <h4>
                  <i className="fa-solid fa-wand-magic-sparkles"></i> AI Implementation Instructions
                </h4>
                <textarea 
                  className="wi-textarea" 
                  rows={6} 
                  value={formData.aiInstructions || ''} 
                  onChange={e => setFormData({ ...formData, aiInstructions: e.target.value })}
                  placeholder="Escribe aquí las instrucciones técnicas que debe seguir la IA para completar esta tarea..."
                  style={{ background: "rgba(0,0,0,0.2)", marginTop: "12px" }}
                ></textarea>
                <div style={{ marginTop: "10px", fontSize: "0.75rem", color: "#a78bfaaa", display: "flex", alignItems: "center", gap: "6px" }}>
                  <i className="fa-solid fa-info-circle"></i> Estas instrucciones serán seguidas por el agente al ejecutar la tarea.
                </div>
              </div>
              <div className="wi-section">
                <h4>Discussion</h4>
                <div className="discussion-box">
                  <div className="avatar"><i className="fa-solid fa-robot"></i></div>
                  <textarea className="wi-textarea" rows={3} placeholder="Add a comment. Use @ to mention an agent..."></textarea>
                </div>
              </div>
            </div>
            <div className="wi-right-col">
              <div className="wi-section">
                <h4>Planning</h4>
                <div className="wi-field-row">
                  <label>Priority</label>
                  <select className="wi-select" defaultValue="2"><option value="1">1</option><option value="2">2</option><option value="3">3</option></select>
                </div>
                <div className="wi-field-row">
                  <label>Effort</label>
                  <input type="number" className="wi-select" placeholder="Hours" style={{ width: "100%" }} />
                </div>
              </div>
              <div className="wi-section">
                <h4>Development</h4>
                <div className="dev-box">
                  <i className="fa-brands fa-github" style={{ fontSize: "1.5rem" }}></i>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Create a branch to get started. Agents will auto-commit here.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SprintSelect({ projectId, value, onChange }: { projectId: number, value: any, onChange: any }) {
  const [sprints, setSprints] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/settings/sprints?projectId=${projectId}`).then(r => r.ok ? r.json() : []).then(d => {
      if (Array.isArray(d)) setSprints(d);
    });
  }, [projectId]);

  const roots = sprints.filter(s => !s.parentId);

  return (
    <select className="wi-select" value={value || ""} onChange={e => onChange(e.target.value ? parseInt(e.target.value) : null)}>
      <option value="">Backlog / No Sprint</option>
      {roots.map(root => (
        <React.Fragment key={root.id}>
          <option value={root.id} style={{ fontWeight: "bold" }}>{root.name}</option>
          {sprints.filter(s => s.parentId === root.id).map(child => (
            <option key={child.id} value={child.id}>&nbsp;&nbsp;&nbsp;{child.name}</option>
          ))}
        </React.Fragment>
      ))}
    </select>
  );
}
