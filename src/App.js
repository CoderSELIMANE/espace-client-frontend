import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

import DocumentEdit from './pages/DocumentEdit';
import authService from './services/authService';
import { AppProvider } from './contexts/AppContext';
import NotificationToast from './components/NotificationToast';

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

// Composant pour rediriger les utilisateurs connectés
const PublicRoute = ({ children }) => {
  return !authService.isAuthenticated() ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <NotificationToast />
          <Routes>
          {/* Route par défaut */}
          <Route 
            path="/" 
            element={
              authService.isAuthenticated() ? 
                <Navigate to="/dashboard" /> : 
                <Navigate to="/login" />
            } 
          />
          
          {/* Routes publiques */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          
          {/* Routes protégées */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document/edit/:id"
            element={
              <ProtectedRoute>
                <DocumentEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />



          {/* Route 404 */}
          <Route 
            path="*" 
            element={
              <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                  <h1 className="display-1 text-muted">404</h1>
                  <h2>Page non trouvée</h2>
                  <p className="text-muted">La page que vous recherchez n'existe pas.</p>
                  <a href="/" className="btn btn-primary">
                    <i className="fas fa-home me-2"></i>
                    Retour à l'accueil
                  </a>
                </div>
              </div>
            } 
          />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
