
import React from 'react';
import { Network, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatusCard 
          isConfigured={isConfigured} 
          isConnected={isConnected} 
          testConnection={testConnection} 
          config={config} 
        />

        <StatsCard
          icon={Network}
          title="Interfaces"
          value={stats.interfaces}
          isLoading={interfacesLoading}
        />

        <StatsCard
          icon={Users}
          title="Peers"
          value={stats.peers}
          isLoading={peersLoading}
        />

        <StatsCard
          icon={Activity}
          title="Conexões Ativas"
          value={stats.activeConnections}
          isLoading={peersLoading}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">WireGuard Manager</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-wireguard-muted/50">
            <CardHeader>
              <CardTitle>Interfaces Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <InterfacesTable 
                interfaces={interfacesData} 
                isLoading={interfacesLoading} 
              />
            </CardContent>
          </Card>

          <Card className="bg-wireguard-muted/50">
            <CardHeader>
              <CardTitle>Peers Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <PeersTable 
                peers={peersData} 
                isLoading={peersLoading} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
