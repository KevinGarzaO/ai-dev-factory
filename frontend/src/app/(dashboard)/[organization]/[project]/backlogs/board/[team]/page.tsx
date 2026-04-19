import BacklogTable from "@/components/BacklogTable";
import Toolbar from "@/components/Toolbar";

export default async function EnterpriseBacklogPage({ params }: { params: Promise<{ organization: string, project: string, team: string }> }) {
  const { organization, project, team } = await params;
  const orgName = decodeURIComponent(organization || 'SFTX');
  const projectName = decodeURIComponent(project || 'CLI');
  const teamName = decodeURIComponent(team || 'Default');

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