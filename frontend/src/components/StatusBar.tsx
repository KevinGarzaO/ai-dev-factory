'use client';

interface StatusBarProps {
  userName?: string;
  userInitials?: string;
  roles?: string[];
  taskCount?: number;
  sprintCount?: number;
  releaseCount?: number;
}

export default function StatusBar({ 
  userName = 'Kevin Garza', 
  userInitials = 'KG',
  roles = ['PM', 'Frontend'],
  taskCount = 12,
  sprintCount = 3,
  releaseCount = 2
}: StatusBarProps) {
  return (
    <div className="statusbar">
      <div className="statusbar-left">
        <div className="ai-status" style={{ padding: '2px 8px', background: 'transparent', border: 'none' }}>
          <span className="dot"></span>
          <span style={{ color: 'var(--success)' }}>Claude Haiku 4.5 — Online & Listo</span>
        </div>
        
        <div className="divider"></div>
        
        <span>{taskCount} tasks · {sprintCount} sprints · {releaseCount} releases</span>
      </div>

      <div className="statusbar-right">
        <div className="statusbar-user">
          <div className="topbar-avatar" style={{ width: '20px', height: '20px', fontSize: '9px' }}>
            {userInitials}
          </div>
          <span>{userName}</span>
          {roles.map((role) => (
            <span key={role} className="role-badge">{role}</span>
          ))}
        </div>

        <button 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--danger)', 
            cursor: 'pointer', 
            fontSize: '11px',
            padding: '4px 8px',
            borderRadius: '4px',
            fontFamily: 'inherit'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}