
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MikrotikConnectionSettings from '@/components/settings/MikrotikConnectionSettings';
import WireguardDefaultSettings from '@/components/settings/WireguardDefaultSettings';
import LogViewer from '@/components/debug/LogViewer';
import SettingsHeader from '@/components/settings/SettingsHeader';
import ConnectionDebugger from '@/components/debug/ConnectionDebugger';
import UserManagementSettings from '@/components/settings/UserManagementSettings';
import DatabaseConnectionInfo from '@/components/debug/DatabaseConnectionInfo';

const Settings = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <SettingsHeader />
      
      <div className="bg-wireguard/40 backdrop-blur-sm rounded-lg border border-white/10 p-1">
        <Tabs defaultValue="mikrotik" className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-6 bg-wireguard/40 p-1 gap-1">
            <TabsTrigger value="mikrotik" className="text-sm">Conexão Mikrotik</TabsTrigger>
            <TabsTrigger value="defaults" className="text-sm">WireGuard</TabsTrigger>
            <TabsTrigger value="users" className="text-sm">Usuários</TabsTrigger>
            <TabsTrigger value="logs" className="text-sm">Logs</TabsTrigger>
            <TabsTrigger value="debug" className="text-sm">Diagnóstico</TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            <TabsContent value="mikrotik" className="mt-0 animate-slideIn">
              <MikrotikConnectionSettings />
            </TabsContent>
            
            <TabsContent value="defaults" className="mt-0 animate-slideIn">
              <WireguardDefaultSettings />
            </TabsContent>
            
            <TabsContent value="users" className="mt-0 animate-slideIn">
              <UserManagementSettings />
            </TabsContent>
            
            <TabsContent value="logs" className="mt-0 animate-slideIn">
              <LogViewer />
            </TabsContent>
            
            <TabsContent value="debug" className="mt-0 animate-slideIn">
              <div className="space-y-6">
                <DatabaseConnectionInfo />
                <ConnectionDebugger />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
