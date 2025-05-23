
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
      <Card className="bg-wireguard/30 border-white/10 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent" />
        <CardHeader className="p-4 md:p-6 pb-2">
          <CardTitle className="text-base md:text-lg font-medium flex items-center">
            <Activity className="mr-2 h-5 w-5 text-yellow-500" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-1 relative z-10">
          <div className="text-sm text-wireguard-muted-foreground">
            O roteador Mikrotik não está configurado. Por favor, vá para a página de configurações para configurar a conexão.
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 bg-wireguard/50 border-white/10 text-wireguard-foreground hover:bg-wireguard-primary/20 transition-all"
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
      <Card className="bg-wireguard/30 border-white/10 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent" />
        <CardHeader className="p-4 md:p-6 pb-2">
          <CardTitle className="text-base md:text-lg font-medium flex items-center">
            <XCircle className="mr-2 h-5 w-5 text-red-500" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-1 relative z-10">
          <div className="text-sm text-wireguard-muted-foreground">
            Não foi possível conectar ao roteador Mikrotik. Por favor, verifique as configurações.
          </div>
          <Button 
            onClick={() => testConnection()}
            size="sm"
            className="mt-4 bg-wireguard/50 border border-white/10 text-wireguard-foreground hover:bg-wireguard-primary/20 transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-wireguard/30 border-white/10 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent" />
      <CardHeader className="p-4 md:p-6 pb-2">
        <CardTitle className="text-base md:text-lg font-medium flex items-center">
          <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
          Status da Conexão
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-1 relative z-10">
        <div className="text-sm text-wireguard-foreground/90">
          Conectado com sucesso
          {config && (
            <div className="mt-2 text-xs text-wireguard-muted-foreground flex flex-col gap-1">
              <p className="flex items-center">
                <span className="w-20 font-medium">Endereço:</span> 
                <span className="px-2 py-0.5 bg-wireguard/50 rounded text-wireguard-foreground/80">{config.address}</span>
              </p>
              <p className="flex items-center">
                <span className="w-20 font-medium">Porta:</span> 
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
