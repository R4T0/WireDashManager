
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Users, Network, FileText, QrCode, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  const [currentDate, setCurrentDate] = useState<string>(new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }));

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      setCurrentDate(now.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Peers', path: '/peers', icon: Users },
    { name: 'Interfaces', path: '/interfaces', icon: Network },
    { name: 'Generate Config', path: '/generate-config', icon: FileText },
    { name: 'QR Code', path: '/qr-code', icon: QrCode },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-wireguard border-r border-wireguard-muted flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-wireguard-muted flex items-center space-x-3">
          <img 
            src="/lovable-uploads/f28adbf6-258e-4edf-805e-135b0e76115e.png" 
            alt="WireDash Logo" 
            className="w-8 h-8"
          />
          <h1 className="text-lg font-semibold text-wireguard-foreground">WireDash</h1>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "side-nav-item",
                location.pathname === item.path ? "active" : ""
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 text-xs text-wireguard-muted-foreground border-t border-wireguard-muted">
          <div>WireDash Manager</div>
          <div>v1.0.0</div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-wireguard-muted flex items-center justify-between px-6">
          <h2 className="text-lg font-medium">{navItems.find(item => item.path === location.pathname)?.name || 'WireDash Manager'}</h2>
          <div className="text-sm text-wireguard-muted-foreground">
            <div className="text-right">{currentTime}</div>
            <div>{currentDate}</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
