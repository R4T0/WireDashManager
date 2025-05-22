
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
import { AuthProvider } from "./contexts/auth";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <MikrotikProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/peers" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Peers />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/interfaces" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Interfaces />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/generate-config" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <GenerateConfig />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/qr-code" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <QRCode />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </MikrotikProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
