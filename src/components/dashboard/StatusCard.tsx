
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { MikrotikConfig } from '@/services/mikrotik/types';
import { Button } from '@/components/ui/button';

interface StatusCardProps {
  isConfigured: boolean;
  isConnected: boolean;
  testConnection: () => void;
  config: MikrotikConfig | null;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  isConfigured, 
  isConnected, 
  testConnection, 
  config 
}) => {
  if (!isConfigured) {
    return (
      <Card className="bg-wireguard-muted/50 h-full flex flex-col">
        <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
          <CardTitle className="text-base md:text-lg font-medium flex items-center">
            <Activity className="mr-1.5 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0 flex-1 flex flex-col justify-between">
          <div className="text-xs md:text-sm text-wireguard-muted-foreground mb-4">
            O roteador Mikrotik não está configurado. Configure a conexão nas configurações.
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-wireguard/50 border-white/10 text-wireguard-foreground hover:bg-wireguard-primary/20 transition-all w-full"
            onClick={() => window.location.href = '/settings'}
          >
            Ir para Configurações
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="bg-wireguard-muted/50 h-full flex flex-col">
        <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
          <CardTitle className="text-base md:text-lg font-medium flex items-center">
            <XCircle className="mr-1.5 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-red-500" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0 flex-1 flex flex-col justify-between">
          <div className="text-xs md:text-sm text-wireguard-muted-foreground mb-4">
            Não foi possível conectar ao roteador Mikrotik. Verifique as configurações.
          </div>
          <Button 
            onClick={() => testConnection()}
            size="sm"
            className="bg-wireguard/50 border border-white/10 text-wireguard-foreground hover:bg-wireguard-primary/20 transition-all inline-flex items-center gap-2 w-full justify-center"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-wireguard-muted/50 h-full flex flex-col">
      <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
        <CardTitle className="text-base md:text-lg font-medium flex items-center">
          <CheckCircle className="mr-1.5 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-green-500" />
          Status da Conexão
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-6 pt-0 flex-1">
        <div className="text-xs md:text-sm text-wireguard-foreground/90">
          <div className="text-2xl md:text-3xl font-bold text-green-500 mb-2">Conectado</div>
          {config && (
            <div className="space-y-1 text-xs text-wireguard-muted-foreground">
              <p className="flex items-center justify-between">
                <span>Endereço:</span> 
                <span className="px-2 py-0.5 bg-wireguard/50 rounded text-wireguard-foreground/80">{config.address}</span>
              </p>
              <p className="flex items-center justify-between">
                <span>Porta:</span> 
                <span className="px-2 py-0.5 bg-wireguard/50 rounded text-wireguard-foreground/80">{config.port}</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
