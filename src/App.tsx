// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';

// --- Page Imports ---
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// Import other pages/components used in routes
import Layout from './components/Layout'; // Import the Layout component

// --- Placeholder Pages (Create these simple components) ---
const TasksPage: React.FC = () => <div className="text-stone-900 dark:text-white">Página de Tareas (Contenido)</div>;
const SettingsPage: React.FC = () => <div className="text-stone-900 dark:text-white">Página de Ajustes (Contenido)</div>;
const NotFoundPage: React.FC = () => <div className="text-stone-900 dark:text-white">404 - Página no encontrada</div>;


// --- Component for Protected Routes ---
// This helper component simplifies wrapping routes with Layout and Auth check
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they login,
    // which is a nicer user experience than dropping them off on the home page.
    return <Navigate to="/login" replace />;
  }
  // If authenticated, wrap the children (the actual page component) with the Layout
  return <Layout>{children}</Layout>;
};


// --- Main Routing Logic ---
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Route: Login */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protected Routes wrapped by Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* --- Redirects and Catch-all --- */}

      {/* Redirect root path to dashboard if logged in, else to login */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />

      {/* Catch-all route */}
      {/* If logged in, show a "Not Found" page within the layout */}
      {/* If not logged in, redirect to login */}
      <Route
        path="*"
        element={
          isAuthenticated
            ? <Layout><NotFoundPage /></Layout>
            : <Navigate to="/login" replace />
        }
      />

    </Routes>
  );
}

// --- Main App Component ---
function App() {
  return (
    <AuthProvider> {/* AuthProvider wraps everything */}
      <Router>      {/* Router wraps the routes */}
        <AppRoutes /> {/* Component containing route definitions */}
      </Router>
    </AuthProvider>
  );
}

export default App;