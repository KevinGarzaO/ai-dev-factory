import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import StatusBar from '@/components/StatusBar';
import { Providers } from '@/components/Providers';
import WorkItemModal from '@/components/WorkItemModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="app-layout">
        <TopBar />
        <div className="app-body">
          <Sidebar />
          <div className="main-content">
            {children}
          </div>
        </div>
        <StatusBar />
      </div>
      <WorkItemModal />
    </Providers>
  );
}