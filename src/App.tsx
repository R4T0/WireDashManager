
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
          <Routes>
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/peers" element={<Layout><Peers /></Layout>} />
            <Route path="/interfaces" element={<Layout><Interfaces /></Layout>} />
            <Route path="/generate-config" element={<Layout><GenerateConfig /></Layout>} />
            <Route path="/qr-code" element={<Layout><QRCode /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </MikrotikProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
