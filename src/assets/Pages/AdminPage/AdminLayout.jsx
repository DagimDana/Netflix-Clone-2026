import Sidebar from '../../Components/Admin/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import './AdminLayout.css';

function AdminLayout() {
  const location = useLocation();

  // ✅ true only when path is exactly "/admin"
  const isDashboard =
    location.pathname.split('/').filter(Boolean).length === 1;

  return (
    <div>

      {/* ✅ Show ONLY on main admin page */}
      {isDashboard && (
        <h1 className="wel">
          Welcome to the Admin Panel!
        </h1>
      )}

      <Sidebar />

      <div>
        <Outlet />
      </div>

    </div>
  );
}

export default AdminLayout;

// import Sidebar from '../../Components/Admin/Sidebar';
// import { Outlet } from 'react-router-dom';
// import './AdminLayout.css'

// function AdminLayout() {
//   return (
//     <div>
//       <h1 className="wel">
//   Welcome to the Admin Panel
// </h1>
//       <Sidebar />

//       <div>
//         <Outlet />
//       </div>
//     </div>
//   );
// }

// export default AdminLayout;

