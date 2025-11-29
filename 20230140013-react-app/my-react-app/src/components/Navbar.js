import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ nama: '', role: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = jwtDecode(token);
          if (payload) {
            setUser({ nama: payload.nama || payload.name || '', role: payload.role || '' });
          }
        }
      }, []);

    const handleLogout = () => {
    localStorage.removeItem('token');
        setUser(null);
        navigate('/', { replace: true });
    };

    return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex space-x-4 items-center">
            <Link to="/dashboard" className="font-bold text-xl hover:text-blue-200">
              Sistem Presensi
            </Link>
            
            {user && (
              <Link to="/presensi" className="hover:text-blue-200">
                Presensi
              </Link>
            )}

            {user && user.role === 'admin' && (
              <Link to="/reports" className="hover:text-blue-200 font-semibold bg-blue-700 px-3 py-1 rounded">
                Laporan Admin
              </Link>
            )}
          </div>

          <div>
            {user.nama ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm bg-blue-500 px-3 py-1 rounded-full">
                  Halo, {user.nama}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="bg-white text-blue-600 px-4 py-2 rounded font-bold hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 text-white px-4 py-2 rounded font-bold hover:bg-green-600"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;