import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import CadastroPage from '../pages/CadastroPage';
import HomePage from '../pages/HomePage';
import ReservaPage from '../pages/ReservaPage';
import EditarReservaPage from '../pages/EditarReservaPage';
import { AuthProvider, AuthContext } from '../context/AuthContext';

function PrivateRoute({ children }) {
  const { usuario } = useContext(AuthContext);
  if (!usuario) return <Navigate to="/" replace />;
  return children;
}

export default function RouterApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/home" element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          } />
          <Route path="/reserva" element={
            <PrivateRoute>
              <ReservaPage />
            </PrivateRoute>
          } />
          <Route path="/reserva/editar/:id" element={<EditarReservaPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}