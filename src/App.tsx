import React from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SubjectsProvider } from './context/SubjectsContext';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Growth from './pages/Growth';
import Assistant from './pages/Assistant';
import Profile from './pages/Profile';
import Login from './pages/Login';
import SubjectSetup from './pages/SubjectSetup';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <SubjectsProvider>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-100 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDIxNywgNzAsIDIzOSwgMC4yKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative">
          <Header />
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <Routes>
              <Route path="/setup" element={<ProtectedRoute><SubjectSetup /></ProtectedRoute>} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
              <Route path="/growth" element={<ProtectedRoute><Growth /></ProtectedRoute>} />
              <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
            <Navbar />
          </div>
        </div>
      </div>
    </SubjectsProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;