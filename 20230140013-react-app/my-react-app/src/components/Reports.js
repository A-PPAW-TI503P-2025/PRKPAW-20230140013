import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); 

  // ... (Kode icon dan fetchReports tidak berubah) ...
  // Custom pinpoint icon
  const pinpointIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"%3E%3Cpath fill="%2346b3d9" d="M16 0C9.4 0 4 5.4 4 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z"/%3E%3Ccircle cx="16" cy="12" r="5" fill="%23ffffff"/%3E%3C/svg%3E',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  const fetchReports = async (query) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get('http://localhost:5000/api/reports/daily', config);
      setReports(response.data.data || []);
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Gagal mengambil laporan');
    }
  };

  useEffect(() => {
    fetchReports("");
  }, [navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports(searchTerm);
  };

  // Helper function untuk format URL gambar
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Ubah backslash windows (\) jadi slash (/)
    const cleanPath = imagePath.replace(/\\/g, '/');
    return `http://localhost:5000/${cleanPath}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Laporan Presensi Harian
      </h1>

      {/* ... (Form Search dan Error handler tidak berubah) ... */}
      <form onSubmit={handleSearchSubmit} className="mb-6 flex space-x-2">
        <input
          type="text"
          placeholder="Cari berdasarkan nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700"
        >
          Cari
        </button>
      </form>

      {error && (
        <p className="text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>
      )}

      {!error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.length > 0 ? (
                reports.map((presensi) => (
                  <tr key={presensi.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {presensi.user ? presensi.user.nama : "N/A"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(presensi.checkIn).toLocaleString("id-ID", {
                        timeZone: "Asia/Jakarta",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {presensi.checkOut
                        ? new Date(presensi.checkOut).toLocaleString("id-ID", {
                            timeZone: "Asia/Jakarta",
                          })
                        : "Belum Check-Out"}
                    </td>

                    {/* --- KOLOM AKSI (MAP & FOTO) --- */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {/* 1. TOMBOL LIHAT MAP */}
                        {presensi.latitude && presensi.longitude ? (
                          <button
                            onClick={() => setSelectedLocation({
                              lat: parseFloat(presensi.latitude),
                              lng: parseFloat(presensi.longitude),
                              nama: presensi.user?.nama || 'Unknown'
                            })}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition shadow-sm"
                          >
                            Lihat Map 📍
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs italic px-2">No Map</span>
                        )}

                        {/* 2. TOMBOL LIHAT FOTO (PERBAIKAN DI SINI) */}
                        {/* Gunakan presensi.buktiFoto, BUKAN presensi.image */}
                        {presensi.buktiFoto ? (
                          <button
                            onClick={() => setSelectedImage(getImageUrl(presensi.buktiFoto))}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition shadow-sm"
                          >
                            Bukti Foto 📸
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs italic px-2">No Foto</span>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ... (Modal Map tidak berubah) ... */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Lokasi Presensi - {selectedLocation.nama}</h2>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <MapContainer 
                center={[selectedLocation.lat, selectedLocation.lng]} 
                zoom={15} 
                style={{ height: '300px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; Osm contributors'
                />
                <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={pinpointIcon}>
                  <Popup>{selectedLocation.nama}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* ... (Modal Foto tidak berubah) ... */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)} 
        >
          <div className="relative bg-white p-2 rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-auto">
            <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 z-10"
              >
                &times;
            </button>
            
            <img 
              src={selectedImage} 
              alt="Bukti Presensi Full" 
              className="w-full h-auto object-contain rounded"
              onClick={(e) => e.stopPropagation()} 
            />
            
            <div className="text-center mt-2">
                 <button 
                    onClick={() => setSelectedImage(null)}
                    className="px-4 py-2 bg-gray-800 text-white rounded text-sm hover:bg-gray-700"
                 >
                    Tutup
                 </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ReportPage;