import { Outlet } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import NotificationToast from '@/components/notifications/NotificationToast';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background bg-grid">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <Outlet />
      </div>
      <NotificationToast />
    </div>
  );
}