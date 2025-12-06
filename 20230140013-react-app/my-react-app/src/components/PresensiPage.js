import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Webcam from 'react-webcam';


function AttendancePage() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [coords, setCoords] = useState(null);
    const mapRef = useRef(null);
    const [image, setImage] = useState(null); 
 	const webcamRef = useRef(null); 
 	const capture = useCallback(() => {
 	const imageSrc = webcamRef.current.getScreenshot();
 	    setImage(imageSrc); 
 	}, [webcamRef]);


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
    if (!coords || !image) {
      setError("Lokasi dan Foto wajib ada!");
      return;
    }

    try {
      const blob = await (await fetch(image)).blob();

      const formData = new FormData();
      formData.append("latitude", coords.lat);
      formData.append("longitude", coords.lng);
      formData.append("image", blob, "selfie.jpg");

      const response = await axios.post(
        "http://localhost:5000/api/presensi/check-in",

        formData,
        { headers: { Authorization: `Bearer ${getToken()}` } }
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
        <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
            {/* Ubah max-w-2xl jadi max-w-5xl agar lebih lebar untuk layout berdampingan */}
            <div className="max-w-5xl w-full mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                        Lakukan Presensi
                    </h2>

                    {/* Grid Layout: Peta di Kiri, Kamera di Kanan (pada layar besar) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        
                        {/* --- KOLOM KIRI: PETA --- */}
                        <div>
                            {coords ? (
                                <div className="border rounded-lg overflow-hidden h-full flex flex-col">
                                    <div className="bg-blue-50 p-2 border-b border-blue-200 flex justify-between items-center text-xs">
                                        <div className="truncate pr-2">
                                            <span className="font-bold">Lat:</span> {coords.lat.toFixed(5)}, <span className="font-bold">Lng:</span> {coords.lng.toFixed(5)}
                                        </div>
                                        <button
                                            onClick={getLocation}
                                            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs shrink-0"
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                    <MapContainer
                                        ref={mapRef}
                                        center={[coords.lat, coords.lng]}
                                        zoom={17}
                                        style={{ height: '250px', width: '100%' }} // Tinggi dikecilkan jadi 250px
                                        key={`${coords.lat}-${coords.lng}`}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; Osm'
                                        />
                                        <Marker position={[coords.lat, coords.lng]} icon={pinpointIcon}>
                                            <Popup>Lokasi Presensi Anda</Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                            ) : (
                                <div className="h-[250px] flex items-center justify-center bg-gray-100 rounded-lg text-gray-500 border">
                                    <p>Sedang memuat lokasi...</p>
                                </div>
                            )}
                        </div>

                        {/* --- KOLOM KANAN: KAMERA --- */}
                        <div className="flex flex-col">
                            {/* Container kamera dipaksa tingginya sama dengan map (250px) */}
                            <div className="border rounded-lg overflow-hidden bg-black mb-2 h-[250px] flex items-center justify-center relative">
                                {image ? (
                                    <img src={image} alt="Selfie" className="h-full w-full object-cover" />
                                ) : (
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="h-full w-full object-cover" // Object cover agar full container
                                    />
                                )}
                            </div>

                            {!image ? (
                                <button
                                    onClick={capture}
                                    className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition text-sm font-semibold"
                                >
                                    Ambil Foto 📸
                                </button>
                            ) : (
                                <button
                                    onClick={() => setImage(null)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded w-full hover:bg-gray-600 transition text-sm font-semibold"
                                >
                                    Foto Ulang 🔄
                                </button>
                            )}
                        </div>
                    </div>

                    {/* PESAN & ERROR */}
                    {(message || error) && (
                        <div className="mb-4">
                            {message && <p className="text-green-600 bg-green-100 p-2 rounded text-center text-sm font-semibold">{message}</p>}
                            {error && <p className="text-red-600 bg-red-100 p-2 rounded text-center text-sm font-semibold">{error}</p>}
                        </div>
                    )}

                    {/* TOMBOL UTAMA (CHECK-IN / CHECK-OUT) */}
                    <div className="flex space-x-4">
                        <button
                            onClick={handleCheckIn}
                            className="flex-1 py-3 px-4 bg-green-600 text-white font-bold rounded shadow hover:bg-green-700 transition"
                        >
                            CHECK-IN
                        </button>

                        <button
                            onClick={handleCheckOut}
                            className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded shadow hover:bg-red-700 transition"
                        >
                            CHECK-OUT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AttendancePage;
