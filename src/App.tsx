
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react"; // Import React explicitly

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Peers from "./pages/Peers";
import Interfaces from "./pages/Interfaces";
import GenerateConfig from "./pages/GenerateConfig";
import QRCode from "./pages/QRCode";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { MikrotikProvider } from "./contexts/mikrotik";
import { AuthProvider } from "./contexts/auth/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Create the QueryClient outside the component to avoid recreating it on each render
const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <MikrotikProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rota de autenticação - acessível sem login */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Rotas protegidas - requerem autenticação */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/peers" element={
                <ProtectedRoute>
                  <Layout><Peers /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/interfaces" element={
                <ProtectedRoute>
                  <Layout><Interfaces /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/generate-config" element={
                <ProtectedRoute>
                  <Layout><GenerateConfig /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/qr-code" element={
                <ProtectedRoute>
                  <Layout><QRCode /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout><Settings /></Layout>
                </ProtectedRoute>
              } />
              
              {/* Rota para página não encontrada */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </MikrotikProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
