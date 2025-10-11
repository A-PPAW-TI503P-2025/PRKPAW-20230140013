import React, { useState } from 'react';
import './App.css';

function App() {
  // Membuat state untuk menyimpan nama pengguna
  const [nama, setNama] = useState('');

  // Fungsi untuk menangani perubahan pada input field
  const handleInputChange = (event) => {
    setNama(event.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hello, {nama || 'Guest'}!</h1>
        <p>Masukkan nama Anda:</p>
        <input
          type="text"
          value={nama}
          onChange={handleInputChange}
          placeholder="Ketik nama di sini..."
        />
      </header>
    </div>
  );
}

export default App;