'use client';

import { useState } from 'react';

interface Task {
  id: string;
  type: 'story' | 'task' | 'bug' | 'epic';
  title: string;
  status: 'new' | 'progress' | 'review' | 'done' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignee?: string;
  assigneeInitials?: string;
  sprint: string;
  estimate?: string;
  isAIGenerated?: boolean;
  indent?: number;
}

interface BacklogTableProps {
  tasks?: Task[];
}

const mockTasks: Task[] = [
  { id: '#26', type: 'story', title: 'Necesito que mi proyecto tenga autenticación', status: 'new', priority: 'high', assignee: 'Claude 4', assigneeInitials: 'CL4', sprint: 'Backlog', estimate: '5pts', isAIGenerated: true },
  { id: '#27', type: 'task', title: 'Configurar Provider de Autenticación (JWT/NextAuth)', status: 'new', priority: 'medium', assignee: '—', assigneeInitials: '', sprint: 'Backlog', estimate: '3pts', indent: 1 },
  { id: '#28', type: 'task', title: 'Crear formulario de Login/Register con validación', status: 'new', priority: 'medium', assignee: '—', assigneeInitials: '', sprint: 'Backlog', estimate: '5pts', indent: 1 },
  { id: '#29', type: 'bug', title: 'El login no valida correctamente la contraseña', status: 'progress', priority: 'critical', assignee: 'Kevin', assigneeInitials: 'KG', sprint: 'Sprint 1', estimate: '2pts' },
  { id: '#30', type: 'story', title: 'Dashboard con métricas del proyecto', status: 'new', priority: 'medium', assignee: '—', assigneeInitials: '', sprint: 'Backlog', estimate: '8pts' },
  { id: '#31', type: 'task', title: 'Integrar gráficos con Recharts', status: 'new', priority: 'low', assignee: '—', assigneeInitials: '', sprint: 'Backlog', estimate: '5pts', indent: 1 },
  { id: '#32', type: 'epic', title: 'Sistema de Payments con Stripe', status: 'new', priority: 'high', assignee: '—', assigneeInitials: '', sprint: 'Backlog', estimate: '21pts' },
];

const priorityIcons: Record<string, string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🔵',
};

export default function BacklogTable({ tasks = mockTasks }: BacklogTableProps) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">✨</div>
        <div className="title">No hay tasks en el backlog</div>
        <div className="subtitle">Genera tasks con IA o crea una manualmente</div>
        <div className="actions">
          <button className="toolbar-btn ai">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            Generar con IA
          </button>
          <button className="toolbar-btn ghost">
            <i className="fa-solid fa-plus"></i>
            Nueva Task
          </button>
        </div>
      </div>
    );
  }

  return (
    <table className="premium-table">
      <thead>
        <tr>
          <th style={{ width: 40 }}></th>
          <th style={{ width: 120 }}>Tipo</th>
          <th style={{ width: 60 }}>ID</th>
          <th>Título</th>
          <th style={{ width: 120 }}>Estado</th>
          <th style={{ width: 120 }}>Prioridad</th>
          <th style={{ width: 140 }}>Asignado</th>
          <th style={{ width: 120 }}>Sprint</th>
          <th style={{ width: 100 }}>Estimación</th>
          <th style={{ width: 60 }}></th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task, index) => (
          <tr 
            key={task.id} 
            onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
            className={selectedTask === task.id ? 'selected' : ''}
            style={task.indent ? { paddingLeft: `${24 + task.indent * 24}px`, position: 'relative' } : {}}
          >
            <td>
              <div className="premium-checkbox"></div>
            </td>
            <td>
              <span className={`type-badge ${task.type}`}>
                {task.type === 'story' && '📋 '}
                {task.type === 'task' && '⚡ '}
                {task.type === 'bug' && '🐛 '}
                {task.type === 'epic' && '🚀 '}
                {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
              </span>
            </td>
            <td>
              <span className="id-tag">{task.id}</span>
            </td>
            <td>
              <div className="task-title">
                {task.isAIGenerated && (
                  <span className="ai-badge">
                    <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 9 }}></i>
                  </span>
                )}
                <span>{task.title}</span>
              </div>
            </td>
            <td>
              <span className={`status-badge ${task.status}`}>
                {task.status === 'new' && '○ New'}
                {task.status === 'progress' && '◐ In Progress'}
                {task.status === 'review' && '◔ Review'}
                {task.status === 'done' && '✓ Done'}
                {task.status === 'blocked' && '⛔ Blocked'}
              </span>
            </td>
            <td>
              <span className={`priority-badge ${task.priority}`}>
                {priorityIcons[task.priority]} {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </td>
            <td>
              <div className={`row-avatar ${task.assignee ? 'has-user' : ''}`}>
                {task.assigneeInitials || '—'}
              </div>
            </td>
            <td>
              <span className="sprint-tag">{task.sprint}</span>
            </td>
            <td>
              <span className="estimate">{task.estimate || '—'}</span>
            </td>
            <td>
              <span className="row-actions">⋮</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}