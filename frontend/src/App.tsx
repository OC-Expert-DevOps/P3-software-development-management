import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';

import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { DownloadPage } from './pages/DownloadPage';

const LandingPlaceholder = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <h1 className="text-4xl font-extrabold text-blue-600 mb-8">DataShare MVP</h1>
    <div className="space-x-4">
      <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Se connecter</Link>
      <Link to="/register" className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded hover:bg-gray-50">S'inscrire</Link>
    </div>
    <div className="mt-8">
      <Link to="/upload/anonymous" className="text-gray-500 hover:text-gray-700 underline">Upload anonyme</Link>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPlaceholder />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Routes publiques */}
          <Route path="/upload/anonymous" element={<UploadPage isAnonymous={true} />} />
          <Route path="/d/:token" element={<DownloadPage />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
