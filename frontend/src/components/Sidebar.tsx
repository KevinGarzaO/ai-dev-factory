'use client';

import Link from 'next/link';

interface SidebarProps {
  currentPage?: string;
}

const sections = [
  {
    title: 'WORKSPACE',
    items: [
      { icon: 'fa-building', label: 'Overview' },
      { icon: 'fa-chart-line', label: 'Dashboard' },
    ]
  },
  {
    title: 'PROYECTO',
    items: [
      { icon: 'fa-list', label: 'Backlog', badge: '12' },
      { icon: 'fa-bolt', label: 'Sprint Activo', badge: '3' },
      { icon: 'fa-calendar', label: 'Roadmap' },
      { icon: 'fa-rocket', label: 'Releases' },
      { icon: 'fa-chart-pie', label: 'Analytics' },
    ]
  },
  {
    title: 'AGENTE IA',
    items: [
      { icon: 'fa-robot', label: 'Ejecutar SDD' },
      { icon: 'fa-file-code', label: 'Tasks generadas' },
      { icon: 'fa-coins', label: 'Uso y costos' },
    ]
  },
  {
    title: 'CONFIG',
    items: [
      { icon: 'fa-gear', label: 'Configuración' },
      { icon: 'fa-users', label: 'Equipo' },
    ]
  },
];

const icons: Record<string, string> = {
  'fa-building': '🏢',
  'fa-chart-line': '📊',
  'fa-list': '📋',
  'fa-bolt': '⚡',
  'fa-calendar': '🗓️',
  'fa-rocket': '🚀',
  'fa-chart-pie': '📈',
  'fa-robot': '🤖',
  'fa-file-code': '📝',
  'fa-coins': '💰',
  'fa-gear': '⚙️',
  'fa-users': '👥',
};

export default function Sidebar({ currentPage = 'Backlog' }: SidebarProps) {
  return (
    <div className="sidebar">
      {sections.map((section) => (
        <div key={section.title} className="sidebar-section">
          <div className="sidebar-section-label">{section.title}</div>
          <div className="sidebar-nav">
            {section.items.map((item) => (
              <Link 
                key={item.label} 
                href={`/${item.label.toLowerCase().replace(/ /g, '-')}`}
                className={`sidebar-nav-item ${currentPage === item.label ? 'active' : ''}`}
              >
                <span className="nav-icon">{icons[item.icon]}</span>
                <span className="label">{item.label}</span>
                {item.badge && <span className="badge">{item.badge}</span>}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}