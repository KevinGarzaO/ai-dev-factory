import SprintMatrix from "@/components/SprintMatrix";

export default function EnterpriseSprintPage({ params }: { params: Promise<{ organization: string, project: string, team: string, iterationPath: string[] }> }) {
  const { organization, project, team, iterationPath } = await params;
  // In a real database, we would use params.organization and params.iterationPath 
  // to fetch the specific tasks for this Sprint.
  // For now, we inject the dynamic parameters down or just let the global Context load.
  
  return (
    <>
      <div style={{ marginBottom: "16px", color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", gap: "8px", alignItems: "center" }}>
        <span><i className="fa-solid fa-building"></i> {decodeURIComponent(organization || "")}</span>
        <span>/</span>
        <span><i className="fa-solid fa-folder-open"></i> {decodeURIComponent(project || "")}</span>
        <span>/</span>
        <span><i className="fa-solid fa-users"></i> {decodeURIComponent(team || "")}</span>
        <span>/</span>
        <span style={{ color: "var(--primary)", fontWeight: "bold" }}>
          {iterationPath?.map(p => decodeURIComponent(p)).join(" / ")}
        </span>
      </div>
      <SprintMatrix />
    </>
  );
}
