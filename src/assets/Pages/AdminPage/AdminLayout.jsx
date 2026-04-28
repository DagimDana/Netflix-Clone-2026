import Sidebar from '../../Components/Admin/Sidebar';
import { Outlet } from 'react-router-dom';

function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;