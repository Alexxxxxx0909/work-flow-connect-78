
/**
 * Componente Principal de la Aplicación
 * 
 * Este es el punto de entrada de la aplicación React que contiene:
 * - Proveedores globales (Theme, Auth, Data, Jobs, Chat)
 * - Configuración de rutas usando React Router
 * - Implementación de rutas protegidas
 * - Configuración de rutas públicas
 */

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { JobProvider } from "@/contexts/JobContext";
import { DataProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Importar componentes de páginas
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import JobsPage from "./pages/JobsPage";
import JobDetail from "./pages/JobDetail";
import ProfilePage from "./pages/ProfilePage";
import ChatsPage from "./pages/ChatsPage";
import UserProfile from "./pages/UserProfile";
import CreateJobPage from "./pages/CreateJobPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import NotFound from "./pages/NotFound";

// Inicializar el cliente de React Query
const queryClient = new QueryClient();

/**
 * Componente de Ruta Protegida
 * Asegura que el usuario esté autenticado antes de acceder a la ruta
 * Redirige a login si no está autenticado
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  // Mostrar pantalla de carga mientras se verifica el estado de autenticación
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }
  
  // Redireccionar a login si no hay usuario autenticado
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // Si hay usuario autenticado, mostrar el contenido protegido
  return <>{children}</>;
};

/**
 * Componente de Ruta Solo Pública
 * Accesible solo cuando no hay sesión iniciada
 * Redirige al dashboard si ya está autenticado
 */
const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  // Mostrar pantalla de carga mientras se verifica el estado de autenticación
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }
  
  // Redireccionar al dashboard si ya hay un usuario autenticado
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }
  
  // Si no hay usuario autenticado, mostrar el contenido público
  return <>{children}</>;
};

/**
 * Componente de Rutas de la Aplicación
 * Contiene todas las rutas y su protección de acceso
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      
      {/* Rutas protegidas - requieren autenticación */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
      <Route path="/jobs/:jobId" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
      <Route path="/jobs/create" element={<ProtectedRoute><CreateJobPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/chats" element={<ProtectedRoute><ChatsPage /></ProtectedRoute>} />
      <Route path="/user/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/create-job" element={<ProtectedRoute><CreateJobPage /></ProtectedRoute>} />
      <Route path="/saved-jobs" element={<ProtectedRoute><SavedJobsPage /></ProtectedRoute>} />
      
      {/* Ruta 404 para manejar URLs no encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

/**
 * Componente App Principal
 * Configura todos los proveedores y configuración global
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <JobProvider>
              <ChatProvider>
                <TooltipProvider>
                  <AppRoutes />
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </ChatProvider>
            </JobProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
