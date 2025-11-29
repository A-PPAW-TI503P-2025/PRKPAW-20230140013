import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    // Fix padding for base64
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const json = window.atob(padded);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nama: '', role: '', email: '' });
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [totalAttendance, setTotalAttendance] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const payload = decodeJwt(token);
    if (payload) {
      setUser({ nama: payload.nama || payload.name || '', role: payload.role || '', email: payload.email || '' });
    }

    // Fetch today's attendance
    const fetchTodayAttendance = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/presensi/today', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTodayAttendance(response.data.data);
      } catch (err) {
        console.error('Error fetching today attendance:', err);
      }
    };

    // Fetch total attendance
    const fetchTotalAttendance = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/presensi/total', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTotalAttendance(response.data.total);
      } catch (err) {
        console.error('Error fetching total attendance:', err);
      }
    };

    fetchTodayAttendance();
    fetchTotalAttendance();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">PA</div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Portal Aplikasi</h1>
              <p className="text-sm text-gray-500">Dashboard Mahasiswa/Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Signed in as</div>
              <div className="text-sm font-medium text-gray-800">{user.nama || 'Pengguna'}</div>
              <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{user.role || '—'}</div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm focus:outline-none"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800">Selamat Datang, {user.nama || 'Teman'}</h2>
            <p className="mt-2 text-gray-600">Ini adalah dashboard Anda. Gunakan navigasi untuk mengakses fitur presensi, laporan, dan pengaturan akun.</p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg">
                <div className="text-sm text-gray-500">Presensi Hari Ini</div>
                <div className="mt-2 text-2xl font-bold text-indigo-700">
                  {todayAttendance ? (todayAttendance.checkOut ? '✓ Selesai' : '✓ Check-in') : '—'}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="text-sm text-gray-500">Total Kehadiran</div>
                <div className="mt-2 text-2xl font-bold text-green-700">{totalAttendance}</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded shadow">Presensi</button>
              <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded">Lihat Laporan</button>
              <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded">Pengaturan</button>
            </div>
          </section>

          <aside className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Ringkasan Akun</h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li><span className="font-medium text-gray-800">Nama:</span> {user.nama || '-'}</li>
              <li><span className="font-medium text-gray-800">Role:</span> {user.role || '-'}</li>
              <li><span className="font-medium text-gray-800">Email:</span> (tersimpan di backend)</li>
            </ul>

            <div className="mt-6">
              <button onClick={handleLogout} className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Logout</button>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
