import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css'

function App() {
  // En una aplicación completa aquí controlarás el estado de autenticación para proteger las rutas.
  // Por simplicidad se asume que el usuario no está autenticado hasta hacer login.
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    // Simulate fetching authentication status from an API or local storage
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Por ejemplo, si el usuario está autenticado muestra el dashboard, sino redirige a login */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        {/* Ruta por defecto redirige a login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
