
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SystemData {
  version: string;
  uptime: string;
  model: string;
  cpu: string;
  memory: string;
}

interface SystemInfoProps {
  systemData: SystemData | null;
  isLoading: boolean;
}

const SystemInfo: React.FC<SystemInfoProps> = ({ systemData, isLoading }) => {
  return (
    <Card className="bg-wireguard-muted/50">
      <CardHeader>
        <CardTitle>Informações do Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {isLoading ? (
            <div className="text-wireguard-muted-foreground">Carregando informações do sistema...</div>
          ) : systemData ? (
            <>
              <div className="flex justify-between">
                <span className="text-wireguard-muted-foreground">Versão:</span>
                <span>{systemData.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wireguard-muted-foreground">Uptime:</span>
                <span>{systemData.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wireguard-muted-foreground">Modelo:</span>
                <span>{systemData.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wireguard-muted-foreground">CPU:</span>
                <span>{systemData.cpu}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wireguard-muted-foreground">Memória:</span>
                <span>{systemData.memory}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-wireguard-muted-foreground">Versão:</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wireguard-muted-foreground">Status:</span>
                <span className="text-green-500">Operacional</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wireguard-muted-foreground">Último Backup:</span>
                <span>Nunca</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wireguard-muted-foreground">Modo:</span>
                <span>Produção</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemInfo;
