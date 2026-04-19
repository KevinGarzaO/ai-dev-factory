'use client';

import Link from 'next/link';

interface SidebarProps {
  currentPage?: string;
}

const workspaceItems = [
  { icon: 'fa-building', label: 'Overview' },
  { icon: 'fa-chart-line', label: 'Dashboard' },
];

const projectItems = [
  { icon: 'fa-list', label: 'Backlog', active: true, badge: '12' },
  { icon: 'fa-bolt', label: 'Sprint Activo', badge: '3' },
  { icon: 'fa-calendar', label: 'Roadmap' },
  { icon: 'fa-rocket', label: 'Releases' },
  { icon: 'fa-chart-pie', label: 'Analytics' },
];

const agentItems = [
  { icon: 'fa-robot', label: 'Ejecutar SDD' },
  { icon: 'fa-file-code', label: 'Tasks generadas' },
  { icon: 'fa-coins', label: 'Uso y costos' },
];

const configItems = [
  { icon: 'fa-gear', label: 'Configuración' },
  { icon: 'fa-users', label: 'Equipo' },
];

export default function Sidebar({ currentPage = 'Backlog' }: SidebarProps) {
  return (
    <div className="sidebar">
      {/* WORKSPACE Section */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Workspace</div>
        <div className="sidebar-nav">
          {workspaceItems.map((item) => (
            <Link 
              key={item.label} 
              href={`/${item.label.toLowerCase()}`}
              className={`sidebar-nav-item ${currentPage === item.label ? 'active' : ''}`}
            >
              <i className={`fa-solid ${item.icon} icon`}></i>
              <span className="label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* PROYECTO Section */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Proyecto</div>
        <div className="sidebar-nav">
          {projectItems.map((item) => (
            <Link 
              key={item.label} 
              href={`/${item.label.toLowerCase().replace(/ /g, '-')}`}
              className={`sidebar-nav-item ${currentPage === item.label ? 'active' : ''}`}
            >
              <i className={`fa-solid ${item.icon} icon`}></i>
              <span className="label">{item.label}</span>
              {item.badge && <span className="badge">{item.badge}</span>}
            </Link>
          ))}
        </div>
      </div>

      {/* AGENTE IA Section */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Agente IA</div>
        <div className="sidebar-nav">
          {agentItems.map((item) => (
            <Link 
              key={item.label} 
              href={`/${item.label.toLowerCase().replace(/ /g, '-')}`}
              className={`sidebar-nav-item ${currentPage === item.label ? 'active' : ''}`}
            >
              <i className={`fa-solid ${item.icon} icon`}></i>
              <span className="label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* CONFIG Section */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Config</div>
        <div className="sidebar-nav">
          {configItems.map((item) => (
            <Link 
              key={item.label} 
              href={`/${item.label.toLowerCase().replace(/ /g, '-')}`}
              className={`sidebar-nav-item ${currentPage === item.label ? 'active' : ''}`}
            >
              <i className={`fa-solid ${item.icon} icon`}></i>
              <span className="label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}