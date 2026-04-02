"use client";

import { useState, useEffect, useRef } from "react";
import { useBacklog } from "@/context/BacklogContext";
import "./AgentTerminal.css";

type LogEntry = {
  type: "info" | "command" | "success" | "error" | "ai";
  text: string;
  timestamp: string;
};

export default function AgentTerminal() {
  const { showTerminal, setShowTerminal, terminalPrompt, setTerminalPrompt, refreshBacklog } = useBacklog();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectId, setProjectId] = useState<number | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(d => { if (d) setProjectId(d.projectId); });
  }, []);

  const addLog = (text: string, type: LogEntry["type"] = "info") => {
    setLogs(prev => [...prev, {
      type,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }]);
  };

  useEffect(() => {
    if (showTerminal) {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, showTerminal]);

  const startGeneration = async () => {
    if (hasStarted.current || isGenerating || !terminalPrompt) return;
    hasStarted.current = true;
    setIsGenerating(true);
    setShowTerminal(true); // Open console when generating
    setLogs([]);

    addLog(`Iniciando agente para proyecto ID: ${projectId || 'Default'}`, "info");
    addLog(`Objetivo: "${terminalPrompt}"`, "command");
    addLog("Conectando con Claude Haiku 4...", "ai");
    addLog("Analizando requerimientos y dependencias...", "ai");

    try {
      await new Promise(r => setTimeout(r, 800));
      addLog("Generando estructura de User Stories...", "ai");
      
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: terminalPrompt, projectId: projectId || 1 })
      });

      const data = await res.json();

      if (data.success) {
        addLog("Historias de usuario creadas exitosamente.", "success");
        addLog(`ID de Referencia: #${data.storyId}`, "info");
        addLog("Desglosando tareas técnicas...", "ai");
        await new Promise(r => setTimeout(r, 600));
        addLog("Backlog actualizado con nuevos items.", "success");
        addLog("El agente ha terminado su ejecución.", "success");
      } else {
        addLog(`Error en el motor de IA: ${data.error}`, "error");
      }
    } catch (e: any) {
      addLog(`Error de red: ${e.message}`, "error");
    } finally {
      setIsGenerating(false);
      if (refreshBacklog) refreshBacklog();
    }
  };

  useEffect(() => {
    if (!hasStarted.current && terminalPrompt) {
      startGeneration();
    } else if (!terminalPrompt) {
        hasStarted.current = false;
    }
  }, [terminalPrompt]);

  const toggleTerminal = () => {
    setShowTerminal(!showTerminal);
  };

  return (
    <div className={`agent-terminal ${showTerminal ? 'expanded' : 'collapsed'}`}>
      <div className="terminal-header" onClick={toggleTerminal}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className={`status-dot online small ${isGenerating ? 'blinking' : ''}`}></div>
          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#fff", letterSpacing: "1px" }}>
            {isGenerating ? 'AI AGENT EXECUTING...' : 'AI AGENT CONSOLE'}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isGenerating && <span style={{ fontSize: "0.75rem", color: "var(--warning)" }}><i className="fa-solid fa-spinner fa-spin"></i> Trabajando...</span>}
          <button className="icon-btn" style={{ color: "#fff" }}>
            <i className={`fa-solid ${showTerminal ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
          </button>
        </div>
      </div>
      
      {showTerminal && (
        <>
          <div className="terminal-body">
            {logs.length === 0 && <div className="log-entry info" style={{ opacity: 0.5 }}>Console ready. Waiting for task...</div>}
            {logs.map((log, i) => (
              <div key={i} className={`log-entry ${log.type}`}>
                <span className="timestamp">[{log.timestamp}]</span>
                <span className="prefix">{log.type === 'command' ? '>' : (log.type === 'ai' ? '🤖' : '#')}</span>
                <span className="text">{log.text}</span>
              </div>
            ))}
            {isGenerating && (
              <div className="log-entry ai">
                <span className="timestamp">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                <span className="prefix">🤖</span>
                <span className="text blinking">Procesando...</span>
              </div>
            )}
            <div ref={logEndRef} />
          </div>

          <div className="terminal-footer">
            <div className="current-prompt">
              <span style={{ color: "var(--primary)", marginRight: "8px" }}>$</span>
              <span>{terminalPrompt || 'No active task'}</span>
            </div>
            {!isGenerating && logs.length > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setTerminalPrompt(""); setLogs([]); }}
                  className="action-btn" 
                  style={{ padding: "4px 12px", background: "rgba(255,100,100,0.1)", color: "var(--danger)", border: "1px solid var(--danger)", fontSize: "0.75rem" }}
                >
                  Clear Logs
                </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
