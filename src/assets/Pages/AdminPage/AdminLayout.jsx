import Sidebar from '../../Components/Admin/Sidebar';
import { Outlet } from 'react-router-dom';

function AdminLayout() {
  return (
    <div>
      <Sidebar />

      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;