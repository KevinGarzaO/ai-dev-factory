'use client';

import AppSwitcher from './AppSwitcher';

interface TopBarProps {
  orgName?: string;
  projectName?: string;
  currentPage?: string;
}

export default function TopBar({ orgName = 'SFTX', projectName = 'CLI', currentPage = 'Backlog' }: TopBarProps) {
  return (
    <div className="topbar">
      {/* Logo & Breadcrumb */}
      <div className="topbar-logo">
        <div className="logo-icon">
          <i className="fa-solid fa-code-branch"></i>
        </div>
        <span className="logo-text">SpecForge-TX</span>
      </div>

      <div className="topbar-breadcrumb">
        <span>{orgName}</span>
        <span className="sep">/</span>
        <span>{projectName}</span>
        <span className="sep">/</span>
        <span className="current">{currentPage}</span>
      </div>

      {/* Search */}
      <div className="topbar-search" style={{ position: 'relative' }}>
        <i className="fa-solid fa-search search-icon" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '12px' }}></i>
        <input 
          type="text" 
          placeholder="Buscar tasks, sprints, features..." 
          style={{ 
            width: '100%', 
            background: 'var(--bg-base)', 
            border: '1px solid var(--border)', 
            borderRadius: '6px', 
            padding: '6px 12px 6px 32px', 
            color: 'var(--text-main)', 
            fontSize: '13px', 
            outline: 'none',
            transition: 'border-color 0.2s'
          }} 
        />
      </div>

      {/* Right Section */}
      <div className="topbar-right">
        <div className="ai-status">
          <span className="dot"></span>
          <span>Claude Haiku 4.5</span>
        </div>
        
        <div style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>
          <i className="fa-regular fa-bell"></i>
        </div>
        
        <AppSwitcher />
        
        <div className="topbar-avatar">
          KG
        </div>
      </div>
    </div>
  );
}