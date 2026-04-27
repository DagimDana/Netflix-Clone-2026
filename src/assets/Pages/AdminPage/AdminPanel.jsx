import React from 'react'
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../../Components/Admin/AdminDashboard'
import VideoManagement from '../../Components/Admin/VideoManagement'
import UserManagement from '../../Components/Admin/UserManagement'
import Statistics from '../../Components/Admin/Statistics'
import Sidebar from '../../Components/Admin/Sidebar'

function AdminPanel() {
  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar always visible */}
      {/* <Sidebar /> */}

      {/* Pages change here */}
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/videos" element={<VideoManagement />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/stats" element={<Statistics />} />
      </Routes>
    </div>
  )
}

export default AdminPanel
