
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
	const [nama, setNama] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [role, setRole] = useState('mahasiswa');
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);

		try {
			const payload = {
				nama: nama,
				email: email,
				password: password,
				role: role,
			};

			const response = await axios.post('http://localhost:5000/api/auth/register', payload);

			setSuccess(response.data.message || 'Registrasi berhasil. Silakan login.');
			setTimeout(() => navigate('/login'), 1200);

		} catch (err) {
			setError(err.response ? err.response.data.message : 'Registrasi gagal');
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
			<div className="max-w-md w-full">
				<div className="mb-6 flex items-center gap-3">
					<div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">PA</div>
					<div>
						<h1 className="text-2xl font-semibold text-gray-800">Portal Aplikasi</h1>
						<p className="text-sm text-gray-500">Buat akun untuk mengakses fitur</p>
					</div>
				</div>

				<div className="bg-white p-8 rounded-xl shadow-lg">
					<h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Register</h2>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label htmlFor="nama" className="block text-sm font-medium text-gray-700">Nama</label>
							<input
								id="nama"
								type="text"
								value={nama}
								onChange={(e) => setNama(e.target.value)}
								required
								className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
							/>
						</div>

						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
							/>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
							/>
						</div>

						<div>
							<label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
							<select
								id="role"
								value={role}
								onChange={(e) => setRole(e.target.value)}
								className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-white"
							>
								<option value="mahasiswa">mahasiswa</option>
								<option value="admin">admin</option>
							</select>
						</div>

						<button
							type="submit"
							className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700"
						>
							Daftar
						</button>
					</form>

					{error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}
					{success && <p className="text-green-600 text-sm mt-4 text-center">{success}</p>}

					<div className="mt-6 text-center text-sm text-gray-600">
						Sudah punya akun? <Link to="/login" className="text-indigo-600 font-medium hover:underline">Masuk</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default RegisterPage;
