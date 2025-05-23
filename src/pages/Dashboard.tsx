
import React from 'react';
import { Network, Users, Activity } from 'lucide-react';

// Import custom components
import StatusCard from '@/components/dashboard/StatusCard';
import StatsCard from '@/components/dashboard/StatsCard';
import InterfacesTable from '@/components/dashboard/InterfacesTable';
import PeersTable from '@/components/dashboard/PeersTable';
import QuickStartGuide from '@/components/dashboard/QuickStartGuide';
import SystemInfo from '@/components/dashboard/SystemInfo';
import StorageInfo from '@/components/dashboard/StorageInfo';

// Import custom hook
import useSystemStats from '@/hooks/dashboard/useSystemStats';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const {
    isConfigured,
    isConnected,
    testConnection,
    config,
    stats,
    systemData,
    interfacesData,
    peersData,
    systemLoading,
    interfacesLoading,
    peersLoading
  } = useSystemStats();
  
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
      {/* Cards principais com altura uniforme */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-6">
        <div className="col-span-1">
          <StatusCard 
            isConfigured={isConfigured} 
            isConnected={isConnected} 
            testConnection={testConnection} 
            config={config} 
          />
        </div>

        <div className="col-span-1">
          <StatsCard
            icon={Network}
            title="Interfaces"
            value={stats.interfaces}
            isLoading={interfacesLoading}
          />
        </div>

        <div className="col-span-1">
          <StatsCard
            icon={Users}
            title="Peers"
            value={stats.peers}
            isLoading={peersLoading}
          />
        </div>

        <div className="col-span-1">
          <StatsCard
            icon={Activity}
            title="Conexões Ativas"
            value={stats.activeConnections}
            isLoading={peersLoading}
          />
        </div>
      </div>

      <div className="mt-4 md:mt-8">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">WireGuard Manager</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          <div className="col-span-1">
            <InterfacesTable 
              interfaces={interfacesData} 
              isLoading={interfacesLoading} 
              isMobile={isMobile}
            />
          </div>

          <div className="col-span-1">
            <PeersTable 
              peers={peersData} 
              isLoading={peersLoading} 
              isMobile={isMobile}
            />
          </div>
        </div>

        <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          <QuickStartGuide />
          <SystemInfo 
            systemData={systemData} 
            isLoading={systemLoading} 
          />
        </div>
        
        {isConnected && <StorageInfo />}
      </div>
    </div>
  );
};

export default Dashboard;
