
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Peers from "./pages/Peers";
import Interfaces from "./pages/Interfaces";
import GenerateConfig from "./pages/GenerateConfig";
import QRCode from "./pages/QRCode";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { MikrotikProvider } from "./contexts/mikrotik";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MikrotikProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/peers" element={<Peers />} />
              <Route path="/interfaces" element={<Interfaces />} />
              <Route path="/generate-config" element={<GenerateConfig />} />
              <Route path="/qr-code" element={<QRCode />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </MikrotikProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
