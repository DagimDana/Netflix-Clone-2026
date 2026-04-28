import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './assets/Components/Header/Header';
import Footer from './assets/Components/Footer/Footer';

import Home from './assets/Pages/Home/Home';
import AdminDashboard from './assets/Components/Admin/AdminDashboard';
import VideoManagement from './assets/Components/Admin/VideoManagement';
import UserManagement from './assets/Components/Admin/UserManagement';
import Statistics from './assets/Components/Admin/Statistics';

import AdminLayout from './assets/Pages/AdminPage/AdminLayout';

function App() {
  return (
    
      <Routes>

        {/* USER PAGES (with header/footer) */}
        <Route
          path="/"
          element={
            <>
              <Header />
              <Home />
              <Footer />
            </>
          }
        />

        {/* ADMIN PAGES (NO header/footer) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="videos" element={<VideoManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="stats" element={<Statistics />} />
        </Route>

      </Routes>
    
  );
}

export default App;