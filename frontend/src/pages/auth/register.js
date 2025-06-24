import React, { useState } from 'react';
import Swal from 'sweetalert2';


export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    age: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('formdata ==<<>>', formData)
  
      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: errorData.detail || 'Something went wrong!',
        });
        return;
      }
  
      const data = await response.json();
      Swal.fire({
        icon: 'success',
        title: 'Registered Successfully!',
        text: `Welcome, ${data.full_name}`,
      });
      
      // Optional: redirect or clear form
      // router.push('/auth/login');
      setFormData({
        fullName: '',
        email: '',
        mobile: '',
        age: '',
        password: '',
      });
  
    } catch (error) {
      console.error('Registration error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong. Please try again later.',
      });
    }
  };
  

  const handleSocialLogin = (provider) => {
    console.log(`Attempting social login with: ${provider}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 sm:p-10 w-full max-w-md transform transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">Create Your Account</h2>

        <div className="space-y-5 mb-6">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-gray-700 font-medium text-sm">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm text-gray-800"
              value={formData.fullName}
              onChange={handleChange}
              required
              aria-label="Full Name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-gray-700 font-medium text-sm">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm text-gray-800"
              value={formData.email}
              onChange={handleChange}
              required
              aria-label="Email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="mobile" className="text-gray-700 font-medium text-sm">Mobile Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              placeholder="Enter your mobile number"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm text-gray-800"
              value={formData.mobile}
              onChange={handleChange}
              required
              aria-label="Mobile Number"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="age" className="text-gray-700 font-medium text-sm">Age <span className="text-red-500">*</span></label>
            <input
              type="number"
              id="age"
              name="age"
              placeholder="Enter your age"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm text-gray-800"
              value={formData.age}
              onChange={handleChange}
              required
              aria-label="Age"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-gray-700 font-medium text-sm">Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a strong password"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm text-gray-800"
              value={formData.password}
              onChange={handleChange}
              required
              aria-label="Password"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Register"
          >
            Register
          </button>
        </div>

        <p className="text-center text-gray-500 my-6 text-sm relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:w-[calc(50%-2.5rem)] before:h-px before:bg-gray-300 after:content-[''] after:absolute after:right-0 after:top-1/2 after:w-[calc(50%-2.5rem)] after:h-px after:bg-gray-300">
          Or continue with
        </p>

        <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => handleSocialLogin('Google')}
            className="flex-1 flex items-center justify-center border border-gray-300 bg-white text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
            aria-label="Sign in with Google"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.24 10.285V14.4H19.345C18.892 16.736 16.592 19.381 12.24 19.381C7.994 19.381 4.49 16.035 4.49 11.99C4.49 7.945 7.994 4.599 12.24 4.599C14.691 4.599 16.488 5.688 17.513 6.643L20.428 3.728C18.064 1.545 15.36 0 12.24 0C5.462 0 0 5.372 0 11.99C0 18.608 5.462 23.98 12.24 23.98C19.018 23.98 23.513 18.232 23.513 12.181C23.513 11.455 23.447 10.849 23.336 10.285H12.24V10.285Z" fill="#EA4335"/>
              <path d="M0 11.99L4.49 11.99C4.49 14.331 6.302 16.299 8.643 16.299C9.72 16.299 10.702 15.918 11.488 15.341L14.4 18.256C12.981 19.333 10.681 19.98 8.643 19.98C5.234 19.98 2.22 17.513 0 14.597L0 11.99Z" fill="#34A853"/>
              <path d="M12.24 4.091C13.622 4.091 14.881 4.582 15.863 5.49L18.778 2.575C17.027 1.053 14.636 0 12.24 0C8.831 0 5.817 2.467 3.595 5.383L7.108 7.97C8.016 5.864 9.974 4.091 12.24 4.091Z" fill="#FBBC04"/>
              <path d="M23.513 12.181L23.336 10.285H12.24V14.4H19.345C19.259 14.869 19.141 15.421 18.892 16.035C20.655 14.629 21.848 13.567 23.513 12.181Z" fill="#4285F4"/>
            </svg>
            Google
          </button>
          <button
            onClick={() => handleSocialLogin('GitHub')}
            className="flex-1 flex items-center justify-center border border-gray-300 bg-white text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
            aria-label="Sign in with GitHub"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.372 0 0 5.372 0 12c0 5.304 3.438 9.799 8.205 11.385.6.11.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.725-4.043-1.61-4.043-1.61-.546-1.387-1.332-1.758-1.332-1.758-1.09-.745.08-.729.08-.729 1.205.086 1.838 1.238 1.838 1.238 1.07 1.833 2.809 1.304 3.493.998.109-.775.419-1.305.762-1.604-2.665-.304-5.466-1.332-5.466-5.93 0-1.309.465-2.382 1.236-3.22-.124-.304-.536-1.524.118-3.176 0 0 1.009-.323 3.301 1.23.958-.266 1.98-.399 3.003-.404 1.022.005 2.044.138 3.003.404 2.29-1.553 3.297-1.23 3.297-1.23.655 1.652.243 2.872.118 3.176.77.838 1.233 1.911 1.233 3.22 0 4.61-2.805 5.62-5.474 5.92-.43.37-.817 1.1-.817 2.22 0 1.605.015 2.899.015 3.293 0 .319.215.694.825.576C20.562 21.785 24 17.309 24 12c0-6.628-5.372-12-12-12z"/>
            </svg>
            GitHub
          </button>
          <button
            onClick={() => handleSocialLogin('Facebook')}
            className="flex-1 flex items-center justify-center border border-gray-300 bg-white text-blue-600 py-3 rounded-xl hover:bg-gray-50 transition duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
            aria-label="Sign in with Facebook"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 20V14H6V10H9V8C9 4.71 10.667 3 14.5 3C16.167 3 17.5 3.167 18 3.333V7H15C13.833 7 13 7.5 13 8.5V10H18L17 14H13V20H9Z" fill="#3B5998"/>
            </svg>
            Facebook
          </button>
        </div>

        <p className="text-sm text-center text-gray-600 mt-8">
          Already have an account?{' '}
          <a href="/auth/login" className="text-blue-600 hover:underline font-medium transition duration-200">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
