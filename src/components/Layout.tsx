
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Users, Network, FileText, QrCode, LayoutDashboard, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import UserMenu from '@/components/Layout/UserMenu';

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
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-wireguard to-[#0d1424]">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-wireguard/80 backdrop-blur-sm border-r border-white/10 flex flex-col transition-all duration-300 shadow-lg">
        {/* Logo */}
        <div className="p-4 border-b border-white/10 flex items-center space-x-3">
          <img 
            src="/lovable-uploads/f28adbf6-258e-4edf-805e-135b0e76115e.png" 
            alt="WireDash Logo" 
            className="w-8 h-8"
          />
          <h1 className="text-lg font-bold text-white tracking-tight">WireDash</h1>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-6 px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200",
                      isActive 
                        ? "bg-wireguard-primary/15 text-wireguard-primary font-medium" 
                        : "text-wireguard-foreground/80 hover:text-wireguard-foreground hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5", 
                      isActive ? "text-wireguard-primary" : "text-wireguard-foreground/70"
                    )} />
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="absolute left-0 w-1 h-5 bg-wireguard-primary rounded-r-full" />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.name}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 text-xs text-wireguard-muted-foreground/80 border-t border-white/10 bg-wireguard/50">
          <div>WireDash Manager</div>
          <div>v1.0.0</div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-white/10 bg-wireguard/50 backdrop-blur-sm flex items-center justify-between px-6 shadow-md">
          <h2 className="text-lg font-medium text-wireguard-foreground">
            {navItems.find(item => item.path === location.pathname)?.name || 'WireDash Manager'}
          </h2>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-wireguard-foreground/70 hover:text-wireguard-foreground hover:bg-white/5">
              <Bell className="h-5 w-5" />
            </Button>
            
            <div className="text-sm text-right text-wireguard-foreground/90">
              <div className="font-medium">{currentTime}</div>
              <div className="text-xs text-wireguard-muted-foreground">{currentDate}</div>
            </div>
            
            <UserMenu />
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
