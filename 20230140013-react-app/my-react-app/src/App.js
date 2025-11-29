import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';
import AttendancePage from './components/PresensiPage';
import ReportPage from './components/Reports';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div>
        {/* Navigasi ini bisa dihapus jika tidak diperlukan */}
        
        <Navbar />
        
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/" element={<LoginPage />} /> 
          <Route path="/presensi" element={<AttendancePage />} />
          <Route path="/reports" element={<ReportPage />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
