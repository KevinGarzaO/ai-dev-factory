import BacklogTable from "@/components/BacklogTable";

export default function EnterpriseBacklogPage({ params }: { params: { organization: string, project: string, team: string } }) {
  return (
    <>
      <div className="breadcrumbs">
        <span><i className="fa-solid fa-building"></i> {decodeURIComponent(params.organization || "")}</span>
        <span className="sep">/</span>
        <span><i className="fa-solid fa-folder-open"></i> {decodeURIComponent(params.project || "")}</span>
        <span className="sep">/</span>
        <span className="current"><i className="fa-solid fa-users"></i> {decodeURIComponent(params.team || "")} Backlog</span>
      </div>
      <BacklogTable />
    </>
  );
}
