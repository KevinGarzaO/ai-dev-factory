import Sidebar from '@/components/Sidebar';
import { Providers } from '@/components/Providers';
import WorkItemModal from '@/components/WorkItemModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="app-layout">
        <Sidebar />
        <div className="main-wrapper">
          <div className="view-section">
             {children}
          </div>
        </div>
      </div>
      <WorkItemModal />
    </Providers>
  );
}
