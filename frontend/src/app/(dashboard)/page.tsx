import BacklogTable from "@/components/BacklogTable";
import Toolbar from "@/components/Toolbar";

export default function BacklogPage() {
  return (
    <>
      <Toolbar />
      <div className="content-scroll">
        <BacklogTable />
      </div>
    </>
  );
}