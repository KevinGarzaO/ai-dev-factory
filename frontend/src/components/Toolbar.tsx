'use client';

import { useState } from 'react';

interface ToolbarProps {}

export default function Toolbar({}: ToolbarProps) {
  const [view, setView] = useState<'Lista' | 'Board' | 'Timeline'>('Lista');

  return (
    <div className="toolbar">
      {/* Left Actions */}
      <button className="toolbar-btn primary">
        <i className="fa-solid fa-plus"></i>
        Nueva Task
      </button>
      
      <button className="toolbar-btn ai">
        <i className="fa-solid fa-wand-magic-sparkles"></i>
        Generar con IA
      </button>
      
      <div className="toolbar-divider"></div>
      
      <button className="toolbar-btn ghost">
        <i className="fa-solid fa-layer-group"></i>
        Agrupar
      </button>
      
      <button className="toolbar-btn ghost">
        <i className="fa-solid fa-filter"></i>
        Filtrar
      </button>
      
      <button className="toolbar-btn ghost">
        <i className="fa-solid fa-arrow-up-wide-short"></i>
        Ordenar
      </button>
      
      <div className="toolbar-spacer"></div>
      
      {/* Right - View Toggle */}
      <div className="view-toggle">
        {(['Lista', 'Board', 'Timeline'] as const).map((v) => (
          <div 
            key={v}
            className={`view-toggle-btn ${view === v ? 'active' : ''}`}
            onClick={() => setView(v)}
          >
            {v === 'Lista' && <><i className="fa-solid fa-list"></i> </>}
            {v === 'Board' && <><i className="fa-solid fa-table-cells"></i> </>}
            {v === 'Timeline' && <><i className="fa-solid fa-chart-gantt"></i> </>}
            {v}
          </div>
        ))}
      </div>
      
      <input 
        type="text" 
        placeholder="Buscar..." 
        style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border)', 
          borderRadius: '6px',
          padding: '6px 12px',
          color: 'var(--text-main)',
          fontSize: '12px',
          width: '160px',
          outline: 'none'
        }}
      />
    </div>
  );
}