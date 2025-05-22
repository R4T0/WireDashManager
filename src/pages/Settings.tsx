
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MikrotikConnectionSettings from '@/components/settings/MikrotikConnectionSettings';
import WireguardDefaultSettings from '@/components/settings/WireguardDefaultSettings';
import LogViewer from '@/components/debug/LogViewer';
import SettingsHeader from '@/components/settings/SettingsHeader';
import ConnectionDebugger from '@/components/debug/ConnectionDebugger';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <SettingsHeader />
      
      <Tabs defaultValue="mikrotik">
        <TabsList className="mb-6">
          <TabsTrigger value="mikrotik">Conexão Mikrotik</TabsTrigger>
          <TabsTrigger value="defaults">Configuração Padrão</TabsTrigger>
          <TabsTrigger value="logs">Logs do Sistema</TabsTrigger>
          <TabsTrigger value="debug">Diagnóstico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mikrotik">
          <MikrotikConnectionSettings />
        </TabsContent>
        
        <TabsContent value="defaults">
          <WireguardDefaultSettings />
        </TabsContent>
        
        <TabsContent value="logs">
          <LogViewer />
        </TabsContent>
        
        <TabsContent value="debug">
          <ConnectionDebugger />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
