import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function AttendancePage() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [coords, setCoords] = useState(null);
    const mapRef = useRef(null);

    // Custom pinpoint icon
    const pinpointIcon = new L.Icon({
      iconUrl: 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"%3E%3Cpath fill="%2346b3d9" d="M16 0C9.4 0 4 5.4 4 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z"/%3E%3Ccircle cx="16" cy="12" r="5" fill="%23ffffff"/%3E%3C/svg%3E',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    // Fungsi untuk mendapatkan lokasi pengguna
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                    setError("");
                },
                (error) => {
                    setError("Gagal mendapatkan lokasi: " + error.message);
                },
                {
                    enableHighAccuracy: true,  // Menggunakan GPS untuk akurasi tinggi
                    timeout: 10000,             // Tunggu maksimal 10 detik
                    maximumAge: 0               // Jangan gunakan cache lokasi lama
                }
            );
        } else {
            setError("Geolocation tidak didukung oleh browser ini.");
        }
    };

    useEffect(() => {
        getLocation();
    }, []);

    useEffect(() => {
        if (mapRef.current && coords) {
            setTimeout(() => {
                mapRef.current.invalidateSize();
            }, 100);
        }
    }, [coords]);

    const getToken = () => {
        return localStorage.getItem("token");
    };

    const handleCheckIn = async () => {
        setMessage("");
        setError("");
        if (!coords) {
            setError("Lokasi belum didapatkan. Mohon izinkan akses lokasi.");
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            };

            const response = await axios.post(
                "http://localhost:5000/api/presensi/check-in",
                {
                    latitude: coords.lat,
                    longitude: coords.lng
                },
                config
            );

            setMessage(response.data.message);
        } catch (err) {
            setError(err.response ? err.response.data.message : "Check-in gagal");
        }
    };

    const handleCheckOut = async () => {
        setMessage("");
        setError("");
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            };

            const response = await axios.post(
                "http://localhost:5000/api/presensi/check-out",
                {},
                config
            );
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response ? err.response.data.message : 'Check-out gagal');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
                        Lakukan Presensi
                    </h2>

                    {coords && (
                        <div className="my-6 border rounded-lg overflow-hidden">
                            <div className="bg-blue-50 p-3 border-b border-blue-200 flex justify-between items-center">
                                <div className="text-sm text-gray-700">
                                    <p><strong>Latitude:</strong> {coords.lat.toFixed(6)}</p>
                                    <p><strong>Longitude:</strong> {coords.lng.toFixed(6)}</p>
                                    {coords.accuracy && <p className="text-xs text-gray-600"><strong>Akurasi:</strong> ±{coords.accuracy.toFixed(1)}m</p>}
                                </div>
                                <button
                                    onClick={getLocation}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 font-semibold"
                                >
                                    Refresh Lokasi
                                </button>
                            </div>
                            <MapContainer
                                ref={mapRef}
                                center={[coords.lat, coords.lng]}
                                zoom={17}
                                style={{ height: '400px', width: '100%' }}
                                key={`${coords.lat}-${coords.lng}`}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[coords.lat, coords.lng]} icon={pinpointIcon}>
                                    <Popup>Lokasi Presensi Anda</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    )}

                    {message && <p className="text-green-600 bg-green-100 p-3 rounded mb-4 text-center font-semibold">{message}</p>}
                    {error && <p className="text-red-600 bg-red-100 p-3 rounded mb-4 text-center font-semibold">{error}</p>}

                    <div className="flex space-x-4">
                        <button
                            onClick={handleCheckIn}
                            className="flex-1 py-3 px-4 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 transition"
                        >
                            Check-In
                        </button>

                        <button
                            onClick={handleCheckOut}
                            className="flex-1 py-3 px-4 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700 transition"
                        >
                            Check-Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AttendancePage;
