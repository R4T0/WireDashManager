
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
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-base md:text-lg">Informações do Sistema</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
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
                <span className="text-right flex-shrink overflow-hidden text-ellipsis max-w-[150px]">{systemData.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wireguard-muted-foreground">Modelo:</span>
                <span className="text-right flex-shrink overflow-hidden text-ellipsis max-w-[150px]">{systemData.model}</span>
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
