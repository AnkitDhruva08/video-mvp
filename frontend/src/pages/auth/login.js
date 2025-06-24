import React, { useState } from 'react';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    identifier: '', // email or mobile
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: error.detail || 'Invalid credentials.',
        });
        return;
      }

      const data = await response.json();
      Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: `Welcome back, ${data.full_name || 'User'}`,
      });

      // Clear form or redirect
      setCredentials({ identifier: '', password: '' });
      // e.g., router.push('/dashboard');

    } catch (err) {
      console.error('Login error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong. Try again.',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 p-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 sm:p-10 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">Login to Your Account</h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="text-gray-700 text-sm font-medium">Email or Mobile <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              placeholder="Enter your email or mobile number"
              className="w-full p-4 mt-1 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              value={credentials.identifier}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="text-gray-700 text-sm font-medium">Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="w-full p-4 mt-1 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition duration-300 shadow-lg"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <a href="/auth/register" className="text-blue-600 hover:underline font-medium">Register here</a>
        </p>
      </div>
    </div>
  );
}
