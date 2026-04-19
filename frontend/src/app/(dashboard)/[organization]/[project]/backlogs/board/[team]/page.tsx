import BacklogTable from "@/components/BacklogTable";
import Toolbar from "@/components/Toolbar";

export default function EnterpriseBacklogPage({ params }: { params: { organization: string, project: string, team: string } }) {
  const orgName = decodeURIComponent(params.organization || 'SFTX');
  const projectName = decodeURIComponent(params.project || 'CLI');
  const teamName = decodeURIComponent(params.team || 'Default');

  return (
    <>
      <Toolbar />
      <div className="content-scroll">
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            <i className="fa-solid fa-folder-open" style={{ marginRight: '6px' }}></i>
            {projectName}
          </span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>
            <i className="fa-solid fa-users" style={{ marginRight: '6px' }}></i>
            {teamName}
          </span>
        </div>
        <BacklogTable />
      </div>
    </>
  );
}